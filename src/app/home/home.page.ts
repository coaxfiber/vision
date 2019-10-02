import {  Component, OnInit, ViewChild,ElementRef} from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { NativeGeocoder,NativeGeocoderOptions,NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { ChangeDetectorRef } from '@angular/core';
declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  map;
  @ViewChild('mapElement') mapElement;
  geocoder = new google.maps.Geocoder;
  markers = [];
  Destination: any;
  MyLocation: any;
  geoAddress: string = '';
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };
    @ViewChild('directionsPanel') directionsPanel: ElementRef;

    opacity='0'
    matches: String[];
    isRecording = false;

    hide=false;

    routes:any
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;

  constructor(private speechRecognition: SpeechRecognition,private geolocation: Geolocation,private tts: TextToSpeech,private nativeGeocoder: NativeGeocoder, private cd: ChangeDetectorRef,) {
  }

  ngOnInit(): void {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 17.625002, lng: 121.727314 },
      zoom: 13
    });

    //this.tryGeolocation();
    let pos = {
      lat:  17.647857,
      lng: 121.674139
    };
    this.MyLocation = new google.maps.LatLng(pos);

    let pos2 = {
      lat:  17.620048,
      lng: 121.704997
    };

        this.Destination = new google.maps.LatLng(pos2);
  }

ionViewDidEnter(){
  //Set latitude and longitude of some place
}

