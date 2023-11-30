import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { APP_FILTER } from '@nestjs/core';
import { CustomExceptionFilter } from './modules/middlewares/error-handle.middleware';
import { EmailModule } from './modules/mail/email.module';
import { AppMiddleware } from './modules/middlewares/base-url.middleware';

@Module({
  imports: [AuthModule, UsersModule, EmailModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
