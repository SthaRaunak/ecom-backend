import { ErrorCode, HTTPException } from "./root";

export class UnprocessableEntity extends HTTPException {
  constructor(error: any, message: string, errorCode: number) {
    super(message, errorCode, 422, error);
  }
}
