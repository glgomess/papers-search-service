import bcrypt from 'bcrypt';
import DBClient from '../database/postgres';
import { NewUserInterface, UserInterface } from '../interfaces';
import QueryBuilder from '../database/queries';
import { GenericError, UserError } from '../errors';

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
    try {
      const response = await this.db.execute(userQuery);
      if (response.rowCount <= 0) {
        throw new UserError('User not found.', 400, '', email);
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

      throw new UserError('Invalid password.', 400, '', { email });
    } catch (e) {
      if (!(e instanceof UserError)) {
        throw new GenericError('An error occurred while attempting to login.', 500, e.message, e.stack);
      }
      throw e;
    }
  }

  async signUp(user: NewUserInterface) {
    const {
      email, password, firstName, lastName,
    } = user;

    // Check for existing user.
    const userEmailQuery = QueryBuilder.findUserByEmail(email);
    try {
      const response = await this.db.execute(userEmailQuery);
      if (response.rowCount > 0) {
        throw new UserError('Email already in use.', 400, '', { email, firstName, lastName });
      }

      const hash = bcrypt.hashSync(password, this.saltRounds);

      const insertQuery = QueryBuilder.insertNewUser(email, hash, firstName, lastName);
      await this.db.execute(insertQuery);
    } catch (e) {
      if (!(e instanceof UserError)) {
        throw new GenericError('An error occurred while signing up.', 500, e.message, { email, firstName, lastName });
      }

      throw e;
    }
  }
}
