<?php
//
// File:         WP_ScriptManager_class.php
//
// Author:       Richard Guay
//

//
// Global Variables:
//
global $cctWP_SM_lang_info, $cctSM_options_hook, $cct_SM_AF;
$cctWP_SM_lang_info = null;

global $colordb;

//
// Class:        cctWP_SM
//
// Description:  This class encapsolates all the functions used in the WP Script
//               management system.  It is mostly a holder for the different 
//               functions.
//
class cctWP_SM {
  //
  // Class Variables.
  //
  //     $pagename          The name of the current page. Determine once and use everywhere.
  //     $loadstyles        This boolean variable will determine if styles need loaded or not.
  //
  public $pagename;
  public $loadstyles = false;

  //
  // Function:	        init
  //
  // Description:	This function is used to initialize the Script 
  // 			Manager.
  //
  public function init($pagename) {
    global $cctSM_options_hook, $colordb;

    //
    // Set a dummy color value used latter.
    //
    $colordb['basecolor'] = 'x';

    //
    // Set the calculated page name. I use this because on certain surcomstances the page name can not
    // be accurately determine by the normal means. This also gives protection to how it is determined
    // in different versions.
    //
    $this->pagename = $pagename;

    //
    // Load Codemirror.
    //
    wp_enqueue_script( 'WP_ScriptManager_scriptEditor', plugins_url( "js/codemirror/codemirror-c.js", __FILE__ ), array( 'jquery' ));

    //
    // Load Javascript for doing code highlighting and other user 
    // level coding.
    //
    if(!is_admin()||(($pagename!='WP_SM_plugin_page')&&($pagename!='WP_SM_plugin_options'))) {
      wp_enqueue_script( 'WP_ScriptManager_codehighlight', plugins_url( "js/WP_ScriptManager_user.js", __FILE__ ), array( 'jquery' ));
    }

    //
    // Load the Less.js code for translating the less css style tags.
    //
    wp_enqueue_script('WP_ScriptManager_less_script', plugins_url( "js/less.js", __FILE__), array('jquery'));
       
    //
    // Load the jQuery plugins.
    //
    wp_enqueue_script( 'WP_ScriptManager_textinput', plugins_url( "js/textinputs_jquery.js", __FILE__ ), array( 'jquery' ));

    //
    // Link in the shortcode.
    //
    add_shortcode('CodeInsert', array(&$this,'CodeInsert'));
    add_shortcode('CodeHighlight', array(&$this,'CodeHighlight'));
  }

   //
   // Function:        insert_into_header
   //
   // Description:     This function is used to add items to the header
   //                  of the HTML page.  This is for getting the ajax
   //                  script to use for each language and available languages
   //                  in javascripts.
   //
  public function insert_into_header() {
    //
    // Define global variables used.
    //
    global $wpdb, $pagename, $cctSM_plugin_hook;

    //
    // Insert the variables needed for ScriptManager to run.
    //
    echo "<script type='text/javascript'>\n";
    $langs = $this->Get_Lang_info();
    echo "SMprog.prototype.langs = new Array();\n";
    foreach ($langs as $lang) {
      if($lang[0] < 97) {
	      echo "SMprog.prototype.langs[{$lang[0]}] = new Array(); \nSMprog.prototype.langs[{$lang[0]}]['id'] = {$lang[0]};\n";
	      echo "SMprog.prototype.langs[{$lang[0]}]['name'] = '{$lang[1]}';\n";
	      if($lang[2] == '') {
	        echo "SMprog.prototype.langs[{$lang[0]}]['loc'] ='" . get_admin_url() . "admin-ajax.php';\n";
	      } else {
	        echo "SMprog.prototype.langs[{$lang[0]}]['loc'] = '" . plugins_url( $lang[2] , __FILE__ ) . "';\n";
	      }
	      echo "SMprog.prototype.langs[{$lang[0]}]['function'] = '{$lang[3]}';\n";
	      echo "SMprog.prototype.langs[{$lang[0]}]['ref'] = '{$lang[4]}';\n";
      }
    }
    //
    // Close out the javascript section.
    //
    echo "</script>";

    //
    // You have to unset the loopinf variable in the foreach.
    //
    unset($lang);
  }

  //
  // Function:          insert_into_footer
  //
  // Description:       This function is used to insert code into the footer of all pages
  //                    and post in WordPress.
  //
  public function insert_into_footer() {
    //
    // Determine if styles need to be loaded or not.
    //
    if($this->loadstyles) {
      //
      // Add the LESS script for the entire project.  It will actually just include the stuff needed for that page.
      //
      echo '<style type="text/less">';
      include_once("css/ScriptManagerStyles.php");
      echo '</style>';
    }

    //
    // Add the javascript code to update the LESS styles. Just do this all the time.
    //
    echo '<script type="text/javascript" charset="utf-8"> less.refreshStyles();</script>';
  }

