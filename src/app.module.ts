import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { APP_FILTER } from '@nestjs/core';
import { CustomExceptionFilter } from './modules/middlewares/error-handle.middleware';
import { EmailModule } from './modules/mail/email.module';
import { AppMiddleware } from './modules/middlewares/base-url.middleware';
import { ClassModule } from './modules/class/class.module';
import { GradeModule } from './modules/grade/grade.module';
import { GradeReviewModule } from './modules/grade-review/grade-review.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    EmailModule,
    ClassModule,
    GradeModule,
    GradeReviewModule,
    NotificationModule,
  ],
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
