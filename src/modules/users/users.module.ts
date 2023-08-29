import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { UserService } from "./service/user.service";

@Module({
  imports: [TypeOrmModule.forFeature([User]), User],
  providers: [UserService],

})
export class UsersModule {}