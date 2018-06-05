import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, AlertController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Constants } from "../../app/constants";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  name: string = ''
  email : string = ''
  newPassword : string = ''
  confirmPassword: string = ''
  endpoint : string
  httpOptions: any
  userInfo: any

  constructor( public loadingCtrl: LoadingController, public alertCtrl: AlertController, public http: HttpClient, public navParams: NavParams, private storage: Storage) {

    this.endpoint = Constants.API_URL

    this.userInfo = navParams.get('data')
    this.email = this.userInfo.email
    this.name = this.userInfo.name

    this.storage.get('token').then((val) => {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization' : 'Bearer ' + val,
          'timeout': '${15000}'
        })
      }
    })
  }

  //  Check if password is match
  validate() {

    if (this.newPassword != this.confirmPassword){

      this.alertCtrl.create({
        title: 'Password don’t match!',
        subTitle: 'Please re-enter password.',
        buttons: ['OK']
      }).present()

      return false
    }

    return true
  }

  // Change password
  change() {
    if(this.validate()) {
      this.submit()
    }
  }

  // Submit
  submit() {

    let data = {
      name: this.name,
      email: this.email,
      password: this.newPassword
    }

    let url = this.endpoint + '/users/' + this.userInfo.id

    this.http.put(url, data, this.httpOptions).subscribe(resp => {

      let response : any = resp

      if (response.status) {
        this.alertCtrl.create({
          title: 'Success!',
          subTitle: 'Password changed successfully.',
          buttons: ['OK']
        }).present()
      }

    }, error => {
      console.log(error)
    })
  }

}
