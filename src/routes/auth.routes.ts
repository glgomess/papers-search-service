import express, { Response, Request, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { NewUserInterface, UserInterface } from '../interfaces';
import AuthService from '../services/auth.service';
import generateJWT from '../utils/jwt-generator';

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
        throw errors;
      }

      const user: UserInterface = req.body;
      const authService = new AuthService();
      const completeUserData = await authService.login(user);

      res.cookie('hci-key', generateJWT(), { maxAge: 28800 });
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
        throw errors;
      }

      const newUser: NewUserInterface = req.body;
      const authService = new AuthService();
      await authService.signUp(newUser);

      return res.status(200).json('Success');
    } catch (e) {
      next(e);
    }
  },
);

// routes.post(
//   '/recover',
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//     } catch (e) {}
//   },
// );

export default routes;
