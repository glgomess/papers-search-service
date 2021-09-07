import express, { Response, Request, NextFunction } from 'express';

const routes = express.Router();

const tempUser = [];

routes.get(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (e) {}
  },
);

routes.post(
  '/signup',
  async (req: Request, res: Response, next: NextFunction) => {
    try {

    } catch (e) {}
  },
);

routes.post(
  '/recover',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (e) {}
  },
);

export default routes;
