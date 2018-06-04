import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController, AlertController, LoadingController, NavParams  } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { TimeoutError } from 'rxjs/util/TimeoutError';

import { HomePage } from '../home/home';
import { SyncPage } from '../sync_data/sync_data';
import { SettingsPage } from '../settings/settings';
import { Constants } from "../../app/constants";

@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {

  userId: string
  barCode: string = ''
  first_name: string = ''
  last_name: string = ''
  phone_number: string = ''
  email: string = ''
  re_email: string = ''
  entries: number = 0
  userInfo: any
  endpoint: string
  httpOptions: any
  masks: any

  ionViewWillEnter(){
    this.storage.get('entries').then((val) => {
      if(JSON.parse(val) != null) {
        this.entries = JSON.parse(val).length
      }
    });

    this.storage.get('token').then((val) => {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization' : 'Bearer ' + val,
          'timeout': '${15000}'
        })
      }

      this.getUser()
    })
  }

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public http: HttpClient, public navParams: NavParams, private barcodeScanner: BarcodeScanner, private storage: Storage) {

    this.masks = {
      phoneNumber: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
      barcode: [/[a-zA-Z]/, /[a-zA-Z]/, '-', /[0-9]/, /\d/, /\d/, /\d/, /\d/, '-', /\d/]
    }

    this.endpoint = Constants.API_URL

    this.init()
  }

  // Initialize the variables
  init() {
    this.barCode = ''
    this.first_name = ''
    this.last_name = ''
    this.phone_number = ''
    this.email = ''
    this.re_email = ''
    this.storage.get('entries').then((val) => {
      if (JSON.parse(val) == null) {
        this.storage.set('entries', JSON.stringify([]))
      } else {
        this.entries = JSON.parse(val).length
      }
    });
  }

  // Get account information
  getUser() {
    this.http.get(this.endpoint + '/me', this.httpOptions).subscribe(resp => {
      var response : any = resp
      this.userInfo = response
      this.userId = response.name
    }, error => {
      console.log(error)
    })
  }

  // Navigate to account setting page
  goToSettingPage() {
    this.navCtrl.push(SettingsPage, {
      data: this.userInfo
    })
  }

  // Scan barcode
  scanBarcode() {
    var options = {
      showTorchButton: true
    }

    this.barcodeScanner.scan(options).then(barcodeData => {
      this.barCode = barcodeData.text
    }).catch(err => {
      this.alertCtrl.create({
        title: 'Scan failed!',
        subTitle: 'Barcode scan is failed. Please try again.',
        buttons: ['OK']
      }).present()
    });
  }

  // Submit the data to AgileCRM
  submit() {

    if(this.validate()) {

      let loader = this.loadingCtrl.create({
        content: 'Submitting...',
        dismissOnPageChange: true,
      })
      loader.present()

      let addCustomerUrl = this.endpoint + '/customers'
      let data = this.makeRequestdata()

      this.http.post(addCustomerUrl, data, this.httpOptions).subscribe(response => {
        
        let resp : any = response
        if (resp.status == true) {
          loader.dismiss()
          this.alertCtrl.create({
            title: 'Success!',
            subTitle: 'New contact was created successfully.',
            buttons: ['OK']
          }).present()
          this.init()
        } else {
          loader.dismiss()
          this.alertCtrl.create({
            title: 'Contact creation failed!',
            subTitle: 'The ID already exist. Please try with other ID.',
            buttons: ['OK']
          }).present()
        }

      }, error => {
        console.log('--------- Submitting Error --------')
        console.log(JSON.stringify(error))
        loader.dismiss()
        this.saveData();
        if (error instanceof TimeoutError) {
          this.showTimeoutAlert()
        } else {
          this.showConnectionAlert()
        }
      })
    }
  }

  // Show Connection Error Alert
  showConnectionAlert() {
    this.alertCtrl.create({
      title: 'Connection Error!',
      subTitle: 'No internet connection. The data will be saved on this app. Please synchronize the data when you have stable wifi.',
      buttons: ['OK']
    }).present()
  }

  // Show Timeout  Alert
  showTimeoutAlert() {
    this.alertCtrl.create({
      title: 'Connection Timeout!',
      subTitle: 'The data will be saved on this app. Please synchronize the data when you have stable wifi.',
      buttons: ['OK']
    }).present()
  }

  // Save the data on local database
  saveData() {
    var data = this.makeRequestdata()
    data['saved_at'] = Date()
    this.storage.get('entries').then((val) => {
      var savedData = JSON.parse(val)

      var existId = false
      for(let key in savedData) {
        if(savedData[key].pheramor_id == data.pheramor_id) {
          existId = true
        } else {
          existId = false
        }
      }

      if (!existId) {
        savedData.push(data)
        this.storage.set('entries', JSON.stringify(savedData))
        this.init()
      } else {
        this.alertCtrl.create({
          title: 'ID Error!',
          subTitle: 'The Pheramor ID already exist on local database.',
          buttons: ['OK']
        }).present()
      }
    });
  }

  //  Check form data validation.
  validate() {
    if (this.barCode == '' || this.first_name == '' || this.last_name == '' || this.email == '') {
      this.alertCtrl.create({
        title: 'Validation error!',
        subTitle: 'You must fill all items.',
        buttons: ['OK']
      }).present()
      return false
    } else if (this.email != this.re_email){
      this.alertCtrl.create({
        title: 'Email address doesn’t match!',
        subTitle: 'Please reenter email address.',
        buttons: ['OK']
      }).present()
      return false
    }
    return true
  }

  // Get data for http request
  makeRequestdata() {

    var data = {
      pheramor_id: this.barCode.toUpperCase(),
      sales_email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      phone: this.phone_number.replace(/\D+/g, '')
    }

    return data
  }

  // Move to saved data page
  viewSyncData() {
    this.navCtrl.push(SyncPage, {
      data: this.userInfo
    })
  }

  // Log out
  logout() {
    this.storage.set('token', '')
    this.navCtrl.push(HomePage)
  }

}
