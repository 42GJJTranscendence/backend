// typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PSQL_HOST,
  port: 5432,
  username: process.env.PSQL_USERNAME,
  password: process.env.PSQL_PASSWORD,
  database: process.env.PSQL_DBNAME,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
