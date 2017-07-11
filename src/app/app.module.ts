import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WindowRefService } from './window-ref.service';

import './rxjs-extensions';

import { PdbAutocompleteComponent } from './app.component';

@NgModule({
  declarations: [
    PdbAutocompleteComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule,
    FlexLayoutModule
  ],
  providers: [WindowRefService],
  bootstrap: [PdbAutocompleteComponent]
})
export class AppModule { }
