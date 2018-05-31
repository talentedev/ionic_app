import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController, AlertController, LoadingController, NavParams  } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { TimeoutError } from 'rxjs/util/TimeoutError';

import { HomePage } from '../home/home';
import { SyncPage } from '../sync_data/sync_data';

@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {

  barCode: string = ''
  first_name: string = ''
  last_name: string = ''
  phone_number: string = ''
  email: string = ''
  re_email: string = ''
  entries: number = 0
  user_data: any
  endpoint: string = 'https://pheramor.agilecrm.com/dev/'
  username: string = ''
  password: string = ''
  httpOptions: any
  masks: any;

  ionViewWillEnter(){
    this.storage.get('entries').then((val) => {
      if(JSON.parse(val) != null) {
        this.entries = JSON.parse(val).length
      }
    });
  }

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public http: HttpClient, public navParams: NavParams, private barcodeScanner: BarcodeScanner, private storage: Storage) {
    this.user_data = navParams.get('data')
    this.username = this.user_data.staff_email
    this.password = this.user_data.api_key
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization' : 'Basic ' + btoa(this.username + ':' + this.password),
        'timeout': '${15000}'
      })
    };

    this.masks = {
      phoneNumber: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
      barcode: [/[a-zA-Z]/, /[a-zA-Z]/, '-', /[0-9]/, /\d/, /\d/, /\d/, /\d/, '-', /\d/]
    };
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

      var searchContactByEmailUrl = this.endpoint + 'api/contacts/search/email/' + this.email

      this.http.get(searchContactByEmailUrl, this.httpOptions).subscribe(response => {
        console.log('--------- Search Contact Result --------')
        console.log(JSON.stringify(response))
        var requestData = this.makeRequestdata()
        var searchContactByPheramorIDUrl = this.endpoint + 'api/search/?q=' + this.barCode.toUpperCase() + '&page_size=10&type="PERSON"'

        if (response == null) {

          this.http.get(searchContactByPheramorIDUrl, this.httpOptions).subscribe(resp => {

            var email = ''
            if (resp[0] != null) {
              email = this.getEmail(resp[0].properties)
            }
            // The ID already exist
            if (resp[0] != null && email != requestData.properties[2].value) {
              loader.dismiss()
              this.alertCtrl.create({
                title: 'Contact creation failed!',
                subTitle: 'The ID already exist. Please try with other ID.',
                buttons: ['OK']
              }).present()
            } else {    // The ID don't exist
              var createContactUrl = this.endpoint + 'api/contacts'

              this.http.post(createContactUrl, requestData, this.httpOptions).subscribe(data => {
                loader.dismiss()
                this.alertCtrl.create({
                  title: 'Success!',
                  subTitle: 'New contact was created successfully.',
                  buttons: ['OK']
                }).present()
                this.init()
              }, error => {
                loader.dismiss()
                if (error instanceof TimeoutError) {
                  this.showTimeoutAlert()
                } else {
                  this.showConnectionAlert()
                }
                this.saveData()
              })
            }

          }, error => {
            console.log('========== Contact Create Error ===========')
            console.log(JSON.stringify(error))
            loader.dismiss()
            if (error instanceof TimeoutError) {
              this.showTimeoutAlert()
            } else {
              this.showConnectionAlert()
            }
            this.saveData();
          })
          
        } else {

          this.http.get(searchContactByPheramorIDUrl, this.httpOptions).subscribe(resp => {
            console.log('============ Email ===========')
            console.log(resp[0])
            var email = ''
            if (resp[0] != null) {
              email = this.getEmail(resp[0].properties)
            }
            // The ID already exist
            if (resp[0] != null && email != requestData.properties[2].value) {
              loader.dismiss()
              this.alertCtrl.create({
                title: 'Contact creation failed!',
                subTitle: 'The ID already exist. Please try with other ID.',
                buttons: ['OK']
              }).present()
            } else {  // The ID don't exist
              console.log('------------ Update Contact ------------------')
              console.log(response['id'])
              var updateContactUrl = this.endpoint + 'api/contacts/edit-properties'
              requestData['id'] = response['id']

              this.http.put(updateContactUrl, requestData, this.httpOptions).subscribe(data => {
                // Update tags
                var updateTagsUrl = this.endpoint + 'api/contacts/edit/tags'
                this.http.put(updateTagsUrl, requestData, this.httpOptions).subscribe(data => {
                  loader.dismiss()
                  this.alertCtrl.create({
                    title: 'Success!',
                    subTitle: 'Contact was updated successfully.',
                    buttons: ['OK']
                  }).present()
                  this.init()
                })
              }, error => {
                console.log('--------- Contact Update Error --------')
                console.log(JSON.stringify(error))
                loader.dismiss()
                if (error instanceof TimeoutError) {
                  this.showTimeoutAlert()
                } else {
                  this.showConnectionAlert()
                }
                this.saveData()
              })
            }
          })

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

  // Get email value
  getEmail(data) {
    for(let key in data) {
      if(data[key].name == 'email') {
        return data[key].value
      }
    }
    return ''
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
        if(savedData[key].properties[3].value == data.properties[3].value) {
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
          subTitle: 'The ID already exist on local database.',
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
        'tags': [this.user_data.staff_tag, this.user_data.access_code],
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
      }
    return data
  }

  // Move to saved data page
  viewSyncData() {
    this.navCtrl.push(SyncPage, {
      data: this.user_data
    })
  }

  // Log out
  logout() {
    this.navCtrl.push(HomePage)
  }

}
