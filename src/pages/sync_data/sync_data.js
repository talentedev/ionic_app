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
import { Storage } from '@ionic/storage';
var SyncPage = /** @class */ (function () {
    function SyncPage(navCtrl, alertCtrl, loadingCtrl, http, navParams, storage) {
        this.navCtrl = navCtrl;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.http = http;
        this.navParams = navParams;
        this.storage = storage;
        this.endpoint = 'https://likeswiperight.agilecrm.com/dev/';
        this.username = '';
        this.password = '';
        this.registrantsStatus = 'all';
        this.numberOfRegistrants = 0;
        this.registrants = [];
        this.successedRegistrants = [];
        this.failedRegistrants = [];
        this.countSyncData = 0;
        this.countSyncFailed = 0;
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
        this.init();
    }
    // Initialize
    SyncPage.prototype.init = function () {
        var _this = this;
        this.storage.get('entries').then(function (val) {
            var data = JSON.parse(val);
            if (data == null) {
                _this.registrants = [];
                _this.numberOfRegistrants = _this.registrants.length;
            }
            else {
                _this.numberOfRegistrants = data.length;
                _this.registrants = data;
            }
        });
        this.storage.get('successedRegistrants').then(function (val) {
            if (JSON.parse(val) == null) {
                _this.storage.set('successedRegistrants', JSON.stringify([]));
            }
            else {
                _this.successedRegistrants = JSON.parse(val);
            }
        });
        this.storage.get('failedRegistrants').then(function (val) {
            if (JSON.parse(val) == null) {
                _this.storage.set('failedRegistrants', JSON.stringify([]));
            }
            else {
                _this.failedRegistrants = JSON.parse(val);
            }
        });
    };
    // Synchronize data
    SyncPage.prototype.syncData = function () {
        this.successedRegistrants = [];
        this.failedRegistrants = [];
        var submittingLoader = this.loadingCtrl.create({
            content: 'Submitting...',
            dismissOnPageChange: true,
        });
        submittingLoader.present();
        for (var val in this.registrants) {
            this.submit(this.registrants[val], submittingLoader);
        }
    };
    // Submit data
    SyncPage.prototype.submit = function (data, submittingLoader) {
        var _this = this;
        var searchContactByEmailUrl = this.endpoint + 'api/contacts/search/email/' + data.properties[2].value;
        this.http.get(searchContactByEmailUrl, this.httpOptions).subscribe(function (response) {
            var searchContactByPheramorIDUrl = _this.endpoint + 'api/search/?q=' + data.properties[3].value + '&page_size=10&type="PERSON"';
            if (response == null) {
                _this.http.get(searchContactByPheramorIDUrl, _this.httpOptions).subscribe(function (resp) {
                    // The ID already exist
                    if (resp[0] != null && _this.getEmail(resp[0].properties) != data.properties[2].value) {
                        _this.failedRegistrants.push(data);
                        _this.showResult(data, submittingLoader, false);
                    }
                    else { // The ID don't exist
                        var createContactUrl = _this.endpoint + 'api/contacts';
                        _this.http.post(createContactUrl, data, _this.httpOptions).subscribe(function (resp) {
                            _this.successedRegistrants.push(data);
                            _this.showResult(data, submittingLoader, true);
                        });
                    }
                });
            }
            else {
                _this.http.get(searchContactByPheramorIDUrl, _this.httpOptions).subscribe(function (resp) {
                    // The ID already exist
                    if (resp[0] != null && _this.getEmail(resp[0].properties) != data.properties[2].value) {
                        _this.failedRegistrants.push(data);
                        _this.showResult(data, submittingLoader, false);
                    }
                    else { // The ID don't exist
                        var updateContactUrl = _this.endpoint + 'api/contacts/edit-properties';
                        data.id = response['id'];
                        _this.http.put(updateContactUrl, data, _this.httpOptions).subscribe(function (resp) {
                            _this.successedRegistrants.push(data);
                            _this.showResult(data, submittingLoader, true);
                        });
                    }
                });
            }
        }, function (error) {
            console.log('--------- Sync Error --------');
            console.log(JSON.stringify(error));
            _this.showErrorResult(data, submittingLoader);
        });
    };
    // Get email value
    SyncPage.prototype.getEmail = function (data) {
        for (var key in data) {
            if (data[key].name == 'email') {
                return data[key].value;
            }
        }
    };
    // Clear Data
    SyncPage.prototype.clearData = function () {
        this.storage.set('entries', JSON.stringify([]));
        this.storage.set('successedRegistrants', JSON.stringify([]));
        this.storage.set('failedRegistrants', JSON.stringify([]));
        this.countSyncData = 0;
        this.alertCtrl.create({
            title: 'Success!',
            subTitle: 'All data deleted from local database.',
            buttons: ['OK']
        }).present();
        this.init();
    };
    // Show alert when synchronizing data is finished.
    SyncPage.prototype.showResult = function (data, submittingLoader, success) {
        var _this = this;
        if (success == true) {
            this.storage.get('successedRegistrants').then(function (val) {
                var savedData = JSON.parse(val);
                savedData.push(data);
                _this.storage.set('successedRegistrants', JSON.stringify(savedData));
                _this.init();
            });
        }
        else {
            this.storage.get('failedRegistrants').then(function (val) {
                var savedData = JSON.parse(val);
                savedData.push(data);
                _this.storage.set('failedRegistrants', JSON.stringify(savedData));
                _this.init();
            });
        }
        this.countSyncData++;
        var failedCount = this.failedRegistrants.length;
        var successedCount = this.successedRegistrants.length;
        var str = '';
        if (failedCount == 0) {
            str = 'All data was sychronized successfully.';
        }
        else {
            str = successedCount + ' data was sychronized successfully. ' + failedCount + ' data was failed because the same ID already exist.';
        }
        if (this.countSyncData == this.numberOfRegistrants) {
            submittingLoader.dismiss();
            this.alertCtrl.create({
                title: 'Synchronize data successfully!',
                subTitle: str,
                buttons: ['OK']
            }).present();
            this.countSyncData = 0;
            this.storage.set('entries', JSON.stringify([]));
            this.init();
        }
    };
    // Show error result
    SyncPage.prototype.showErrorResult = function (data, submittingLoader) {
        var _this = this;
        this.storage.get('failedRegistrants').then(function (val) {
            var savedData = JSON.parse(val);
            savedData.push(data);
            _this.storage.set('failedRegistrants', JSON.stringify(savedData));
            _this.init();
        });
        this.countSyncFailed++;
        if (this.countSyncFailed == this.numberOfRegistrants) {
            submittingLoader.dismiss();
            this.failedRegistrants = this.registrants;
            var str = this.failedRegistrants.length + ' data was failed due to no internet connection.';
            this.alertCtrl.create({
                title: 'Synchronize data failed!',
                subTitle: str,
                buttons: ['OK']
            }).present();
            this.countSyncFailed = 0;
        }
    };
    SyncPage = __decorate([
        Component({
            selector: 'page-sync',
            templateUrl: 'sync_data.html'
        }),
        __metadata("design:paramtypes", [NavController, AlertController, LoadingController, HttpClient, NavParams, Storage])
    ], SyncPage);
    return SyncPage;
}());
export { SyncPage };
//# sourceMappingURL=sync_data.js.map