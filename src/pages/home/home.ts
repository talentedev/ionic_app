import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TimeoutError } from 'rxjs/util/TimeoutError';
import { Storage } from '@ionic/storage';

import { MainPage } from '../main/main';
import { Constants } from "../../app/constants";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  logoUrl = 'assets/imgs/logo.png'
  linkToYoutube = 'https://youtu.be/igppm2Ynbr4'
  email : string = ''
  password : string = ''
  endpoint : string

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public http: HttpClient, private iab: InAppBrowser, private storage: Storage) {
    this.endpoint = Constants.API_URL;
  }

  // Login to next screen with correnct access code.
  login() {

    let loader = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true,
    })
    loader.present()

    let codeAlert = this.alertCtrl.create({
      title: 'Login Failed!',
      subTitle: 'Invalid email or password. Please retry with correct credential.',
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

    var url = this.endpoint + '/login'
    var data = {
      email: this.email,
      password: this.password
    }

    this.http.post(url, data).subscribe(resp => {
      var response : any = resp;
      if (response.access_token != null) {

        // Save token to local storage
        this.storage.set('token', response.access_token)

        // Go to main page
        this.navCtrl.push(MainPage)

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
