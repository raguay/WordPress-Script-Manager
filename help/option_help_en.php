<?php
//
// File:          Option_help_en.php
//
// Description:   This file contains the options page help string in english.
//
// Copyrighted by Custom Computer Tools and Richard Guay
// Build February 27, 2012
//

global $ob_SM;

$ob_SM->help_option_intro_title = 'Introduction';
$ob_SM->help_option_intro = <<<HEREDOC
<p>The Script Manager has many options that you can configure.  These options allow you to customize the 
Script Manager to your particular installation.  The options are in two category:  General and Theme.  The
General options allow you to configure how Script Manager works.  The Theme options allow you to configure
how the editor and code formatter looks.</p>
HEREDOC;

$ob_SM->help_option_general_title = 'General Options';
$ob_SM->help_option_general = <<<HEREDOC
<p>The General options currently has one thing to configure: Execution directory.  This is the directory
in which the scripts will be executed.  Therefore, if you want links in your web site for files in a 
particular directory, your script will always know what directory you are executing the script.  This
helps to protect location of administration files and gives consistancy to the execution of the scripts. 
For instance, the execution directory for ajax calls in WordPress is different than normal calls.</p>
HEREDOC;

$ob_SM->help_option_theme_title = 'Theme Options';
$ob_SM->help_option_theme = <<<HEREDOC
<p>The Theme options page allows you to change the color of the code highlighting in the editor and 
code highlighting shortcode. Therefore, you can change the colorization to match what you like, or 
the coloring of your web site.</p>
<p>To change the color, just put the hex value of the color in the input area in front of the type of 
code you want to changed.  Make sure you remember the '#' symbol in front of the hex number.  When you 
change the number and exit the input area, the color to the right of the value will change to the color you 
indicated.  If you click color area, a graphical color picker with popup for changing the color value.  Clicking 
the color box again, or a different color box, will close that color picker.</p>
HEREDOC;

$ob_SM->help_option_sidebar = <<<HEREDOC
<p>For more great themes, plugins, help files, and tutorials, please visit our web site <a href='http://customct.com'>Custom Computer Tools</a>.</p>
HEREDOC;

?>
