import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { UserDuplicatException } from './custom.exception';

@Catch(UserDuplicatException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: UserDuplicatException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    const status = exception.getStatus();
    const message = exception.message;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
