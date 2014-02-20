//
// Name:    WP_ScriptManager_admin.js
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

//
// Create Global variable with this class.
//
var cctSMprog;

//
// Create an editor class.
//


function SMeditor(editorinst) {
	//
	// Define the class variables:
	//
	//       smFull             boolean telling if we are full screen or not.
	//       codeMirrorHeight   Varaible for storing the original height of 
	//                             the editor
	//       beforefullscreen   variable containing window sizes before full 
	//                             screen mode
	//       findReplaceOn      boolean telling if find/replace div is open
	//       GotoOn             boolean telling if the goto div is open
	//       editor             variable containing editor instance
	//       lastPos            This is the last position in the current search
	//       lastQuery          This is the search term for the last search
	//       marked             An array of marked locations.
	//       hlLine             The current line that is highlighted
	//
	this.smFull = false;
	this.codeMirrorHeight = 0;
	this.beforefullscreen = 0;
	this.findReplaceOn = false;
	this.GotoOn = false;
	this.editor = editorinst;
	this.lastPos = null;
	this.lastQuery = null;
	this.marked = [];
	this.hlLine = 0;
	this.changed = false;
}

//
// Create Global Variable with this class.
//
var cctSMeditor;

//
// Function:     ready
//
// Description:  This code is executed upon completely loading the DOM.
//
jQuery(document).ready(function() {
	//
	// Do stuff when DOM is ready.  We need to load the textarea editor.
	//
	//
	// Create instances of our global objects.
	//
	cctSMprog = new SMprog();

	//
	// The following code is used to show a spinner while ajax functions
	// are working.
	//
	jQuery('#loadingDiv').hide() // hide it initially
	.ajaxStart(function() {
		//
		// Ajax was started.  Show the spinner.
		//
		jQuery(this).show();
	}).ajaxStop(function() {
		//
		// Ajax has finished.  Hide the spinner.
		//
		jQuery(this).hide();
	});

	//
	// If we have an editor instance, connect to it and start the editor. Since
	// the default tab selected is the HTML tab, the default state of the 
	// editor will be for editing html.  Also, it will show line numbers and
	// the indent will be three spaces.  Also, it will match braces in the 
	// program.
	//
	if (document.getElementById("scripteditor") != null) {
		cctSMeditor = new SMeditor(CodeMirror.fromTextArea(document.getElementById("scripteditor"), {
			lineNumbers: true,
			mode: "text/html",
			theme: "neat",
			matchBrackets: true,
			indentUnit: 3,
			extraKeys: {"Ctrl-Space": function(cm) {
										CodeMirror.simpleHint(cm, CodeMirror.javascriptHint);
									  }
						},
			onCursorActivity: function() {
				//
				// Set the line that has cursor activity to a different color.
				//
				cctSMeditor.editor.setLineClass(cctSMeditor.hlLine, null);
				cctSMeditor.hlLine = cctSMeditor.editor.setLineClass(cctSMeditor.editor.getCursor().line, "activeline");
			},
			onChange: function() {
				//
				// Contents have changed.  Flag for saving.
				//
				cctSMeditor.changed = true;
			}
		}));

		//
		// Fix the height of the CodeMirror area.
		//
		jQuery('.CodeMirror').css('height','456px');
	}

	//
	// Create some value for the editor on a non-editor page.
	//
	if(cctSMeditor.editor != null) {
		cctSMeditor.editor.setValue('');
		cctSMeditor.editor.refresh();
	}
});

//
// Function:     editor_save
//
// Description:  This is the call back function for the textarea editor.  It 
//               allows for saving the current text area into the script 
//               database.
//
SMprog.prototype.editor_save = function() {
	if (sessionStorage.currentScript == "") {
		//
		// There is not a script set to store.  Tell the user to select a
		// script.
		//
		this.Modal_Dialog("Please select a script to edit first.", "", "<div style='display: block-inline; float: none; margin: 20px auto 2px;  width: 110px;'><button class='SM_Script_button' onclick='cctSMprog.Close_Modal_Dialog(true)'>OK</button></span></div>");
	} else if (this.editor_changed()) {
		//
		// The contents have changed and the user asked to save.
		// Get the editor contents and store it into the database. 
		//
		jQuery.post(
		this.langs[1]['loc'], {
			action: 'ajax_Save_Script',
			name: sessionStorage.currentScript,
			langID: sessionStorage.currentLangNum,
			script: this.Get_Script_from_editor(),
		}, function(response) {
			//
			// The response is the script to be edited.
			//
			cctSMprog.editor_clear_changed();
		});
	}
};

//
// Function:     Get_Script_from_editor
//
// Description:  This will get the script from the editor and clean
//               up all quotes for sending in a string.
//
SMprog.prototype.Get_Script_from_editor = function() {
	//
	// Get the script from the editor.
	//
	result = cctSMeditor.editor.getValue().trim();

	//
	// Clean Quotes so that it transmits better.
	//
	result = this.FixQuotes(result);

	//
	// Send the results.
	//
	return (result);
};

//
// Function:       FixQuotes
//
// Description:    This function fixes quotes for transmission without 
//                 quote errors.
//
SMprog.prototype.FixQuotes = function(text) {
	//
	// Change all double quotes to the #dquote# selector.
	//
	result1 = text.split('\"').join('#dquote#');

	//
	// Change all single quotes to the #squote# selector.
	//
	result2 = result1.split("\'").join("#squote#");

	//
	// Return the results.
	//
	return (result2);
}

//
// Function:     editor_changed
//
// Description:  This method is used to see if the contents of the editor
//               has changed.  It returns true if it has.
//
SMprog.prototype.editor_changed = function() {
	return (cctSMeditor.changed);
}

//
// Function:     editor_clear_changed
//
// Description:  This method is used to clear the editor contents have changed
//               flag.
//
SMprog.prototype.editor_clear_changed = function() {
	cctSMeditor.changed = false;
}

