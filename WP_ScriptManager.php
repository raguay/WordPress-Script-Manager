<?php
//
// File:         WP_ScriptManager_class.php
//
// Author:       Richard Guay
//
/**
 * @package WP_ScriptManager
 * @version 1.0
 */
/*
Plugin Name: WP CCT Script Manager
Plugin URI: http://www.customct.com/shop/script-manager/
Description:  This plugin facilates the writing of re-usable HTML, PHP, JavaScript, CSS, and LESS code for including almost anywhere in the site.  It has a shortcode imbedding of code, and code running in a widget.  Since all scripts are kept in the database, you do not have to worry about changing plugins or themes deleting your files.  You can also call php scripts from JavaScript by the ajax calling functions already defined in this plugin.  This plugin also adds a way to connect to any of the actions or filters defined in WordPress.  You therefore can extend WordPress in anyway you want.  If you add other language modules, you can even work with functions in ruby, tcl, python, etc.
Author: Richard Guay
Version: 1.0
Author URI: http://customct.com/about/richardguay
*/

//
// Declare the global variables.
//
global $wpdb, $ob_SM;
global $cctSM_plugin_hook, $cctSM_options_hook;
global $WP_cctSM_version, $pagename, $cct_SM_AF;
$WP_cctSM_version = "1.0";

//
// I can not find a dependable way to get the admin page name.  So
// this is the cheating way to get it from the url since admin pages
// do not use renaming.
//
$pagename = $_GET['page'];

define( 'CUSTOMCT_ALT_API', 'http://localhost/WP_test/API/plugins/' );

//
// Register the activation and deactivation hooks.
//
register_activation_hook(__FILE__, 'WP_cctSM_activation');
register_deactivation_hook(__FILE__, 'WP_cctSM_deactivation');

//
// Function:     WP_cctSM_activaton
//
// Description:  This function is called upon plugin activation.  Therefore,
//               this function needs to create the needed databases, update
//               old databases, and any other first time installation or
//               updating that will be needed.
//

function WP_cctSM_activation() {
   include_once('activation.php');
}

//
// Function:	     WP_cctSM_deactivation
//
// Description:	     This is the Deactivation function.  This function will
//                   clean up stuff after deactivaton.
//
function WP_cctSM_deactivation() {
   //
   // Declare global variables.
   //
   global $wpdb;

   include_once('deactivation.php');
}

//
// Include needed files.  The WP_ScriptManager_class file is the most basic 
// needed file for defining the functions used in the application.  
//
include_once('WP_ScriptManager_class.php');
include_once('WP_ScriptManager_action_filters.php');

//
// If this is the admin pages, then load that information as well.  This
// keeps the base plugin stuff for just the user side from taking so 
// long to process unnessassary admin page stuff.  We also do the basic
// action functions assignment at this point.
//
if(is_admin()) {
  //
  // Load the administrator page code.
  //
  require('WP_ScriptManager_admin.php');

  //
  // Create the Script Manager object.
  //
  $ob_SM = new cctWP_SM_admin();
} else {
  //
  // Create the Script Manager object.
  //
  $ob_SM = new cctWP_SM();

}

//
// Now, we need to add action hooks that we use in the Script Manager for
// basic operations.  This is only action hooks enabling and not initialization
// or such type of operations.  These need to be set to properly run the
// plugin.
//

//
// Add action hooks for doing ajax if we are doing ajax calls right now.
//
if(DOING_AJAX) {
  //
  // Setup the ajax functions for the general user.  These ajax functions are
  // used on user pages and admin pages.
  //
  add_action('wp_ajax_ajax_Run_Script', array( &$ob_SM, 'ajax_Run_Script'));

  if(is_admin()) {
    //
    // Setup ajax functions for administration pages only.
    //
    add_action('wp_ajax_ajax_Create_Script_List', array( &$ob_SM,'ajax_Create_Script_List'));
    add_action('wp_ajax_ajax_Create_Script_List_for_selector', array( $ob_SM,'ajax_Create_Script_List_for_selector'));
    add_action('wp_ajax_ajax_Get_Script', array( &$ob_SM, 'ajax_Get_Script'));
    add_action('wp_ajax_ajax_Save_Script', array( &$ob_SM, 'ajax_Save_Script'));
    add_action('wp_ajax_ajax_New_Script', array( &$ob_SM, 'ajax_New_Script'));
    add_action('wp_ajax_ajax_Delete_Script', array( &$ob_SM, 'ajax_Delete_Script'));
    add_action('wp_ajax_ajax_Rename_Script', array( &$ob_SM, 'ajax_Rename_Script'));
    add_action('wp_ajax_ajax_Save_General', array( &$ob_SM, 'ajax_Save_General'));
    add_action('wp_ajax_ajax_Save_Theme', array( &$ob_SM, 'ajax_Save_Theme'));
  }
}

