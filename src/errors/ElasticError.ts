export default class ElasticError extends Error {
  statusCode: number;

  originalMessage: string;

  stack: string;

  constructor(message:string, statusCode:number, originalMessage:string, stack: string) {
    super(message);

    this.statusCode = statusCode;
    this.originalMessage = originalMessage;
    this.stack = stack;
    Object.setPrototypeOf(this, ElasticError.prototype);
  }

  serializeMessage() {
    return this.originalMessage;
  }
}