import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/timeout';

const defaultTimeout = 15000;

/** Pass untouched request through to the next request handler. */
@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    console.log('===  timeout interceptor ====')
    return next.handle(req).timeout(defaultTimeout);
  }
}