  //
  // Function:          get_color_db
  //
  // Description:       This function is for retrieving the color for the Less script
  //                    for doing the code highlighting.
  //
  // Input:             $color       Name of the color to retrieve
  //
  public function get_color_db($color) {
    global $wpdb, $colordb;

    if($colordb['basecolor'] == 'x') {
      //
      // The database has not been read yet.  Get the data from the database.
      //
      $theme = 'default';
      $dbcolor = $wpdb->get_results("select color, value from sm_highlight where theme like 'default';",'ARRAY_N',0);
      foreach ($dbcolor as $colpair) {
        $colordb[$colpair[0]] = $colpair[1];
      }

      //
      // Clear out the indexes.
      //
      unset($colpair);
    } 
    
    //
    // Return the proper color.
    //
    return($colordb[$color]);
  }

   //
   // Function:         Get_Lang_info
   //
   // Description:      This function is used to obtain the language
   //                   info from the database.  This is used to get all 
   //                   the needed information about the languages used
   //                   with the Script Manager.
   //
   public function Get_Lang_info() {
     //
     // Global Varaibles.
     //
     global $wpdb, $cctWP_SM_lang_info;

     //
     // This will be our array for the information.
     //
     if($cctWP_SM_lang_info == null) {
       //
       // Get the information from the database.
       //
       $cctWP_SM_lang_info = $wpdb->get_results("select * from sm_lang order by ID",'ARRAY_N',0);
     }

     //
     // Return the array of information.
     //
     return($cctWP_SM_lang_info);
   }

   //
   // Function:	        init_ajax
   //
   // Description:	This function is used to initialize the Script 
   // 			Manager ajax functions.
   //
   public function init_ajax($pagename) {
     //
     // Link in the shortcode for running embedded scripts inside an ajax
     // call.
     //
     add_shortcode('CodeInsert', array(&$this,'CodeInsert'));
   }
   
   //
   // Function:       CodeInsert
   //
   // Description:    This is the function called by the shortcode to insert the
   //                 results of a script.
   //
   // Inputs:         attr['lang']          The language used
   //                 attr['name']          name of the script
   //                 attr['parms']         parameters to the script
   //                 content               What is encapsulated by the shortcode start/stop pair.
   //
   public function CodeInsert($attr,$content) {
    //
    // Code was inserted.  Therefore, make the styles to be loaded.
    //
    $this->loadstyles = true;

     //
     // Define the default parameters.
     //
     $defaults = array(
		       'lang' => 'HTML',
		       'name' => 'test',
		       'param' => ''
		       );

    $parms = '';
    extract( shortcode_atts( $defaults, $attr ) );

    if(($content == '')||($content==null)) {
      $parms = $param;
    } else {
      $parms = $param . "; $content = \"" . $content . "\"; ";
    }

     //
     // Get the code to be executed from the database.
     //
     $langID =  $this->Get_Language_id(trim($lang));

     //
     // Evaluate the script from the database and return the results.
     //
     return($this->Eval_Script($langID,trim($name),$parms));
   }
   
   //
   // Function:       CodeHighlight
   //
   // Description:    This is the function called by the shortcode to highlight
   //                 the encapsulated code or the code retrieved from the 
   //                 database.
   //
   // Inputs:         attr['lang']          The language used
   //                 attr['name']          name of the script
   //
   public function CodeHighlight($attr,$content) {
    //
    // Code was highlighted.  Therefore, make the styles to be loaded.
    //
    $this->loadstyles = true;
    

     //
     // Define the default parameters.
     //
     $defaults = array(
		       'lang' => 'HTML',
		       'name' => '',
		       );

     $options = shortcode_atts( $defaults, $attr );

     //
     // Get the language id for the language of the code.
     //
     $langID =  $this->Get_Language_id(trim($options['lang']));

     //
     // Get the language reference for codemirror to us.
     //
     $langRef = $this->Get_Lang_Ref($langID);

     //
     // See if we need to get the code from the database.
     //
     if($content == null) {
       //
       // If there was not content sent, then we need to get the code
       // from the database to display.
       //
       $content = $this->Get_Script($langID,$options['name']);

       //
       // Clean the quotes before displaying the script.
       //
       $content = $this->CleanQuotes($content);
     }

     //
     // Evaluate the script from the database and return the results.
     //
     return("<div class='CodeMirror codemirrordiv cm-s-neat' lang='{$langRef}'><textarea class='codemirrortext'>{$content}</textarea></div>");
   }

