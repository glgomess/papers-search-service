import { Client } from '@elastic/elasticsearch';
import csv from 'csv-parser';
import fs from 'fs';

class ElasticCluster {
  client: Client;

  constructor() {
    // Very simple local cluster for development and testing.
    this.client = new Client({ node: process.env.ELASTIC_CLUSTER_URL });
  }

  async createIndex(indexName: string) {
    await this.client.indices.create({
      index: indexName,
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
  }

  async createMapping(indexName: string) {
    await this.client.indices.putMapping({
      index: indexName,
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
    const { body } = await this.client.search({
      index,
      body: {
        query: {
          match: { keyword_equivalent: { query: keyword, analyzer: 'standard' } },
        },
      },
    });

    return body;
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
          await this.insertDataIntoIndex(currentData[i], 'articles');
        }
      });
  };
}

export default new ElasticCluster();
