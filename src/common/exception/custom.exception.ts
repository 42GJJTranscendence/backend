import { HttpException, HttpStatus } from '@nestjs/common';

export class UserDuplicatException extends HttpException {
  constructor() {
    super('Username already exist!', HttpStatus.BAD_REQUEST);
  }
}

export class SendMessageFailException extends HttpException {
  constructor() {
    super('Send MessageFail!', HttpStatus.BAD_REQUEST);
  }
}

