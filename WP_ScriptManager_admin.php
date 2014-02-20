<?php
//
// File:        WP_ScriptManagner_admin
//
// Author:      Richard Guay
//
// Description: This file has the functions needed for the administrator side
//              of the plugin.
//

//
// Define Global variables.
//
global $cctSM_plugin_hook, $cctSM_options_hook, $cct_SM_AF;
global $wp, $ob_SM;

class cctWP_SM_admin extends cctWP_SM {
   //
   // Function:	        init
   //
   // Description:	This function is used to initialize the Script
   // 			Manager.
   //
   public function init($pagename) {
     //
     // Run the init for the base class.
     //
     parent::init($pagename);

     if($pagename == 'WP_SM_plugin_page') {
       //
       // Load the files that are only for the main Script Manager page.
       //

       //
       // CodeMirror files.
       //
       wp_enqueue_script( 'WP_ScriptManager_scriptEditor', plugins_url( "js/codemirror/codemirror-c.js", __FILE__ ), array( 'jquery' ));

       //
       // The main javascript for the scriptmanager.
       //
       wp_enqueue_script( 'WP_ScriptManager_admin_script', plugins_url( "js/WP_ScriptManager_admin.js", __FILE__ ), array( 'jquery', 'json2', 'WP_ScriptManager_scriptEditor' ));

     } elseif($pagename == 'WP_SM_plugin_options') {
       //
       // Load the Admin Options page stuff.
       //

       //
       //The main javascript for the scriptmanager options page.
       //
       wp_enqueue_script( 'WP_ScriptManager_admin_script', plugins_url( "js/WP_ScriptManager_admin_options.js", __FILE__ ), array( 'jquery', 'farbtastic' ));
       wp_enqueue_style( 'farbtastic' );

     }

   }

   //
   // Function:         init_ajax
   //
   // Description:      This function is used to just setup the ajax function.
   //
   public function init_ajax($pagename) {
     //
     // Run the ajax_init for the base class.
     //
     parent::init_ajax($pagename);

     //
     // Run the parent's init to get shortcodes working on admin pages and in
     // ajax functions.
     //
     parent::init($pagename);
   }

   //
   // Function:         plugin_menu
   //
   // Description:      This function is called to add the menu options in the
   //                   administration screen.
   //
   public function plugin_menu() {
     //
     // Declare global variables.
     //
     global $cctSM_plugin_hook, $cctSM_options_hook, $ob_SM;

     //
     // Add the submenu and catch the name of the screen.
     //
     $cctSM_plugin_hook = add_submenu_page('tools.php', 'Script Manager', 'Script Manager', 'activate_plugins', 'WP_SM_plugin_page', array(&$ob_SM,'plugin_page'));

     $cctSM_options_hook = add_options_page('Script Manager Options', 'Script Manager Options', 'activate_plugins', 'WP_SM_plugin_options', array(&$ob_SM,'options_page'));

     if(substr(get_bloginfo('version'),0,3) <= 3.2) {
       //
       // Add help content.
       //
       add_action('contextual_help', array( $ob_SM,'context_help'), 10, 2);

       //
       // Add help content for the options page.
       //
       add_action('contextual_help', array( $ob_SM,'context_help_options'), 10, 2);
     } else {
       //
       // Add the context help for version 3.3+
       //
       add_action("load-{$cctSM_plugin_hook}", array(&$ob_SM,'plugin_help33'));
       add_action("load-{$cctSM_options_hook}", array(&$ob_SM,'plugin_help33_options'));
     }
   }

