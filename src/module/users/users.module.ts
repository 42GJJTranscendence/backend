import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { UserService } from "./service/user.service";
import { UserController } from "./controller/user.controller";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [TypeOrmModule.forFeature([User]), User,
  PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],

})
export class UsersModule { }