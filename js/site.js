"use strict";

const REQUEST_BASE_URL = "https://api.foursquare.com/v2/venues/search?ll=";
const CLIENT_ID = "ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3";
const CLIENT_SECRET = "1KG5RCUPH0RDODKDE4KOIOAFL13KPV41AZNJE4ZN4WY1VDVP";
const INTENT = "checkin";

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

function foursquareRequest(radius, type, ...coordinates) {
    let radius_meters = radius * 1000;
    let now = new Date();
    let date_string = now.getFullYear().toString() + (now.getMonth() < 10 ? "0" + (now.getMonth() + 1).toString() : (now.getMonth() + 1).toString()) + (now.getDate < 10 ? "0" + now.getDate().toString() : now.getDate().toString());
    let url = REQUEST_BASE_URL + coordinates[0] + "," + coordinates[1] + "&intent=" + INTENT + "&radius=" + radius_meters + "&query=" + type + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=" + date_string;
    let xhr = createCORSRequest("GET", url);

    if (!xhr) {
        $(".message-div").text("CORS is not supported by your browser");
    } else {
        xhr.onload = function () {
            let responseObject = JSON.parse(xhr.responseText);
            let venues = responseObject.response.venues;

            $(".results-div").text("");
            venues.forEach(venue => {
                $(".results-div").append("<h3>" + venue.name + "</h3>");
                $(".results-div").append(venue.location.address !== undefined ? venue.location.address + "<br />" : " ");
                $(".results-div").append((venue.location.postalCode !== undefined ? venue.location.postalCode : " ") + " " + (venue.location.city !== undefined ? venue.location.city : " ") + "<br />");
            });
        };
        xhr.onerror = function () {
            $(".message-div").text("There was an error sending the request.");
        };

        xhr.send();
    }
}

function search() {
    let radius = $("#radius").val();
    let search_type = $("#venue-type").val();

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            foursquareRequest(radius, search_type, position.coords.latitude, position.coords.longitude);
            $(".message-div").text("Your position is: " + position.coords.latitude + ", " + position.coords.longitude);
        }, function (error) {
            $(".message-div").text(error.code + ": " + error.message);
            return error.code;
        });
    } else {
        $(".message-div").text("Your browser does not support location services.");
    }
}

$(document).ready(function () {
    $("#search-button").on("click", search);
});