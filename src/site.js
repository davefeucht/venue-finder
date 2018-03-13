"use strict";

const CLIENT_ID = "ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3";
const CLIENT_SECRET = "1KG5RCUPH0RDODKDE4KOIOAFL13KPV41AZNJE4ZN4WY1VDVP";
const REDIRECT_URL = "https://dev.throughapinhole.com/foursquare";
const REQUEST_BASE_URL = "https://api.foursquare.com/v2/venues/search?ll=";

let access_token = "";

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if("withCredentials" in xhr) {
        xhr.open(method, url, true);
    }
    else if(typeof XDomainRequest !== "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    }
    else {
        xhr = null;
    }
 
    return xhr;
}

function foursquareAuth(step, ...data) {
    if(step === "redirect") {
        location.replace("https://foursquare.com/oauth2/authenticate?client_id=ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3&response_type=code&redirect_uri=" + REDIRECT_URL);
    }
    else if (step === "get-token") {
        let url = "https://foursquare.com/oauth2/access_token?client_id=ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3&client_secret=1KG5RCUPH0RDODKDE4KOIOAFL13KPV41AZNJE4ZN4WY1VDVP&grant_type=authorization_code&redirect_uri=" + REDIRECT_URL + "&code=" + data[0];
        let xhr = createCORSRequest("GET", url);
        if(!xhr) {
            $(".message-div").text("CORS is not supported by your browser");
        }
        else {
            xhr.onload = function() {
                let responseText = xhr.responseText;
                access_token = responseText;
                alert(access_token);
            };
            xhr.onerror = function() {
                $(".message-div").text("There was an error sending the request.");
            };

            xhr.send();
        }
    }
}

function foursquareRequest(radius, type, ...coordinates) {
    let now = new Date();
    let date_string = now.getFullYear().toString() + (now.getMonth() < 10 ? ("0" + (now.getMonth() + 1).toString()) : (now.getMonth() + 1).toString()) + now.getDate().toString();
    let url = REQUEST_BASE_URL + coordinates[0] + "," + coordinates[1] + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=" + date_string; 
    let xhr = createCORSRequest("GET", url);
    if(!xhr) {
        $(".message-div").text("CORS is not supported by your browser");
    } 
    else {
        xhr.onload = function() {
            $(".message-div").text(xhr.responseText);
        };
        xhr.onerror = function() {
            $(".message-div").text("There was an error sending the request.");
        };

        xhr.send();
    }
}

function getLocation() {

  if("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
    function(position) {
        foursquareRequest(3, "restaurant", position.coords.latitude, position.coords.longitude);
        $(".message-div").text("Your position is: " + position.coords.latitude + ", " + position.coords.longitude);
    },
    function(error) {
        $(".message-div").text(error.code + ": " + error.message);
        return(error.code);
    });
  }
  else {
      $(".message-div").text("Your browser does not support location services.");
  }
}

$(document).ready(function() {
    let urlParams = new URLSearchParams(window.location.search);
    let code = "";

    if(urlParams.has("code")) {
      code = urlParams.get("code"); 
      foursquareAuth("get-token", code);
    }
    else {
      getLocation();
      //foursquareAuth("redirect");
    }

});
