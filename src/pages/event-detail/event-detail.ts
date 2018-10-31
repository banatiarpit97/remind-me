import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the EventDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage {
	item:any;
	date:any;
	time:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  	this.item = this.navParams.get('item');
  }

  ionViewDidLoad() {
  }

}