   //
   // Function:	        plugin_page
   //
   // Description:	This function creates the Script Manager screen in
   // 			the wordpress administrator pages.
   //
   public function plugin_page() {
    //
    // A plugin page is loaded. Therefore, load the styles.
    //
    $this->loadstyles = true;

      //
      // Declare global variables.
      //
      global $WP_cctSM_version;

      //
      // See if the user has permissions.  If not, die!
      //
      if ( ! current_user_can( 'create_scripts' ) ) {
        echo '<div class="postbox-container"><p>In order to create or edit custom scripts, you have to have the \'create_scripts\' capability.  Sorry, but you don\'t.  Please see your administrator.</p></div>';
        return;
      }

      //
      // Send the plugin's page.
      //
      $spinner = plugins_url( "images/spinner.gif", __FILE__ );
      echo <<<HEREDOC
<div class="wrap">
   <div id="Header_div">
      <div id="Header_text_div">
      <span class="name">Script Manager</span><br><span class="version">version
HEREDOC;
      echo $WP_cctSM_version;
      echo <<<HEREDOC
      </span></div></div>
   <div id="SM_Container">
HEREDOC;
      echo $this->Create_Lang_List();
      echo <<<HEREDOC
      <div id="SM_Container_div">
         <div id="SM_Script_Function_div">
            <button id="ScriptNewBut" class="SM_Script_button" onClick="cctSMprog.New_Script()">New</button>
            <button id="ScriptDeleteBut" class="SM_Script_button" onClick="cctSMprog.Delete_Script()">Delete</button>
            <button id="ScriptRenameBut" class="SM_Script_button" onClick="cctSMprog.Rename_Script()">Rename</button>
            <button id="ScriptTestBut" class="SM_Script_button" onClick="cctSMprog.Test_Script()">Test</button>
            <div id='loadingDiv'><img src='{$spinner}'></div>
         </div>
	<div id="ScriptList">
HEREDOC;
      //
      // Creat the list of scripts.  Default to HTML scripts.
      //
      echo $this->Create_Script_List(1);
      echo '</div></div>';

      //
      // Insert the Editor.
      //
      echo '<div style="width: 980px; height: 500px; max-height: 500px; padding-top: 5px;">';
      $this->InsertEditor();
      echo '</div></div>';

      //
      // Allow adding new stuff by others.  This is a special action hook for
      // anyone to add new features to the program.
      //
      do_action( 'cct_SM_plugin_page' );

      //
      // Close the document.
      //
      echo '</div>';
   }

   //
   // Function:	        InsertEditor
   //
   // Description:	This function defines the editor area.
   //
  public function InsertEditor() {
     echo '<div id="EditorDiv"><div id="EditorBar"><div id="EditorBarButtons">';
     //
     // Put in all the logic for the editor's button bar.
     //
     $this->CreateEditorBarButton("save","disk.png","cctSMprog.editor_save()","Save Script");
     $this->CreateEditorBarButton("fullscr","monitor.png","cctSMeditor.fullscreen()","Full Screen");
     $this->CreateEditorBarButton("undo","arrow_undo.png","cctSMeditor.undo()","Undo");
     $this->CreateEditorBarButton("redo","arrow_redo.png","cctSMeditor.redo()","Redo");
     $this->CreateEditorBarButton("goto","page_go.png","cctSMeditor.goto()","Goto");
     $this->CreateEditorBarButton("findreplace","find.png","cctSMeditor.findReplace()","Find/Replace");
     $this->CreateEditorBarButton("CodeInsert","script_add.png","cctSMeditor.insertCode()","Insert Code");
     $this->CreateEditorBarButton("Codehighlight","highlight.png","cctSMeditor.editor_highlightCode()","Highlight Code");

     //
     // Finish out the editor area.
     //
     echo '</div></div><textarea id="scripteditor" name="content" cols="160" rows="30"></textarea></div>';
   }

   //
   // Function:	        CreateEditorBarButton
   //
   // Description:	This function adds a button to the button bar of the
   //                   script editor.
   //
  public function CreateEditorBarButton($id, $image, $function, $caption) {
     $loc =  plugins_url( "images/silk/{$image}", __FILE__ );
     echo '<div id="'.$id.'" style="display: inline;" ><a title="'.$caption.'" onClick="'.$function.'"><img src="'.$loc.'"></a></div>';
   }

  //
  // Function:	        Create_Lang_List
  //
  // Description:	This function is used to create the list
  //                   of languages supported by the manager.
  //
  public function Create_Lang_List() {
    //
    // Declare global variables.
    //
    global $wpdb;

    //
    // Query the database for a list of tables.
    //
    $langs = $wpdb->get_results("SELECT id, name, lr FROM `sm_lang`",'ARRAY_N',0);

    //
    // Build the string of scripting languages.  langs contains a list of ids and
    // names for the scripting languages.
    //
    $count = 0;
    $build = "<ul>";
    $langSelected = '';
    foreach  ($langs as &$value) {
      if ($count++ < 1) {
        $build .= '<li class="tabselected left-side" onClick="cctSMprog.list_scripts(';
        $langNumSelected = $value[0];
        $langSelected = $value[1];
      } else {
        if($value[2] == 0) {
          $build .= '<li class="tabunselected left-side" onClick="cctSMprog.list_scripts(';
        } else {
          $build .= '<li class="tabunselected right-side" onClick="cctSMprog.list_scripts(';
        }
      }
      $build .= "{$value[0]}, '{$value[1]}')\" id=\"{$value[1]}\">{$value[1]}</li>";
    }

    //
    // Set the sessionStorage to contain the first selected value.  This
    // will be used to set the global variables by first call to change
    // the tag.
    //
    $build .= "</ul><script type=\"text/javascript\"> sessionStorage.currentLang = \"{$langSelected}\"; sessionStorage.currentLangNum = {$langNumSelected}; sessionStorage.currentScript = \"\"; </script>";

    //
    // We have to destroy the reference to the variable in the foreach
    // loop.
    //
    unset($value);

    //
    // Return the results.
    //
    return $build;
  }

