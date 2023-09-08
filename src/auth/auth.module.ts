import { Module } from '@nestjs/common';
import { User } from 'src/modules/users/entity/user.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { UserService } from 'src/modules/users/service/user.service';
import { JwtStrategy } from './scurity/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from 'src/database/redis/redis.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), UsersModule,
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '300s' },
      }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    RedisModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService, JwtStrategy],
    exports: [JwtStrategy, PassportModule]
})

export class AuthModule {
}