//
// Function:     list_scripts
//
// Description:  This function is used to set the language type of the 
//               scripts viewed and edited.
//
SMprog.prototype.list_scripts = function(langNum, lang) {
	var langNum = parseInt(langNum);
	if (sessionStorage.currentLang != lang) {
		//
		// See if the buffer has been changed and needs to be saved.
		//
		if (this.editor_changed() && (sessionStorage.currentScript != '')) {
			//
			// Contents have changed! Save the editors contents.
			//
			this.editor_save();
		}

		//
		// See if we need to turn on or off the insert code button.
		//
		if ((langNum == 1) || (langNum == 98)) {
			//
			// We just came to the HTML language tab from another
			// language tab.  Enable the CodeInsert button.
			//
			jQuery('#CodeInsert').show();
			jQuery('#Codehighlight').show();
		} else if ((sessionStorage.currentLangNum == 1) || (sessionStorage.currentLangNum == 98)) {
			//
			// We just left the HTML language tab. Disable the 
			// CodeInsert button.
			//
			jQuery('#CodeInsert').hide();
			jQuery('#Codehighlight').hide();
		}

		//
		// Turn on and off different script function buttons for Filters and 
		// Actions.
		//
		if ((langNum == 98) || (langNum == 99)) {
			//
			// We are entering the filter or action hooks scripts. Set the 
			// appropriate buttons visible or hidden.
			//
			//jQuery('#ScriptNewBut').hide();
			//jQuery('#ScriptDeleteBut').hide();
			jQuery('#ScriptRenameBut').hide();
			//jQuery('#ScriptTestBut').hide();
		} else if ((sessionStorage.currentLangNum == 98) || (sessionStorage.currentLangNum == 99)) {
			//jQuery('#ScriptNewBut').show();
			//jQuery('#ScriptDeleteBut').show();
			jQuery('#ScriptRenameBut').show();
			//jQuery('#ScriptTestBut').show();
		}

		//
		// It has changed languages.  Re-load the possible scripts for that 
		// language.
		//
		if (sessionStorage.currentLang != "") {
			jQuery('#' + sessionStorage.currentLang).removeClass('tabselected');
			jQuery('#' + sessionStorage.currentLang).addClass('tabunselected');
			jQuery('#' + lang).removeClass('tabunselected');
			jQuery('#' + lang).addClass('tabselected');
		}

		//
		// Get a list of scripts in the database for the new language.
		//
		jQuery.post(
		this.langs[1]['loc'], {
			action: 'ajax_Create_Script_List',
			langID: langNum,
		}, function(response) {
			//
			// The response is the html for the list of scripts
			// to edit/view.
			//
			jQuery('#ScriptList').html(response);
		});


		//
		// Change the currentLang variable.
		//
		sessionStorage.currentLang = lang;
		sessionStorage.currentLangNum = langNum;

		//
		// Clear out the currently selected script.
		//
		sessionStorage.currentScript = "";

		//
		// Clear out the editor area.
		//
		cctSMeditor.editor.setValue("");
		cctSMeditor.changed = false;
	}
};

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
	for (var i = 1; i < this.langs.length; i++) {
		if (this.langs[i]['name'] == lang) langID = i;
	}

	//
	// Return the result.
	//
	return (langID);
}

//
// Function:      getScriptFromServer
//
// Description:   This method is used to obtain a script from the server.
//
// Inputs:        langid             Id number of the language
//                script             name of the script
//                resultFunction     The function to process the script
//                                   obtained.
//
SMprog.prototype.getScriptFromServer = function(langid, script, resultFunction) {
	//
	// Get the script from the server and give it to the resultFunction.
	//
	jQuery.post(
	this.langs[1]['loc'], {
		action: 'ajax_Get_Script',
		name: script,
		langID: sessionStorage.currentLangNum,
	}, resultFunction);
}

//
// Function:      set_script
//
// Description:   This function is used to load the script into the editor.
//
// Inputs:        script       Name of the script to edit
//
SMprog.prototype.set_script = function(script) {
	//
	// Do not reload if it is the currently selected script.
	//
	if (sessionStorage.currentScript != script) {
		//
		// If the script content has changed, then save it first.
		//
		if (this.editor_changed() && (sessionStorage.currentScript != '')) {
			//
			// Save the script.
			//
			this.editor_save();
		}

		this.getScriptFromServer(sessionStorage.currentLangNum, script, function(response) {
			//
			// Change all double quotes to the #dquote# selector.
			//
			response = response.trim().split('#dquote#').join('"');

			//
			// Change all single quotes to the #squote# selector.
			//
			response = response.split("#squote#").join("'");

			//
			// The response is the script to be edited.
			//
			cctSMeditor.editor.setValue(response);

			//
			// Set the language syntax highlighting to the current 
			// scripts language.
			//
			if (sessionStorage.currentLangNum < 98) {
				cctSMeditor.editor.setOption('mode', cctSMprog.langs[sessionStorage.currentLangNum]['ref']);
			} else {
				//
				// We process the WordPresw actionss and filters differently
				// than the other scripts.
				//
				if (sessionStorage.currentLangNum == 98) {
					//
					// It is an action.  Treat as html.
					//
					cctSMeditor.editor.setOption('mode', 'application/x-httpd-php');
				} else {
					//
					// It is an filter.  Treat as PHP.
					//
					cctSMeditor.editor.setOption('mode', 'text/x-php');
				}
			}

			//
			// Make sure the editor cleared flag is cleared.
			//
			cctSMprog.editor_clear_changed();
		});

		//
		// Highlight the script being edited.  Make sure the name has it's
		// spaces turned into underscores.  IDs can not have spaces in them.
		//
		script2 = script.split(' ').join('_');
		jQuery('#' + script2 + ' div').removeClass('normal');
		jQuery('#' + script2 + ' div').addClass('selected');

		//
		// Turn off highlighting from the last script.
		//
		if (sessionStorage.currentScript != '') {
			//
			// Change all spaces in the name to underscores because IDs
			// can not contain spaces.
			//
			script2 = sessionStorage.currentScript.split(' ').join('_');
			jQuery('#' + script2 + ' div').removeClass('selected');
			jQuery('#' + script2 + ' div').addClass('normal');
		}

		//
		// Set it as the currently being edited script.
		//
		sessionStorage.currentScript = script;
	}
};

