import { ErrorCode, HTTPException } from "./root";

class InternalException extends HTTPException {
  constructor(message: string, errors: any, errorCode: number) {
    super(message, errorCode, 500, errors);
  }
}

export { InternalException };
