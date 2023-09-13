import { Module } from '@nestjs/common';
import { User } from 'src/module/users/entity/user.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/module/users/users.module';
import { UserService } from 'src/module/users/service/user.service';
import { JwtStrategy } from './scurity/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [TypeOrmModule.forFeature([User]), UsersModule,
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '300s' },
      }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService, JwtStrategy],
    exports: [JwtStrategy, PassportModule, AuthService]
})

export class AuthModule {
}
