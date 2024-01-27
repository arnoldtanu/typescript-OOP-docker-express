export class UserVisibleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
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