   //
   // Method:       Get_Lang_Ref
   //
   // Description:  This method is used to determine the descriptor to use
   //               for the language to be displayed in codemirror properly.
   //
   public function Get_Lang_Ref($langid) {
     //
     // Set the language syntax highlighting to the current 
     // scripts language. This is pulled from the database.
     //
     $langs = $this->Get_Lang_info();
     return($langs[$langid-1][4]);
   }

   //
   // Function:       Eval_Script
   //
   // Description:    This function is used to evaluate a given script.
   //
   // Inputs:         langid         ID of the script language
   //                 name           name of the script
   //                 parms          parameters for the script
   //
  public function Eval_Script($langid, $name, $parms) {
    //
    // Define Globals
    //
    global $ob_SM;

    //
    // Define Varaiables.
    //
    $results = '';

    //
    // Get the script from the database.
    //
    $script = $this->Get_Script($langid,$name);

    //
    // Clean the quotes before executing the script.
    //
    $script = $this->CleanQuotes($script);
    $parms = $this->CleanQuotes($parms);

    //
    // Process the script appropriately.
    //
    $langs = $this->Get_Lang_info();
    if($langid < 97) {
      //
      // For all normal languages, use the function defined for it in
      // the database.
      //
      $callfun = $langs[$langid-1][3];
    } else {
      //
      // For special functions, use a particular function.  This mostly done
      // because these processes are out of order and the indexing would be 
      // messed up.
      //
      if($langid == 98) {
	      //
     	  // It is an action hook.  Process as HTML code with shortcode 
      	// expansion.
      	//
      	$callfun = 'processHTMLParam';
      }
      if($langid == 99) {
        //
      	// This is a filter.  Process as PHP code.
      	//
      	$callfun = 'processPHPParam';
      }
    }

    $results = call_user_func(array(&$ob_SM,$callfun), $script, $parms);

    //
    // Return the results.
    //
    return($results);
  }

   //
   // Function:       runPHPString
   //
   // Description:    This function runs a PHP script in a string and
   //                 returns the results.
   //
   // Input:          $scriptstring      The string containing the script.
   //
   public function runPHPString($scriptstring) {
     //
     // Set a default values.
     //
     $content = "";

     //
     // Save the current directory and goto the directory to run the script
     // in.
     //
     $currentdir = getcwd();
     chdir($this->get_option('script_dir'));

     //
     // Turn on output buffering to capture script output.
     //
     ob_start();
     
     //
     // Okay, let's wrap everything up in a try sequence.
     //
     try{
       //
       // Evaluate the PHP code. 
       //
       eval($scriptstring);
     } catch(Exception $e) {
       //
       // Put the error message into the contents to return.
       //
       $content = "<p class='ErrorMsg'>Recieved an error from the script:  " . $e->get_Message() . "</p>";
     }
  
     //
     // Assign the code evaluation output to $content variable and clean buffer.
     //
     $content .= ob_get_clean();

     //
     // Go back to the original directory.
     //
     chdir($currentdir);

     //
     // Return the $content
     //
     return $content;
   }

   //
   // Function:      processCSSParam
   //
   // Description:   This function is used to replace macro names in the
   //                html with actual values.
   //
   // Input:         param      A comma separated list of macros
   //                script     The html to process
   //
  public function processCSSParam($script,$parms) {
     //
     // Make sure the parms was not a doubly quoted empty string.
     //
      if(($parms == "''")||($parms == '')) {
         $parms = '';
      }

      //
      // Run the CSS the same as the HTML.  
      //
      $result = $this->processHTMLParam($script,$params);

      //
      // Now, put the results into a style.
      //
      $result = "<style type='text/css'>{$result}</style>";

      //
      // Return the results.
      //
      return($result);
   }

   //
   // Function:      processLessParam
   //
   // Description:   This function is used to replace macro names in the
   //                html with actual values.
   //
   // Input:         param      A comma separated list of macros
   //                script     The html to process
   //
  public function processLessParam($script,$parms) {
     //
     // Make sure the parms was not a doubly quoted empty string.
     //
      if(($parms == "''")||($parms == '')) {
         $parms = '';
      }

      //
      // Run the CSS the same as the HTML.  
      //
      $result = $this->processHTMLParam($script,$params);

      //
      // Now, put the results into a style.
      //
      $result = "<style type='text/less'>{$result}</style>";

      //
      // Return the results.
      //
      return($result);
   }

