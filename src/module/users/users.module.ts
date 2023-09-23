import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { UserService } from "./service/user.service";
import { UserController } from "./controller/user.controller";
import { PassportModule } from "@nestjs/passport";
import { FriendMoudle } from "./friend/friend.module";
import { AuthModule } from "src/auth/auth.module";
import { UserStatusService } from "./service/userStatus.service";

@Module({
  imports: [TypeOrmModule.forFeature([User]), User,
  PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [UserController],
  providers: [UserService, UserStatusService],
  exports: [UserService, UserStatusService],

})
export class UsersModule { }