"use strict";

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

/**************
* Factory function to represent an Application Error
* Takes an error object and exposes a method to display the error in the form.
**************/
function AppError(error) {
  const originalError = error; 
  
  /************
  *  Function to display an error message
  ************/
  function displayError() {
    if(originalError instanceof ValidationError) {
      $(".validation-message--error").text(`Validation Error: ${originalError.message}`);
    }
    else if(originalError instanceof LocationError) {
      $(".validation-message--error").text(`Location Error: ${originalError.message}`);
    }
    else {
      $(".validation-message--error").text(`Error: ${originalError.message}`);
    }
  }

  return {
    displayError: displayError
  };

}

/**************
* Factory function to represent a Location
* Exposes a function to Return a promise for getting the location of the user using the browser geolocation API.
**************/
function Location() {

  /***********
  * Function to check if geolocation is enabled
  * Returns true if yes, false if no
  ***********/
  function geolocationIsEnabled() {
    let enabled = false;
    if("geolocation" in navigator) {
      enabled = true;
    }
  
    return enabled;
  }

  /*************
  *  Function which gets the location of the user. 
  *  Returns a promise for the return of the location from the browser geolocation API.
  *************/
  function getLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => {
        const location = position.coords;
        resolve(location);
      }, error => {
        AppError(error).displayError(); 
        reject(error);
      });
    });
  }

  return {
    geolocationIsEnabled: geolocationIsEnabled,
    getLocation: getLocation
  };

}

/***************
* Factory function to represent a Venue
* Takes venue details as arguments and exposes functions to get the formatted name and address information of the venue
***************/
function Venue(venueName, venueAddress, venuePostalCode, venueCity) { 
  const name = venueName;
  const address = venueAddress;
  const postalCode = venuePostalCode;
  const city = venueCity;

  /*************
  * Function to create a string for the address information for a venue.
  *************/
  function getAddressString() {
    let address_phone = "";
    if(address === undefined && postalCode === undefined && city === undefined) { 
      address_phone = "No information available";
    }
    else {
      address_phone += (address !== undefined ? `${address} <br />` : " ");
      address_phone += (postalCode !== undefined ? postalCode : " ") + (city !== undefined ? ` ${city} <br />`: " ");
    }
  
    return address_phone;
  }

  function getName() {
    if(name === undefined) {
      return "No name available";
    }
    else {
      return name;
    }
  }

  return {
    getAddressString: getAddressString,
    getName: getName
  };
}

/***************
* Factory function to represent the list of results
* Takes a JSON list of result venues from search
* Exposes a method to display the results in the page
***************/
function ResultsList(resultVenues) {

  const venues = resultVenues;
  /************
  *  Function to display the results of a search.
  *  Takes as parameter the object containing the returned venues
  ************/
  function displayResults() {
    const results = $("<div>");
             
    //If there were no results, display a message
    if(venues.length === 0) {
      results.addClass("results__no-result-text");
      results.append(document.createTextNode("No results found."));
    }
    //Otherwise display the results
    else { 
      results.addClass("results__detail");
  
      for(const venue of venues) {
        const venueObject = Venue(venue.name, venue.location.address, venue.location.postalCode, venue.location.city); 
          
        //Create a div for the individual venue
        const venue_div = $("<div>", {"class": "results__result"});
  
        //Create a div for the venue name and append it to the venue div
        const venue_name = $("<div>", {"class": "result__header"});
        venue_name.text(venueObject.getName());
        venue_div.append(venue_name);
  
        //Append the text of the address and phone number to the venue div
        const venue_details = $("<div>", {"class": "result__details"});
        venue_details.html(venueObject.getAddressString());
        venue_div.append(venue_details);
  
        //Append the venue div to the container results div
        results.append(venue_div);
      }
    }
    //Append the full list of results to the DOM
    $(".results").append(results);
    
  }

  return {
    displayResults: displayResults
  };
}

