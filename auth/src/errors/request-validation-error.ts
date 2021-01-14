import { ValidationError } from 'express-validator';

interface customError {
  statusCode: number;
  serializeErrors(): {
    message: string;
    field?: string;
  }[];
}

export class RequestValidationError extends Error implements customError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super();

    // Only because we are extending a built class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return { message: err.msg, field: err.param };
    });
  }
}
