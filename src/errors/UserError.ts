import CustomError from './CustomError';

export default class UserError extends CustomError {
  statusCode: number;

  originalMessage: string;

  stack: string;

  payload?: Object;

  constructor(
    message:string,
    statusCode:number,
    originalMessage:string,
    stack: string,
    payload?: Object,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.originalMessage = originalMessage;
    this.stack = stack;
    if (payload) {
      this.payload = payload;
    }
    Object.setPrototypeOf(this, UserError.prototype);
  }
}