   //
   // Function:      processJavaScriptParam
   //
   // Description:   This function is used to replace macro names in the
   //                html with actual values.
   //
   // Input:         param      A comma separated list of macros
   //                script     The html to process
   //
  public function processJavaScriptParam($script,$parms) {
     //
     // Make sure the parms was not a doubly quoted empty string.
     //
      if(($parms == "''")||($parms == '')) {
         $parms = '';
      }

      //
      // Just embed the JavaScript with the parms tagged to the end of the
      // script as a function call.
      //
      $result = "<script type='text/javascript'>${script}${parms}</script>";
      return($result);
   }

   //
   // Function:      processHTMLParam
   //
   // Description:   This function is used to replace macro names in the
   //                html with actual values.
   //
   // Input:         param      A comma separated list of macros
   //                script     The html to process
   //
   public function processHTMLParam($script,$parms) {
     //
     // Make sure the parms was not a doubly quoted empty string.
     //
      if(($parms == "''")||($parms == '')) {
         $parms = '';
      }

      //
      // See if there is embedded shortcodes in the script or parameteres and process them.
      //
      $script = do_shortcode($script);
      $parms = do_shortcode($parms);

      //
      // The parms for an HTML script will be PHP variable assignments
      // that will be expanded inside the script.  Therefore, append the
      // parms to the beginning and close execution of PHP.
      //
      $result = $this->runPHPString($parms."; ?> ".$script);

      //
      // Return the results.
      //
      return($result);
   }

   //
   // Function:      processPHPParam
   //
   // Description:   This function is used to evaluate the PHP code by running
   //                the function in the param.
   //
   // Input:         param      A comma separated list of macros
   //                script     The html to process
   //
   public function processPHPParam($script,$param) {
     //
     // Check for a doubly quote null string.
     //
     if($param == "''") {
       $param = '';
     }

      //
      // See if there is embedded shortcodes in the parameteres and process them.
      //
      $parms = do_shortcode($parms);

     // Send the Script to runPHPString.  The parms is an optional function 
     // calling with special args.  In that case, the executing of that
     // function will produce the output.  Therefore, we can just add
     // the parms onto the end of the script.
     return($this->runPHPString($param.$script));
   }

  //
  // Function:       processSQLParam
  //
  // Description:    This function processes a sql script request.
  //
  // Input:         param      A comma separated list of macros
  //                script     The html to process
  //
  public function processSQLParam($script, $param) {
    //
    // Declare all global variables.
    //
    global $wpdb;

    //
    // Check for a doubly quote null string.
    //
    if($param == "''") {
      $param = '';
    }

    //
    // Define $results and set the default value.
    //
    $result = '';

    //
    // Query the database for a list of tables.
    //
    $rows = $wpdb->get_results($script);
    $headers = $wpdb->get_col_info();

    //
    // Build the string of databases.
    //
    $rowCount = 1;     // The first row is assumed.

    //
    // First, build the headers.
    //
    $result = '<div id="DBM_Data_table"><table><tr class="DBM_Table_header_row">';
    foreach  ($headers as $value) {
      $result .= '<th class="DBM_Table_header">' . $value . '</th>';
    }

    //
    // Second, build the table.
    //
    foreach ($rows as &$value) {
      //
      // This logic is for creating different colored rows in the database
      // table by the odd or even formating.
      //
      if($rowCount++ & 1) {
        //
        // If it is an odd number row, set the class as an odd row.
        //
        $result .= '</tr><tr class="DBM_Table_row_odd">';
      } else {
        //
        // It must be even, therefore, set the even row class.
        //
        $result .= '</tr><tr class="DBM_Table_row_even">';
      }

      //
      // Add each element in the row with the table data tag.
      //
      foreach ($value as $term) {
        $result .= '<td class="DBM_Table_data">' . $term . '</td>';
      }
    }

    //
    // Close out the table and the table div.
    //
    $result .= '</tr></table></div>';

    //
    // We have to destroy the reference to the variable in the foreach
    // loop.
    //
    unset($value);

    // 
    // Return the results from proecssing the script.
    //
    return($result);
  }


   //
   // Function:      Get_Language_id
   //
   // Description:   This function is used to obtain the number that represents
   //                the language.
   //
   // Inputs:        lang       string name of the language.
   //
  public function Get_Language_id($lang) {
     global $wpdb;

     //
     // Query the database for the lang id.
     //
     $results = $wpdb->get_var("select id from sm_lang where name like '{$lang}'",0,0);

     //
     // Return the results.
     //
     return($results);
   }

   //
   // Function:      Get_Script
   //
   // Description:   This function does the actual retrieving of the script
   //                from the database.
   //
  public function Get_Script($langID, $script) {
     //
     // Global Varaibles.
     //
     global $wpdb;

      //
      // Query the database for the script.
      //
      $scripts = $wpdb->get_results("select script from sm_scripts where lang_id={$langID} and name='{$script}'",'ARRAY_N',0);

      //
      // Return the result.
      //
      return($scripts[0][0]);
   }