//
// Add the action handler for initializing the script manager.
//
add_action( 'plugins_loaded', 'Script_Manager_Init' );

//
// Add the toolbar menu.
//
add_action( 'admin_bar_menu', array(&$ob_SM,'toolbar'), 50 );

//
// Add the widgets init function to the widgets_init action.
//
add_action( 'widgets_init', 'cctWP_SM_Init_Widgets' ); 

//
// Load the action functions for admin screens.
//
if(is_admin()) {
  //
  // Insert the Script Manager windows to the Tools menu in the
  // Administrators screens.  This should always get loaded on admin
  // screens.
  //
  add_action('admin_menu', array(&$ob_SM,'plugin_menu'));
  
  //
  // link in to the wp_header for inserting code and ajax stuff.
  //
  add_action( 'admin_head', array(&$ob_SM,'insert_into_header'));

  //
  // link in to the wp_footer for inserting code.  Mostly, for getting the
  // less activated as soon as possible.
  //
  add_action( 'admin_footer', array(&$ob_SM,'insert_into_footer'));
} else {
  //
  // link in to the wp_header for inserting code and ajax stuff.
  //
  add_action( 'wp_head', array(&$ob_SM,'insert_into_header'));

  //
  // link in to the wp_footer for inserting code.  Mostly, for getting the
  // less activated as soon as possible.
  //
  add_action( 'wp_footer', array(&$ob_SM,'insert_into_footer'));
}


//
// Function:       Script_Manager_Init
//
// Description:    This function is used to initialize the Script Manager.
//                 It is ran after all plugins are loaded for allowing functions
//                 from other plugins available to the Script Manager before
//                 running.
//
function Script_Manager_Init() {
  global $pagename, $wpdb, $cct_SM_AF, $ob_SM;

  if(is_admin()) {
    //
    // Run the addbuttons for the visual editor.
    //
    smplugin_addbuttons();

    if (DOING_AJAX) {
      //
      // Run just the ajax stuff.
      //
      $ob_SM->init_ajax($pagename);
    }
  }
  //
  // Run the init for the user pages. This has basic stuff for everything.
  //  
  $ob_SM->init($pagename);

  //
  // Add all the other actions from the database.
  //
  $actions = $wpdb->get_results("select a.name, b.function, b.priority, b.args from sm_scripts as a, sm_actions as b where a.script != '' and a.lang_id = 98 and a.name = b.name",'ARRAY_N',0);

  //
  // For each action that has a program, setup the action for inserting the
  // code or html.
  //
  foreach ($actions as $name) {
    add_action( $name[0] , array($cct_SM_AF, $name[1]),$name[2],count(explode(',',$name[3])));
  }

  //
  // You have to unset the variable used in the foreach loop.
  //
  unset($name);

  //
  // Add all the filters from the database.
  //
  $filters = $wpdb->get_results("select a.name, b.priority, b.args, a.script from sm_scripts as a, sm_filters as b where a.script != '' and a.lang_id = 99 and a.name = b.name",'ARRAY_N',0);

  //
  // For each filter that has a program, setup the action for inserting the
  // code or html.
  //
  foreach ($filters as $name) {
    //
    // Remove the quotes from the script.
    //
    $content = $ob_SM->CleanQuotes($name[3]);
    $numarg = count(explode(',', $name[2]));

    //
    // Create the filter.
    //
    add_filter( $name[0] , create_function($name[2], $content), $name[1], $numarg);
  }

  //
  // You have to unset the variable used in the foreach loop.
  //
  unset($name);
}

//
// Class:        cctWP_SM_widget
//
// Description:  This class is used to create a widget for inserting scripts
//               into the Word Press widget system.
//
class cctWP_SM_widget extends WP_Widget {
  //
  // Function:      cctWP_SM_widget
  //
  // Description:   This is the initialization function for the widget.
  //
  function cctWP_SM_widget() { 
    //
    // Create an array of options for the widget.  Classname is the CSS class
    // for the widget for customizing looks.  Description is the discription 
    // for the widget that id displayed.
    //
    $widget_ops = array(
			'classname' => 'cctWP_SM_widget_class',
			'description' => 'This widget allows for the insertion of any type of code into a widget on your web site.'
			);

    //
    // Give this information to the WordPress engine.
    //
    $this->WP_Widget('cctWP_SM_widget','Insert Script', $widget_ops);
  } 

