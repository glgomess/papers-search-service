export default abstract class CustomError extends Error {
  statusCode: number;

  stack: string;

  message: string;

  originalMessage: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
