import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { UserService } from "./service/user.service";
import { UserController } from "./controller/user.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User]), User],
  controllers: [UserController],
  providers: [UserService],

})
export class UsersModule {}