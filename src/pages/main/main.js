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
import { NavController, AlertController, LoadingController, NavParams } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { HomePage } from '../home/home';
import { SyncPage } from '../sync_data/sync_data';
var MainPage = /** @class */ (function () {
    function MainPage(navCtrl, alertCtrl, loadingCtrl, http, navParams, barcodeScanner, storage) {
        this.navCtrl = navCtrl;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.http = http;
        this.navParams = navParams;
        this.barcodeScanner = barcodeScanner;
        this.storage = storage;
        this.barCode = '';
        this.first_name = '';
        this.last_name = '';
        this.phone_number = '';
        this.email = '';
        this.re_email = '';
        this.entries = 0;
        this.endpoint = 'https://likeswiperight.agilecrm.com/dev/';
        this.username = '';
        this.password = '';
        this.user_data = navParams.get('data');
        this.username = this.user_data.staff_email;
        this.password = this.user_data.api_key;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(this.username + ':' + this.password)
            })
        };
        this.masks = {
            phoneNumber: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
            barcode: [/[a-zA-Z]/, /[a-zA-Z]/, '-', /[0-9]/, /\d/, /\d/, /\d/, /\d/, '-', /\d/]
        };
        this.init();
    }
    MainPage.prototype.ionViewWillEnter = function () {
        var _this = this;
        this.storage.get('entries').then(function (val) {
            if (JSON.parse(val) != null) {
                _this.entries = JSON.parse(val).length;
            }
        });
    };
    // Initialize the variables
    MainPage.prototype.init = function () {
        var _this = this;
        this.barCode = '';
        this.first_name = '';
        this.last_name = '';
        this.phone_number = '';
        this.email = '';
        this.re_email = '';
        this.storage.get('entries').then(function (val) {
            if (JSON.parse(val) == null) {
                _this.storage.set('entries', JSON.stringify([]));
            }
            else {
                _this.entries = JSON.parse(val).length;
            }
        });
    };
    // Scan barcode
    MainPage.prototype.scanBarcode = function () {
        var _this = this;
        var options = {
            showTorchButton: true
        };
        this.barcodeScanner.scan(options).then(function (barcodeData) {
            _this.barCode = barcodeData.text;
        }).catch(function (err) {
            _this.alertCtrl.create({
                title: 'Scan failed!',
                subTitle: 'Barcode scan is failed. Please try again.',
                buttons: ['OK']
            }).present();
        });
    };
    // Submit the data to AgileCRM
    MainPage.prototype.submit = function () {
        var _this = this;
        if (this.validate()) {
            var loader_1 = this.loadingCtrl.create({
                content: 'Submitting...',
                dismissOnPageChange: true,
            });
            loader_1.present();
            var searchContactByEmailUrl = this.endpoint + 'api/contacts/search/email/' + this.email;
            this.http.get(searchContactByEmailUrl, this.httpOptions).subscribe(function (response) {
                console.log('--------- Search Contact Result --------');
                console.log(JSON.stringify(response));
                var requestData = _this.makeRequestdata();
                var searchContactByPheramorIDUrl = _this.endpoint + 'api/search/?q=' + _this.barCode.toUpperCase() + '&page_size=10&type="PERSON"';
                if (response == null) {
                    _this.http.get(searchContactByPheramorIDUrl, _this.httpOptions).subscribe(function (resp) {
                        // The ID already exist
                        if (resp[0] != null && _this.getEmail(resp[0].properties) != requestData.properties[2].value) {
                            loader_1.dismiss();
                            _this.alertCtrl.create({
                                title: 'Contact creation failed!',
                                subTitle: 'The ID already exist. Please try with other ID.',
                                buttons: ['OK']
                            }).present();
                        }
                        else { // The ID don't exist
                            var createContactUrl = _this.endpoint + 'api/contacts';
                            _this.http.post(createContactUrl, requestData, _this.httpOptions).subscribe(function (data) {
                                loader_1.dismiss();
                                _this.alertCtrl.create({
                                    title: 'Success!',
                                    subTitle: 'New contact was created successfully.',
                                    buttons: ['OK']
                                }).present();
                                _this.init();
                            }, function (error) {
                                loader_1.dismiss();
                                _this.showConnectionAlert();
                                _this.saveData();
                            });
                        }
                    }, function (error) {
                        loader_1.dismiss();
                        _this.showConnectionAlert();
                        _this.saveData();
                    });
                }
                else {
                    _this.http.get(searchContactByPheramorIDUrl, _this.httpOptions).subscribe(function (resp) {
                        console.log('============ Email ===========');
                        console.log(_this.getEmail(resp[0].properties));
                        // The ID already exist
                        if (resp[0] != null && _this.getEmail(resp[0].properties) != requestData.properties[2].value) {
                            loader_1.dismiss();
                            _this.alertCtrl.create({
                                title: 'Contact creation failed!',
                                subTitle: 'The ID already exist. Please try with other ID.',
                                buttons: ['OK']
                            }).present();
                        }
                        else { // The ID don't exist
                            console.log('------------ Update Contact ------------------');
                            console.log(response['id']);
                            var updateContactUrl = _this.endpoint + 'api/contacts/edit-properties';
                            requestData['id'] = response['id'];
                            _this.http.put(updateContactUrl, requestData, _this.httpOptions).subscribe(function (data) {
                                loader_1.dismiss();
                                _this.alertCtrl.create({
                                    title: 'Success!',
                                    subTitle: 'Contact was updated successfully.',
                                    buttons: ['OK']
                                }).present();
                                _this.init();
                            }, function (error) {
                                console.log('--------- Contact Update Error --------');
                                console.log(JSON.stringify(error));
                                loader_1.dismiss();
                                _this.showConnectionAlert();
                                _this.saveData();
                            });
                        }
                    });
                }
            }, function (error) {
                console.log('--------- Submitting Error --------');
                console.log(JSON.stringify(error));
                loader_1.dismiss();
                _this.showConnectionAlert();
                _this.saveData();
            });
        }
    };
    // Get email value
    MainPage.prototype.getEmail = function (data) {
        for (var key in data) {
            if (data[key].name == 'email') {
                return data[key].value;
            }
        }
    };
    // Show Connection Error Alert
    MainPage.prototype.showConnectionAlert = function () {
        this.alertCtrl.create({
            title: 'Connection Error!',
            subTitle: 'No internet acceess or invalid email and key. The data saved on local database. You can synchronize them later.',
            buttons: ['OK']
        }).present();
    };
    // Save the data on local database
    MainPage.prototype.saveData = function () {
        var _this = this;
        var data = this.makeRequestdata();
        data['saved_at'] = Date();
        this.storage.get('entries').then(function (val) {
            var savedData = JSON.parse(val);
            savedData.push(data);
            _this.storage.set('entries', JSON.stringify(savedData));
            _this.init();
        });
    };
    //  Check form data validation.
    MainPage.prototype.validate = function () {
        if (this.barCode == '' || this.first_name == '' || this.last_name == '' || this.email == '') {
            this.alertCtrl.create({
                title: 'Validation error!',
                subTitle: 'You must fill all items.',
                buttons: ['OK']
            }).present();
            return false;
        }
        else if (this.email != this.re_email) {
            this.alertCtrl.create({
                title: 'No match email address!',
                subTitle: 'Please reenter email address.',
                buttons: ['OK']
            }).present();
            return false;
        }
        return true;
    };
    // Get data for http request
    MainPage.prototype.makeRequestdata = function () {
        var data = {
            'tags': [this.user_data.staff_tag],
            'properties': [
                {
                    "type": "SYSTEM",
                    "name": "first_name",
                    "value": this.first_name
                },
                {
                    "type": "SYSTEM",
                    "name": "last_name",
                    "value": this.last_name
                },
                {
                    "type": "SYSTEM",
                    "name": "email",
                    "value": this.email
                },
                {
                    "name": "Pheramor ID",
                    "type": "CUSTOM",
                    "value": this.barCode.toUpperCase()
                },
                {
                    "name": "Phone Number",
                    "type": "CUSTOM",
                    "value": this.phone_number.replace(/\D+/g, '')
                }
            ]
        };
        return data;
    };
    // Move to saved data page
    MainPage.prototype.viewSyncData = function () {
        this.navCtrl.push(SyncPage, {
            data: this.user_data
        });
    };
    // Log out
    MainPage.prototype.logout = function () {
        this.navCtrl.push(HomePage);
    };
    MainPage = __decorate([
        Component({
            selector: 'page-main',
            templateUrl: 'main.html'
        }),
        __metadata("design:paramtypes", [NavController, AlertController, LoadingController, HttpClient, NavParams, BarcodeScanner, Storage])
    ], MainPage);
    return MainPage;
}());
export { MainPage };
//# sourceMappingURL=main.js.map