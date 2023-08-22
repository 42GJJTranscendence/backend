import { Module } from '@nestjs/common';
import { User } from 'src/modules/users/entity/user.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [TypeOrmModule.forFeature([User]), User],
    controllers: [AuthController],
    providers: [AuthService],
})

export class AuthModule {
}
