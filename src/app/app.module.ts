import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule,  HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { IonicStorageModule } from '@ionic/storage';
import { TextMaskModule } from 'angular2-text-mask';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { MainPage } from '../pages/main/main';
import { SyncPage } from '../pages/sync_data/sync_data';
import { SettingsPage } from '../pages/settings/settings';
import { DirectiveModule } from './modules/directives/directives.module';
import { TimeoutInterceptor } from './services/timeout-interceptor';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    MainPage,
    SyncPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    TextMaskModule,
    DirectiveModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    MainPage,
    SyncPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true},
    InAppBrowser,
    BarcodeScanner
  ]
})
export class AppModule {}
