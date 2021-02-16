import { StatusCodes } from 'http-status-codes';

export class EntityAlreadyExists extends Error {
  public status = StatusCodes.CONFLICT;
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityAlreadyExists.prototype);
  }
}

export class EntityNotFound extends Error {
  public status = StatusCodes.NOT_FOUND;
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityNotFound.prototype);
  }
}

export class EntityCreationError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityCreationError.prototype);
  }
}

export class EntityGetError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityGetError.prototype);
  }
}

export class EntityUpdateError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EntityUpdateError.prototype);
  }
}
