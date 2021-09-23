import express, { Response, Request, NextFunction } from 'express';
import ElasticCluster from '../elasticsearch/elastic';

const routes = express.Router();

routes.get(
  '/search/keywords',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { kw } = req.body;
      const elasticCluster = new ElasticCluster();
      const matches = await elasticCluster.getAutocompleteData('articles', kw);

      return res.status(200).json(matches);
    } catch (e) {
      next(e);
    }
  },
);

routes.post(
  '/setup',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const elasticCluster = new ElasticCluster();
      // Create indices.
      await elasticCluster.createArticleIndex();

      // Create mappings.
      await elasticCluster.createArticleIndexMapping();

      // Migrate data.
      await elasticCluster.migrateFileDBToElasticIndex();

      return res.status(200).json('All indices were successfully created.');
    } catch (e) {
      next(e);
    }
  },
);

routes.delete(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const elasticCluster = new ElasticCluster();
      await elasticCluster.deleteIndices('articles');

      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  },
);

export default routes;
