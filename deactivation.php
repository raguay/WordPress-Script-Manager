<?php
//
// File:          deactivation.php
//
// Description:   This file is for the deactivation of the Script Manager plugin.  It will remove
//                all the database files and scripts.
//
// Copyrighted by Custom Computer Tools and Richard Guay
// Build February 27, 2012
//
//
// Get rid of the options for this plugin.
//
delete_option('WP_cctSM_version');

//
// Remove the database tables created.
//
$wpdb->query("DROP TABLE IF EXISTS sm_scripts");
$wpdb->query("DROP TABLE IF EXISTS sm_lang");
$wpdb->query("DROP TABLE IF EXISTS sm_options");
$wpdb->query("DROP TABLE IF EXISTS sm_actions");
$wpdb->query("DROP TABLE IF EXISTS sm_filters");

?>