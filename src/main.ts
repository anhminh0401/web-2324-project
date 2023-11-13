import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './database/connect-database';

async function bootstrap() {
  // connect database mysql by typeORM
  await AppDataSource.initialize();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