  //
  // Function:      form
  //
  // Description:   This function displays the widgets form in the
  //                administration dashboard.
  //
  // Inputs:        $instance       The instance of the widget to display
  //
  function form($instance) { 
    global $ob_SM;

    //
    // Create the defaults array.  It shows the default values of the
    // information stored in the widget.
    //
    $defaults = array( 
		      'title' => 'Embedded Script',
		      'ScriptLang' => 'HTML',
		      'scriptname' => '',
		      'params' => ''
		      );

    //
    // Take the current instance and merge with the defaults.
    //
    $instance = wp_parse_args( (array) $instance, $defaults);

    //
    // Get our varibles out in an easy to read form.
    //
    $title = $instance['title'];
    $ScriptLang = $instance['ScriptLang'];
    $scriptname = $instance['scriptname'];
    $params = $instance['params'];


    //
    // Get the list of languages and scripts for the current language.
    //
    $langs = $ob_SM->Get_Lang_info();
    $scripts = $ob_SM->Get_Script_List($ob_SM->Get_Language_id($ScriptLang));

    //
    // Get the list of scripts for the given language.
    //

    //
    // Next is the HTML script for the form that takes in the information.
    //
    ?>
         <p>Title: <input class="widefat" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" /></p>
         <p>Script Language: <?php
	    echo '<select class="widefat" id=' . $this->get_field_name('ScriptLang') . ' name=' . $this->get_field_name('ScriptLang') . ' onchange="cctSMprog.ScriptSelectorChange(this.id);">';

    //
    // Loop through each language, set the language needed as the selected
    // option, and finish out the selector.
    //
    foreach ($langs as $lang) {
      echo '<option ';
      if($lang[1] == $ScriptLang)
      	echo 'selected="selected">' . esc_attr($lang[1]) . '</option>';
      else
        echo '>' . $lang[1] . '</option>';
    }
    echo '</select>';
    unset($lang);

    ?>	 <p>Script Name: <?php
	  echo '<select class="widefat" name="' . $this->get_field_name('scriptname') . '">';

    //
    // Loop through each script, set the script
    // option, and finish out the selector.
    //
    foreach ($scripts as $script) {
      echo '<option ';
      if($script[0] == $scriptname)
        echo 'selected="selected">' . esc_attr($script[0]) . '</option>';
      else
        echo '>' . $script[0] . '</option>';
    }
    echo '</select>';
    unset($script);


    echo "<p>Parameters for the Script: <input class='widefat' name='";
    echo $this->get_field_name( 'params' ); 
    echo "'' type='text' value='";
    echo esc_attr( $params ); 
    echo "' /> </p>";
  }

  //
  // Function:      update
  // 
  // Description:   This function is used to update the widget.
  //
  function update($new_instance, $old_instance) { 
    //
    // Copy over the new instances information to the old
    // instance.
    //
    $instance = $old_instance;
    $instance['title'] = strip_tags( $new_instance['title'] );
    $instance['ScriptLang'] = strip_tags( $new_instance['ScriptLang'] );
    $instance['scriptname'] = strip_tags( $new_instance['scriptname'] );
    $instance['params'] = strip_tags( $new_instance['params'] );

    //
    // Return the updated instance.
    //
    return $instance;
  } 

  //
  // Function:      widget
  //
  // Description:   This displays the widget for the user to see.
  //
  // Inputs:        $args
  //                $instance
  //
  function widget($args, $instance) {
    //
    // define globals.
    //
    global $ob_SM;

    //
    // Extract the arguments passed to the function.
    //
    extract($args);

    //
    // Send the stuff for before the widget.
    //
    echo $before_widget;

    //
    // Get our variables for processing the widget.
    //
    $title = apply_filters( 'widget_title', empty($instance['title']) ? '' : $instance['title'], $instance);
    $ScriptLang = empty( $instance['ScriptLang'] ) ? 'PHP' : $instance['ScriptLang']; 
    $script = empty( $instance['scriptname'] ) ? '' : $instance['scriptname']; 
    $params = empty( $instance['params'] ) ? '' : $instance['params']; 

    //
    // Display the title.
    //
    if ( !empty( $title ) ) { 
      echo $before_title . $title . $after_title; 
    };

    //
    // Get the code to be executed from the database.
    //
    $langID =  $ob_SM->Get_Language_id(trim($ScriptLang));

    //
    // Run the specified script.
    //
    echo $ob_SM->Eval_Script($langID,$script,$params);

    //
    // Send the after the widget suff.
    //
    echo $after_widget;
  }
}

