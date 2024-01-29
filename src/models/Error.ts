export class UserVisibleError extends Error {
  errorCode:number|null;
  constructor(message: string, errorCode : number|null = null) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
  }
}

export class InternalError extends Error {
  additionalMessage: string;
  constructor(message: string = '') {
    super("An unexpected error occurred.");
    this.name = this.constructor.name;
    this.additionalMessage = message; // more info about the error
  }
}