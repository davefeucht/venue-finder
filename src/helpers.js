/*
* This file defines helper functions to be used by the UI to facilitate
* the function of the application
*/

"use strict";

/************
*  Function to scroll the page back to the top
************/
export function toTop() {
  $("html, body").animate({ scrollTop: 0 }, "fast");
}

/*************
*  Function to reset the page after searching by un-focusing input elements and
*  setting page zoom back to standard (since many mobile browsers zoom in when
*  an input element is clicked).
*************/
export function unFocusInputs() {
  if(document.activeElement instanceof HTMLInputElement) {
    document.activeElement.blur();
  }
}

/**************
* Function to select the correct radio button when a label is clicked
**************/
export function selectRadio() {
  const radioId = $(this).attr("for");
  $("#" + radioId).trigger("click"); 
  $("input[type=radio]").parent().removeClass("inputs__radio-input--selected");
  $("#" + radioId).parent().addClass("inputs__radio-input--selected");
}

/**************
* Function to fade in an element of the page identified by a CSS selector passed in an event.
* Takes a jQuery event with data {element_class: <class name>}
**************/
export function showElement(event) {
  $(event.data.element_class).fadeIn();
}

/************
* Function to validate the form fields
************/
export function validateFields() {
  if(!$("input[name=radius]").is(":checked")) {
    throw Error("Please select a search radius");
  }
}

/*************
* Function to reset any validation messages which have been shown.
*************/
export function clearValidation() {
  $(".validation-message").text("");
}

/************
* Function to clear results before a new search
************/
export function clearResults() {
  $(".results__detail").remove();
  $(".results__no-result-text").remove();
}

export function queryLocation(location) {
  if(location.geolocationIsEnabled()) {
    location.queryLocation()
      .then(() => {
        //Enable search button
      })
      .catch((error) => {
        throw Error(error.message);
      });
  }
}