//
// Function:      New_Script
//
// Description:   This function is called when the new script button is
//                pressed.  It will create a new script in the database.
//
SMprog.prototype.New_Script = function() {
	//
	// If the current editor content has changed, save the changes first.
	//
	if ((sessionStorage.currentScript != '') && (this.editor_changed())) {
		//
		// Save the contents first.
		//
		this.editor_save();
	}

	//
	// Clear out the editor area.
	//
	cctSMeditor.editor.setValue("");
	cctSMeditor.changed = false;

	//
	// Clear out the slected script.
	//
	jQuery('.script').removeClass('selected');
	jQuery('.script').addClass('normal');
	sessionStorage.currentScript = '';

	//
	// Save the original html for the div
	//
	sessionStorage.oldHTML = jQuery('#ScriptList').html();

	if (sessionStorage.currentLangNum < 98) {
		//
		// Put in the HTML for requesting the name of the new script.  This is
		// for any of the normal script types.
		//
		jQuery('#ScriptList').html("<div style='margin: auto; width: 400px; height: 140px; padding-left: 0px; padding-right: 0px; margin-top: 40px;'><h2 style='padding-left: 0px; padding-right: 0px; padding-bottom: 20px;'>Creating a new " + sessionStorage.currentLang.trim() + " Script</h2>Name:<input type='text' name='scriptname' id='scriptname' /><p><button id='NewBut2' onClick='cctSMprog.Make_New_Script();'>New</button><button onClick='cctSMprog.Cancel_New_Script();'>Cancel</button></p></div><script type='text/javascript'>document.NewForm.script.focus();</script>");
	} else {
		//
		// Put in the HTML for creating a new filte or Action.
		//
		nameAF = '';
		if (sessionStorage.currentLangNum == 98) {
			nameAF = 'Action';
		} else {
			nameAF = 'Filter';
		}
		jQuery('#ScriptList').html("<div style='margin: auto; width: 300px;'><h2 style='padding: 0px 0px 0px 0px;'>Creating a new " + nameAF + "</h2><form name='NewForm' style='margin: auto; width: 305px;'><div style='margin: auto; width: 305px; height: 100px; top: -15px;'><div><p style='text-align: left;'>Name:<input type='text' name='scriptname' id='scriptname' style='width: 200px; margin: 0px 30px 0px 35px;' /></p></div><div><p style='text-align: left;'>Priority:<input type='number' name='scriptpri' id='scriptpri' style='width: 40px; margin: 0px 160px 0px 33px;' min='1' max='100' value='10' /></p></div><div><p style='text-align: left;'>Arguments:<input type='text' name='scriptargs' id='scriptargs' style='width: 200px; margin: 0px 0px 0px 10px;'></p></div></div></form><div style='margin: auto; width: 300px;'><div style='display: inline;'><div style='margin: auto; width: 110px; padding-top: 15px;'><button id='NewBut2' onClick='cctSMprog.Make_New_FilterAction()'>New</button><button onClick='cctSMprog.Cancel_New_Script()'>Cancel</button></div></div></div></div>");
	}
};

//
// Function:      Cancel_New_Script
//
// Description:   This function cleans up after a canceled new script function.
//
SMprog.prototype.Cancel_New_Script = function() {
	//
	// Put the original HTML back into the div.
	//
	jQuery('#ScriptList').html(sessionStorage.oldHTML);
};

//
// Function:      Make_New_FilterAction
//
// Description:   This functin finishes WP_SM_New_Script function for making
//                a new filter or Action hook.
//
SMprog.prototype.Make_New_FilterAction = function() {
	//
	// Get the input values.
	//
	var scriptname = jQuery('#scriptname').val().trim();
	var scriptpri = jQuery('#scriptpri').val().trim();
	var scriptargs = jQuery('#scriptargs').val().trim();
	var myargs = null;
	var mymatch = null;

	if(scriptargs != '') {
		//
		// Test for the args matching the regexpression:  "([$][a-zA-Z][a-zA-Z0-9_]*)"
		// Use this to reconstruct the scriptargs variable.  That will eliminate unwanted things.
		//"([$][a-zA-Z]*[a-zA-Z0-9_]*)+"
		//
		myargs = scriptargs.split(",");
		var newargs = new Array();
		mymatch = 1;
		for(var i=0;((i<myargs.length)&&(mymatch != null));i++) {
			//
			// Check to see if it is formated correctly.
			//
			myregexp = new RegExp("([$][a-zA-Z]*[a-zA-Z0-9_]*)+");
			mymatch = myregexp.exec(myargs[i]);

			//
			// Add to the newargs list if it was valid.
			//
			if(mymatch != null) {
				newargs.push(mymatch[1]);
			}
		}

		//
		// Make the list comma separated again.
		//
		myargs = newargs.join(', ');
	} else 
		myargs = '';
	
	if ((mymatch == null)&&(myargs != '')) {
		//
		// There was no match, but they did type something.  It was not properly formed.
		//
		alert("Your arguments was not properly formed.  Please see help pages for help.");
		return
	}

	if (scriptname == '') {
		//
		// Not a valid name.  Cleanup.
		//
		this.Cancel_New_Script();
	} else {
		//
		// Send the new script name to be added.
		//
		jQuery.post(
		this.langs[1]['loc'], {
			action: 'ajax_New_Script',
			name: scriptname,
			langID: sessionStorage.currentLangNum,
			args: myargs,
			priority: scriptpri
		}, function(response) {
			//
			// The response is the success of the new script.  Reload 
			// scripts.
			//
			langnum = sessionStorage.currentLangNum;
			lang = sessionStorage.currentLang;
			sessionStorage.currentLangNum = 0;
			sessionStorage.currentLang = '';
			sessionStorage.currentScript = '';
			cctSMprog.list_scripts(langnum, lang);
			cctSMeditor.editor.setValue('');
		});
	}
}

