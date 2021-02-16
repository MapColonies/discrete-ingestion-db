import { HttpError } from '@map-colonies/error-express-handler';
import { StatusCodes } from 'http-status-codes';

export class EntityAlreadyExists extends Error implements HttpError {
  public status = StatusCodes.CONFLICT;
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityAlreadyExists.prototype);
  }
}

export class EntityNotFound extends Error implements HttpError {
  public status = StatusCodes.NOT_FOUND;
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityNotFound.prototype);
  }
}

export class EntityCreationError extends Error implements HttpError {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityCreationError.prototype);
  }
}

export class EntityGetError extends Error implements HttpError {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityGetError.prototype);
  }
}

export class EntityUpdateError extends Error implements HttpError {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityUpdateError.prototype);
  }
}
