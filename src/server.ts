import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { authRoutes, elasticRoutes } from './routes/index';
import swaggerDocs from './swagger.json';
import { CustomError } from './errors';
import logger from './utils/winston';
import morgan from './utils/morgan';

dotenv.config();

class App {
  public server: express.Application;

  public constructor() {
    this.server = express();
    this.config();
    const port = process.env.PORT ? process.env.PORT : 3001;
    this.server.listen(port);
    logger('Server').info(`HCI Service on Port ${port}`);
  }

  private config() {
    this.server.use(morgan);
    this.server.use(express.json());
    this.server.use(cookieParser());
    this.server.use(
      cors({
        origin: process.env.WHITELIST_ORIGINS,
        optionsSuccessStatus: 200,
        credentials: true,
      }),
    );
    this.server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    this.server.all('*', App.validateToken);
    this.server.use('/api/auth', authRoutes);
    this.server.use('/api/elastic', elasticRoutes);
    this.server.use(authRoutes);
    this.server.use(elasticRoutes);

    // Error handler must be the last middleware.
    this.server.use(App.errorHandler);
  }

  private static async validateToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (process.env.NODE_ENV !== 'locals') {
        if (!req.path.includes('/login')
        && !req.path.includes('/signup')
        && !req.path.includes('/api-docs')) {
          const token = req.cookies[`${process.env.COOKIE_NAME}`];
          if (token) {
            const privateKey = process.env.JWT_KEY;
            jwt.verify(token, privateKey);

            return next();
          }

          return res.status(403).json('JWT not present.');
        }
      }
      return next();
    } catch (e) {
      logger('TokenValidation').error(e);
      return res.status(403).json('Error while validating token.');
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
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line no-unused-vars
    next: NextFunction,
  ) {
    if (err instanceof CustomError) {
      logger('Stack').error(err.stack);
      if (err.originalMessage) {
        logger('OriginalMessage').notice(err.originalMessage);
      }
      if (err.payload) {
        logger('Payload').notice(JSON.stringify(err.payload));
      }
      return res.status(err.statusCode).json(err.message);
    }

    logger('ErrorHandler').error(err.message);
    logger('ErrorHandler').error(err.stack);
    return res.status(500).json('An error occurred. Please try again.');
  }
}

export default new App();
