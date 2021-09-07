import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

class App {
  public server: express.Application;

  public constructor() {
    this.server = express();
    this.config();

    this.server.listen(process.env.port);
    console.log(`HCI Service on Port ${process.env.PORT}`);
  }

  private config() {
    this.server.use(express.json());
    this.server.use(
      cors({ origin: process.env.WHITELIST_ORIGINS, optionsSuccessStatus: 200 }),
    );
    this.server.use(App.validateToken);
    // Middleware de erro deve ser o ultimo a ser usado.
    // this.server.use(this.errorHandler);
  }

  private static async validateToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (process.env.NODE_ENV !== 'local') {
        const privateKey = process.env.JWT_KEY;
        const token = req.headers.authorization;
        jwt.verify(token, privateKey);

        return next();
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
  // private errorHandler(
  //   err: Error,
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   // Sempre retornar uma mensagem
  //   errorLogger.error({
  //     message: `ID: ${res.locals.id} - ${err.message}`,
  //   });
  //   console.log(err.stack);

  //   return res.status(500).json(err.message);
  // }
}

export default new App();