   //
   // Function:        ajax_Create_Script_List
   //
   // Description:     This function is used to get a list of scripts to
   //                  return in an ajax function.  This is formated for
   //                  displaying scripts to be edited.
   //
   // Input:           $lang     ID of the language to get scripts.
   //
  public function ajax_Create_Script_List() {
      //
      // get the submitted parameters
      //
      $langID = $_POST['langID'];

      //
      // Generate the new list of tables.
      //
      $languages = $this->Create_Script_List($langID);
      echo $languages;

      // IMPORTANT: don't forget to "exit"
      exit;
   }

   //
   // Function:        ajax_Create_Script_List_for_selector
   //
   // Description:     This function is used to get a list of scripts to
   //                  return in an ajax function.  This list is formated
   //                  for use in a selector.
   //
   // Input:           $lang     ID of the language to get scripts.
   //
  public function ajax_Create_Script_List_for_selector() {
      //
      // get the submitted parameters
      //
      $langID = $_POST['langID'];

      //
      // Generate the new list of tables.
      //
      $languages = $this->Create_Script_List_for_selector($langID);
      echo $languages;

      // IMPORTANT: don't forget to "exit"
      exit;
   }

   //
   // Function:        Create_Script_List
   //
   // Description:     This function is used to get a list of scripts to
   //                  return in an ajax function.
   //
   // Input:           $lang     ID of the language to get scripts.
   //
  public function Create_Script_List($lang) {
    //
    // Query the database for a list of scripts.
    //

    $scripts = $this->Get_Script_List($lang);

    //
    // Build the string of databases.
    //
    $build = '<div id=innerScriptList>';
    $scriptimg = plugins_url("images/script.png",__FILE__);
    foreach  ($scripts as &$value) {
      $scriptName = $value[0];

	 //
	 // Change spaces in the script name to underscores for usability
	 // in the javascript.  IDs really can not have spaces.
	 //
	 $scriptName2 = str_replace(" ","_",trim($scriptName));

	 //
	 // Now, build the needed string for the script.
	 //
         $build .= "<div class=\"Script_Image_div_class\" onClick=\"cctSMprog.set_script('{$scriptName}')\" id=\"{$scriptName2}\"><div class=\"script normal\"><img class=\"Script_Image_class\" src=\"{$scriptimg}\"/><br>{$scriptName}</div></div>";
      }

      //
      // We have to destroy the reference to the variable in the foreach
      // loop.
      //
      unset($value);

      //
      // Close the last table row.
      //
      $build .= '</div>';

      //
      // Return the results.
      //
      return $build;
   }

   //
   // Function:        Create_Script_List_for_selector
   //
   // Description:     This function is used to get a list of scripts to
   //                  return in an ajax function.
   //
   // Input:           $lang     ID of the language to get scripts.
   //
  public function Create_Script_List_for_selector($lang) {
      //
      // Query the database for a list of scripts.
      //
      $scripts = $this->Get_Script_List($lang);

      //
      // Build the string of databases.
      //
      $build = '';
      foreach  ($scripts as &$value) {
	 $scriptName = $value[0];

	 //
	 // Now, build the needed string for the script.
	 //
         $build .= "<option>{$scriptName}</option>";
      }

      //
      // We have to destroy the reference to the variable in the foreach
      // loop.
      //
      unset($value);

      //
      // Return the results.
      //
      return $build;
   }

   //
   // Function:      ajax_Get_Script
   //
   // Description:   This function is used to get the script from the database
   //                for returning to the ajax call.
   //
  public function ajax_Get_Script() {
      //
      // get the submitted parameters
      //
      $script = $_POST['name'];
      $langID = $_POST['langID'];

      //
      // Get the actual script from the database.
      //
      $content = $this->Get_Script($langID, $script);

      //
      // Return the script.
      //
      echo $content;

      // IMPORTANT: don't forget to "exit"
      exit;
   }

