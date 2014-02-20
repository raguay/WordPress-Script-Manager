//
// Name:    WP_ScriptManager_admin_options.js
//
// Description:  This file contains the javascript for doing the administration
//               pages for ScriptManager.
//

//
// Define the ScriptManager program class.
//
function SMprog() {
    this.fadespeed = 100;
}

var cctSMprog;

jQuery(document).ready(function (){
    //
    // Do stuff when DOM is ready.  We need to load the textarea editor.
    //
    cctSMprog = new SMprog();
    
    //
    // The following code is used to show a spinner while ajax functions
    // are working.
    //
    jQuery('#loadingDiv')
	.hide()  // hide it initially
	.ajaxStart(function() {
	    //
	    // Ajax was started.  Show the spinner.
	    //
        jQuery(this).show();
	})
	.ajaxStop(function() {
	    //
	    // Ajax has finished.  Hide the spinner.
	    //
        jQuery(this).hide();
	});
    
    //
    // Set the default first tab.
    //
    sessionStorage.CurrentTab = 'general';
});

//
// Function:           ChangeTabs
//
// Description:        This function is used to change the tabs in the options page
//                     for the Script Manager.
//
// Inputs:             newtab         The id of the new tab.
//
SMprog.prototype.ChangeTabs = function(newtab) {
  if(this.fbt) {  
    //
    // Turn off the color picker.
    //
    jQuery("#colorpickerouter").remove();
    this.CurrentColorId = 0;
    this.fbt = 0;
  }

  if(sessionStorage.CurrentTab != newtab) {
      sessionStorage.CurrentTab = newtab;
      switch(newtab) {
          case 'general':
              jQuery('#themes').removeClass('tabselected');
              jQuery('#general').addClass('tabselected');
              jQuery('#themetext').removeClass('optiontbTop');
              jQuery('#generaltext').addClass('optiontbTop');
          break;

          case 'themes':
              jQuery('#general').removeClass('tabselected');
              jQuery('#themes').addClass('tabselected');
              jQuery('#generaltext').removeClass('optiontbTop');
              jQuery('#themetext').addClass('optiontbTop');
          break;
      }
  }
}

//
// Function:            SaveOptions
//
// Description:         This function is used to save the options for the Script Manager.
//
SMprog.prototype.SaveOptions = function() {
  if(this.fbt) {  
    //
    // Turn off the color picker.
    //
    jQuery("#colorpickerouter").remove();
    this.CurrentColorId = 0;
    this.fbt = 0;
  }

  switch(sessionStorage.CurrentTab) {
    case'general':
      //
      // Get the variable values.
      //
      directory = jQuery('#exedir').val().trim();

      //
      // Send the Save General setting ajax call.
      //
      jQuery.post(
      this.langs[1]['loc'], {
        action: 'ajax_Save_General',
        dir: directory
      }, function(response) {
        //
        // The response is the success of saving the general settings.
        //
      });    
    break;

    case 'themes':
      //
      // Get the theme color values and name.
      //
      var themename = jQuery("#themename").val().trim();
      var comment = jQuery("#commentcolor").val().trim();     
      var keyword = jQuery("#keywordcolor").val().trim();      
      var string = jQuery("#stringcolor").val().trim();       
      var builtin = jQuery("#builtincolor").val().trim();      
      var special = jQuery("#specialcolor").val().trim();      
      var variable = jQuery("#variablecolor").val().trim();     
      var number = jQuery("#numbercolor").val().trim();       
      var atom = jQuery("#atomcolor").val().trim();         
      var meta = jQuery("#metacolor").val().trim();         
      var def = jQuery("#defcolor").val().trim();          
      var variable2 = jQuery("#variable-2color").val().trim();   
      var variable3 = jQuery("#variable-3color").val().trim();   
      var property = jQuery("#propertycolor").val().trim();     
      var operator = jQuery("#operatorcolor").val().trim();     
      var error = jQuery("#errorcolor").val().trim();        
      var qualifier = jQuery("#qualifiercolor").val().trim();    
      var bracket = jQuery("#bracketcolor").val().trim();      
      var tag = jQuery("#tagcolor").val().trim();          
      var attribute = jQuery("#attributecolor").val().trim();    
      var header = jQuery("#headercolor").val().trim();       
      var quote = jQuery("#quotecolor").val().trim();        
      var hr = jQuery("#hrcolor").val().trim();           
      var link = jQuery("#linkcolor").val().trim();         
      var alcolor = jQuery("#alcolorcolor").val().trim();      
      var codeareaColor = jQuery("#codeareaColorcolor").val().trim();
      var numberscolor = jQuery("#numberscolorcolor").val().trim(); 
      var bkgnumbers = jQuery("#bkgnumberscolor").val().trim(); 
      var tableheader =   jQuery("#tableheadercolor").val().trim();
      var tableroweven =   jQuery("#tablerowevencolor").val().trim();
      var tablerowodd =   jQuery("#tablerowoddcolor").val().trim();

      //
      // Send the theme information to the server.
      //
      jQuery.post(
      this.langs[1]['loc'], {
        action: 'ajax_Save_Theme',
        themename:      themename,
        comment:        comment,   
        keyword:        keyword,   
        string:         string,   
        builtin:        builtin,   
        special:        special,   
        variable:       variable,   
        number:         number,   
        atom:           atom,   
        meta:           meta,   
        def:            def,   
        variable2:      variable2,  
        variable3:      variable3,  
        property:       property,   
        operator:       operator,   
        error:          error,   
        qualifier:      qualifier,   
        bracket:        bracket,   
        tag:            tag,   
        attribute:      attribute,   
        header:         header,   
        quote:          quote,   
        hr:             hr,   
        link:           link,   
        alcolor:        alcolor,   
        codeareaColor:  codeareaColor,
        numberscolor:   numberscolor,
        bkgnumbers:     bkgnumbers,
        tableheader:    tableheader,
        tableroweven:   tableroweven,
        tablerowodd:    tablerowodd,

      }, function(response) {
        //
        // The response is the success of saving the theme settings.
        //
        
      });    
    break;
  }
};

