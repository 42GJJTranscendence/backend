import { Module } from '@nestjs/common';
import { User } from 'src/modules/users/entity/user.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { UserService } from 'src/modules/users/service/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([User]), UsersModule,
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '300s' },
      }),
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService],
})

export class AuthModule {
}
