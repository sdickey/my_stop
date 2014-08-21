$(document).ready(function(){
  var chart = new Chart();
  chart.getLocation();
  chart.bindEvents();
});

function Chart() {
  this.stopLatitude = 0;
  this.stopLongitude = 0;
  this.userLatitude = 0;
  this.userLongitude = 0;
}

Chart.prototype = {

bindEvents: function() {
  $('.interact').on('submit', 'form', this.confirmInfo.bind(this));
  $(window).on('resize', this.codeAddress.bind(this));
},

codeAddress: function() {
  var address = document.getElementById('address').value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var mapOptions = {
        zoom: 15,
        center: results[0].geometry.location
      };

      stopLatitude = results[0].geometry.location.k;
      stopLongitude = results[0].geometry.location.B;

      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
},

getLocation: function() {
  var x = document.getElementById("show-location");
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(this.showPosition);
  }
  else{x.innerHTML = "Geolocation is not supported by this browser.";}
  },

  showPosition: function(position) {
  geocoder = new google.maps.Geocoder();
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;
  var latlng = new google.maps.LatLng(userLatitude, userLongitude);
  var mapOptions = {
    zoom: 12,
    center: latlng
  };

  var x = document.getElementById("show-location");
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
},

confirmInfo: function(e) {
  e.preventDefault();
  var ajaxRequest = $.ajax({
    url: '/set_info',
    type: "GET",
    data: $(e.currentTarget).serialize()
  });
  ajaxRequest.done(this.displayInfo.bind(this));
},

displayInfo: function(data) {
  userPhone = data.phonenum;
  $('.interact').fadeOut();
  $('#show-location').fadeIn();
  $('#show-location').html("<p>Your stop is: " + data.stopaddress + "<br>We'll text to " + data.phonenum + " when your stop is coming up.<br> Happy travels!");
  this.codeAddress();
  this.startCompareCoords();
},

keepInPlace: function() {
  $('#show-location').removeClass('info-off-page').addClass('info-final-pos');
},

startCompareCoords: function() {
  intervalID = setInterval(this.compareCoords.bind(this), 5000);
},

compareCoords: function() {
  var alertRadius = 1; //kilometer
  var earthRadius = 6371; // kilometers
  var cartesianX = earthRadius * (userLongitude - stopLongitude) * (Math.PI / 180) * (Math.cos(stopLatitude));
  var cartesianY = earthRadius * (userLatitude - stopLatitude) * (Math.PI / 180);
  var cartXSquared = Math.pow(cartesianX, 2);
  var cartYSquared = Math.pow(cartesianY, 2);
  var distanceToStop = Math.sqrt(cartXSquared + cartYSquared);

  if (distanceToStop < alertRadius) {
    clearInterval(intervalID);
    this.sendUserStopMessage();
  }
  else {
    console.log("You're not there yet");
  }
},

 sendUserStopMessage: function() {
      var ajaxRequest = $.ajax({
        url: '/stop_approaching',
        type: 'POST'
      });
    ajaxRequest.done(this.stopTextNotification.bind(this));
  },

  stopTextNotification: function() {
    console.log("What's up from the stopTextNotification function");
  }

}; //ends map prototype