   //
   // Function:      ajax_Run_Script
   //
   // Description:   This allows us to run a script and send the results back 
   //                to the browser.
   //
  public function ajax_Run_Script() {
     //
     // Declare global variables.
     //
     global $wpdb;
     
     //
     // get the submitted parameters
     //
     $name = $_POST['name'];
     $langID = $_POST['langID'];

     //
     // The parms was sent with slashes on the quotes.  Remove those
     // slashes before trying to use it.
     //
     $parms = stripslashes($_POST['param']);


     //
     // Evaluate the script and echo it back.
     //
     echo $this->Eval_Script($langID, $name, $parms);

     //
     // IMPORTANT: don't forget to "exit".  Ajax scripts have to be
     // exited.
     //
     exit;
   }
   
   //
   // Function:      CleanQuotes
   //
   // Description:   This function is used to change the quoting markers
   //                back to actual quotes.
   //
   // Input:         $script        The script to clean up.
   //
  public function CleanQuotes($script){
     //
     // Replace the double quote markers.
     //
     $result = str_replace("#dquote#",'"',$script);
  
     //
     // Replace the single quote markers.
     //
     $result = str_replace("#squote#","'",$result);

     //
     // Return the results.
     //
     return($result);
   }


   
   //
   // Function:      List_Langs
   //
   // Description:   This function is used to generate a list of languages.
   //
   // Input:         pretext    text to add before the language
   //                posttext   text to add after the language
   //
  public function List_Langs($pretext, $posttext) {
     //
     // Define the global variables used.
     //
     global $wpdb;

     //
     // Query the database for a list of tables.
     //
     $langs = $wpdb->get_results("SELECT id, name FROM `sm_lang`",'ARRAY_N',0);

     //
     // Generate the list of languages.
     //
     $result = '';
     foreach  ($langs as &$value) {
       $result .= "{$pretext} {$value[1]} {$posttext}";
     }
     
     //
     // Return the results.
     //
     return($result);
   }

   //
   // Function:         get_option
   //
   // Description:      This is used to obtain an option for the script manager
   //                   from the sm_options database.
   //
   // Inputs:           opt          option to retrieve
   //
  public function get_option($opt) {
     //
     // Define global variables used.
     //
     global $wpdb;

     //
     // Query the database for a list of tables.
     //
     $result = $wpdb->get_results("SELECT `value` FROM `sm_options` WHERE `option` like '{$opt}'",'ARRAY_N',0);

     //
     // Return the first entry of the first and only array.
     //
     return($result[0][0]);
   }
   //
   // Function:         set_option
   //
   // Description:      This is used to set options into the database.
   //
   // Inputs:           option          option to save
   //                   value           value to save for the option.
   //
  public function set_option($opt, $value) {
    //
    // Define global variables used.
    //
    global $wpdb;

    //
    // Store in the database.
    //
    $wpdb->update('sm_options', array( 'value' => $value), array('option' => $opt));
   }

   //
   // Function:        Get_Script_List
   //
   // Description:     This function is used to get a list of scripts for a
   //                  specified language id.
   //
   // Input:           $lang     ID of the language to get scripts.
   //
  public function Get_Script_List($lang) {
      //
      // Declare global variables.
      //
      global $wpdb;

      //
      // Query the database for a list of scripts.
      //
      $scripts = $wpdb->get_results("select name from sm_scripts where lang_id={$lang} order by name",'ARRAY_N',0);

      //
      // Return the results.
      //
      return($scripts);
   }

