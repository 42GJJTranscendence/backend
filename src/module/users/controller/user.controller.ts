import { Get, Controller, Param, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/check/duplication')
  async CheckDuplicationUserName(@Query('username') username: string) {
    console.log(username);
    let user = await this.userService.findOneByUsername(username);
    console.log(user);
    if (user != null) {
      return true;
    } else return false;
  }
}