//
// Function:      Make_New_Script
//
// Description:   This function finishes WP_SM_New_Script function.
//
SMprog.prototype.Make_New_Script = function() {
	//
	// Get the name of the new script.
	//
	script = jQuery('#ScriptList input').val().trim();
	if (script == '') {
		//
		// Not a valid name.  Cleanup.
		//
		this.Cancel_New_Script();
	} else {
		//
		// Send the new script name to be added.
		//
		jQuery.post(
		this.langs[1]['loc'], {
			action: 'ajax_New_Script',
			name: script,
			langID: sessionStorage.currentLangNum,
		}, function(response) {
			//
			// The response is the success of the new script.  Reload 
			// scripts.
			//
			langnum = sessionStorage.currentLangNum;
			lang = sessionStorage.currentLang;
			sessionStorage.currentLangNum = 0;
			sessionStorage.currentLang = '';
			sessionStorage.currentScript = '';
			cctSMprog.list_scripts(langnum, lang);
			cctSMeditor.editor.setValue('');
		});
	}
};

//
// Function:      Delete_Script
//
// Description:   This function is called when the delete script button is
//                pressed.  It will delete the selected script in the database.
//
SMprog.prototype.Delete_Script = function() {
	if (sessionStorage.currentScript != '') {
		//
		// Make sure they really want to do this.
		//
		this.Modal_Dialog("Are you sure you want to delete " + sessionStorage.currentScript, "", "<div style='display: block-inline; float: none; margin: 20px auto 2px;  width: 125px;'><button class='SM_Script_button' type='button' onclick=cctSMprog.Delete_Sure_Script() style='margin-right: 5px;'>Delete</button><button class='SM_Script_button' onclick=cctSMprog.Close_Modal_Dialog(true) style='margin-left: 5px;'>Cancel</button></span></div></div>");
	}
};


//
// Function:      Delete_Sure_Script
//
// Description:   This function finishes the script deletion process.
//
SMprog.prototype.Delete_Sure_Script = function() {
	//
	// Clean up from the dialogue.
	//
	this.Close_Modal_Dialog(true);

	//
	// Send the new script name to be added.
	//
	jQuery.post(
	this.langs[1]['loc'], {
		action: 'ajax_Delete_Script',
		name: sessionStorage.currentScript,
		langID: sessionStorage.currentLangNum,
	}, function(response) {
		//
		// Get the current language locally and clear it globally.
		//
		lang = sessionStorage.currentLang;
		langNum = sessionStorage.currentLangNum;
		sessionStorage.currentScript = "";
		sessionStorage.currentLang = "";
		sessionStorage.currentLangNum = 0;

		//
		// Reload the languages' scripts.
		//
		cctSMprog.list_scripts(langNum, lang);
	});
};

//
// Function:      Rename_Script
//
// Description:   This function is called when the rename script button is
//                pressed.  It will ask for a new name in a dialog.  The
//                dialog will call the actual function for doing the renaming.
//
SMprog.prototype.Rename_Script = function() {
	//
	// If no script is currently selected, do nothing.
	//
	if (sessionStorage.currentScript != '') {
		//
		// Save the original html for the div
		//
		this.oldHTML = jQuery('#ScriptList').html();

		//
		// Put in the HTML for requesting the name of the new script.
		//
		jQuery('#ScriptList').html("<div style='margin: auto; margin-top: 75px;'><form id='NewForm'>New Name for the Script:<input type='text' name='script' /></form><p><button onClick='cctSMprog.Make_Rename_Script()'>Rename</button><button onClick='cctSMprog.Cancel_Rename_Script()'>Cancel</button></div><script type='text/javascript'>jQuery('#NewForm input').focus();</script>");
	}
};

//
// Function:      Cancel_Rename_Script
//
// Description:   This function cleans up after a canceled rename script 
//                function.
//
SMprog.prototype.Cancel_Rename_Script = function() {
	//
	// Put the original HTML back into the div.
	//
	jQuery('#ScriptList').html(this.oldHTML);
};

//
// Function:      Make_Rename_Script
//
// Description:   This function is called when the rename script button is
//                pressed.  It will rename the currently selected script in 
//                the database.
//
SMprog.prototype.Make_Rename_Script = function() {
	//
	// Get the new name for the script from the user.
	//
	newname = jQuery('#ScriptList input').val().trim();
	if (newname == '') {
		//
		// It was an invalid name.  Cleanup.
		//
		this.Cancel_Rename_Script();
	} else {
		//
		// If the editor contents have changed, save it first.
		//
		if (this.editor_changed()) {
			this.editor_save();
		}

		//
		// Send the new script name to be added.
		//
		jQuery.post(
		this.langs[1]['loc'], {
			action: 'ajax_Rename_Script',
			oldname: sessionStorage.currentScript,
			name: newname,
			langID: sessionStorage.currentLangNum,
		}, function(response) {
			//
			// Get the current language locally and clear it globally.
			//
			lang = sessionStorage.currentLang;
			langNum = sessionStorage.currentLangNum;
			sessionStorage.currentScript = "";
			sessionStorage.currentLang = "";
			sessionStorage.currentLangNum = 0;

			//
			// Reload the scripts for this language.
			//
			cctSMprog.list_scripts(langNum, lang);
		});
	}
}

