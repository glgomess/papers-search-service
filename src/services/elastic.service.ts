import { Client } from '@elastic/elasticsearch';
import {
  ElasticsearchClientError,
  ProductNotSupportedError,
  SerializationError,
  DeserializationError,
  ConfigurationError,
  ResponseError,
  RequestAbortedError,
  NoLivingConnectionsError,
  ConnectionError,
  TimeoutError,
} from '@elastic/elasticsearch/lib/errors';
import csv from 'csv-parser';
import fs from 'fs';
import { ElasticError } from '../errors';
import { Article } from '../models';
import logger from '../utils/winston';

export default class ElasticService {
  client: Client;

  maximumResults: number;

  static searchData = {
    articles: 'articles',
  };

  indices = {
    articles: '',
  };

  exceptions = {
    existingResource: '',
  };

  constructor() {
    // Very simple local cluster for development and testing.
    // Possibly on production mode the connection will requires more parameters.
    if (!this.client) {
      this.client = new Client({ node: process.env.ELASTIC_CLUSTER_URL });
    }
    this.indices = {
      articles: 'articles',
    };

    /**
     * Arbitrary number to return all possible articles found.
     * Should be changed when a Pagination feature is implemented
     * on the frontend.
     */
    this.maximumResults = 10000;
  }

  static checkIfIsElasticError(error) {
    if (error instanceof ProductNotSupportedError
      || error instanceof SerializationError
      || error instanceof ElasticsearchClientError
      || error instanceof DeserializationError
      || error instanceof ConfigurationError
      || error instanceof ResponseError
      || error instanceof RequestAbortedError
      || error instanceof NoLivingConnectionsError
      || error instanceof ConnectionError
      || error instanceof TimeoutError) {
      return true;
    }

    return false;
  }

  async createArticleIndex() {
    try {
      await this.client.indices.create({
        index: this.indices.articles,
        body: {
          settings: {
            number_of_shards: 1,
            analysis: {
              filter: {
                autocomplete_filter: {
                  type: 'edge_ngram',
                  min_gram: 1,
                  max_gram: 20,
                },
              },
              analyzer: {
                autocomplete: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'autocomplete_filter',
                  ],
                },
              },
            },
          },
        },
      });
    } catch (e) {
      throw new ElasticError('Elastic could not create Articles index.', 500, e.message);
    }
  }

  async createArticleIndexMapping() {
    try {
      await this.client.indices.putMapping({
        index: this.indices.articles,
        include_type_name: true,
        type: 'keyword',
        body: {
          properties: {
            keyword_equivalent: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'standard',
            },
            parent_topic: {
              type: 'text',
            },
          },
        },
      });
    } catch (e) {
      throw new ElasticError('Elastic could not create Articles mapping.', 500, e.message);
    }
  }

  async deleteIndices(indexName: string) {
    try {
      await this.client.indices.delete({ index: indexName });
    } catch (e) {
      throw new ElasticError(`Elastic could not delete ${indexName} index.`, 500, e.message);
    }
  }

  async insertDataIntoIndex(body: object, index: string) {
    try {
      await this.client.index({
        index,
        body,
      });

      await this.client.indices.refresh({ index });
    } catch (e) {
      throw new ElasticError(`Elastic could not insert data into ${index}.`, 500, e.message, body);
    }
  }

  async getAutocompleteData(index: string, keyword: string) {
    try {
      const { body } = await this.client.search({
        index,
        body: {
          query: {
            match_phrase: { keyword_equivalent: { query: keyword, analyzer: 'autocomplete' } },
          },
        },
      });

      const foundResults = body.hits.hits;
      const formattedResults = [];
      for (let i = 0; i < foundResults.length; i += 1) {
        formattedResults.push(foundResults[i]._source.keyword_equivalent);
      }

      return formattedResults;
    } catch (e) {
      throw new ElasticError('An error occurred while finding suggestions for your search.',
        500,
        e.message,
        `Keyword Searched: ${keyword}`);
    }
  }

  async getArticlesByKeywords(index: string, keywords: string, matchAll: boolean) {
    let result;

    /**
       * IMPORTANT: Elastic breaks the keywords into tokens, so the keyword
       * "smart cities" for instance, is broken into "smart" and "cities",
       * that is why the same keyword might return different amount of
       * results based on the "all" or "any" selected by the user.
       * So the query that should match all keywords, but only contain
       * the keyword "smart cities" will return all articles which contains
       * this exact keyword, but the "any" version of the query will return
       * articles that contains either "smart" or "cities" whithin their keywords.
       *
       * Thow only happens with keyword that contain more than one word.
       */
    if (matchAll) {
      result = await this.client.search({
        index,
        size: this.maximumResults,
        body: {
          query: {
            match: {
              keywords: {
                query: keywords,
                operator: 'AND',
              },
            },
          },
        },
      });
    } else {
      result = await this.client.search({
        index,
        size: this.maximumResults,
        body: {
          query: {
            match: {
              keywords: {
                query: keywords,
              },
            },
          },
        },
      });
    }

    const { body } = result;

    const foundResults = body.hits.hits;
    const totalFound = body.hits.total.value;
    const formattedResults = [];

    for (let i = 0; i < foundResults.length; i += 1) {
      formattedResults.push(new Article(foundResults[i]._source));
    }

    return { results: formattedResults, total: totalFound };
  }

  migrateArticlesFileDBToElasticIndex = async () => {
    const articlesFilePath = process.env.ARTICLES_DB_FILE_PATH;
    const currentData = [];

    fs.createReadStream(articlesFilePath)
      .pipe(csv())
      .on('data', (data) => currentData.push(data))
      .on('end', async () => {
        logger('Articles DB Migration').info(`Migrating ${currentData.length} entries.`);
        for (let i = 0; i < currentData.length; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await this.insertDataIntoIndex(currentData[i], this.indices.articles);
        }
      });
  };

  migrateKeywordsFileDBToElasticIndex = async () => {
    const keywordFilePath = process.env.KEYWORDS_DB_FILE_PATH;
    const currentData = [];

    fs.createReadStream(keywordFilePath)
      .pipe(csv())
      .on('data', (data) => currentData.push(data))
      .on('end', async () => {
        logger('Keywords DB Migration').info(`Migrating ${currentData.length} entries.`);
        for (let i = 0; i < currentData.length; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await this.insertDataIntoIndex(currentData[i], this.indices.articles);
        }
      });
  };
}
