import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController, AlertController, LoadingController, NavParams  } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-sync',
  templateUrl: 'sync_data.html'
})
export class SyncPage {

  endpoint: string = 'https://pheramor.agilecrm.com/dev/'
  httpOptions: any
  username: string = ''
  password: string = ''
  user_data: any
  registrantsStatus: string = 'all'
  numberOfRegistrants: number = 0
  registrants: any = []
  successedRegistrants: any = []
  failedRegistrants: any = []
  countSyncData: number = 0
  countSyncFailed: number = 0

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public http: HttpClient, public navParams: NavParams, private storage: Storage) {
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

    this.init()
  }

  // Initialize
  init() {

    this.storage.get('entries').then((val) => {
      var data = JSON.parse(val)
      if (data == null) {
        this.registrants = []
        this.numberOfRegistrants = this.registrants.length
      } else {
        this.numberOfRegistrants = data.length
        this.registrants = data
      }
    });

    this.storage.get('successedRegistrants').then((val) => {
      if (JSON.parse(val) == null) {
        this.storage.set('successedRegistrants', JSON.stringify([]))
      } else {
        this.successedRegistrants = JSON.parse(val)
      }
    });

    this.storage.get('failedRegistrants').then((val) => {
      if (JSON.parse(val) == null) {
       this.storage.set('failedRegistrants', JSON.stringify([]))
      } else {
        this.failedRegistrants = JSON.parse(val)
      }
    });
  }

  // Synchronize data
  syncData() {

    let submittingLoader = this.loadingCtrl.create({
      content: 'Submitting...',
      dismissOnPageChange: true,
    })
    submittingLoader.present()

    // for(let val in this.registrants) {
    //   this.submit(this.registrants[val], submittingLoader)
    // }
    if (this.registrants.length != 0) {
      this.successedRegistrants = []
      this.failedRegistrants = []
      this.submit(submittingLoader, 0)
    } else {
      submittingLoader.dismiss()
      this.alertCtrl.create({
        title: 'There is no any contacts to be synced.',
        subTitle: 'No Data to be synchronized!',
        buttons: ['OK']
      }).present()
    }
  }

  // Submit data
  submit(submittingLoader, count) {

    var data = this.registrants[count]

    var searchContactByEmailUrl = this.endpoint + 'api/contacts/search/email/' + data.properties[2].value

    this.http.get(searchContactByEmailUrl, this.httpOptions).subscribe(response => {

      var searchContactByPheramorIDUrl = this.endpoint + 'api/search/?q=' + data.properties[3].value + '&page_size=10&type="PERSON"'

      if (response == null) {

        this.http.get(searchContactByPheramorIDUrl, this.httpOptions).subscribe(resp => {
          var email = ''
          if (resp[0] != null) {
            email = this.getEmail(resp[0].properties)
          }
          // The ID already exist
          if (resp[0] != null && email != data.properties[2].value) {
            this.failedRegistrants.push(data)
            this.showResult(data, submittingLoader, false)
            if (count < this.registrants.length) {
              this.submit(submittingLoader, count + 1)
            }
          } else {  // The ID don't exist
            var createContactUrl = this.endpoint + 'api/contacts'

            this.http.post(createContactUrl, data, this.httpOptions).subscribe(resp => {
              this.successedRegistrants.push(data)
              this.showResult(data, submittingLoader, true)
              if (count < this.registrants.length) {
                this.submit(submittingLoader, count + 1)
              }
            })
          }
        })

      } else {

        this.http.get(searchContactByPheramorIDUrl, this.httpOptions).subscribe(resp => {
          var email = ''
          if (resp[0] != null) {
            email = this.getEmail(resp[0].properties)
          }
          // The ID already exist
          if (resp[0] != null && email != data.properties[2].value) {
            this.failedRegistrants.push(data)
            this.showResult(data, submittingLoader, false)
            if (count < this.registrants.length) {
              this.submit(submittingLoader, count + 1)
            }
          } else {  // The ID don't exist
            var updateContactUrl = this.endpoint + 'api/contacts/edit-properties'
            data.id = response['id']
            this.http.put(updateContactUrl, data, this.httpOptions).subscribe(resp => {
              // Update tags
              var updateTagsUrl = this.endpoint + 'api/contacts/edit/tags'
              this.http.put(updateTagsUrl, data, this.httpOptions).subscribe(resp => {
                this.successedRegistrants.push(data)
                this.showResult(data, submittingLoader, true)
                if (count < this.registrants.length) {
                  this.submit(submittingLoader, count + 1)
                }
              })
            })
          }
        })

      }
    }, error => {
      console.log('--------- Sync Error --------')
      console.log(JSON.stringify(error))
      this.showErrorResult(data, submittingLoader)
    })
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

  // Clear Data
  clearData() {
    this.storage.set('entries', JSON.stringify([]))
    this.storage.set('successedRegistrants', JSON.stringify([]))
    this.storage.set('failedRegistrants', JSON.stringify([]))

    this.countSyncData = 0
    this.alertCtrl.create({
      title: 'Success!',
      subTitle: 'All data deleted from local database.',
      buttons: ['OK']
    }).present()
    this.init()
  }

  // Show alert when synchronizing data is finished.
  showResult(data, submittingLoader, success) {

    if (success == true) {
      console.log('===== Before saving success  sycn =========')
      this.storage.get('successedRegistrants').then((val) => {
        console.log('===== After saving success  sycn =========')
        var savedData = JSON.parse(val)
        savedData.push(data)
        this.storage.set('successedRegistrants', JSON.stringify(savedData))
        this.init()
      });
    } else {
      this.storage.get('failedRegistrants').then((val) => {
        var savedData = JSON.parse(val)
        savedData.push(data)
        this.storage.set('failedRegistrants', JSON.stringify(savedData))
        this.init()
      });
    }

    this.countSyncData++
    var failedCount = this.failedRegistrants.length
    var successedCount = this.successedRegistrants.length
    var str = ''

    if(failedCount == 0) {
      str = 'All data was sychronized successfully.'
    } else {
      str = successedCount + ' data was sychronized successfully. ' + failedCount + ' data was failed because the same ID already exist.'
    }
    
    if(this.countSyncData == this.numberOfRegistrants) {
      submittingLoader.dismiss()
      this.alertCtrl.create({
        title: 'Synchronize data successfully!',
        subTitle: str,
        buttons: ['OK']
      }).present()

      this.countSyncData = 0
      this.storage.set('entries', JSON.stringify([]))
      this.init()
    }
  }

  // Show error result
  showErrorResult(data, submittingLoader) {

    this.storage.get('failedRegistrants').then((val) => {
      var savedData = JSON.parse(val)
      savedData.push(data)
      this.storage.set('failedRegistrants', JSON.stringify(savedData))
      this.init()
    });

    this.countSyncFailed++
    if (this.countSyncFailed == this.numberOfRegistrants) {
      submittingLoader.dismiss()

      this.failedRegistrants = this.registrants
      var str = this.failedRegistrants.length + ' data was failed due to no internet connection.'

      this.alertCtrl.create({
        title: 'Synchronize data failed!',
        subTitle: str,
        buttons: ['OK']
      }).present()

      this.countSyncFailed = 0
    }
  }
}
