import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderException extends HttpException {
  constructor(code: string, message: string, status = HttpStatus.BAD_REQUEST) {
    super(
      {
        code,
        message,
      },
      status,
    );
  }
}