//
// Function:      Test_Script
//
// Description:   This function is used to test the scripts.
//
SMprog.prototype.Test_Script = function() {
	if (sessionStorage.currentScript != '') {
		//
		// If the contents have not been saved, save them first.
		//
		if (this.editor_changed()) {
			this.editor_save();
		}

		//
		// It is a valid script.  Get the parameters for it.
		//
		this.Modal_Dialog("Parameters for " + sessionStorage.currentScript + " script", "Enter Parameters:<input type=text ></input>", "<span><button class='SM_Script_button' type='button' onclick=cctSMprog.Send_Test_Script() style='display: block; float: none; margin: 20px auto 2px; width: 50px;'>Test Script</button></span></div>", true, function() {
			//
			// Focus the input box.
			//
			jQuery('#displayresults input').focus();
		});
	}
};

//
// Function:      Send_Test_Script
//
// Description:   This function is called to get the parms from
//                the modal dialog area, close out the dialog,
//                and run the script.
//
SMprog.prototype.Send_Test_Script = function() {
	//
	// Default value the results.
	//
	results = '';

	//
	// Get the parameters for running the script.
	//
	params = jQuery('#displayresults input').val().trim();
	params = this.FixQuotes(params);

	//
	// Close the modal dialog.
	//
	this.Close_Modal_Dialog(false);

	// 
	// Run the code and process the results into a dialog.
	//
	this.RunScript(sessionStorage.currentLangNum, sessionStorage.currentScript, params, function(script, result) {
		cctSMprog.Modal_Dialog("Results from the script:  " + script, result, "<span><button class='SM_Script_button' type='button' onclick=cctSMprog.Close_Modal_Dialog(true) style='display: block; float: none; margin: 20px auto 2px; width: 50px;'>Close</button></span></div>", false, function() {
			less.refreshStyles();
		});
	});
}

//
// Function:         RunJavaScript
//
// Description:      This method is a helper function to the RunScript method.
//                   It runs a JavaScript locally on the browser.
//
// Inputs:           script         The name of the script
//                   scriptlines    The actual script
//                   param          The parameters to give to the script
//                   resultFunction A function that will take the name of the
//                                  script and the results from the script.  The
//                                  function is then to make use of the results
//                                  as needed.
//
SMprog.prototype.RunJavaScript = function(script, scriptlines, params, resultFunction) {
	//
	// Set the default values.
	//
	result = '';
	try {
		//
		// Evaluate the script with the parameters.
		//
		result = eval(scriptlines + params);
	} catch (e) {
		//
		// There was an error in it.  Show it.
		//
		result = 'An exeption evaluating the code: ' + e.name;
	}

	//
	// Give the results to the result function for processing.
	//
	resultFunction(script, result);
}

//
// Function:         RunScript
//
// Description:      This method is used to run a specified script.  If it is
//                   something the browser can run, run it in the browser.
//                   Otherwise, exicute the specified function on the server.
//
// Inputs:           langnum        The id number for the language
//                   script         The name of the script
//                   param          The parameters to give to the script
//                   resultFunction A function that will take the name of the
//                                  script and the results from the script.  The
//                                  function is then to make use of the results
//                                  as needed.
//
SMprog.prototype.RunScript = function(langnum, script, param, resultFunction) {
	//
	// Set the default value of the script.
	//
	scriptlines = '';

	//
	// See if a language name was given.  If so, get a number.
	//
	if ((typeof(langnum) == 'string') && (parseInt(langnum) == NaN)) {
		langnum = this.get_Language_ID(langnum);
	}

	//
	// See what type is being ran.
	//
	if (langnum == 3) {
		//
		// It is a JavaScript.  Run in the browser.
		//
		if (script == sessionStorage.currentScript) {
			//
			// The script is the one in the editor.  Get it from the editor.
			//
			scriptlines = cctSMeditor.editor.getValue();

			this.RunJavaScript(script, scriptlines, param, resultFunction);
		} else {
			//
			// We need to get the script from the server and run it locally.
			//
			this.getScriptFromServer(langnum, script, function(response) {
				//
				// Run the resulting script in the browser.
				//
				cctSMprog.RunJavaScript(script, response, param, resultFunction);
			});
		}
	} else {
		if(langnum <98) {
			//
			// Send the script to the server to run it.
			//
			jQuery.post(
			this.langs[sessionStorage.currentLangNum]['loc'], {
				action: 'ajax_Run_Script',
				name: script,
				langID: langnum,
				param: params,
			}, function(response) {
				//
				// The response is the output of the script.  Display it!
				//
				//
				// Give the results to the result function for processing.
				//
				resultFunction(script, response);
			});
		} else {
			//
			// It is a Filter/Action.  Use the default location.
			//
			jQuery.post(
			this.langs[1]['loc'], {
				action: 'ajax_Run_Script',
				name: script,
				langID: langnum,
				param: params,
			}, function(response) {
				//
				// The response is the output of the script.  Display it!
				//
				//
				// Give the results to the result function for processing.
				//
				resultFunction(script, response);
			});
		}
	}
};

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
	if (jQuery("body:has('#wpadminbar')") != []) {
		extra += jQuery('#wpadminbar').height();
	}

	//
	// Stop the page from scrolling.
	//
	jQuery('body').css('overflow', 'hidden');

	//
	// Create the overlay that fades to black.
	//
	if (overlay) {
		jQuery('<div id="overlay"></div>').css({'position': 'absolute', 
												'top': (scrollTop + extra), 
												'left': '0',
												'height': '100%',
												'width':'100%',
												'background':'black',
												'opacity': '0',
												'z-index': '50'}).animate({
																	'opacity': '0.4'
																	}, this.fadespeed).appendTo('body');
	}

	//
	// Create the area to display the results.
	//
	jQuery('<div id="displayresults"></div>').css( {'position': 'absolute',
													'max-width': (winWidth),
													'background': 'white',
													'border': '1px solid #B0C8D7',
													'border-radius': '15px',
													'-moz-border-radius': '15px',
													'z-index': '51',
													'-mox-box-shadow': '0 0 10px black',
													'-webkit-box-shadow': '0 0 10px black',
													'box-shadow':'0 0 10px black'}).html("<div style='padding: 10px'><span><h2 style='margin: auto; text-align: center;'>" + title + "</h2><hr /></span><div style='overflow: auto; max-height: " + (winHeight - (120 + extra)) + "px; max-width: " + (winWidth - 20) + "px;'>" + middle + "</div>" + buttons).hide().appendTo('body');

	//
	// Now, with the code inserted into the DOM, we now go through a
	// dummy node with the same embedded code. Every node that is a 
	// script definition, we evaluate to run the script.
	//
	var div = document.createElement('div');
	div.innerHTML = middle;
	cctSMprog.runScriptNodes(div);

	//
	// Fix the positioning of the results and fade it in.
	//
	jQuery('#displayresults').fadeIn(this.fadespeed + 100, function() {
		//
		// Determine the location for results in the screen.  
		//
		var top = ((winHeight - jQuery(this).height()) / 2) + (extra / 2) + jQuery(document).scrollTop();
		var left = ((winWidth - jQuery(this).width()) / 2) + 10;
		jQuery(this).css( {	'top': (top + "px"),
							'left': (left + "px"),
							'max-height': ((winHeight - extra) + "px")});

		// 
		// Fade finished, run the user function.
		//
		userfunction();
	});
};