tryGeolocation(){
  this.tts.speak('Identifying location.')
  .then(() => {

        var infowindow = new google.maps.InfoWindow();
        this.geolocation.getCurrentPosition().then((resp) => {
          let pos = {
            lat: resp.coords.latitude,
            lng: resp.coords.longitude
          };
          this.MyLocation = new google.maps.LatLng(pos);
          this.getGeoencoder(resp.coords.latitude,resp.coords.longitude);
          let marker = new google.maps.Marker({
            position: pos,
            map: this.map,
            title: 'I am here!'
          });
          if (this.markers.length==0) {
           this.markers.push(marker)
          }else
           this.markers[0]=marker;
          
          this.map.setCenter(pos);

          infowindow.setContent('You are Here!');
          infowindow.open(this.map,marker);
        }).catch((error) => {
          this.tts.speak('Error getting location')
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
          console.log('Error getting location', error);
        });
   })
  .catch((reason: any) => console.log(reason));
}
getGeoencoder(latitude,longitude){
      this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
        this.geoAddress = this.generateAddress(result[0]);
        this.tts.speak("You are in "+this.generateAddress(result[0]))
          .then(() => console.log('Success'))
          .catch((reason: any) => console.log(reason));
      })
      .catch((error: any) => {
        alert('Error getting location'+ JSON.stringify(error));
      });
    }
  
 DeleteMarkers() {
        //Loop through all the markers and remove
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];
        //this.map.clear();
    }

 Deletelast() {
        this.markers.pop();
  }

  calculateAndDisplayRoute() {
     this.opacity='1'
    this.DeleteMarkers();
    this.hide=true;
    var get;
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setPanel(this.directionsPanel.nativeElement);
    var directionsDisplay = this.directionsDisplay
    this.directionsService.route({
    origin: this.MyLocation,
    destination: this.Destination,
    travelMode: 'WALKING'
      }, function(response, status) {
      if (status === 'OK') {
        response.routes[0].warnings = [];
        getval(response.routes)


        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
    function getval(x){
      get = x;
    }
    setTimeout(()=>{ this.assignroute(get) }, 1000);
      this.tts.speak("Location Found.")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
    

}


clearroute(){
  if (this.directionsDisplay != null) {

  document.getElementById("directionsPanel").innerHTML =''
    this.directionsDisplay.setMap(null);
    //this.directionsDisplay.setPanel('');
    this.directionsDisplay = null;
    this.routes=undefined;
    this.hide=true
  }
}

        update()
        {
                  this.geolocation.getCurrentPosition().then((resp) => {
                    let pos = {
                      lat: resp.coords.latitude,
                      lng: resp.coords.longitude
                    };
                    this.MyLocation = new google.maps.LatLng(pos);
                      document.getElementById("directionsPanel").innerHTML ='';

                      this.calculateAndDisplayRoute();
                       this.tts.speak('location updated')
                          .then(() => console.log('Success'))
                          .catch((reason: any) => console.log(reason));
                  }).catch((error) => {
                    this.tts.speak('Error getting location')
                  .then(() => console.log('Success'))
                  .catch((reason: any) => console.log(reason));
                    console.log('Error getting location', error);
                  });
            
        }
startListening() {
    this.getPermission()
    let options = {
      language: 'en-US'
    }
    this.speechRecognition.startListening().subscribe(matches => {
      this.matches = matches;
      this.cd.detectChanges();

      if(this.matches.includes('where am i')||this.matches.includes('nasaan ako')||this.matches.includes('nasan ako')){
        this.tryGeolocation();
      }else if(this.matches.includes('go to sm')||this.matches.includes('find sm')||this.matches.includes('sm')){
          this.clearroute()
           let pos = {
            lat: 17.613032,
            lng: 121.724653,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
          
      }else if(this.matches.includes('saint louis')||this.matches.includes('saint louie')||this.matches.includes('san luis')){
          this.clearroute()
           let pos = {
            lat: 17.610896,
            lng: 121.724528,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('robinsons')||this.matches.includes('robinson')||this.matches.includes('go to robinsons')){
          this.clearroute()
           let pos = {
            lat: 17.627432,
            lng: 121.733186,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('saint paul')||this.matches.includes('go to saint paul')){
          this.clearroute()
           let pos = {
            lat: 17.616463,
            lng: 121.724985,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('cagayan high')||this.matches.includes('go to cagayan high')){
          this.clearroute()
           let pos = {
            lat: 17.619799,
            lng: 121.724568,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('east central')||this.matches.includes('go to east central')){
          this.clearroute()
           let pos = {
            lat: 17.611752, 
            lng: 121.729829,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('rizals park')||this.matches.includes('go to rizals park')){
          this.clearroute()
           let pos = {
            lat: 17.611797,
            lng: 121.730235,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('cathedral')||this.matches.includes('go to cathedral')){
          this.clearroute()
           let pos = {
            lat: 17.613839, 
            lng: 121.730014,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('primark')||this.matches.includes('go to primark')){
          this.clearroute()
           let pos = {
            lat: 17.612371, 
            lng: 121.729617,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('john wesley')||this.matches.includes('go to john wesley')){
          this.clearroute()
           let pos = {
            lat: 17.617451, 
            lng: 121.725836,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('ermita')||this.matches.includes('go to ermita')){
          this.clearroute()
           let pos = {
            lat: 17.614120, 
            lng: 121.724872,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('csu andrews')||this.matches.includes('go to csu andrews')||this.matches.includes('csu')){
          this.clearroute()
           let pos = {
            lat: 17.619789, 
            lng: 121.724767,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('csu carig')||this.matches.includes('go to csu carig')){
          this.clearroute()
           let pos = {
            lat: 17.660032, 
            lng: 121.751023,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('dog say')||this.matches.includes('go to dog say')){
          this.clearroute()
           let pos = {
            lat: 17.613928, 
            lng: 121.724986,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('west central')||this.matches.includes('go to west central')){
          this.clearroute()
           let pos = {
            lat: 17.613174, 
            lng: 121.721969,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('north central')||this.matches.includes('go to north central')){
          this.clearroute()
           let pos = {
            lat: 17.621269,  
            lng: 121.725189,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('mall of the valley')||this.matches.includes('go to mall of the valley')||this.matches.includes('move')){
          this.clearroute()
           let pos = {
            lat: 17.614510,  
            lng: 121.727844 ,
          };
          this.Destination = new google.maps.LatLng(pos);
          this.calculateAndDisplayRoute();
      }else if(this.matches.includes('distance')||this.matches.includes('duration')){
        this.tellinfo();
      }else if(this.matches.includes('distance')||this.matches.includes('duration')){
        this.tellinfo();
      }else if(this.matches.includes('update')||this.matches.includes('updates')){
        this.update();
      }else if(this.matches.includes('reset')){
        location.reload();
      }else{
        if (this.matches.includes('step one')||this.matches.includes('step 1')) {
          if (this.routes[0].legs[0].steps[0]==undefined) {
            this.tts.speak("No Instruction for step 1")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[0]);
          }
        }else if (this.matches.includes('step two')||this.matches.includes('step 2')) {
          if (this.routes[0].legs[0].steps[1]==undefined) {
            this.tts.speak("No Instruction for step 2")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[1]);
          }
        }else if (this.matches.includes('step three')||this.matches.includes('step 3')) {
          if (this.routes[0].legs[0].steps[2]==undefined) {
            this.tts.speak("No Instruction for step 3")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[2]);
          }
         }else if (this.matches.includes('step four')||this.matches.includes('step 4')) {
          if (this.routes[0].legs[0].steps[3]==undefined) {
            this.tts.speak("No Instruction for step 4")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[3]);
          }
         }else if (this.matches.includes('step five')||this.matches.includes('step 5')) {
          if (this.routes[0].legs[0].steps[4]==undefined) {
            this.tts.speak("No Instruction for step 5")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[4]);
          }
         }else if (this.matches.includes('step six')||this.matches.includes('step 6')) {
          if (this.routes[0].legs[0].steps[5]==undefined) {
            this.tts.speak("No Instruction for step 6")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[5]);
          }
         }else if (this.matches.includes('step seven')||this.matches.includes('step 7')) {
          if (this.routes[0].legs[0].steps[6]==undefined) {
            this.tts.speak("No Instruction for step 7")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[6]);
          }
         }else if (this.matches.includes('step 8')) {
          if (this.routes[0].legs[0].steps[7]==undefined) {
            this.tts.speak("No Instruction for step 8")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[7]);
          }
         }else if (this.matches.includes('step 9')) {
          if (this.routes[0].legs[0].steps[8]==undefined) {
            this.tts.speak("No Instruction for step 9")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[8]);
          }
         }else if (this.matches.includes('step 10')) {
          if (this.routes[0].legs[0].steps[9]==undefined) {
            this.tts.speak("No Instruction for step 10")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[9]);
          }
         }else if (this.matches.includes('step 11')) {
          if (this.routes[0].legs[0].steps[10]==undefined) {
            this.tts.speak("No Instruction for step 11")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[10]);
          }
         }else if (this.matches.includes('step 12')) {
          if (this.routes[0].legs[0].steps[11]==undefined) {
            this.tts.speak("No Instruction for step 12")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[11]);
          }
         }else if (this.matches.includes('step 13')) {
          if (this.routes[0].legs[0].steps[12]==undefined) {
            this.tts.speak("No Instruction for step 13")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[12]);
          }
         }else if (this.matches.includes('step 14')) {
          if (this.routes[0].legs[0].steps[13]==undefined) {
            this.tts.speak("No Instruction for step 14")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[13]);
          }
         }else if (this.matches.includes('step 15')) {
          if (this.routes[0].legs[0].steps[14]==undefined) {
            this.tts.speak("No Instruction for step 15")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[14]);
          }
         }else if (this.matches.includes('step 16')) {
          if (this.routes[0].legs[0].steps[15]==undefined) {
            this.tts.speak("No Instruction for step 16")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[15]);
          }
         }else if (this.matches.includes('step 17')) {
          if (this.routes[0].legs[0].steps[16]==undefined) {
            this.tts.speak("No Instruction for step 17")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[16]);
          }
         }else if (this.matches.includes('step 18')) {
          if (this.routes[0].legs[0].steps[17]==undefined) {
            this.tts.speak("No Instruction for step 18")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[17]);
          }
         }else if (this.matches.includes('step 19')) {
          if (this.routes[0].legs[0].steps[18]==undefined) {
            this.tts.speak("No Instruction for step 19")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[18]);
          }
         }else if (this.matches.includes('step 20')) {
          if (this.routes[0].legs[0].steps[19]==undefined) {
            this.tts.speak("No Instruction for step 20")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }else{
            this.speakstep(this.routes[0].legs[0].steps[19]);
          }
         }else{
           this.tts.speak("Voice command not recognized")
              .then(() => console.log('Success'))
              .catch((reason: any) => console.log(reason));
          }
      }
    });
    this.isRecording = true;
  }

