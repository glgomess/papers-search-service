export default abstract class CustomError extends Error {
  // To send on HTTP response.
  statusCode: number;

  stack: string;

  // To send on HTTP response.
  message: string;

  originalMessage: string;

  payload?:Object;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
