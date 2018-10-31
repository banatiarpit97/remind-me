import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http } from "@angular/http";
import 'rxjs/add/operator/map';
import * as moment from 'moment';
import { ToastController } from 'ionic-angular';

import { LocalNotifications } from '@ionic-native/local-notifications';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the AddeventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var $:any;

@Component({
  selector: 'page-addevent',
  templateUrl: 'addevent.html',
})
export class AddeventPage {

  addForm:FormGroup;
  item:any = {
    id:"",
    title:"",
    description:"",
    time:"",
    completeTime:"",
    repeat:""
  }
  itemParam:any;
  user_id = 1;
  edit = false;
  events:any[] =[];

  constructor(public navCtrl: NavController,
              public navParams: NavParams, 
              public viewCtrl:ViewController, 
              public formBuilder:FormBuilder, 
              public http:Http, 
              private localNotifications: LocalNotifications, 
              private storage:Storage, 
              private platform:Platform,
              public toastCtrl:ToastController) {
    var currentTime = moment(new Date()).format();

    this.addForm = formBuilder.group({
      title:["", Validators.required],
      description:["", Validators.required],
      date:[currentTime, Validators.required],
      time:[currentTime, Validators.required],
      repeat:""
    });

    this.storage.get('events').then(events =>{
      if(events){
        this.events = events;
      }
    })
  }

  ionViewDidLoad() {
    this.itemParam = this.navParams.get('item');
    if(this.itemParam){
       this.addForm.patchValue({"title":this.itemParam.title, "description":this.itemParam.description,  "date":this.itemParam.date, "time":this.itemParam.time, "repeat":this.itemParam.repeat});   
       this.edit = true;
    }
    else{
    }
  }

  dismiss(){
  	this.viewCtrl.dismiss();
  }

  add(){
    var addReference = this;
    if(this.edit == false){
      this.item = this.addForm.value;
      this.item.completeTime = this.addForm.value.time;
    this.item.date = this.addForm.value.date.split("T")[0];
    this.item.time = this.addForm.value.time.split("T")[1].split(":")[0] + ":" + this.addForm.value.time.split("T")[1].split(":")[1]
    var hours = this.item.time.split(":")[0];
    var minutes = this.item.time.split(":")[1];
    var year = this.item.date.split("-")[0];
    var month = this.item.date.split("-")[1];
    var date = this.item.date.split("-")[2];
    var notifyTime = new Date();
    notifyTime.setFullYear(year);
    notifyTime.setMonth(month-1);
    notifyTime.setDate(date);
    notifyTime.setHours(hours);
    notifyTime.setMinutes(minutes);
    notifyTime.setSeconds(0);
    var itemIndex = this.events.push(this.item);
    this.item.id = itemIndex - 1;
    this.events[(itemIndex-1)] = this.item;
    var notificationId = itemIndex - 1;

    this.localNotifications.schedule({
                  id: notificationId,
                  title:this.item.title,
                  text: this.item.description,
                  every: this.item.repeat,
                  at: notifyTime
                });

        this.viewCtrl.dismiss(this.events);
    } 
    else{
      this.itemParam.title = this.addForm.value.title;
      this.itemParam.description = this.addForm.value.description;
      this.itemParam.time = this.addForm.value.time;
      this.itemParam.date = this.addForm.value.date;
      this.itemParam.repeat = this.addForm.value.repeat;

      this.events[this.itemParam.id] = this.itemParam;

      var notifyTime = new Date();
      var hours = this.addForm.value.time.split(":")[0];
      var minutes = this.addForm.value.time.split(":")[1];
      var year = this.addForm.value.date.split("-")[0];
      var month = this.addForm.value.date.split("-")[1];
      var date = this.addForm.value.date.split("-")[2];
      notifyTime.setFullYear(year);
      notifyTime.setMonth(month-1);
      notifyTime.setDate(date);
      notifyTime.setHours(hours);
      notifyTime.setMinutes(minutes);
      notifyTime.setSeconds(0);
      this.localNotifications.update({
          id: this.itemParam.id,
          title:this.addForm.value.title,
          text: this.addForm.value.description,
          every: this.addForm.value.repeat,
          at: notifyTime
        });

    
       let toast = this.toastCtrl.create({
                  message: "Todo event edited successfully!",
                  duration: 3000,
                  cssClass:'success'
                });
       toast.present();
      this.viewCtrl.dismiss(this.events);
    }

    this.storage.set('events', this.events);   
  }


}
