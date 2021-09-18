import bcrypt from 'bcrypt';
import DBClient from '../database/postgres';
import { NewUserInterface, UserInterface } from '../interfaces';
import QueryBuilder from '../database/queries';
import UserError from '../errors/UserError';

export default class AuthService {
  saltRounds = 10;

  data: string;

  db: DBClient;

  constructor() {
    this.db = new DBClient();
  }

  async login(user: UserInterface) {
    const { email, password } = user;

    const userQuery = QueryBuilder.findUserByEmail(email);
    const response = await this.db.execute(userQuery);

    if (response.rowCount <= 0) {
      throw new UserError('User not found.', 400);
    }

    const encryptedPassword = response.rows[0].password;
    if (bcrypt.compareSync(password, encryptedPassword)) {
      // If is true, it means the password is correct.
      return {
        firstName: response.rows[0].first_name,
        lastName: response.rows[0].last_name,
        id: response.rows[0].id,
        email: response.rows[0].email,
      };
    }

    throw new UserError('Invalid email or password.', 400);
  }

  async signUp(user: NewUserInterface) {
    const {
      email, password, firstName, lastName,
    } = user;

    // Check for existing user.
    const userEmailQuery = QueryBuilder.findUserByEmail(email);
    const response = await this.db.execute(userEmailQuery);
    if (response.rowCount > 0) {
      throw new UserError('Email already in use.', 400);
    }

    const hash = bcrypt.hashSync(password, this.saltRounds);

    const insertQuery = QueryBuilder.insertNewUser(email, hash, firstName, lastName);
    await this.db.execute(insertQuery);
  }
}