//
// Function:        cctWP_SM_Init_Widgets
//
// Description:     This function will register the our widget with
//                  WordPress.
//
function cctWP_SM_Init_Widgets() {
  //
  // Register the widget.
  //
  register_widget('cctWP_SM_widget');
}

//
// Tinymce editor button add in area.
//

//
// Function:            smplugin_addbuttons
//
// Description:         This function is called to add buttons to the 
//                      tinyMCE editor for inserting scripts into a page/post.
//
function smplugin_addbuttons() {
   // Don't bother doing this stuff if the current user lacks permissions
   if ( ! current_user_can('create_scripts') && ! current_user_can('edit_pages') )
     return;
 
   // Add only in Rich Editor mode
   if ( get_user_option('rich_editing') == 'true') {
     add_filter('mce_external_plugins', 'add_smplugin_tinymce_plugin');
     add_filter('mce_buttons', 'register_smplugin_button');
   }
}
 
//
// Function:            register_smplugin_button
//
// Description:         This function is called register the tinyMCE editor
//                      buttons.  It is called by the mce_buttons filter.
//
function register_smplugin_button($buttons) {
   array_push($buttons, 'smplugin');
   array_push($buttons, 'smhighlight');
   return $buttons;
}
 
//
// Function:            add_smplugin_tinymce_plugin
//
// Description:         This function is called register the tinyMCE editor
//                      buttons.  It is called by the mce_external_plugins 
//                      filter.
//
function add_smplugin_tinymce_plugin($plugin_array) {
  $plugin_array['smplugin'] = plugins_url( "WP_ScriptManager/smplugin/smplugin.js");
  return $plugin_array;
}

//
// The following is for checking for updates to the plugin.
//

//
// Hook into the plugin update check.
//
add_filter('pre_set_site_transient_update_plugins', 'customct_altapi_check');

//
// Function:             customct_altapi_check
//
// Description:          This function is used to check for updates to the script manager
//                       plugin using WordPress's plugin checking api.
//
// Input:
//                       $transient      The transient for the plugin.
//
function customct_altapi_check( $transient ) {

    // Check if the transient contains the 'checked' information
    // If no, just return its value without hacking it
    if( empty( $transient->checked ) )
        return $transient;
    
    // The transient contains the 'checked' information
    // Now append to it information form your own API
    
    $plugin_slug = plugin_basename( __FILE__ );
    
    // POST data to send to your API
    $args = array(
        'action' => 'update-check',
        'plugin_name' => $plugin_slug,
        'version' => $transient->checked[$plugin_slug],
    );
    
    // Send request checking for an update
    $response = customct_altapi_request( $args );
    
    // If response is false, don't alter the transient
    if( false !== $response ) {
        $transient->response[$plugin_slug] = $response;
    }
    
    return $transient;
}

//
// Function:          customct_altapi_request
//
// Deacription:       This function will send a request to the alternative API, 
//                    and return an object.
//
function customct_altapi_request( $args ) {

    // Send request
    $request = wp_remote_post( CUSTOMCT_ALT_API, array( 'body' => $args ) );
    
    // Make sure the request was successful
    if( is_wp_error( $request )
    or
    wp_remote_retrieve_response_code( $request ) != 200
    ) {
        // Request failed
        return false;
    }
    
    // Read server response, which should be an object
    $response = unserialize( wp_remote_retrieve_body( $request ) );
    if( is_object( $response ) ) {
        return $response;
    } else {
        // Unexpected response
        return false;
    }
}


// Hook into the plugin details screen
add_filter('plugins_api', 'customct_altapi_information', 10, 3);

function customct_altapi_information( $false, $action, $args ) {

    $plugin_slug = plugin_basename( __FILE__ );

    // Check if this plugins API is about this plugin
    if( $args->slug != $plugin_slug ) {
        return false;
    }
        
    // POST data to send to your API
    $args = array(
        'action' => 'plugin_information',
        'plugin_name' => $plugin_slug,
        'version' => $transient->checked[$plugin_slug],
    );
    
    // Send request for detailed information
    $response = customct_altapi_request( $args );
    
    // Send request checking for information
    $request = wp_remote_post( CUSTOMCT_ALT_API, array( 'body' => $args ) );

    return $response;
}


//
// End of the PHP
//
?>