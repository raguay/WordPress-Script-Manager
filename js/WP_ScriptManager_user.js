//
// Name:    WP_ScriptManager_user.js
//
// Description:  This file contains the javascript for doing codehighlighting 
//               with the [CodeHighlight] shortcode.
//

//
// Define the ScriptManager program class.
//
function SMprog() {
    this.fadespeed = 100;
}

var cctSMprog;

//
// Function:     ready
//
// Description:  This code is executed upon completely loading the DOM.
//
jQuery(document).ready(function (){
    //
    // Do stuff when DOM is ready.  We need to find codeboxes and do their
    // highlighting.
    //
    cctSMprog = new SMprog();
    var classes = jQuery('.codemirrortext');
    var i=0, length=classes.length;
    while(i<length) {
	var NodeText = classes.get(i++);
	var codeAttr = NodeText.parentElement.lang;
	var codehtml = NodeText.value;
	CodeMirror.runMode(codehtml,codeAttr,NodeText.parentElement);
    }

    //
    // Add a button to the html style editor.
    //
    jQuery(window).load(function() {
	jQuery('#ed_toolbar').append('<input type="button" id="codeInsert" class="ed_button" title="Script Manager Code Insert" value="codeInsert" onClick="cctSMprog.HTMLEditorCodeInsert();"><input type="button" id="codeHighlight" class="ed_button" title="Script Manager Code Insert" value="codeHighlight" onClick="cctSMprog.HTMLEditorCodeHighlight();">');
    });
});

//
// Function:       get_Language_ID
//
// Description:    This function is called to obtain the numerical id
//                 number for a language.
//
// Inputs:         lang          Language to find the id for
//
SMprog.prototype.get_Language_ID = function(lang) {
    var langID = 1;

    //
    // Loop through the language list to find the id of the language.
    //
    for(var i = 1; i < this.langs.length; i++) {
	if(this.langs[i]['name'] == lang)
	    langID = i;
    }

    //
    // Return the result.
    //
    return(langID);
}

//
// Function:       ScriptSelectorChange
//
// Description:    This function is called when the selector in the widget
//                 dialog for setting the script language changes.  It will 
//                 get the list of scripts for the new language and set it
//                 into the selector for the script name.
//
// Inputs:         id      ID of the selector that changed.
//
SMprog.prototype.ScriptSelectorChange = function(id) {
    //
    // First, find the Element in the DOM by ID.
    //
    var widget = document.getElementById(id);

    //
    // Use that to find the next select using jQuery.
    //
    var selects = jQuery(widget).parent().parent().find('select');

    var Lid = this.get_Language_ID(widget.value);

    //
    // Get the new list of scripts and put it into the found selector.
    //
    jQuery.post(
        this.langs[1]['loc'],
	{
	    action : 'ajax_Create_Script_List_for_selector',
	    langID : Lid,
 	},
	function( response ) {
	    //
	    // The response is the html for the list of scripts
	    // to edit/view.
	    //
	    selects[1].innerHTML = response;
	    }
	);
}

