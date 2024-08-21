import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AppInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (request && request?.refreshToken && request?.accessToken) {
      response.header('refreshToken', request.refreshToken);
      response.header('accessToken', request.accessToken);
    } else {
      response.header('refreshToken', '');
      response.header('accessToken', '');
    }
    return next.handle();
  }
}