   //
   // Function:      ajax_Save_Script
   //
   // Description:   This function is used to save the script to the database.
   //
  public function ajax_Save_Script() {
     //
     // Declare global variables.
     //
     global $wpdb;

      //
      // get the submitted parameters
      //
      $name = $_POST['name'];
      $langID = $_POST['langID'];
      $script = $_POST['script'];

      $result = $wpdb->query($wpdb->prepare("UPDATE sm_scripts SET script=%s WHERE lang_id=%d and name=%s",$script, $langID, $name));
      echo $result;

      // IMPORTANT: don't forget to "exit"
      exit;
   }

  //
  // Function:      ajax_New_Script
  //
  // Description:   This will create a new script entry in the database with the name
  //                given.
  //
  public function ajax_New_Script() {
    //
    // Declare global variables.
    //
    global $wpdb;

    //
    // get the submitted parameters
    //
    $name = $_POST['name'];
    $langID = $_POST['langID'];

    $result = $wpdb->query($wpdb->prepare("INSERT INTO sm_scripts (lang_id, name, script) VALUES (%d, %s,'')",$langID, $name));

    //
    // See if it was an action or a filter.
    //
    if($langID == 98) {
      //
      // It is an Action.  Create the entry in the actions database.
      //
      $args = trim($_POST['args']);

      //
      // Determine the number of args.
      //
      if($args == '') {
        //
        // Empty string will always be 0, even if explode says 1.
        //
        $numargs = 0;
      } else {
        //
        // It is non-zero, count the number of args.
        //
        $numargs = count(explode(',',$args));
      }
      $func = '';
      switch($numargs) {
        case 0:
          $func = 'ActionNoArgs';
	        break;
	      case 1:
	        $func = 'ActionOneArg';
	        break;
	      case 2:
	        $func = 'ActionTwoArgs';
	        break;
        default:
	        $func = 'ActionNoArgs';
      }
      if((is_null($args))||($args == '')) {
        $func = 'ActionNoArgs';
      }
	    $result = $wpdb->query($wpdb->prepare("INSERT INTO sm_actions (name, function, priority, args, numargs) VALUES (%s, %s, %d, %s, %d)", $name, $func,$_POST['priority'], $args, $numargs));
    } else if($langID == 99) {
	    //
	    // It is a Filter.  Create the entry in the filters database.
	    //
	    $result = $wpdb->query($wpdb->prepare("INSERT INTO sm_filters (name, args, priority) VALUES (%s, %s, %d)", $name, trim($_POST['args']), $_POST['priority']));
    }

    echo $result;

    //
    // IMPORTANT: don't forget to "exit"
    //
    exit;
  }

  //
  // Function:      ajax_Delete_Script
  //
  // Description:   This will delete the selected script from the database.
  //
  public function ajax_Delete_Script() {
     //
     // Declare global variables.
     //
     global $wpdb;

      //
      // get the submitted parameters
      //
      $name = $_POST['name'];
      $langID = $_POST['langID'];
      $result = $wpdb->query($wpdb->prepare("DELETE FROM sm_scripts where lang_id=%d AND name='%s'",$langID, $name));

      if($langID == 98) {
        //
        // Okay, it is an action.  Remove the actions database entry as well.
        //
        $result = $wpdb->query($wpdb->prepare("DELETE FROM sm_actions where name='%s'",$name));
      }

      if($langID == 99) {
        //
        // Okay, it is a filter.  Remove the filter database entry as well.
        //
        $result = $wpdb->query($wpdb->prepare("DELETE FROM sm_filters where name='%s'",$name));
      }

      echo $result;

      // IMPORTANT: don't forget to "exit"
      exit;
   }

   //
   // Function:      ajax_Rename_Script
   //
   // Description:   This will rename the selected script in the database.
   //
  public function ajax_Rename_Script() {
     //
     // Declare global variables.
     //
     global $wpdb;

     //
     // get the submitted parameters
     //
     $oldname = $_POST['oldname'];
     $name = $_POST['name'];
     $langID = $_POST['langID'];

     $result = $wpdb->query($wpdb->prepare("UPDATE sm_scripts SET name='%s' WHERE lang_id=%d AND name='%s'",$name, $langID, $oldname));
     echo $result;

     // IMPORTANT: don't forget to "exit"
     exit;
   }

   //
   // Function:      ajax_Langs
   //
   // Description:   This will create a list of languages supported.  The user
   //                supplies a pre and post text to surround each language.  This
   //                makes it very easy to create lists.
   //
  public function ajax_Langs() {
     //
     // Declare global variables.
     //
     global $wpdb;

     //
     // get the submitted parameters
     //
     $pretext = $_POST['pretext'];
     $posttext = $_POST['posttext'];

     echo $this->List_Langs($pretext, $posttext);

     //
     // IMPORTANT: don't forget to "exit"
     //
     exit;
   }