//
// Function:      Modal_Dialog
//
// Description:   This function is used to display stuff with a nice
//                modal dialog.  The user send the specs for the buttons.
//
// Inputs:        title          The title for the results
//                middle         What to be displayed in the middle
//                buttons        What to specify in the button area
//                userfunction   Function to run after the last fade
//
SMprog.prototype.Modal_Dialog = function(title, middle, buttons, overlay, userfunction) {
    //
    // set userfunction if not given one.
    //
    userfunction = typeof(userfunction) != 'undefined' ? userfunction : jQuery.noop;
    overlay = typeof(overlay) != 'undefined' ? overlay : true;

    //
    // Determine the size of the window.
    //
    var winHeight = jQuery(window).height();
    var winWidth = jQuery(window).width();
    var scrollTop = jQuery(document).scrollTop();

    //
    // If the wordpress admin bar is display, take it into consideration.  
    // We basically can not overlay it.
    //
    var extra = 0;
    if(jQuery("body:has('#wpadminbar')") != []) {
	extra += jQuery('#wpadminbar').height();
   }
    
    //
    // Stop the page from scrolling.
    //
    jQuery('body').css('overflow','hidden');

    //
    // Create the overlay that fades to black.
    //
    if(overlay) {
	jQuery('<div id="overlay"></div>')
	    .css(  {'position':'absolute',
                'top': (scrollTop + extra),
                'left':'0',
                'height':'100%',
                'width':'100%',
                'background':'black',
                'opacity':'0',
                'z-index':'50'}).animate({'opacity' : '0.4'}, this.fadespeed)
	                            .appendTo('body');
    }

    //
    // Create the area to display the results.
    //
    jQuery('<div id="displayresults"></div>')
	.css(  {'position':'absolute',
            'max-width': winWidth,
            'background':'white',
            'border':'1px solid #B0C8D7',
            'border-radius': '15px',
            '-moz-border-radius':'15px',
            'z-index':'51',
            '-mox-box-shadow':'0 0 10px black',
            '-webkit-box-shadow': '0 0 10px black',
            'box-shadow': '0 0 10px black'})
	.html("<div style='padding: 10px'><span><h2 style='margin: auto; text-align: center;'>" + title + "</h2><hr /></span><div style='overflow: auto; max-height: " + (winHeight-(120+extra)) +"px; max-width: " + (winWidth-20) + "px;'>" + middle + "</div>" + buttons)
	.hide()
	.appendTo('body');
    //
    // Fix the positioning of the results and fade it in.
    //
    jQuery('#displayresults')
	.fadeIn(this.fadespeed+100,function() {
	    //
	    // Determine the location for results in the screen.  
	    //
	    var top = ((winHeight - jQuery(this).height())/2)+(extra/2)+jQuery(document).scrollTop();
	    var left = ((winWidth - jQuery(this).width())/2)+10;
	    jQuery(this)
		.css(  {'top': (top+"px"),
                'left': (left+"px"),
                'max-height': ((winHeight-extra)+"px")});

	    // 
	    // Fade finished, run the user function.
	    //
	    userfunction();
	});
};

//
// Function:       Close_Modal_Dialog
//
// Description:    This function is used to remove the display
//                 of the modal dialog elements from the screen and
//                 re-enable scrolling.
//
SMprog.prototype.Close_Modal_Dialog = function(fadeoutbool) {
    if(fadeoutbool) {
	//
	// Remove the overlay element.
	//
	jQuery('#overlay')
	    .fadeOut(this.fadespeed,function() {
		jQuery(this).remove();
	    });
	
	//
	// Remove the display results element.
	//
	jQuery('#displayresults')
	    .fadeOut(this.fadespeed,function() {
		jQuery(this).remove();
	    });

	//
	// Fix the scrolling.
	//
	jQuery('body').css('overflow','auto');
    } else {
	//
	// Remove the display results element.
	//
	jQuery('#displayresults').remove();
    }
};

//
// Function:         get_Script_List
//
// Description:      This function gets a script list.
//
SMprog.prototype.get_Script_List = function(Lid, callback) {
    //
    // Get the new list of scripts and put it into the found selector.
    //
    jQuery.post(
        this.langs[1]['loc'],
	{
	    action : 'ajax_Create_Script_List_for_selector',
	    langID : Lid,
 	}, callback);
}

//
// Function:       create_Language_List
//
// Description:    This function creates an options list for a selector
//                 of the possible languages.
//
SMprog.prototype.create_Language_List = function() {
    var list = '';

    //
    // Loop through the language list to make the list.
    //
    for(var i = 1; i < this.langs.length; i++) {
	list += '<option>' + this.langs[i]['name'] + '</option>';
    }

    //
    // Return the result.
    //
    return(list);
}

