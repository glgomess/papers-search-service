import express, { Response, Request, NextFunction } from 'express';
import { ElasticService } from '../services';
import logger from '../utils/winston';

const routes = express.Router();

routes.get(
  '/search/keywords',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kw = String(req.query.kw);
      const elasticService = new ElasticService();
      // eslint-disable-next-line max-len
      const matches = await elasticService.getAutocompleteData(ElasticService.searchData.articles, kw);
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
      const elasticService = new ElasticService();
      // Create indices.
      await elasticService.createArticleIndex();

      // Create mappings.
      await elasticService.createArticleIndexMapping();

      // Migrate data.
      await elasticService.migrateFileDBToElasticIndex();

      logger('Elastic').info('Articles Index created and data migrated.');
      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  },
);

routes.delete(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const elasticService = new ElasticService();
      await elasticService.deleteIndices('articles');

      logger('Elastic').info('Articles Index deleted.');
      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  },
);

export default routes;
