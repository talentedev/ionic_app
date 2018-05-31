import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TimeoutError } from 'rxjs/util/TimeoutError';

import { MainPage } from '../main/main';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  logoUrl = 'assets/imgs/logo.png'
  linkToYoutube = 'https://youtu.be/igppm2Ynbr4'
  accessCode : string = ''

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public http: HttpClient, private iab: InAppBrowser) {

  }

  // Login to next screen with correnct access code.
  login() {

    let loader = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true,
    })
    loader.present()

    let codeAlert = this.alertCtrl.create({
      title: 'Wrong Access Code!',
      subTitle: 'Your access code dont exist. Please retry with other Access Code.',
      buttons: ['OK']
    });

    let connectionAlert = this.alertCtrl.create({
      title: 'Connection problem!',
      subTitle: 'Server is stopped temporarily or no internet access. Please check your internet connection.',
      buttons: ['OK']
    });

    let timeoutAlert = this.alertCtrl.create({
      title: 'Connection timeout!',
      subTitle: 'Conection timeout. Please try again.',
      buttons: ['OK']
    });

    var url = 'http://staffapi.pheramor.com//login.php?code=' + this.accessCode

    this.http.get(url).subscribe(resp => {
      if (resp != null) {
        this.navCtrl.push(MainPage, {
          data: resp
        })
      } else {
        codeAlert.present()
        loader.dismiss()
      }
    }, error => {
      console.log('--------- Login Error --------')
      console.log(error)
      if (error instanceof TimeoutError) {
        timeoutAlert.present()
      } else {
        connectionAlert.present()
      }
      loader.dismiss()
    })
  }

  // Open tutorial video on new browser.
  openVideoTutorial () {
    this.iab.create(this.linkToYoutube)
  }

}
