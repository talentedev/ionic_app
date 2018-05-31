var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/timeout';
var defaultTimeout = 100;
/** Pass untouched request through to the next request handler. */
var TimeoutInterceptor = /** @class */ (function () {
    function TimeoutInterceptor() {
    }
    TimeoutInterceptor.prototype.intercept = function (req, next) {
        console.log('===  timeout interceptor ====');
        return next.handle(req).timeout(defaultTimeout);
    };
    TimeoutInterceptor = __decorate([
        Injectable()
    ], TimeoutInterceptor);
    return TimeoutInterceptor;
}());
export { TimeoutInterceptor };
//# sourceMappingURL=timeout-interceptor.js.map