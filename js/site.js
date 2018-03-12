"use strict";

const REDIRECT_URL = "https://dev.throughapinhole.com/foursquare";
let access_token = "";

function foursquareAuth(step, ...data) {
    if (step === 'redirect') {
        location.replace("https://foursquare.com/oauth2/authenticate?client_id=ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3&response_type=code&redirect_uri=" + REDIRECT_URL);
    } else if (step === 'get-token') {
        $.get("https://foursquare.com/oauth2/access_token?client_id=ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3&client_secret=1KG5RCUPH0RDODKDE4KOIOAFL13KPV41AZNJE4ZN4WY1VDVP&grant_type=authorization_code&redirect_uri=" + REDIRECT_URL + "&code=" + data[0], function (response) {
            $('.message-div').text(response);
        });
    }
}

function getLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $('.message-div').text('Your position is: ' + position.coords.latitude + ", " + position.coords.longitude);
        }, function (error) {
            $('.message-div').text(error.code + ": " + error.message);
        });
    } else {
        $('.message-div').text('Your browser does not support location services.');
    }
}

$(document).ready(function () {
    let urlParams = new URLSearchParams(window.location.search);
    let code = "";

    if (urlParams.has('code')) {
        code = urlParams.get('code');
        foursquareAuth('get-token', code);
    } else {
        getLocation();
        foursquareAuth('redirect');
    }
});