   //
   // Function:	        options_page
   //
   // Description:	This function creates the Script Manager Options screen
   // 			in the wordpress administrator pages.
   //
   public function options_page() {
      //
      // Declare global variables.
      //
      global $wpdb, $WP_cctSM_version;

    //
    // A plugin page is loaded. Therefore, load the styles.
    //
    $this->loadstyles = true;


      //
      // See if the user has permissions.  If not, die!
      //
      if (!current_user_can('activate_plugins'))  {
	wp_die( __('<div class="postbox-container"><p>In order to create or edit custom scripts, you have to have the \'create_scripts\' capability.  Sorry, but you don\'t.  Please see your administrator.</p></div>') );
      }

      //
      // Send the plugin's page.
      //
      $spinner = plugins_url( "images/spinner.gif", __FILE__ );
      echo <<<HEREDOC
<div class="wrap">
  <div id="Header_div">
    <div id="Header_text_div">
      <span class="name">Script Manager Options</span><br><span class="version">version 
HEREDOC;
      echo $WP_cctSM_version;
      echo <<<HEREDOC
      </span>
    </div>
  </div>
  <div id='Options'>
    <div id='optiontabs'>
      <ul>
        <li id='general' class='tabselected' onClick='cctSMprog.ChangeTabs("general");'>General</li>
        <li id='themes' onClick='cctSMprog.ChangeTabs("themes");'>Themes</li>
      </ul>
      <div id='loadingDiv'><img src='{$spinner}'></div>
    </div>
    <div id='optiontextbox'>
      <div id='generaltext' class='optiontbBase optiontbTop'>
HEREDOC;
      //
      // Put the General Options here.
      //
      $exedir = $this->get_option('script_dir');
      echo "<h2 style='text-align: center;'>General Options</h2>";
      echo "<table><tr><th><label for='exedir'>Execution Directory:  </label></th><td><input name='exedir' id='exedir' value='{$exedir}' class='regular-text'></input></td><td><span class='description' style='margin-left: 20px;'>This is the directory from which scripts will be executed.</span></td></tr></table>";

      //
      // Close the General Options div and open the Theme Options div.
      //       
      echo "</div><div id='themetext' class='optiontbBase optiontbBottom'>";

      //
      // Put the Theme Options here.
      //
?>
<h2 style='text-align: center;'>Highlighted Text Theming</h2>
<form>
<table style='text-align: left;'>
  <tr>
    <th style='width: 100px;'>
      <label for='themename'>Theme Name:  </label>
    </th>
    <td>
      <select id='themename'><option>Default</option></select>
  </tr>
</table>
<div style='width:  400px; float: left;'>
<table style='text-align: left;'>
  <tr>
    <th style='width: 100px;'><label for='commentcolor'>Comment Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('comment') ?>
    </td>
  </tr>

  <tr>
    <th><label for='keywordcolor'>Keyword Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('keyword') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='stringcolor'>String Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('string') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='builtincolor'>Builtin Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('builtin') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='specialcolor'>Special Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('special') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='numbercolor'>Number Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('number') ?>
    </td>
  </tr>

  <tr>
    <th>
     <label for='variablecolor'>Variable Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('variable') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='atomcolor'>Atom Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('atom') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='metacolor'>Meta Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('meta') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='defcolor'>Def Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('def') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='variable2color'>Variable 2 Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('variable-2') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='variable3color'>Variable 3 Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('variable-3') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='propertycolor'>Property Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('property') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='operatorcolor'>Operator Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('operator') ?>
    </td>
  </tr>
  <tr>
    <th>
      <label for='errorcolor'>Error Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('error') ?>
    </td>
  </tr>

</table>
</div>
<div style='width:  400px; float: right;'>
<table style='text-align: left;'>
  <tr>
    <th>
      <label for='qualifiercolor'>Qualifier Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('qualifier') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='bracketcolor'>Bracket Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('bracket') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='tagcolor'>Tag Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('tag') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='attributecolor'>Attribute Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('attribute') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='headercolor'>Header Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('header') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='quotecolor'>Quote Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('quote') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='hrcolor'>HR Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('hr') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='linkcolor'>Link Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('link') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='alcolorcolor'>Alcolor Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('alcolor') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='codeareaColorcolor'>Code Area Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('codeareaColor') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='numberscolorcolor'>Numbers Bar Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('numberscolor') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='bkgnumberscolor'>Background Numbers Bar Color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('bkgnumbers') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='tableheadercolor'>Table Header Row:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('tableheader') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='tablerowevencolor'>Table Even Row color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('tableroweven') ?>
    </td>
  </tr>

  <tr>
    <th>
      <label for='tablerowoddcolor'>Table Odd Row color:  </label>
    </th>
    <td>
      <?php $this->ColorPickerDiv('tablerowodd') ?>
    </td>
  </tr>

</table>
</div>
</form>
<?php
      //
      // Close the open divs and the save button.
      //
      echo "</div><div class='savebuttondiv'><input type='button' class='button-primary savebutton' onClick='cctSMprog.SaveOptions();' value='Save' text='Save'></div></div>";

      //
      // Apply the action hook.
      //
      do_action( 'cct_SM_options_page' );

      //
      // Close the document.
      //
      echo '</div></div>';
   }

  //
  // Function:        ColorPickerDiv
  //
  // Description:     Create the div and input for a color field.
  //
  // Input:           $name          name of the color in the database.
  //
  public function ColorPickerDiv($name){
    $value = $this->get_color_db($name);
    echo "<div class='colorpickerwrap'><input name='{$name}color'' id='{$name}color' value='{$value}' class='themecolor' onChange='cctSMprog.ColorChange(\"{$name}\")'></input><div id='{$name}colorpicker' class='colorpicker' onclick='cctSMprog.ColorPickerDialog(\"{$name}\");' style='background:  {$value};'></div></div>";    
  }

