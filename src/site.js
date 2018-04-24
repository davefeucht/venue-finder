"use strict";

//Setup constants to hold parameters of the HTTP requests which won't change based on user input
const REQUEST_BASE_URL = "https://api.foursquare.com/v2/venues/search?ll=";
const CLIENT_ID = "ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3";
const CLIENT_SECRET = "1KG5RCUPH0RDODKDE4KOIOAFL13KPV41AZNJE4ZN4WY1VDVP";
const INTENT = "checkin";

/************
* Setup a ValidationError class which can be thrown and caught. Created so that we can
* differentiate between different types of errors if necessary.
************/
class ValidationError extends Error {}

/************
* Setup a LocationError class which can be thrown and caught. Created so that we can
* differentiate between different types of errors if necessary.
************/
class LocationError extends Error {}

/************
*  Function to scroll the page back to the top
************/
function toTop() {
    $("html, body").animate({ scrollTop: 0 }, "fast");
}

/*************
*  Function to reset the page after searching by un-focusing input elements and
*  setting page zoom back to standard (since many mobile browsers zoom in when
*  an input element is clicked).
*************/
function unFocus() {
  if(document.activeElement instanceof HTMLInputElement) {
    document.activeElement.blur();
  }
}

/**************
* Function to select the correct radio button when a label is clicked
**************/
function selectRadio() {
  let radioId = $(this).attr("for");
  $("#" + radioId).trigger("click"); 
  $("input[type=radio]").parent().removeClass("inputs__radio-input--selected");
  $("#" + radioId).parent().addClass("inputs__radio-input--selected");
}

/**************
* Function to show the search radius selection on focus of the search field
**************/
function showRadius() {
  $(".radio").fadeIn();
}

/************
*  Function to display an error message
************/
function displayError(error) {
  if(error instanceof ValidationError) {
    $(".validation-message--radius").text("Validation Error: " + error.message);
  }
  else if(error instanceof LocationError) {
    $(".validation-message--error").text("Location Error: " + error.message);
  }
  else {
    $(".validation-message--error").text("Error: " + error.message);
  }
}

/************
* Function to validate the form fields
************/
function validateFields() {
  if(!$("input[name=radius]").is(":checked")) {
    throw new ValidationError("Please select a search radius");
  }
}

/*************
* Function to reset any validation messages which have been shown.
*************/
function clearValidation() {
  $(".validation-message").text("");
}

/************
*  Function to display the results of a search.
*  Takes as parameter the object containing the returned venues
************/
function displayResults(venues) {
  let results = $("<div>");
           
  //If there were no results, display a message
  if(venues.length === 0) {
      results.addClass("results__no-result-text");
      results.append(document.createTextNode("No results found."));
  }
  //Otherwise display the results
  else { 
    results.addClass("results__detail");

    for(let venue of venues) {
        
      //Create a div for the individual venue
      let venue_div = $("<div>", {"class": "results__result"});

      //Create a div for the venue name and append it to the venue div
      let venue_name = $("<div>", {"class": "result__header"});
      venue_name.text(venue.name);
      venue_div.append(venue_name);

      //Append the text of the address and phone number to the venue div
      let address_phone = "";
      address_phone += (venue.location.address !== undefined ? venue.location.address + "<br />" : " ");
      address_phone += (venue.location.postalComde !== undefined ? venue.location.postalCode : " ") + (venue.location.city !== undefined ? venue.location.city + "<br />": " ");
      address_phone += (venue.contact.formattedPhone !== undefined ? venue.contact.formattedPhone : (venue.contact.phone !== undefined ? venue.contact.phone : " "));
      venue_div.append(address_phone);

      //Append the venue div to the container results div
      results.append(venue_div);
    }
  }
  //Append the full list of results to the DOM
  $(".results").append(results);
  
}

/************
* Function to clear results before a new search
************/
function clearResults() {
  $(".results__detail").remove();
  $(".results__no-result-text").text(" ");
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
  $.get(url)
  .done(data => {
    displayResults(data.response.venues);
  //If the request failed, display the error in the message div
  }).fail(error => {
    displayError(error);
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
*  Function which initiates the search process. This is the click handler function
*  of the Search button. Gets the values of the input boxes, resets any messages
*  provides validation if the radius is not entered, then calls the getLocation()
*  function if geolocation functionality is detected in the browser.
*************/
function search(event) {

  event.preventDefault();

  //Reset the form
  clearValidation();
  clearResults();

  //Try validating the form, if it fails, throw an exception
  try {
    validateFields();
  }
  catch (error) {
    displayError(error); 
    return;
  }

  //If the browser supports location services, get the location, otherwise throw an exception
  if("geolocation" in navigator) {
    getLocation($("input[name=radius]:checked").val(), $("#venue-type").val());
  }
  else {
    displayError(new LocationError("Your browser does not support location services."));
  }

  unFocus();
}

/*************
*  When the DOM is ready, attach the onClick event handler to the search button and the To Top button
*************/
$(document).ready(() => {
  $("form").on("submit", search);
  $("label").on("click", selectRadio);
  $(".text-input input").on("focus", showRadius);
  $(".button--to-top img").on("click", toTop);
});
