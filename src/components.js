/* global API_DATA */

/*
* This file contains definitions for specific error classes used for error checking
* as well as factory functions to define objects for AppError, Location, Venue,
* ResultsList and Request
*/

"use strict";

/************
* Setup a ValidationError class which can be thrown and caught. Created so that we can
* differentiate between different types of errors if necessary.
************/
export class ValidationError extends Error {}

/************
* Setup a LocationError class which can be thrown and caught. Created so that we can
* differentiate between different types of errors if necessary.
************/
export class LocationError extends Error {}

/**************
* Factory function to represent an Application Error
* Takes an error object and exposes a method to display the error in the form.
**************/
export function AppError(error) {
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
export function Location() {

  const enabled = ("geolocation" in navigator ? true : false);
  let location = undefined;

  /***********
  * Function to check if geolocation is enabled
  * Returns true if yes, false if no
  ***********/
  function geolocationIsEnabled() {
    return enabled;
  }

  /*************
  *  Function which gets the location of the user. 
  *  Returns a promise for the return of the location from the browser geolocation API.
  *************/
  function queryLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => {
        location = position.coords;
        resolve(location);
      }, error => {
        AppError(error).displayError(); 
        reject(error);
      });
    });
  }

  /*************
   * Function to get the location coordinates represented by the Location
   ************/
  function getLocation() {
    return location;
  }

  return {
    geolocationIsEnabled: geolocationIsEnabled,
    queryLocation: queryLocation,
    getLocation: getLocation
  };

}

/***************
* Factory function to represent a Venue
* Takes venue details as arguments and exposes functions to get the formatted name and address information of the venue
***************/
export function Venue(venueName, venueAddress, venuePostalCode, venueCity) { 
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
export function ResultsList(resultVenues) {

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
export function Request() {

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
    const url = `${API_DATA.REQUEST_BASE_URL}${coordinates.latitude},${coordinates.longitude}&intent=${API_DATA.INTENT}&radius=${radius}&query=${type}&client_id=${API_DATA.CLIENT_ID}&client_secret=${API_DATA.CLIENT_SECRET}&v=${date_string}`;
    
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
