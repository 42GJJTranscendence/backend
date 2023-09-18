import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';

export class UserDuplicatException extends HttpException {
  constructor() {
    super('Username already exist!', HttpStatus.BAD_REQUEST);
  }
}

export class SendMessageFailException { 
}