  //
  // Class Variables for the plugin help system.
  //
  public $plugin_intro_title = '';
  public $plugin_intro = '';
  public $plugin_basics_title = '';
  public $plugin_basics = '';
  public $plugin_scripts_title = '';
  public $plugin_scripts = '';
  public $plugin_shortcodes_title = '';
  public $plugin_shortcodes = '';
  public $plugin_actions_title = '';
  public $plugin_actions = '';
  public $plugin_filters_title = '';
  public $plugin_filters ='';
  public $plugin_software_title = '';
  public $plugin_software = '';
  public $plugin_EULA_title = '';
  public $plugin_EULA = '';
  public $plugin_sidebar = '';

  //
  // Function:         33plugin_help
  //
  // Description:      This will display the help screen for WordPress 3.3
  //                   and greater.
  //
  // Input:            $screen         This is the current screen object
  //
  public function plugin_help33() {
    //
    // Get the current screen context.
    //
    $screen = get_current_screen();

    //
    // Get the help options information.
    //
    include_once('help/plugin_help_en.php');


    $screen->add_help_tab( array(
      'id'      => 'sm-intro',
      'title'   => $this->plugin_intro_title,
      'content' => $this->plugin_intro
    ));

    $screen->add_help_tab( array(
      'id'      => 'sm-basics',
      'title'   => $this->plugin_basics_title,
      'content' => $this->plugin_basics
    ));

    $screen->add_help_tab( array(
      'id'      => 'sm-scripts',
      'title'   => $this->plugin_scripts_title,
      'content' => $this->plugin_scripts
    ));

    $screen->add_help_tab( array(
      'id'      => 'sm-shortcodes',
      'title'   => $this->plugin_shortcodes_title,
      'content' => $this->plugin_shortcodes
    ));

    $screen->add_help_tab( array(
      'id'      => 'sm-actions',
      'title'   => $this->plugin_actions_title,
      'content' => $this->plugin_actions
    ));

    $screen->add_help_tab( array(
      'id'      => 'sm-filters',
      'title'   => $this->plugin_filters_title,
      'content' => $this->plugin_filters
    ));

    $screen->add_help_tab( array(
      'id'      => 'sm-software',
      'title'   => $this->plugin_software_title,
      'content' => $this->plugin_software
      ));

    $screen->add_help_tab( array(
      'id'      => 'sm-EULA',
      'title'   => $this->plugin_EULA_title,
      'content' => $this->plugin_EULA
      ));

    //
    // Set the contents for the sidebar in the help section.
    //
    $screen->set_help_sidebar( $this->plugin_sidebar );

  }

   //
   // Function:         context_help
   //
   // Description:      This will display the help screen for WordPress 3.2 or
   //                   lower.
   //
   // Inputs:           $text        screen help already given for other things
   //                   $screen      current screen name
   //
  public function context_help($text, $screen) {
     global $cctSM_plugin_hook;

     //
     // Make sure it is our screen.
     //
     if ($screen == $cctSM_plugin_hook) {
       //
       // Add our help to the other help contexts.
       //
       $text .= '<br/>';
       $text .= $this->context_help_content();
     }

     // pass through for other admin page's help
     return $text;
   }


  //
  // Function:         context_help_content
  //
  // Description:      This will display the help screen for WordPress 3.2 or
  //                   lower.  This does the actual content of the screen.
  //
  public function context_help_content() {
    //
    // Get the help options information.
    //
    include_once('help/plugin_help_en.php');

    $output = '
<div class="metabox-holder">
    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->plugin_intro_title .
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->plugin_intro .
'
        </div>
    </div>

    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->plugin_basics_title .
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->plugin_basics .
'
        </div>
    </div>
    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->plugin_scripts_title .
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->plugin_scripts .
'
        </div>
    </div>
    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->plugin_shortcodes_title .
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->plugin_shortcodes .
'
        </div>
    </div>
    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->plugin_actions_title .
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->plugin_actions .
'
        </div>
    </div>
    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->plugin_filters_title .
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->plugin_filters .
'
        </div>
    </div>
    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->plugin_software_title .
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->plugin_software .
'
        </div>
    </div>
    <div class="postbox">
        <h3 style="cursor:default;">
'
. $this->plugin_EULA_title .
'
</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->plugin_EULA .
'
        </div>
    </div>    <div class="postbox">
        <h3 style="cursor:default;">For more Help and Information</h3>
        <div class="inside" style="padding:0px 6px 0px 6px;">
'
. $this->plugin_sidebar .
'
        </div>
    </div>
</div>

';

    return $output;
  }
}
//
// End of the PHP
//
?>
