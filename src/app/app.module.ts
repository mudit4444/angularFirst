import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {ProductListComponent } from './products/product-list.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component'; 
import { from } from 'rxjs';

@NgModule({
  declarations: [
    AppComponent , 
    ProductListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
