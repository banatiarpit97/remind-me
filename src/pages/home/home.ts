import { Component } from '@angular/core';
import { NavController, ModalController, Platform } from 'ionic-angular';
import { AddeventPage} from "../addevent/addevent";
import { Http } from "@angular/http";
import 'rxjs/add/operator/map';
import { EventDetailPage } from '../event-detail/event-detail'
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { LocalNotifications } from '@ionic-native/local-notifications';
import { ActionSheetController } from 'ionic-angular';
import { Searchbar } from 'ionic-angular/components/searchbar/searchbar';



declare var $:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  items:any[] = [];
  itemsCopy:any[] = [];
  event:any = {
    id:null,
    title:null,
    description:null,
    time:null,
    date:null, 
    completeTime:null,
    repeat:null
  }
  user_id = 1;
  noEvent = true;
  date:any[] = [];
  time:any[] = [];
  searchQuery: string = '';
  searchItems: string[];
  segment:string = "all";
  searchEvent:any;
  loader;
  searchbar = false;

  constructor(public navCtrl: NavController, 
              public modalCtrl:ModalController, 
              public http:Http, private storage:Storage, 
              public alertCtrl: AlertController, 
              public platform:Platform, 
              private localNotifications: LocalNotifications, 
              public actionSheetCtrl: ActionSheetController,
              public toastCtrl:ToastController,
              public loadingCtrl:LoadingController) {

     this.loader = loadingCtrl.create({
      content: "Loading Todos"
      });
    this.loader.present();
      storage.get('events').then(events => {
       if(events){
         this.items = events;
         this.itemsCopy = this.items;
         var isOtherElem = this.items.some(function(el){ return el !== null;})
          if(isOtherElem){
            this.noEvent = false;
            this.sortEvents();
          }
          else{
            this.noEvent = true;
          }
          this.loader.dismiss();
          this.loader = null;
       }
       else{
          this.loader.dismiss();
          this.loader = null;
       }

     })

  
     
  }

  swipe(e){
    switch (e.direction) {
      case 2:
        if (this.segment == "all"){
          // this.segment = "today";
          this.todayEvents();
        }
        else if (this.segment == "today") {
          this.tommorrowEvents()
        }
        break;
    
      case 4:
        if (this.segment == "tom") {
          this.todayEvents();
        }
        else if (this.segment == "today") {
          this.allEvents();
        }
        break;

    }
  }
  addEvent(){
  	let modal = this.modalCtrl.create(AddeventPage);
    modal.present();
    modal.onDidDismiss(items => {
      if(items){
       let toast = this.toastCtrl.create({
                  message: "Todo event added successfully!",
                  duration: 3000,
                  cssClass:'success'
                });
       toast.present();
       this.items = items;

       this.itemsCopy = items;
       this.sortEvents();
       if(this.items.length == 0){
         this.noEvent = true;
       }
       else{
         this.noEvent = false;
       }
       if(this.segment == "all"){
          this.items = this.itemsCopy;
        }
        else if(this.segment == "today"){
          this.todayEvents();
        }
        else if(this.segment == "tom"){
          this.tommorrowEvents();
        }  
      }
    })
  }

  removeNull(){
    for(var i=0;i<this.items.length;i++){
            if(this.items[i] == null){
              this.items.splice(i, 1);
              i--;
            }
         }
    this.itemsCopy = this.items;   

  }

  editEvent(item){
    let modal = this.modalCtrl.create(AddeventPage, {item:item});
    modal.present();
    modal.onDidDismiss(items => {
      if(items){

        this.items = items;
        this.itemsCopy = this.items;
        this.sortEvents();
      }
    })
  }

  deleteEvent(item){
    var delreference = this;
    this.items.some(function(el, i):any{
      if(el == item){
         var index  = item.id;
         delreference.items[i] = null;
         delreference.localNotifications.cancel(index);
      }
    })
    this.storage.set('events', this.items);
    let toast = this.toastCtrl.create({
                  message: "Todo event deleted successfully!",
                  duration: 3000,
                  cssClass:'success'
                });
    toast.present();
    this.checkNull();
    this.itemsCopy = this.items;  
   
  }

  checkNull(){
    var isOtherElem = this.items.some(function(el){ return el !== null;})
      if(isOtherElem){
        this.noEvent = false;
      }
      else{
        this.noEvent = true;
      }
  }

  openDetails(item){
    this.navCtrl.push(EventDetailPage, {item:item});
  }

  deleteAll(){
    let confirm = this.alertCtrl.create({
      title: 'Delete All Events?',
      message: 'Are you sure you want to delete all events permanenty?',
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            var arrLength = this.items.length;
            this.items.splice(0, arrLength);
            this.storage.set('events', this.items);
            this.noEvent = true;
            this.localNotifications.cancelAll();
            this.itemsCopy = this.items;
            let toast = this.toastCtrl.create({
                  message: "All todo Events deleted",
                  duration: 3000,
                  cssClass:'success'
                });
                toast.present();
          }
        }
      ]
    });
    confirm.present();
  }

  editDelete(item){
     let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Edit',
          role: 'destructive',
          handler: () => {
            let modal = this.modalCtrl.create(AddeventPage, {item:item});
            modal.present();
            modal.onDidDismiss(items => {
              if(items){
                this.items = items;
              }
            })
          }
        },{
          text: 'Delete',
          handler: () => {
            this.deleteEvent(item);
          }
        }
      ]
    });
    actionSheet.present();
  }

  sortEvents(){
    this.removeNull();

    if(this.items.length > 1){
      this.items.sort(function(a, b){
        var aTime = new Date(a.date.split("-")[0], a.date.split("-")[1], a.date.split("-")[2], a.time.split(":")[0], a.time.split(":")[1], 0, 0); 
        var bTime = new Date(b.date.split("-")[0], b.date.split("-")[1], b.date.split("-")[2], b.time.split(":")[0], b.time.split(":")[1], 0, 0); 
        var c = aTime.getTime();
        var d = bTime.getTime();
        return c - d ;
      })
    }
    this.itemsCopy = this.items;  
  }


  getItems(ev: any) {
    this.searchEvent = ev;
    if(this.segment == "all"){
      this.items = this.itemsCopy;
    }
    else if(this.segment == "today"){
      this.todayEvents();
    }
    else if(this.segment == "tom"){
      this.tommorrowEvents();
    }
    let val = ev.target.value;
    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return ((item.title.toLowerCase().indexOf(val.toLowerCase()) > -1)||(item.description.toLowerCase().indexOf(val.toLowerCase()) > -1));
      })
    }
    this.checkNull();  
  }
  getItemsNoEvent(){
    var searchInput = $('#search input').val();
    if (searchInput && searchInput.trim() != '') {
      this.items = this.items.filter((item) => {
        return ((item.title.toLowerCase().indexOf(searchInput.toLowerCase()) > -1)||(item.description.toLowerCase().indexOf(searchInput.toLowerCase()) > -1));
      })
    }
  }
  allEvents(){
    this.items = this.itemsCopy;
    this.segment = "all";
    this.getItemsNoEvent();
    this.checkNull();
  }
  todayEvents(){
    this.items = this.itemsCopy;
    var curDate = new Date();
    var formattedCurdate = curDate.getFullYear() + '-' + (curDate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2 }) + '-' + curDate.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 });
    this.items = this.items.filter((item) => {
      return (item.date == formattedCurdate);
    })
    this.segment = "today";
    this.getItemsNoEvent();
    this.checkNull();
  }
  tommorrowEvents(){
    this.items = this.itemsCopy;
    var curDate = new Date();
    var formattedCurdate = new Date();
    formattedCurdate.setDate(curDate.getDate()+1);
    var tomorrowDate = formattedCurdate.getFullYear() + '-' + (formattedCurdate.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2 }) + '-' + (formattedCurdate.getDate()).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    this.items = this.items.filter((item) => {
      return (item.date == tomorrowDate);
    })
    this.segment = "tom";
    this.getItemsNoEvent();
    this.checkNull();
  }


}
