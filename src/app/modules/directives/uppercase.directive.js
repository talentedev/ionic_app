var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, Input, Output, EventEmitter } from '@angular/core';
var Uppercase = /** @class */ (function () {
    function Uppercase() {
        this.uppercaseChange = new EventEmitter();
    }
    Uppercase.prototype.ngOnInit = function () {
        this.uppercase = this.uppercase || '';
        this.format(this.uppercase);
    };
    Uppercase.prototype.format = function (value) {
        value = value.replace(/[^a-zA-Z]+/g, '').toUpperCase();
        this.uppercaseChange.next(value);
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], Uppercase.prototype, "uppercase", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], Uppercase.prototype, "uppercaseChange", void 0);
    Uppercase = __decorate([
        Directive({
            selector: '[uppercase]',
            host: {
                '[value]': 'uppercase',
                '(input)': 'format($event.target.value)'
            }
        }),
        __metadata("design:paramtypes", [])
    ], Uppercase);
    return Uppercase;
}());
export { Uppercase };
//# sourceMappingURL=uppercase.directive.js.map