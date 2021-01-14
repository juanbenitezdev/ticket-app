export abstract class CustomError extends Error {
  abstract statusCode: number; // abstract means that subclasses HAVE to implement the fields or methods

  constructor(message: string) {
    super(message);

    // Only because we are extending a built class
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): {
    message: string;
    field?: string;
  }[];
}
