// typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'postgresql',
  port: 5432,
  username: 'jaehyuki',
  password: '1234',
  database: 'main',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};