  //
  // Function:        ajax_Save_General
  //
  // Description:     
  //
  public function ajax_Save_General() {
    $dir = $_POST['dir'];

    //
    // Clear any extra escapes for the directory.
    //
    $dir = stripslashes($dir);
    
    //
    // Save the new directory location.
    //
    echo $this->set_option('script_dir',trim($dir));

    //
    // An ajax function has to be exited.
    //
    exit();
  }

  //
  // Function:        ajax_Save_Theme
  //
  // Description:     This ajax function is used to save values for the theme.
  //
  public function ajax_Save_Theme() {
    global $wpdb;

    //
    // Get the different variables.
    //
    $themename = $_POST['themename'];
    $comment    = $_POST['comment'];
    $keyword    = $_POST['keyword'];
    $string   = $_POST['string'];
    $builtin    = $_POST['builtin'];
    $special    = $_POST['special'];
    $variable    = $_POST['variable'];
    $number  = $_POST['number'];
    $atom  = $_POST['atom'];
    $meta    = $_POST['meta'];
    $def   = $_POST['def'];
    $variable2 = $_POST['variable2'];
    $variable3   = $_POST['variable3'];
    $property   = $_POST['property'];
    $operator    = $_POST['operator'];
    $error = $_POST['error'];
    $qualifier = $_POST['qualifier'];
    $bracket  = $_POST['bracket'];
    $tag = $_POST['tag'];
    $attribute    = $_POST['attribute'];
    $header    = $_POST['header'];
    $quote   = $_POST['quote'];
    $hr = $_POST['hr'];
    $link    = $_POST['link'];
    $alcolor    = $_POST['alcolor'];
    $codeareaColor = $_POST['codeareaColor'];
    $numberscolor = $_POST['numberscolor'];
    $bkgnumbers    = $_POST['bkgnumbers'];
    $tableheader   = $_POST['tableheader'];
    $tablerowodd   = $_POST['tablerowodd'];
    $tableroweven  = $_POST['tableroweven'];

    //
    // Save the Theme information.
    //
    echo "Theme name:  {$themename}, color: {$comment}";
    $wpdb->update('sm_highlight', array('value' => $comment), array('theme' => $themename, 'color' => 'comment'));
    $wpdb->update('sm_highlight', array('value' => $keyword), array('theme' => $themename, 'color' => 'keyword'));
    $wpdb->update('sm_highlight', array('value' => $string), array('theme' => $themename, 'color' => 'string'));
    $wpdb->update('sm_highlight', array('value' => $builtin), array('theme' => $themename, 'color' => 'builtin'));
    $wpdb->update('sm_highlight', array('value' => $special), array('theme' => $themename, 'color' => 'special'));
    $wpdb->update('sm_highlight', array('value' => $variable), array('theme' => $themename, 'color' => 'variable'));
    $wpdb->update('sm_highlight', array('value' => $atom), array('theme' => $themename, 'color' => 'atom'));
    $wpdb->update('sm_highlight', array('value' => $meta), array('theme' => $themename, 'color' => 'meta'));
    $wpdb->update('sm_highlight', array('value' => $def), array('theme' => $themename, 'color' => 'def'));
    $wpdb->update('sm_highlight', array('value' => $variable2), array('theme' => $themename, 'color' => 'variable-2'));
    $wpdb->update('sm_highlight', array('value' => $variable3), array('theme' => $themename, 'color' => 'variable-3'));
    $wpdb->update('sm_highlight', array('value' => $property), array('theme' => $themename, 'color' => 'property'));
    $wpdb->update('sm_highlight', array('value' => $operator), array('theme' => $themename, 'color' => 'operator'));
    $wpdb->update('sm_highlight', array('value' => $error), array('theme' => $themename, 'color' => 'error'));
    $wpdb->update('sm_highlight', array('value' => $qualifier), array('theme' => $themename, 'color' => 'qualifier'));
    $wpdb->update('sm_highlight', array('value' => $bracket), array('theme' => $themename, 'color' => 'bracket'));
    $wpdb->update('sm_highlight', array('value' => $tag), array('theme' => $themename, 'color' => 'tag'));
    $wpdb->update('sm_highlight', array('value' => $attribute), array('theme' => $themename, 'color' => 'attribute'));
    $wpdb->update('sm_highlight', array('value' => $header), array('theme' => $themename, 'color' => 'header'));
    $wpdb->update('sm_highlight', array('value' => $quote), array('theme' => $themename, 'color' => 'quote'));
    $wpdb->update('sm_highlight', array('value' => $hr), array('theme' => $themename, 'color' => 'hr'));
    $wpdb->update('sm_highlight', array('value' => $link), array('theme' => $themename, 'color' => 'link'));
    $wpdb->update('sm_highlight', array('value' => $alcolor), array('theme' => $themename, 'color' => 'alcolor'));
    $wpdb->update('sm_highlight', array('value' => $codeareaColor), array('theme' => $themename, 'color' => 'codeareaColor'));
    $wpdb->update('sm_highlight', array('value' => $numberscolor), array('theme' => $themename, 'color' => 'numberscolor'));
    $wpdb->update('sm_highlight', array('value' => $bkgnumbers), array('theme' => $themename, 'color' => 'bkgnumbers'));
    $wpdb->update('sm_highlight', array('value' => $number), array('theme' => $themename, 'color' => 'number'));
    $wpdb->update('sm_highlight', array('value' => $tableheader), array('theme' => $themename, 'color' => 'tableheader'));
    $wpdb->update('sm_highlight', array('value' => $tableroweven), array('theme' => $themename, 'color' => 'tableroweven'));
    $wpdb->update('sm_highlight', array('value' => $tablerowodd), array('theme' => $themename, 'color' => 'tablerowodd'));
    
    //
    // An ajax function has to be exited.
    //
    exit();
  }

