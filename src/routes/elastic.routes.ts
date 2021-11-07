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
      const matches = await elasticService.getKeywordAutocompleteData(ElasticService.searchData.articles, kw);
      return res.status(200).json(matches);
    } catch (e) {
      next(e);
    }
  },
);

routes.get(
  '/search/authors',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kw = String(req.query.author);
      const elasticService = new ElasticService();
      // eslint-disable-next-line max-len
      const matches = await elasticService.getAuthorAutocompleteData(ElasticService.searchData.articles, kw);
      return res.status(200).json(matches);
    } catch (e) {
      next(e);
    }
  },
);

routes.get(
  '/search/articles',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kw = String(req.query.keywords);
      const authors = String(req.query.authors);
      const { matchKeywords } = req.query;

      // With this line, we can convert the string to boolean.
      const shouldMatchAllKeywords = (matchKeywords !== 'false');
      const elasticService = new ElasticService();
      const matches = await elasticService.getArticles(
        ElasticService.searchData.articles,
        kw,
        authors,
        shouldMatchAllKeywords,
      );

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

      // Migrate data.
      // Maybe migrate to different indexes?
      await elasticService.migrateArticlesFileDBToElasticIndex();
      await elasticService.migrateKeywordsFileDBToElasticIndex();
      await elasticService.migrateAuthorsFileDBToElasticIndex();

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
