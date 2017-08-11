$(document).ready(function(){



var locationList = [
       { name: '한국외국어대학교', latLng: { lat: 40.786998, lng: -73.975664 }},
       { name: '경희대학교', latLng: { lat: 37.763061, lng: -122.431935 }},
       { name: '서울시립대학교', latLng: { lat: 34.079078, lng: -118.242818 }},
       { name: '북서울꿈의숲', latLng: { lat: 34.079078, lng: -118.242818 }},
       { name: '청량리 롯데백화점', latLng: { lat: 34.079078, lng: -118.242818 }}
   ] ;



var Model = function(data){
    var self = this;
    self.name = ko.observable(data.name);
    self.location = ko.observable(data.geometry.location);
    self.formatted_address= ko.observable(data.formatted_address);
    //self.icon =ko.observalbe();

};




var koViewModel = function(){
    var self = this;
    /*
    self.map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: 40.166294, lng: -96.389016 },
                    zoom: 4,
                    mapTypeId: 'roadmap'
                    });
    **/

    var mapOptions = {
          disableDefaultUI: true
        };
    self.map =  new google.maps.Map(document.querySelector('#map'), mapOptions);

    self.infowindow = new google.maps.InfoWindow();
    self.service = new google.maps.places.PlacesService(self.map);
    self.neighborData = ko.observableArray([]);

    //Create input box
    self.input = document.getElementById('pac-input');
    self.searchBox = new google.maps.places.SearchBox(self.input);
    self.map.controls[google.maps.ControlPosition.TOP_LEFT].push(self.input);
    self.map.addListener('bounds_changed', function() {
          self.searchBox.setBounds(self.map.getBounds());
        });
    self.searchBox.addListener('places_changed', function(){
          //Addnewplace
          var new_place_lst = {}
          var places = self.searchBox.getPlaces();
          var geometry = places[0].geometry
          new_place_lst['name'] = places[0].name
          new_place_lst['location'] = geometry.location;
          if (places.length == 0) {
            return;
          }
          var request = {
            query: places[0].name
          };
          self.service.textSearch(request, self.callback);
          var bounds = new google.maps.LatLngBounds();
          console.log(geometry.location);
          bounds.extend(geometry.location);
          window.mapBounds = bounds;
          self.map.fitBounds(bounds);
    });



    self.zoomin = function(data){
        var bounds = new google.maps.LatLngBounds();
        console.log(data.location().lat());
        bounds.extend(new google.maps.LatLng(data.location().lat(), data.location().lng()));
        window.mapBounds = bounds;
        self.map.fitBounds(bounds);
        self.map.setZoom(18);


    }



    //self.service = new google.maps.places.PlacesService(self.map);
    window.mapBounds = new google.maps.LatLngBounds();


    //Result google search of location -> MapMarkerObject on view.
    self.createMapMarker = function(placeData) {
            self.neighborData.push(new Model(placeData));
            // The next lines save location data from the search result object to local variables
            var lat = placeData.geometry.location.lat();  // latitude from the place service
            var lon = placeData.geometry.location.lng();  // longitude from the place service
            var address = placeData.formatted_address;   // name of the place from the place service
            var name = placeData.name;   // name of the place from the place service
            var bounds = window.mapBounds;            // current boundaries of the map window
            var icon = placeData.icon;
            var photo = placeData.photos[0].html_attributions;
            var placePhoto = placeData.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100});

            // marker is an object with additional data about the pin for a single location
            var marker = new google.maps.Marker({
              map:self.map,
              position: placeData.geometry.location,
              title: name,
              icon:icon
            });
            var content_str = '';
            content_str += '<h4>'+name +'</h4>'+ '<br>';
            content_str += '<p>'+'주소: '+placeData.formatted_address+'</p>'+'<br>';
            if(placeData.formatted_phone_number){
                content_str += '<p>'+'전화번호: '+placeData.formatted_phone_number+'</p>'+'<br>'
            }
            content_str += '<img src="' +placePhoto + '">'
            // infoWindows are the little helper windows that open when you click
            // or hover over a pin on a map. They usually contain more information
            // about a location.
            var infoWindow = new google.maps.InfoWindow({
              content: content_str
            });

            // hmmmm, I wonder what this is about...
            google.maps.event.addListener(marker, 'click', function() {
              // your code goes here!
               infoWindow.open(map,marker);

            });

            // this is where the pin actually gets added to the map.
            // bounds.extend() takes in a map location object
            bounds.extend(new google.maps.LatLng(lat, lon));
            // fit the map to the new marker
            self.map.fitBounds(bounds);
            // center the map
            self.map.setCenter(bounds.getCenter());
        };


      // List of Result google search of location/ status of result ->results ofcreateMapMarker function.
      self.callback = function(results,status,request,request2){
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                    self.createMapMarker(results[0]);
                }
            }

      //ListOfaddress ->Make Marker on the map
      self.pinPoster = function(){
            // creates a Google place search service object. PlacesService does the work of
            // actually searching for location data.
            var service = self.service;
            // Iterates through the array of locations, creates a search object for each location
            locationList.forEach(function(place,index){
              // the search request object
              var request = {
                query: place.name,
                index: index
              };
              // Actually searches the Google Maps API for location data and runs the callback
              // function with the search results after each search.
              service.textSearch(request, self.callback);
            });
        };
    self.pinPoster();

}




ko.applyBindings(new koViewModel());

});
