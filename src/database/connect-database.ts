import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.USERNAME_MYSQL,
  password: process.env.PASSWORD_MYSQL,
  database: 'nodejs-internship',
  entities: [__dirname + '/../modules/*/entities/*.entity.{ts,js}'],
  //   migrations: [__dirname + '/../migration/*.{ts,js}'],
  synchronize: false,
  logging: false,
});
