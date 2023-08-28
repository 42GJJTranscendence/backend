import { Module } from '@nestjs/common';
import { User } from 'src/modules/users/entity/user.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([User]), User,
    JwtModule.register({
        secret: process.env.JTW_SCERET,
        signOptions: { expiresIn: '300s' },
      }),],
    controllers: [AuthController],
    providers: [AuthService],
})

export class AuthModule {
}