speakstep(x){
  var ins = x.instructions.split("<b>").join("");
          ins = ins.split("</b>").join("");
          ins = ins.split('<div style="font-size:0.9em">').join(" ");
          ins = ins.split("</b>").join("");
          ins = ins.split("-").join(" ");
          ins = ins.split("</div>").join("");
          ins = ins.split("Rd").join("Road");
          ins = ins.split("Hwy").join("Highway");
          ins = ins.split("/").join(" ");
this.tts.speak(ins+"...  ")
    .then(() => {
      var distance = x.distance.text.replace("km", "kilometers");
      this.tts.speak("For "+distance)
        .then(() => {
            var duration = x.duration.text.replace("mins", "minutes");
                duration = duration.replace("hrs", "hours");
                this.tts.speak("in "+duration)
                    .then(() => {
                                  
                    })
                    .catch((reason: any) => console.log(reason));
        })
        .catch((reason: any) => console.log(reason));
    })
    .catch((reason: any) => console.log(reason));
}


stopListening() {
    this.speechRecognition.stopListening().then(() => {
      this.isRecording = false;
    });
  }
 
  getPermission() {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
  }

  //Return Comma saperated address
  generateAddress(addressObj){
        let obj = [];
        let address = "";
        for (let key in addressObj) {
          obj.push(addressObj[key]);
        }
        obj.reverse();
        for (let val in obj) {
          if(obj[val].length)
          address += obj[val]+', ';
        }
      return address.slice(0, -2);
    }

