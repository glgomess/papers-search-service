import CustomError from './CustomError';

export default class GenericError extends CustomError {
  statusCode: number;

  originalMessage: string;

  payload?: Object;

  constructor(
    message:string,
    statusCode:number,
    originalMessage:string,
    payload?: Object,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.originalMessage = originalMessage;
    if (payload) {
      this.payload = payload;
    }

    Object.setPrototypeOf(this, GenericError.prototype);
  }
}