  //
  //  These are the options help string variables.
  //
  public $help_option_intro_title = '';
  public $help_option_intro = '';
  public $help_option_general_title = '';
  public $help_option_general = '';
  public $help_option_theme_title = '';
  public $help_option_theme = '';
  public $help_option_sidebar = '';

  //
  // Function:           context_help_options
  //
  // Description:        This function is used to add the options help
  //                     screen.
  //
  // Inputs:             $text    Current help text for that page.
  //                     $screen  Name of the current screen.
  //
  public function context_help_options($text, $screen) {
    global $cctSM_options_hook;
     
    //
    // Make sure it is our screen.
    //
    if ($screen == $cctSM_options_hook) {
      //
      // Add our help to the other help contexts.
      //
      $text .= '<br/>';
      $text .= $this->context_help_options_content();
    }
     
    // pass through for other admin page's help
    return $text;
  }

  //
  // Function:       context_help_options_content
  //
  // Description:    This function is used to display the help screen
  //                 for the options page.
  //
  public function context_help_options_content() {
    //
    // Get the help options information.
    //
    include_once('help/option_help_en.php');

    $output = '
<div class="metabox-holder">
    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->help_option_intro_title .
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->help_option_intro . 
'
        </div>
    </div>

    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->help_option_general_title . 
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->help_option_general .
'
        </div>
    </div>
    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->help_option_theme_title . 
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->help_option_theme .
'
        </div>
    </div>
    <div class="postbox">
        <h3 style="cursor:default;">For more Help and Information</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->help_option_sidebar .
'
        </div>
    </div>
</div>

';
 
    return $output;
  }

  //
  // Function:         plugin_help33_options
  //
  // Description:      This will display the help screen for WordPress 3.3
  //                   and greater.  This is the options help screen.
  //
  // Input:            $screen         This is the current screen object
  //
  public function plugin_help33_options() {
    //
    // Get the current screen object.
    //
    $screen = get_current_screen();

    //
    // Get the help options information.
    //
    include_once('help/option_help_en.php');

    //
    // Add the help tabs.
    //
    $screen->add_help_tab( array(
      'id'      => 'sm-intro',
      'title'   => $this->help_option_intro_title,
      'content' => $this->help_option_intro
    ));

    $screen->add_help_tab( array(
      'id'      => 'sm-general',
      'title'   => $this->help_option_general_title,
      'content' => $this->help_option_general
    ));

    $screen->add_help_tab( array(
      'id'      => 'sm-themes',
      'title'   => $this->help_option_theme_title,
      'content' => $this->help_option_theme
    ));

    //
    // Set the contents for the sidebar in the help section.
    //
    $screen->set_help_sidebar( $this->help_option_sidebar );
  }

  //
  // Function:      toolbar
  //
  // Description:   This functions is used to add menus to the admin
  //                toolbar.  If the logged in user can create scripts
  //                then add a ScriptManager link.
  //
  public function toolbar( $wp_admin_bar ) {
    if(!is_object($wp_admin_bar)){
      return;
    }

    //
    // See if the current user has privilages to create scripts.
    //
    if ( ! current_user_can( 'create_scripts' ) )
    return;

    if(!is_admin()) {
      //
      // Since we are not showing an admin screen, add the menu item.
      //
      $wp_admin_bar->add_menu( array(
        'id' => 'scriptmanager',
        'parent' => 'site-name',
        'title' => 'Script Manager',
        'href' => admin_url( 'tools.php?page=WP_SM_plugin_page' )
      ) );
    }
  }
}

//
// End the PHP Code.
//
?>
