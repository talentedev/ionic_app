import { NgModule } from '@angular/core';

import { Uppercase } from './uppercase.directive';

@NgModule({
  declarations: [
    Uppercase
  ],
  exports: [
    Uppercase
  ]
})
export class DirectiveModule{}