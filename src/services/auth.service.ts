import bcrypt from 'bcrypt';
import DBClient from '../database/postgres';
import { NewUserInterface } from '../interfaces';
import User from '../interfaces/user.interface';
import QueryBuilder from '../database/queries';

export default class AuthService {
  saltRounds = 10;

  data: string;

  usersDB:Array<User>;

  db: DBClient;

  constructor() {
    this.db = new DBClient();
  }

  async signUp(user: NewUserInterface) {
    const {
      email, password, firstName, lastName,
    } = user;

    const userEmailQuery = QueryBuilder.findUserByEmail(email);
    const response = await this.db.execute(userEmailQuery);
    if (response.rowCount > 0) {
      throw new Error('Email already in use.');
    }

    const hash = bcrypt.hashSync(password, this.saltRounds);

    const insertQuery = QueryBuilder.insertNewUser(email, hash, firstName, lastName);
    await this.db.execute(insertQuery);
  }
}
