"use strict";

//Setup constants to hold parameters of the HTTP requests which won't change based on user input
const REQUEST_BASE_URL = "https://api.foursquare.com/v2/venues/search?ll=";
const CLIENT_ID = "ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3";
const CLIENT_SECRET = "1KG5RCUPH0RDODKDE4KOIOAFL13KPV41AZNJE4ZN4WY1VDVP";
const INTENT = "checkin";

/************
*  Function to scroll the page back to the top
************/
function toTop() {
    $("html, body").animate({ scrollTop: 0 }, "fast");
}

/************
*  Function to create a cross-site request so that the HTTP request can be sent cross-domain
*  Takes as parameters the HTTP method, and the URL to make the request to
*  Returns a Promise object which will resolve if the request is successful and reject
*  either if XMLHttpRequest is not supported or the request fails
************/
function createAndSendRequest(method, url) {
    return new Promise((resolve, reject) => {
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

      xhr.onload = function() {
        if(xhr.status === 200) {
          resolve(xhr.response);
        }
      };

      xhr.onerror = function() {
        if(xhr === null) {
          reject("Your browser does not support cross-domain requests");
        }
        else {
          reject("A network error occurred");
        }
      };
 
      xhr.send();
      
   });
}

/************
*  Function to display an error message upon failure to get location
************/
function displayError(error) {
    $(".message-div").text(error.code + ": " + error.message);
}

/************
*  Function to make the request to the Foursquare Search API endpoint
*  Takes as parameters the search radius, type of venue, and coordinates
*  Makes the request to the API, parses the response JSON, and updates
*  the page with content.
************/
function foursquareRequest(radius, type, coordinates) {

    //Since radius is in kilometers, we multiply to get meters, which is what Foursquare expects
    let radius_meters = radius * 1000;

    //Set up the YYYYMMDD date string
    let now = new Date();
    let date_string = now.getFullYear().toString() + (now.getMonth() < 10 ? ("0" + (now.getMonth() + 1).toString()) : (now.getMonth() + 1).toString()) + (now.getDate < 10 ? ("0" + now.getDate().toString()) : now.getDate().toString());

    //Set up the full request URL
    let url = REQUEST_BASE_URL + 
      coordinates.latitude + "," + coordinates.longitude + 
      "&intent=" + INTENT + 
      "&radius=" + radius_meters +
      "&query=" + type +
      "&client_id=" + CLIENT_ID + 
      "&client_secret=" + CLIENT_SECRET + 
      "&v=" + date_string; 

    //Make HTTP request
    createAndSendRequest("GET", url).then(response => {
      let responseObject = JSON.parse(response);
      let venues = responseObject.response.venues;
           
      //If there were no results, display a message
      if(venues.length === 0) {
          $(".results-div").append("<div class=\"no-results\">There are no " + type + "(s) within " + radius + " km</div>");
      }
      //Otherwise display the results
      else { 
        venues.forEach(venue => {
          let phoneNumber = (venue.contact.formattedPhone !== undefined ? venue.contact.formattedPhone + "<br />" : venue.contact.phone);
          $(".results-div").append("<div class=\"venue-div " + venue.id + "\"></div>");
          $("." + venue.id).append("<div class=\"venue-name\">" + venue.name + "</div>");
          $("." + venue.id).append((venue.location.address !== undefined ? venue.location.address + "<br />" : " "));
          $("." + venue.id).append((venue.location.postalCode !== undefined ? venue.location.postalCode : " ") + " " + (venue.location.city !== undefined ? venue.location.city : " ") + "<br />");
          $("." + venue.id).append(phoneNumber);
        });
      }
    //If the request failed, display the error in the message div
    }).catch(error => {
      $(".message-div").text(error);
    });
}

/*************
*  Function which gets the location of the user, and then initiates the call to
*  the Foursquare API endpoint.
*  Takes as arguments the radius and the venue type.
*************/
function getLocation(radius, venue_type) {
    navigator.geolocation.getCurrentPosition(position => {
        foursquareRequest(radius, venue_type, position.coords);
    }, error => {
        displayError(error);
    });
}

/*************
*  Function which initiates the search process. This is the onClick function
*  of the Search button. Gets the values of the input boxes, resets any messages
*  provides validation if the radius is not entered, then calls the getLocation()
*  function if geolocation functionality is detected in the browser.
*************/
function search() {
    $(".message-div").text("");
    $(".radius-validation-div").text("");
    $(".results-div").text("");

    if($("#radius").val() < 1) {
        $(".radius-validation-div").text("Please select a search radius");
        return;
    }

    if("geolocation" in navigator) {
        getLocation($("#radius").val(), $("#venue-type").val());
    }
    else {
        $(".message-div").text("Your browser does not support location services.");
    }
}

/*************
*  When the DOM is ready, attach the onClick event handler to the search button and the To Top button
*************/
$(document).ready(function() {
    $("#search-button").on("click", search);
    $(".to-top-button").on("click", toTop);
});
