import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus  } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal server error';
    const error = exception.name || 'Error';

    if (message == "Unauthorized") {
        return res.redirect('/login');
    }

    return res.status(status).render('error', {
      title: 'Błąd',
      statusCode: status,
      message,
      error,
    });
  }
}
