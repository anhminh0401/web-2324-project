import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './database/connect-database';
import { CustomExceptionFilter } from './modules/middlewares/error-handle.middleware';

async function bootstrap() {
  // connect database mysql by typeORM
  await AppDataSource.initialize();
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CustomExceptionFilter());
  await app.listen(3000);
}
bootstrap();