//
// Class Variables:        CurrentColorID          Id of the current changing color
//                         fbt                     Contains reference to the current color picker
//
SMprog.prototype.CurrentColorId = 0;
SMprog.prototype.fbt = 0;

//
// Function:            ColorPickerDialog
//
// Description:         This functions creates a color picker using Fabtastic for changing
//                      the styles color graphically.
//
// Inputs:              inputid         the id of the input to place the final oclor.
//
SMprog.prototype.ColorPickerDialog = function(inputid) {
  //
  // If no CurrentColorId is set, we need to init the color picker
  //
  if(this.CurrentColorId == 0) {
    //
    // Save the new current colorid
    //
    this.CurrentColorId = inputid;

    //
    // Get the position of the colorpicker square.
    //
    loc = jQuery("#"+inputid+"colorpicker").position();

    //
    // Add the Fabtastic color picker to the right of the color square.
    //
    jQuery('<div id="colorpickerouter"><div id="colorpicker"></div></div>').css( {'top': loc.top,
                                                                                  'left': (loc.left + 160)}).appendTo('body');

    //
    // Set the on change function for the color picker.
    //
    this.fbt = jQuery.farbtastic('#colorpicker',this.OnColorChangePicker);   
    
    //
    // Set the current color value into the color picker.
    // 
    this.fbt.setColor(jQuery("#"+inputid+"color").val());
  } else {
    //
    // Turn off the color picker.
    //
    jQuery("#colorpickerouter").remove();
    this.CurrentColorId = 0;
    this.fbt = 0;
  }
};

//
// Function:            OnColorChangePicker
//
// Description:         The functions is called whenever the color is changed in the
//                      color picker.
//
// Inputs:              color       The new color value
//
SMprog.prototype.OnColorChangePicker = function(color) {
  //
  // Set the new color in the color square.
  //
  jQuery("#"+cctSMprog.CurrentColorId+"colorpicker").css('background',color);

  //
  // Set the new color value into the input.
  //
  jQuery("#"+cctSMprog.CurrentColorId+"color").val(color);
}

//
// Function:            ColorChange
//
// Description:         This functions is called whenever the color in the input is changed.
//
// Inputs:              inputid         the id of the input to place the final oclor.
//
SMprog.prototype.ColorChange = function(inputid) {
    //
    // Get the new color value and change the background color in the color square.
    //
    value = jQuery("#"+inputid+"color").val();
    jQuery("#"+inputid+"colorpicker").css('background',value);

    //
    // Set the new color value into the color picker if it is open.
    //
    if(this.fbt != 0)
      this.fbt.setColor(value);
};
