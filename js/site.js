"use strict";

//Setup constants to hold parameters of the HTTP requests which won't be variable

const REQUEST_BASE_URL = "https://api.foursquare.com/v2/venues/search?ll=";
const CLIENT_ID = "ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3";
const CLIENT_SECRET = "1KG5RCUPH0RDODKDE4KOIOAFL13KPV41AZNJE4ZN4WY1VDVP";
const INTENT = "checkin";

/************
*  Function to create a CORS request so that the HTTP request can be sent cross-domain
*  Takes as parameters the HTTP method, and the URL to make the request to
*  Returns an XMLHttpRequest object
************/
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest !== "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }

    return xhr;
}

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
    let radius_meters = 3 * 1000;
    let now = new Date();
    let date_string = now.getFullYear().toString() + (now.getMonth() < 10 ? "0" + (now.getMonth() + 1).toString() : (now.getMonth() + 1).toString()) + (now.getDate < 10 ? "0" + now.getDate().toString() : now.getDate().toString());
    let url = REQUEST_BASE_URL + coordinates.latitude + "," + coordinates.longitude + "&intent=" + INTENT + "&radius=" + radius_meters + "&query=" + type + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=" + date_string;
    let xhr = createCORSRequest("GET", url);

    if (!xhr) {
        $(".message-div").text("CORS is not supported by your browser");
    } else {
        xhr.onload = function () {
            let responseObject = JSON.parse(xhr.responseText);
            let venues = responseObject.response.venues;

            venues.forEach(venue => {
                let phoneNumber = venue.contact.formattedPhone !== undefined ? venue.contact.formattedPhone + "<br />" : venue.contact.phone;
                $(".results-div").append("<div class=\"venue-div " + venue.id + "\"></div>");
                $("." + venue.id).append("<div class=\"venue-name\">" + venue.name + "</div>");
                $("." + venue.id).append(venue.location.address !== undefined ? venue.location.address + "<br />" : " ");
                $("." + venue.id).append((venue.location.postalCode !== undefined ? venue.location.postalCode : " ") + " " + (venue.location.city !== undefined ? venue.location.city : " ") + "<br />");
                $("." + venue.id).append(phoneNumber);
            });
        };
        xhr.onerror = function () {
            $(".message-div").text("There was an error sending the request.");
        };

        xhr.send();
    }
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

    if ($("#radius").val() < 1) {
        $(".radius-validation-div").text("Please select a search radius");
        return;
    }

    if ("geolocation" in navigator) {
        getLocation($("#radius").val(), $("#venue-type").val());
    } else {
        $(".message-div").text("Your browser does not support location services.");
    }
}

/*************
*  When the DOM is ready, attach the onClick event handler to the search button.
*************/
$(document).ready(function () {
    $("#search-button").on("click", search);
});