calculateAndDisplayRoutetest() {

    this.opacity='1'
    this.DeleteMarkers();
    this.hide=true;
    var get;
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setPanel(this.directionsPanel.nativeElement);
    var directionsDisplay = this.directionsDisplay
    this.directionsService.route({
    origin: this.MyLocation,
    destination: this.Destination,
    travelMode: 'WALKING'
      }, function(response, status) {
      if (status === 'OK') {
        this.routes=response.routes
        response.routes[0].warnings = [];
        getval(response.routes)
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
    function getval(x){
      get = x;
    }
    setTimeout(()=>{ this.assignroute(get) }, 1000);
    

}


assignroute(x){
 this.routes=x;console.log(this.routes)
} 

tellinfo(){

  var str = this.routes[0].legs[0].distance.text;
  var distance = str.replace("km", "kilometers");
      str = this.routes[0].legs[0].duration.text;
  var duration = str.replace("mins", "minutes");
      duration = duration.replace("hrs", "hours");
  this.tts.speak("Distance is "+distance+"...")
              .then(() => {
                this.tts.speak("Duration is "+duration+"...")
                  .then(() => {
                    this.tts.speak("with "+this.routes[0].legs[0].steps.length+" Steps...")
                      .then(() => console.log('Success'))
                      .catch((reason: any) => console.log(reason));
                  })
                  .catch((reason: any) => console.log(reason));
              })
              .catch((reason: any) => console.log(reason));
}


addmarker(){
  //this.DeleteMarkers();

    var infowindow = new google.maps.InfoWindow();
    let pos = {
      lat:  17.625002,
      lng: 121.727314
    };
    this.MyLocation = new google.maps.LatLng(pos);
    let marker = new google.maps.Marker({
      position: pos,
      map: this.map,
      title: 'I am here!'
    });

    this.markers.push(marker);

    infowindow.setContent('You are Here!');
    infowindow.open(this.map,marker);
    this.map.setCenter(pos);
}

}