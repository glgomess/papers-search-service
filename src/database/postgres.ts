import { Pool } from 'pg';

export default class DBClient {
  pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DATABASE,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      ssl: { rejectUnauthorized: false },
    });
  }

  async execute(query: string) {
    return this.pool.query(query);
  }
}