//
// Function:       CodeInsert
//
// Description:    This function opens the dialog for inserting other code into
//                 the script as a shortcode.  This does the actual code 
//                 insertion.
//
SMprog.prototype.CodeInsert = function() {
    //
    // Get the parameters from the dialog.
    //
    var name = jQuery('#scriptname').val().trim();
    var lang = jQuery('#scriptlang').val().trim();
    var param = jQuery('#scriptparam').val().trim();

    //
    // Close the dialog.
    //
    cctSMprog.Close_Modal_Dialog(true);

    //
    // Insert the code.
    //
    cmd = "[CodeInsert lang='" + lang + "' name='" + name + "' param='" + param + "']";
    cctSMprog.ed.execCommand('mceInsertContent',false,cmd);
}

//
// Function:       CodeHighlight
//
// Description:    This function opens the dialog for inserting other code into
//                 the script as a shortcode.  This does the actual code 
//                 insertion.
//
SMprog.prototype.CodeHighlight = function() {
    //
    // Get the parameters from the dialog.
    //
    var name = jQuery('#scriptname').val().trim();
    var lang = jQuery('#scriptlang').val().trim();
    var param = jQuery('#scriptparam').val().trim();

    //
    // Close the dialog.
    //
    cctSMprog.Close_Modal_Dialog(true);

    //
    // Insert the code.
    //
    cmd = '';
    if(name != 'none') {
	cmd = "<pre>[CodeHighlight lang='" + lang + "' name='" + name + "' param='" + param + "']</pre>";
    } else {
	//
	// Give a block highlighting.
	//
	cmd = "<pre>[CodeHighlight lang='" + lang + "'][/CodeHighlight]</pre>";
    }
    cctSMprog.ed.execCommand('mceInsertContent',false,cmd);
}

//
// Function:       ScriptSelectorChangeEditor
//
// Description:    This function is called when the selector in the widget
//                 dialog for setting the script language changes.
//
SMprog.prototype.ScriptSelectorChangeEditor = function(name) {
    //
    // Make sure we have something for the name parameter.
    //
    name = typeof(name) != 'undefined' ? name : "";

    //
    // Get the new language and get the associated language id.
    //
    var Lid = this.get_Language_ID(jQuery('#scriptlang').val().trim());

    //
    // Query the database for a list of scripts for that language.
    //
    this.get_Script_List(Lid, 
	function( response ) {
	    //
	    // The response is the html for the list of scripts
	    // to edit/view.
	    //
	    if(name == "") {
		jQuery('#scriptname').html(response);
	    } else {
		jQuery('#scriptname').html("<option>" + name + "</option>" + response);
	    }
	}
			);
}

//
// Function:       HTMLEditorCodeInsert
//
// Description:    This function is called in the WordPress HTML editor for
//                 inserting a script into the page/post.
//
SMprog.prototype.HTMLEditorCodeInsert = function() {
    var begin = "Script Language: <select name='scriptlang' id='scriptlang' onchange='cctSMprog.ScriptSelectorChangeEditor()' style='width: 184px;'>";
    var middle = "</select><br>Script Name: <select name='scriptname' id='scriptname' style='width: 205px;'>";
    var end = "</select><br>Parameters for the Script: <input name='scriptparam' id='scriptparam' type='text' value='' />";

    var langs = cctSMprog.create_Language_List();

    cctSMprog.Modal_Dialog("Code Insertion",begin + langs + middle + end,"<div style='margin: auto; width: 115px;'><button class='SM_Script_button' onclick=cctSMprog.HTMLCodeInsert() style='margin: 20px 5px 5px 2px; width: 50px;'>Insert</button><button class='SM_Script_button' onclick=cctSMprog.Close_Modal_Dialog(true) style='margin: 20px 5px 5px 2px; width: 50px;'>Cancel</button></div>");

    //
    // Query the database for a list of scripts for that language.
    //
    cctSMprog.get_Script_List(1, 
			      function( response ) {
				  //
				  // The response is the html for the list of scripts
				  // to edit/view.
				  //
				  jQuery('#scriptname').html(response);
			      }
			     );
}