/****************
* Factory function to represent a Request
* Exposes method to make a request, which uses 'Private' methods to build the query string 
****************/
function Request() {
  //Setup constants to hold parameters of the HTTP requests which won't change based on user input
  const REQUEST_BASE_URL = "https://api.foursquare.com/v2/venues/search?ll=";
  const CLIENT_ID = "ZK1LL4LNA35TMQHPJORGHTWMP1LJVWLTVPHA4FCVBMLLZHJ3";
  const CLIENT_SECRET = "1KG5RCUPH0RDODKDE4KOIOAFL13KPV41AZNJE4ZN4WY1VDVP";
  const INTENT = "checkin";

  /************
  * Function to create the appropriate date string for the Foursquare request
  ************/
  function getFormattedDateString() {
    const now = new Date();
    const date_string = `${now.getFullYear().toString()}${(now.getMonth() < 10 ? ("0" + (now.getMonth() + 1).toString()) : (now.getMonth() + 1).toString())}${(now.getDate < 10 ? ("0" + now.getDate().toString()) : now.getDate().toString())}`;
    return date_string;
  }

  /***************
  * Function to build the Foursquare request URL
  ***************/
  function getFoursquareRequestURL(coordinates, radius, type, date_string) {
    //Set up the full request URL
    const url = `${REQUEST_BASE_URL}${coordinates.latitude},${coordinates.longitude}&intent=${INTENT}&radius=${radius}&query=${type}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=${date_string}`;
    
    return url;
  }

  /************
  *  Function to make the request to the Foursquare Search API endpoint
  *  Takes as parameters the search radius, type of venue, and coordinates
  *  Makes the request to the API, parses the response JSON, and updates
  *  the page with content.
  ************/
  function makeRequest(radius, type, coordinates) {
  
    //Since radius is in kilometers, we multiply to get meters, which is what Foursquare expects
    const radius_meters = radius * 1000;
  
    //Set up the YYYYMMDD date string
    const date_string = getFormattedDateString();
  
    //Set up the full request URL
    const url = getFoursquareRequestURL(coordinates, radius_meters, type, date_string);
  
    //Make HTTP request
    $.get(url)
      .done(data => {
        const results = ResultsList(data.response.venues);
        results.displayResults();
      //If the request failed, display the error in the message div
      }).fail(error => {
        AppError(error).displayError();
      });
  }

  return {
    makeRequest: makeRequest
  };

}

/************
 * HELPER FUNCTIONS
 ***********/

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
function unFocusInputs() {
  if(document.activeElement instanceof HTMLInputElement) {
    document.activeElement.blur();
  }
}

/**************
* Function to select the correct radio button when a label is clicked
**************/
function selectRadio() {
  const radioId = $(this).attr("for");
  $("#" + radioId).trigger("click"); 
  $("input[type=radio]").parent().removeClass("inputs__radio-input--selected");
  $("#" + radioId).parent().addClass("inputs__radio-input--selected");
}

/**************
* Function to fade in an element of the page identified by a CSS selector passed in an event.
* Takes a jQuery event with data {element_class: <class name>}
**************/
function showElement(event) {
  $(event.data.element_class).fadeIn();
}

/************
* Function to validate the form fields
************/
function validateFields() {
  if(!$("input[name=radius]").is(":checked")) {
    AppError(new ValidationError("Please select a search radius")).displayError();
  }
}

/*************
* Function to reset any validation messages which have been shown.
*************/
function clearValidation() {
  $(".validation-message").text("");
}

/************
* Function to clear results before a new search
************/
function clearResults() {
  $(".results__detail").remove();
  $(".results__no-result-text").remove();
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

  //Try validating the form. If it fails, display the error raised
  try {
    validateFields();
  }
  catch (error) {
    AppError(error).displayError(); 
    return;
  }

  //If the browser supports location services, get the location, otherwise throw an exception
  const location = Location();
  if(location.geolocationIsEnabled()) {
    const request = Request();
    location.getLocation()
      .then((coordinates) => {
        request.makeRequest($(".radio--radius input:checked").val(), $(".text-input input").val(), coordinates);
      }).catch((error) => {
        AppError(new LocationError(error.message)).displayError();
      });
  }
  else {
    AppError(new LocationError("Your browser does not support location services.")).displayError();
  }

  unFocusInputs();
}

/*************
*  When the DOM is ready, attach the onSubmit event handler to the search form, and the onClick handler to the Radius buttons and the To Top button
*************/
$(document).ready(() => {
  $("form").on("submit", search);
  $("label").on("click", selectRadio);
  $("label").on("click", search);
  $(".text-input input").on("focus", {element_class:".radio--radius"}, showElement);
  $(".button--to-top img").on("click", toTop);
});
