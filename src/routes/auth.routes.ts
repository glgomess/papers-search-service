import express, { Response, Request, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import RequestValidationError from '../errors/RequestValidationError';
import { NewUserInterface, UserInterface } from '../interfaces';
import AuthService from '../services/auth.service';
import generateJWT from '../utils/jwt-generator';
import logger from '../utils/winston';

const routes = express.Router();

routes.post(
  '/login',
  body('email', 'Invalid email')
    .isEmail()
    .isLowercase(),
  body('password', 'Invalid password')
    .isAlphanumeric()
    .isLength({ max: 20 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new RequestValidationError('Invalid data sent on HTTP request.', 400, '', errors);
      }

      const user: UserInterface = req.body;
      const authService = new AuthService();
      const completeUserData = await authService.login(user);

      logger('Login').info(
        `User ${completeUserData.firstName} ${completeUserData.lastName} logged in.`,
      );
      res.cookie('hci-key', generateJWT(),
        { maxAge: 28800, domain: process.env.HCI_FRONT_URL });
      return res.status(200).json(completeUserData);
    } catch (e) {
      next(e);
    }
  },
);

routes.post(
  '/signup',
  body('email', 'Invalid email')
    .isEmail()
    .isLowercase(),
  body('password', 'Invalid password')
    .isAlphanumeric()
    .isLength({ max: 20 }),
  body('firstName', 'Invalid First Name')
    .isString()
    .isLength({ max: 50 }),
  body('lastName', 'Invalid Last Name')
    .isString()
    .isLength({ max: 50 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new RequestValidationError('Invalid data sent on HTTP request.', 400, '', errors);
      }

      const newUser: NewUserInterface = req.body;
      const authService = new AuthService();
      await authService.signUp(newUser);

      logger('SignUp').info(
        `User ${newUser.firstName} ${newUser.lastName} successfully signed up.`,
      );
      return res.status(200).json('Success');
    } catch (e) {
      next(e);
    }
  },
);

export default routes;
