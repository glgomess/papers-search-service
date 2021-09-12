export default class UserError extends Error {
  status: number;

  name: string;

  message: string;

  stack: string;

  constructor(message: string, status: number) {
    super(message);
    // Error.captureStackTrace(this, this.constructor);
    this.stack = (new Error()).stack;

    this.name = 'UserError';
    this.status = status;
  }
}
