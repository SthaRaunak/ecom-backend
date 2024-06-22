import { ErrorCode, HTTPException } from "./root";

export class UnauthorizedException extends HTTPException {
  constructor(message: string, errorCode: ErrorCode, errors?: any) {
    super(message, errorCode, 401, errors);
  }
}
