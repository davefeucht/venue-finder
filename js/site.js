"use strict";

var access_token = "";

function foursquareAuth(step, ...data) {
    if(step === 'redirect') {
        location.replace("https://foursquare.com/oauth2/authenticate?client_id=ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3&response_type=code&redirect_uri=http://dev.throughapinhole.com/foursquare/");
    }
    else if (step === 'get-token') {
        
    }
}

function getLocation() {
  if("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
    function(position) {
        $('.message-div').text('Your position is: ' + position.coords.latitude + ", " + position.coords.longitude);
        alert(position.coords.latitude + ", " + position.coords.longitude);
    },
    function(error) {
        alert(error.code + ": " + error.message); 
    });
  }
  else {
      $('.message-div').text('Your browser does not support location services.');
  }
}

$(document).ready(function() {
    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('code')) {
    foursquareAuth('get-token');
    getLocation();
});