//
// Function:       runScriptNodes
//
// Description:    This function goes through a DOM structure and
//                 gets every <script></script> nodes for evaluation.
//
SMprog.prototype.runScriptNodes = function(e) {
	if (e.nodeType != 1) return; //if it's not an element node, return
 
	if (e.tagName.toLowerCase() == 'script') {
		eval(e.text); //run the script
	}
	else {
		var n = e.firstChild;
		while ( n ) {
			if ( n.nodeType == 1 ) cctSMprog.runScriptNodes( n ); //if it's an element node, recurse
			n = n.nextSibling;
		}
	}
}

//
// Function:       Close_Modal_Dialog
//
// Description:    This function is used to remove the display
//                 of the modal dialog elements from the screen and
//                 re-enable scrolling.
//
SMprog.prototype.Close_Modal_Dialog = function(fadeoutbool) {
	if (fadeoutbool) {
		//
		// Remove the overlay element.
		//
		jQuery('#overlay').fadeOut(this.fadespeed, function() {
			jQuery(this).remove();
		});

		//
		// Remove the display results element.
		//
		jQuery('#displayresults').fadeOut(this.fadespeed, function() {
			jQuery(this).remove();
		});

		//
		// Fix the scrolling.
		//
		jQuery('body').css('overflow', 'auto');
	} else {
		//
		// Remove the display results element.
		//
		jQuery('#displayresults').remove();
	}
};

//
// Function:       ScriptSelectorChange
//
// Description:    This function is called when the selector in the widget
//                 dialog for setting the script language changes.
//
SMprog.prototype.ScriptSelectorChange = function() {
	//
	// Get the new language and get the associated language id.
	//
	var Lid = this.get_Language_ID(jQuery('#scriptlang').val().trim());

	//
	// Query the database for a list of scripts for that language.
	//
	this.get_Script_List(Lid, function(response) {
		//
		// The response is the html for the list of scripts
		// to edit/view.
		//
		jQuery('#scriptname').html(response);
	});
}

