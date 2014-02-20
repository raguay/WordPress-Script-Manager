<?php
//
// File:              activation.php
//
// Description:      This file is included into the activation function for the Word Press
//                   Script Manager.  It will setup the databases and fill in the default
//                   values.  It also creates a new user role 'create_script' which is needed
//                   in order to use the plugin screens.
//
// Copyrighted by Custom Computer Tools and Richard Guay
// Build February 27, 2012
//
global $wpdb;
global $WP_cctSM_version;

//
// See if the table exists.
//
if($wpdb->get_var("show tables like 'sm_lang'") != 'sm_lang') {
   //
   // It's not there!  Create the table.
   //
   $result = $wpdb->query("CREATE TABLE `sm_lang` (
                           `id` INT UNSIGNED NOT NULL PRIMARY KEY ,
                           `name` VARCHAR( 50 ) NOT NULL ,
                           `location` VARCHAR( 100 ),
                           `callfunction` VARCHAR( 50 ),
                           `ref` VARCHAR( 50 ),
                           `lr` INT UNSIGNED DEFAULT 0
   );");

   //
   // If the first table is not there, neither is this one.  Therefore, 
   // create the table.
   //
   $result = $wpdb->query("CREATE TABLE `sm_scripts` (
                           `lang_id` INT NOT NULL ,
                           `parent` int(11) NOT NULL DEFAULT '0',
                           `flag` int(11) NOT NULL DEFAULT '0',
                           `name` VARCHAR( 50 ) NOT NULL ,
                           `script` TEXT NOT NULL ,
                           PRIMARY KEY (  `lang_id`, `name` )
   );");

   //
   // Create the options database.
   //
   $result = $wpdb->query("CREATE TABLE IF NOT EXISTS `sm_options` (
                           `option` varchar(50) NOT NULL,
                           `value` varchar(100) DEFAULT NULL,
                           KEY `option` (`option`)
   );");

   //
   // Create the filters table.
   //
   $result = $wpdb->query("CREATE TABLE IF NOT EXISTS `sm_filters` (
                           `name` varchar(50) NOT NULL,
                           `args` varchar(200) NOT NULL,
                           `priority` int(11) NOT NULL);");

   //
   // Create the actions table.
   //
   $result = $wpdb->query("CREATE TABLE IF NOT EXISTS `sm_actions` (
                           `name` varchar(50) NOT NULL,
                           `function` varchar(50) NOT NULL,
                           `priority` int(11) NOT NULL,
                           `args` varchar(200) NOT NULL,
                           `numargs` int(11) NOT NULL);");

   //
   // Create the highlight database.
   //
   $result = $wpdb->query("CREATE TABLE IF NOT EXISTS `sm_highlight`(
                           `theme` varchar(25) NOT NULL,
                           `color` varchar(25) NOT NULL,
                           `value` varchar(25) NOT NULL);");

   //
   // Insert the default information for the different languages.
   //
   $wpdb->insert('sm_lang', array( 'id' => 1, 'name' => 'HTML', 'callfunction' => 'processHTMLParam', 'ref' => 'application/x-httpd-php', 'lr' => 0));
   $wpdb->insert('sm_lang', array( 'id' => 2, 'name' => 'WPPHP', 'callfunction' => 'processPHPParam', 'ref' => 'text/x-php', 'lr' => 0));
   $wpdb->insert('sm_lang', array( 'id' => 3, 'name' => 'JavaScript', 'callfunction' => 'processJavaScriptParam', 'ref' => 'text/javascript', 'lr' => 0));
   $wpdb->insert('sm_lang', array( 'id' => 4, 'name' => 'CSS', 'callfunction' => 'processCSSParam', 'ref' => 'text/css', 'lr' => 0));
   $wpdb->insert('sm_lang', array( 'id' => 5, 'name' => 'Less', 'callfunction' => 'processLessParam', 'ref' => 'text/less', 'lr' => 0));
   $wpdb->insert('sm_lang', array( 'id' => 6, 'name' => 'SQL', 'callfunction' => 'processSQLParam', 'ref' => 'text/x-mysql', 'lr' => 0));
   $wpdb->insert('sm_lang', array( 'id' => 99, 'name' => 'Filters', 'callfunction' => 'processPHPParam', 'ref' => 'text/x-php', 'lr' => 1));
   $wpdb->insert('sm_lang', array( 'id' => 98, 'name' => 'Actions', 'callfunction' => 'processHTMLParam', 'ref' => 'application/x-httpd-php', 'lr' => 1));

   //
   // Set the default colors for the highlighting of code.
   //
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'comment', 'value' => '#a86'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'keyword', 'value' => '#0000ff'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'string', 'value' => '#a22'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'builtin', 'value' => '#077'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'special', 'value' => '#0aa'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'variable', 'value' => '#000000'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'number', 'value' => '#3a3'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'atom', 'value' => '#3a3'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'meta', 'value' => '#555'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'def', 'value' => '#00f'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'variable-2', 'value' => '#05a'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'variable-3', 'value' => '#0a5'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'property', 'value' => '#000000'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'operator', 'value' => '#000000'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'error', 'value' => '#f00'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'qualifier', 'value' => '#555'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'bracket', 'value' => '#cc7'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'tag', 'value' => '#170'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'attribute', 'value' => '#00c'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'header', 'value' => '#a0a'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'quote', 'value' => '#090'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'hr', 'value' => '#999'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'link', 'value' => '#00c'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'alcolor', 'value' => '#f0fcff'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'codeareaColor', 'value' => '#ffffff'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'numberscolor', 'value' => '#000000'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'bkgnumbers', 'value' => 'add8e6'));
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'basecolor', 'value' => '#B0C8D8')); 
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'tableheader', 'value' => '#B0C8D8')); 
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'tableroweven', 'value' => '#B0C8D8')); 
   $wpdb->insert('sm_highlight', array( 'theme' => 'default', 'color' => 'tablerowodd', 'value' => '#B0C8D8')); 

   //
   // Set the default directory for running the scripts.  Guess at one level
   // above the admin directory that the current working path should be.
   //
   $script_dir = dirname(getcwd());
   $wpdb->insert('sm_options', array( 'option' => 'script_dir', 'value' => $script_dir));

   //
   // Add the version information to the options database.
   //
   add_option("WP_cctSM_version",$WP_cctSM_version);

   //
   // Add create_scripts capability to the admin role.
   //
   $role =& get_role( 'administrator');
   if(!empty($role)) {
      $role->add_cap( 'create_scripts');
   }
}
?>