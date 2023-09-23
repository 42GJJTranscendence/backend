import { Injectable } from '@nestjs/common';

@Injectable()
export class UserStatusService {
  private userStatus = {};

  setUserStatus(username: string, status: string) {
    this.userStatus[username] = status;
  }

  getUserStatus(username: string) {
    return this.userStatus[username];
  }
}