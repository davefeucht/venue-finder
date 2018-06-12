"use strict";

import * as Components from "./components.js";
import * as Helpers from "./helpers.js";

/*************
*  Function which initiates the search process. This is the click handler function
*  of the Search button. Gets the values of the input boxes, resets any messages
*  provides validation if the radius is not entered, then calls the getLocation()
*  function if geolocation functionality is detected in the browser.
*************/
function search(event, location) {

  event.preventDefault();

  //Reset the form
  Helpers.clearValidation();
  Helpers.clearResults();

  //Try validating the form. If it fails, display the error raised
  try {
    Helpers.validateFields();
  }
  catch (error) {
    Components.AppError(new Components.ValidationError(error.message)).displayError(); 
    return;
  }

  const request = Components.Request();
  request.makeRequest($(".radio--radius input:checked").val(), $(".text-input input").val(), location.getLocation());

  Helpers.unFocusInputs();
}

/*************
*  When the DOM is ready, attach the onSubmit event handler to the search form, and the onClick handler to the Radius buttons and the To Top button
*************/
$(document).ready(() => {
  //If the browser supports location services, get the location
  const location = Components.Location();
  try {
    Helpers.queryLocation(location);
  }
  catch (error) {
    Components.AppError(new Components.LocationError(error.message)).displayError();
  }
  $("form").on("submit", (e) => { search(e, location); });
  $("label").on("click", Helpers.selectRadio);
  $("label").on("click", (e) => { search(e, location); });
  $(".text-input input").on("focus", {element_class:".radio--radius"}, Helpers.showElement);
  $(".button--to-top img").on("click", Helpers.toTop);
});