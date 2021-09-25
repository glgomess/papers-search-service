import { Client } from '@elastic/elasticsearch';
import { ElasticsearchClientError } from '@elastic/elasticsearch/lib/errors';
import csv from 'csv-parser';
import fs from 'fs';
import ElasticError from '../errors/ElasticError';

export default class ElasticService {
  client: Client;

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
    if (!this.client) {
      this.client = new Client({ node: process.env.ELASTIC_CLUSTER_URL });
    }
    this.indices = {
      articles: 'articles',
    };
    this.exceptions.existingResource = 'resource_already_exists_exception';
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
      if (e.message.includes(this.exceptions.existingResource)) {
        console.log(`Error creating INDEX ${this.indices.articles} - Index already exists.`);
      }
    }
  }

  async createArticleIndexMapping() {
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
  }

  async deleteIndices(indexName: string) {
    await this.client.indices.delete({ index: indexName });
  }

  async insertDataIntoIndex(body: object, index: string) {
    await this.client.index({
      index,
      body,
    });

    await this.client.indices.refresh({ index: 'articles' });
  }

  async getAutocompleteData(index: string, keyword: string) {
    try {
      const { body } = await this.client.search({
        index,
        body: {
          query: {
            match: { keyword_equivalent: { query: keyword, analyzer: 'autocomplete' } },
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
      console.log(e);
      if (e instanceof ElasticsearchClientError) {
        throw new ElasticError('An error occurred while fetching the keywords.',
          500,
          e.message,
          e.stack);
      }
    }
  }

  migrateFileDBToElasticIndex = async () => {
    const keywordFilePath = process.env.KEYWORDS_DB_FILE_PATH;
    const currentData = [];
    fs.createReadStream(keywordFilePath)
      .pipe(csv())
      .on('data', (data) => currentData.push(data))
      .on('end', async () => {
        for (let i = 0; i < currentData.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
          await this.insertDataIntoIndex(currentData[i], this.indices.articles);
        }
      });
  };
}
