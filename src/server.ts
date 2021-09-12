import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authRoutes } from './routes/index';

dotenv.config();

class App {
  public server: express.Application;

  public constructor() {
    this.server = express();
    this.config();

    this.server.listen(process.env.PORT);
    console.log(`HCI Service on Port ${process.env.PORT}`);
  }

  private config() {
    this.server.use(express.json());
    this.server.use(
      cors({ origin: process.env.WHITELIST_ORIGINS, optionsSuccessStatus: 200 }),
    );
    this.server.all('*', App.validateToken);
    this.server.use('/api', authRoutes);
    this.server.use(authRoutes);

    // Error handler must be the last middleware.
    this.server.use(App.errorHandler);
  }

  private static async validateToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (process.env.NODE_ENV !== 'local') {
        if (req.path !== '/login' && req.path !== '/signup') {
          const privateKey = process.env.JWT_KEY;
          const token = req.headers.authorization;
          jwt.verify(token, privateKey);

          return next();
        }
      }
      return next();
    } catch (e) {
      console.error(e);
      return res.status(403).json();
    }
  }

  /**
   *
   * @param err
   * @param req
   * @param res
   * @param next
   *
   * Para que o Node reconheca que esse middleware eh um middleware de
   * erro, ele precisa ter esses 4 parametros.
   */
  static errorHandler(
    err: any,
    req: Request,
    res: Response,
    // eslint-disable-next-line no-unused-vars
    next: NextFunction,
  ) {
    if (err.message) {
      console.log(err.message);
    } else {
      // In this case, it is a validation error thrown by the validator.
      console.log(err);
    }

    if (err.stack) {
      console.log(err.stack);
    }

    if (err.name === 'UserError') {
      return res.status(400).json(err.message);
    }

    return res.status(500).json('An error occurred. Please try again.');
  }
}

export default new App();
