import { CommonErrorDataInterface } from '../interfaces';

export default class UserError extends Error implements CommonErrorDataInterface {
  statusCode: number;

  originalMessage: string;

  stack: string;

  constructor(message:string, statusCode:number, originalMessage:string, stack: string) {
    super(message);

    this.statusCode = statusCode;
    this.originalMessage = originalMessage;
    this.stack = stack;
    Object.setPrototypeOf(this, UserError.prototype);
  }
}