SMprog.prototype.get_Script_List = function(Lid, callback) {
	//
	// Get the new list of scripts and put it into the found selector.
	//
	jQuery.post(
	this.langs[1]['loc'], {
		action: 'ajax_Create_Script_List_for_selector',
		langID: Lid,
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
	for (var i = 1; i < this.langs.length; i++) {
		list += '<option>' + this.langs[i]['name'] + '</option>';
	}

	//
	// Return the result.
	//
	return (list);
}

//
// The following functions are for the editor class.
//
//
// Function:       fullscreen
//
// Description:    This function is used to toggle the full screen
//                 mode of the editor.
//
SMeditor.prototype.fullscreen = function() {
	//
	// Get the page reference for forcing fullscreen.
	//
	var page = jQuery('.CodeMirror-scroll');

	//
	// Is it already fullscreen or not?
	//
	if (this.smFull) {
		//
		// It is full screen.
		//
		// Remove the fullscreen class and set the flag for normal
		// screen size.
		//
		jQuery("#EditorDiv").removeClass('fullscreen');
		this.smFull = false;

		//
		// Set the page scroll back.
		//
		jQuery('body').css('overflow', 'auto');

		//
		// Set the original CodeMirror height and original page size.
		//
		jQuery(".CodeMirror").height(this.codeMirrorHeight);
		page.height(this.beforeFullscreen.height);
		page.width(this.beforeFullscreen.width);
		cctSMeditor.editor.refresh();
	} else {
		this.beforeFullscreen = {
			height: page.height(),
			width: page.width()
		}

		//
		// Determine the size of the window.
		//
		var winHeight = jQuery(window).height();
		var winWidth = jQuery(window).width();
		jQuery(document).scrollTop(0);
		this.codeMirrorHeight = jQuery(".CodeMirror").height();

		//
		// If the wordpress admin bar is display, take it into consideration.  
		// We basically can not overlay it.
		//
		var adminbarHeight = jQuery('#wpadminbar').height();
		var editbarHeight = jQuery('#EditBar').height();

		//
		// Add the fullscreen class to the EditorDiv and place at the
		// appropriate location under the adminbar.
		//
		jQuery("#EditorDiv").addClass('fullscreen').css('top',(adminbarHeight - 15));

		//
		// Set the new height for CodeMirror editor.
		//
		jQuery(".CodeMirror").height(winHeight - adminbarHeight - editbarHeight - 20);

		//
		// Stop the page from scrolling.
		//
		jQuery('body').css('overflow', 'hidden');

		//
		// Set that we are full screen.
		//
		this.smFull = true;
		page.height('100%');
		page.width('100%');
		cctSMeditor.editor.refresh();
	}
};

//
// Function:       findReplace
//
// Description:    This function emplemints the find and replace in the
//                 editor.
//
SMeditor.prototype.findReplace = function() {
	if (this.findReplaceOn) {
		//
		// Remove the line find/replace box.
		//
		jQuery("#findReplaceDiv").remove();

		//
		// Set the state flag to not showing the box.
		//
		this.findReplaceOn = false;
	} else {
		//
		// Get the location of the goto button.  We want our box to go just above it.
		//
		var findReplacepos = jQuery("#findreplace").position();

		//
		// Insert the html for the find/replace box.
		//
		jQuery("<div id='findReplaceDiv' class='basecolor' style='position: absolute; top: " + (findReplacepos.top - 30) + "px; left: " + findReplacepos.left + "px; height: 25px; width: 400px; border-top-left-radius: 5px; border-top-right-radius: 5px; text-size: 12px'><form type='Submit'><input value='search' type='text' size='10' maxlength='20' name='findInput' id='findInput' style='margin: 4px 4px 0px 7px; padding: 1px 1px 1px 2px; border-radius: 5px; width: 84px'><button type='button' class='editorButton' onClick='cctSMeditor.findButton()'><p style='text-size: 12px; margin: 0px'>Find</p></button><label title='Regular Expression Search'><input class='editorcheckbox' type='checkbox' name='RegCheck' id='RegCheck'>RegEx</label><input value='replace' type='text' size='10' maxlength='20' name='replaceInput' id='replaceInput' style='margin: 4px 4px 0px 4px; padding: 1px 1px 1px 2px; border-radius: 5px; width: 84px'><button type='button' class='editorButton' onClick='cctSMeditor.replaceButton()'><p style='text-size: 12px; margin: 0px'>Replace</p></button><label title='Replace All Occurances'><input type='checkbox' name='AllCheck' id='AllCheck'>All</label></form></div>").prependTo("#EditorDiv");

		//
		// Focus the input to the line number input.
		//
		jQuery("#findInput").focus();

		//
		// Set the state flag to showing the gotobox.
		//
		this.findReplaceOn = true;
	}
};

//
// Function:       editor_findButton
//
// Description:    This function will find the text.
//
SMeditor.prototype.findButton = function() {
	this.unmark();
	var text = jQuery('#findInput').val();
	if (!text) return;
	if (document.getElementById('RegCheck').checked) text = new RegExp(text);
	for (var cursor = this.editor.getSearchCursor(text); cursor.findNext();)
	this.marked.push(this.editor.markText(cursor.from(), cursor.to(), "searched"));

	if (this.lastQuery != text) this.lastPos = null;
	var cursor = this.editor.getSearchCursor(text, this.lastPos || this.editor.getCursor());
	if (!cursor.findNext()) {
		cursor = this.editor.getSearchCursor(text);
		if (!cursor.findNext()) return;
	}
	this.editor.setSelection(cursor.from(), cursor.to());
	this.lastQuery = text;
	this.lastPos = cursor.to();
};

//
// Function:       unmark
//
// Description:    This function is used to unmark search locations for 
//                 a new search.
//
SMeditor.prototype.unmark = function() {
	for (var i = 0; i < this.marked.length; ++i)
	this.marked[i].clear();
	this.marked.length = 0;
}

//
// Function:       editor_replaceButton
//
// Description:    This function will replace the found text.
//
SMeditor.prototype.replaceButton = function() {
	this.unmark();
	var text = jQuery('#findInput').val();
	if (document.getElementById('RegCheck').checked) text = new RegExp(text);
	var replace = jQuery('#replaceInput').val();
	if (!text) return;
	if (this.lastQuery != text) this.lastPos = null;
	var cursor = this.editor.getSearchCursor(text, this.lastPos || this.editor.getCursor());
	if (document.getElementById('AllCheck').checked) for (; cursor.findNext();)
	cursor.replace(replace);
	else {
		if (!cursor.findNext()) {
			cursor = this.editor.getSearchCursor(text);
			if (!cursor.findNext()) return;
		}
		cursor.replace(replace);
		this.editor.setSelection(cursor.from(), cursor.to());
		this.lastQuery = text;
		this.lastPos = cursor.to();
	}
};

//
// Function:       undo
//
// Description:    This function undo the last edit.
//
SMeditor.prototype.undo = function() {
	cctSMeditor.editor.undo();
};

//
// Function:       redo
//
// Description:    This function re-does a undo.
//
SMeditor.prototype.redo = function() {
	cctSMeditor.editor.redo();
};

//
// Function:       goto
//
// Description:    This function gotos a particular line in the editor.
//
SMeditor.prototype.goto = function() {
	if (this.GotoOn) {
		//
		// Get the line number to go to.
		//
		var linenumber = parseInt(jQuery("#lineNumber").val());

		//
		// Remove the line number box.
		//
		jQuery("#gotoDiv").remove();

		//
		// Set the state flag to not showing the box.
		//
		this.GotoOn = false;

		//
		// Focus the editor so the cursor will show there.
		//
		cctSMeditor.editor.focus();

		//
		// Make sure the number is a valid number.  If not, just ignore it.  Otherwise,
		// goto that line number.  If line 0 was given, make sure it goes to line 1.
		//
		if (linenumber != NaN) {
			if (linenumber < 1) linenumber = 1;

			//
			// Move the cursor to that location.
			//
			cctSMeditor.editor.setCursor(linenumber - 1, 0);
		}
	} else {
		//
		// Get the location of the goto button.  We want our box to go just above it.
		//
		var gotopos = jQuery("#goto").position();

		//
		// Insert the html for the goto box.
		//
		jQuery("<div id='gotoDiv' class='basecolor' style='position: absolute; top: " + (gotopos.top - 30) + "px; left: " + gotopos.left + "px; height: 25px; width: 39px; border-top-left-radius: 5px; border-top-right-radius: 5px;'><form type='Submit'><input value='ln#' type='text' size='3' maxlength='3' name='lineNumber' id='lineNumber' style='margin: 4px 4px 0px 4px; padding: 1px 1px 1px 2px; border-radius: 5px; width: 30px;'></form></div>").prependTo("#EditorDiv");

		//
		// Focus the input to the line number input.
		//
		jQuery("#lineNumber").focus();

		//
		// Set the state flag to showing the gotobox.
		//
		this.GotoOn = true;
	}
};

//
// Function:       editor_insertCode
//
// Description:    This function opens the dialog for inserting other code into
//                 the script as a shortcode.
//
SMeditor.prototype.insertCode = function() {
	var begin = "Script Language: <select class='widefat' name='scriptlang' id='scriptlang' onchange='cctSMprog.ScriptSelectorChange()'>";
	var middle = "</select>Script Name: <select class='widefat' name='scriptname' id='scriptname'>";
	var end = "</select>Parameters for the Script: <input class='widefat' name='scriptparam' id='scriptparam' type='text' value='' /> </p>";

	var langs = cctSMprog.create_Language_List();

	cctSMprog.Modal_Dialog("Code Insertion", begin + langs + middle + end, "<div style='margin: auto; width: 115px;'><button class='SM_Script_button' onclick=cctSMeditor.CodeInsert() style='margin: 20px 5px 5px 2px; width: 50px;'>Insert</button><button class='SM_Script_button' onclick=cctSMprog.Close_Modal_Dialog(true) style='margin: 20px 5px 5px 2px; width: 50px;'>Cancel</button></div>");

	//
	// Query the database for a list of scripts for that language.
	//
	cctSMprog.get_Script_List(1, function(response) {
		//
		// The response is the html for the list of scripts
		// to edit/view.
		//
		jQuery('#scriptname').html(response);
	});
};

//
// Function:       CodeInsert
//
// Description:    This function opens the dialog for inserting other code into
//                 the script as a shortcode.  This does the actual code 
//                 insertion.
//
SMeditor.prototype.CodeInsert = function() {
	//
	// Get the parameters from the dialog.
	//
	var name = jQuery('#scriptname').val().trim();
	var lang = jQuery('#scriptlang').val().trim();
	var param = jQuery('#scriptparam').val().trim();

	//
	// Make sure it is not a recursive call.
	//
	if ((lang == sessionStorage.currentLang) && (name == sessionStorage.currentScript)) {
		alert("Please, no recursive calling!");
	} else {
		//
		// Close the dialog.
		//
		cctSMprog.Close_Modal_Dialog(true);

		//
		// Insert the code.
		//
		var ret = cctSMeditor.editor.getCursor();
		cctSMeditor.editor.replaceRange("[CodeInsert lang='" + lang + "' name='" + name + "' param='" + param + "']", {
			line: ret.line,
			ch: ret.ch
		}, {
			line: ret.line,
			ch: ret.ch
		});
		cctSMeditor.editor.focus();
	}
}

//
// Function:       editor_highlightCode
//
// Description:    This function opens the dialog for inserting other code into
//                 the script as a shortcode.
//
SMeditor.prototype.editor_highlightCode = function() {
	var begin = "Script Language: <select class='widefat' name='scriptlang' id='scriptlang' onchange='cctSMprog.ScriptSelectorChange()'>";
	var middle = "</select>Script Name: <select class='widefat' name='scriptname' id='scriptname'>";
	var end = "</select>Parameters for the Script: <input class='widefat' name='scriptparam' id='scriptparam' type='text' value='' /> </p>";

	var langs = cctSMprog.create_Language_List();

	cctSMprog.Modal_Dialog("Code Highlight", begin + langs + middle + end, "<div style='margin: auto; width: 115px;'><button class='SM_Script_button' onclick=cctSMeditor.CodeHighlight() style='margin: 20px 5px 5px 2px; width: 50px;'>Insert</button><button class='SM_Script_button' onclick=cctSMprog.Close_Modal_Dialog(true) style='margin: 20px 5px 5px 2px; width: 50px;'>Cancel</button></div>");

	//
	// Query the database for a list of scripts for that language.
	//
	cctSMprog.get_Script_List(1, function(response) {
		//
		// The response is the html for the list of scripts
		// to edit/view.
		//
		jQuery('#scriptname').html("<option>none</option>" + response);
	});
};

//
// Function:       CodeHighlight
//
// Description:    This function opens the dialog for inserting other code into
//                 the script as a shortcode.  This does the actual code 
//                 insertion.
//
SMeditor.prototype.CodeHighlight = function() {
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
	if (name != 'none') {
		cmd = "<pre>[CodeHighlight lang='" + lang + "' name='" + name + "' param='" + param + "']</pre>";
	} else {
		//
		// Give a block highlighting.
		//
		cmd = "<pre>[CodeHighlight lang='" + lang + "'][/CodeHighlight]</pre>";
	}
	var ret = cctSMeditor.editor.getCursor();
	cctSMeditor.editor.replaceRange(cmd, {
		line: ret.line,
		ch: ret.ch
	}, {
		line: ret.line,
		ch: ret.ch
	});
	ret = cctSMeditor.editor.getCursor();
	cctSMeditor.editor.setCursor({
		line: ret.line,
		ch: ret.ch - 22
	});
	cctSMeditor.editor.focus();
}