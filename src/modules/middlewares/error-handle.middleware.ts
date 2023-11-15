import { Response } from 'express';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { CustomError } from 'src/helper/errors';
import { ResponseWrapper } from 'src/helper/response-wrapper';

@Catch(CustomError)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    exception.status = exception.status || 400;

    response
      .status(exception.status)
      .send(new ResponseWrapper(null, exception, null));
  }
}
