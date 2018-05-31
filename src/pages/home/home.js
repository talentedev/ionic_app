var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MainPage } from '../main/main';
var HomePage = /** @class */ (function () {
    function HomePage(navCtrl, loadingCtrl, alertCtrl, http, iab) {
        this.navCtrl = navCtrl;
        this.loadingCtrl = loadingCtrl;
        this.alertCtrl = alertCtrl;
        this.http = http;
        this.iab = iab;
        this.logoUrl = 'assets/imgs/logo.png';
        this.linkToYoutube = 'https://www.youtube.com/watch?v=C0DPdy98e4c';
        this.accessCode = '';
        this.httpOptions = {
            headers: new HttpHeaders({
                'timeout': '${10}'
            })
        };
    }
    // Login to next screen with correnct access code.
    HomePage.prototype.login = function () {
        var _this = this;
        var loader = this.loadingCtrl.create({
            content: 'Please wait...',
            dismissOnPageChange: true,
        });
        loader.present();
        var codeAlert = this.alertCtrl.create({
            title: 'Wrong Access Code!',
            subTitle: 'Your access code dont exist. Please retry with other Access Code.',
            buttons: ['OK']
        });
        var connectionAlert = this.alertCtrl.create({
            title: 'Connection problem!',
            subTitle: 'Server is stopped temporarily or no internet access. Please check your internet connection.',
            buttons: ['OK']
        });
        var url = 'http://staffapi.pheramor.com//login.php?code=' + this.accessCode;
        this.http.get(url).subscribe(function (resp) {
            if (resp != null) {
                _this.navCtrl.push(MainPage, {
                    data: resp
                });
            }
            else {
                codeAlert.present();
                loader.dismiss();
            }
        }, function (error) {
            console.log('--------- Login Error --------');
            console.log(error);
            connectionAlert.present();
            loader.dismiss();
        });
    };
    // Open tutorial video on new browser.
    HomePage.prototype.openVideoTutorial = function () {
        this.iab.create(this.linkToYoutube);
    };
    HomePage = __decorate([
        Component({
            selector: 'page-home',
            templateUrl: 'home.html'
        }),
        __metadata("design:paramtypes", [NavController, LoadingController, AlertController, HttpClient, InAppBrowser])
    ], HomePage);
    return HomePage;
}());
export { HomePage };
//# sourceMappingURL=home.js.map