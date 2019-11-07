import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {ProductListComponent } from './products/product-list.component';
import { AppRoutingModule } from './app-routing.module';
import {FormsModule} from '@angular/forms'
import { AppComponent } from './app.component'; 
import { from } from 'rxjs';

@NgModule({
  declarations: [
    AppComponent , 
    ProductListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