//
// Function:       HTMLEditorCodeHighlight
//
// Description:    This function is called in the WordPress HTML editor for
//                 inserting a script for highlighting into the page/post.
//
SMprog.prototype.HTMLEditorCodeHighlight = function() {
    var begin = "Script Language: <select name='scriptlang' id='scriptlang' onchange='cctSMprog.ScriptSelectorChangeEditor(\"none\")' style='width: 184px;'>";
    var middle = "</select><br>Script Name: <select name='scriptname' id='scriptname' style='width: 205px;'>";
    var end = "</select><br>Parameters for the Script: <input name='scriptparam' id='scriptparam' type='text' value='' />";

    var langs = cctSMprog.create_Language_List();

    cctSMprog.Modal_Dialog("Code Highlighting",begin + langs + middle + end,"<div style='margin: auto; width: 115px;'><button class='SM_Script_button' onclick=cctSMprog.HTMLCodeHighlight() style='margin: 20px 5px 5px 2px; width: 50px;'>Insert</button><button class='SM_Script_button' onclick=cctSMprog.Close_Modal_Dialog(true) style='margin: 20px 5px 5px 2px; width: 50px;'>Cancel</button></div>");

    //
    // Query the database for a list of scripts for that language.
    //
    cctSMprog.get_Script_List(1, 
			      function( response ) {
				  //
				  // The response is the html for the list of scripts
				  // to edit/view.
				  //
				  jQuery('#scriptname').html('<option>none</option>' + response);
			      }
			     );
}

//
// Function:       HTMLCodeInsert
//
// Description:    This function opens the dialog for inserting other code into
//                 the script as a shortcode.  This does the actual code 
//                 insertion.
//
SMprog.prototype.HTMLCodeInsert = function() {
    //
    // Get the parameters from the dialog.
    //
    var name = jQuery('#scriptname').val().trim();
    var lang = jQuery('#scriptlang').val().trim();
    var param = jQuery('#scriptparam').val().trim();

    //
    // Close the dialog.
    //
    cctSMprog.Close_Modal_Dialog(true);

    //
    // Insert the code.
    //
    cmd = "[CodeInsert lang='" + lang + "' name='" + name + "' param='" + param + "']";
    var sel = jQuery("#content").getSelection();
    jQuery('#content').insertText(cmd,sel.start,true);
}

//
// Function:       HTMLCodeHighlight
//
// Description:    This function opens the dialog for inserting other code into
//                 the script as a shortcode.  This does the actual code 
//                 highlighting.
//
SMprog.prototype.HTMLCodeHighlight = function() {
    //
    // Get the parameters from the dialog.
    //
    var name = jQuery('#scriptname').val().trim();
    var lang = jQuery('#scriptlang').val().trim();
    var param = jQuery('#scriptparam').val().trim();

    //
    // Close the dialog.
    //
    cctSMprog.Close_Modal_Dialog(true);

    //
    // Insert the code.
    //
    var cmd = '';
    var ishighlight = false;
    if(name != 'none') {
	cmd = "<pre>[CodeHighlight lang='" + lang + "' name='" + name + "' param='" + param + "']</pre>";
    } else {
	//
	// Give a block highlighting.
	//
	cmd = "<pre>[CodeHighlight lang='" + lang + "'][/CodeHighlight]</pre>";
    ishighlight = true;
    }

    //
    // Set the command into the textarea at the caret.
    //
    var sel = jQuery("#content").getSelection();
    jQuery('#content').insertText(cmd,sel.start,true);

    //
    // Move the cursor back 22 spaces.
    //
    if(ishighlight) {
        sel = jQuery("#content").getSelection();
        jQuery('#content').insertText('',sel.start - 22,true);
    }
}
