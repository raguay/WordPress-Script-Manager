<?php
//
// File:          Plugin_help_en.php
//
// Description:   This file contains the plugin page help string in english.
//
// Copyrighted by Custom Computer Tools and Richard Guay Feb 2012.
//
global $ob_SM;

$ob_SM->plugin_intro_title = 'Introduction';
$ob_SM->plugin_intro = <<<HEREDOC
<h2 style="text-align: center;">Welcome to Script Manager by <a href="http://customct.com/">Custom Computer Tools</a>!</h2>
<p>This plugin gives you the power to take full control of your Word Press site.  You can insert
your custom scripts into any post, page, or widget area you want.  You can also create actions and
filters to further customize your Word Press site.  There is nothing that can be done in another plugin
that you cannot duplicate with Script Manager.  You could even take the functionality of all your different
plugins and put them into Script Manager.  We have <a href="http://www.customct.com/tutorials-script-manager/">
tutorials</a> on our web site to show you how.</p>
HEREDOC;

$ob_SM->plugin_basics_title = 'Basics';
$ob_SM->plugin_basics = <<<HEREDOC
<p>To get started, simply select the language you want to use to make a script.  Then select "New" button to the
left of the script list area.  You will have to give your script a name and then click the "New" button under the
name. After the server acknowledges the new script name, you will see the new script name in the script list area.
After selecting the script name, you can add your script into the program editor at the bottom.  The program
editor will highlight the program according to the language syntax.  If you want to change the colors, please
goto the options page for the Script Manager.</p>
<p>When you have the code you want, you can test most things with the "Test" button to the left of the script
list area.  This is an ajax call to WordPress to test your script.  Therefore, some WordPress PHP functions will
not be available.<p>
<p>To delete a script, simply select the script you no longer want and click the "Delete" button to the left
of the script list area.<p>
<p>To rename a script, simply select the script you want to rename and click the "Rename" button to the left
of the script list area.  Then, simply supply the new name in the input area. Click on "Rename" button under the
new name area to save the new name.<p>
HEREDOC;

$ob_SM->plugin_scripts_title = 'Scripts';
$ob_SM->plugin_scripts = <<<HEREDOC
<p>Script Manager allows you to add many types of scripts into your WordPress page, post, widget, etc.  Currently,
you can add custom HTML, PHP, JavaScript, SQL, CSS, or LESS scripts anywhere in your web site.  We are looking to
add even more language types in the future (Like Node, Ruby, Pearl, etc).</p>
<p>An HTML script is great for creating iframe code that WordPress will not remove from the post or page.  This is
great for incapsulating Google Maps, Facebook connection pages, or anything else that the HTML editor of
WordPress likes to mess-up. Or, you can simply put code that you like to reuse on other pages. CSS and LESS
scripts are great for changing the appearance of your themes, or simply adding styling to your HTML code.
PHP scripts are for adding functionality from the server side. JavaScript scripts are great for user side
processing of data or for that extra flare in the user interface of the web site. SQL tables can also
be placed where ever you need a special table. All of these can be combined to great dynamic web apps
inside of WordPress.</p>
<p>The edit area has some buttons at the top as well. These buttons are to help you edit your code.</p>
<p>The first icon is the "Save" icon. When you are ready to save your current work, simply press the save icon.
The wait icon under the "Test" button to the left of the script list area will show up while waiting for the
server.</p>
<p>The next icon is for full screen editing mode.  That will make your edit area as big as possible on your
current browser size.  To make completely full screen, simply invoke full screen mode of your browser as well.
Please make the browser full screen first, then your edit area.</p>
<p>The next icon is the "Undo" and "Redo" buttons.  The "Undo" button will undo up to the last 10 edits.  The "Redo"
button simply recreates the last edits that were undone. </p>
<p>The next icon is the "Goto" button.  When you press the "Goto" button, an input box will appear right above it.
Put the line number you want to go to and re-click the "Goto" button.  The cursor will immediately go to the
specified line number and the input box will disappear.<p>
<p>The next icon is the search and replace button.  When you click on it, an input area appears above the icon for
putting in the search criteria.  You can do normal searching or regular expression searching.  Simply check the
regular expression box for performing a regular expression search.  Once you have your search criteria in the
search box, press "find" to go to the first occurance.  If you want to replace it, put the string you want to
replace it with in the replace box and click "Replace". If you want to replace all occurances of that string,
simply check the "all" box before pressing "Replace".<p>
<p>On HTML scripts, there are two more icons in the editor:  Insert Code, and Highlight code.  If you
press the "Insert Code" icon, a pop-up will ask you for the language, script name, and parameters for the script.
Then a shortcode for that script will be placed in your HTML script right where the cursor last was.  The "Highlight Code"
does the same, except the script will not be inserted, but the code will be inserted with the proper highlighting
for that language. If "none" is selected, then the code highlight shortcode will be inserted with an open/close
structure.  All code in the middle will be displayed just like it came from the database.  These buttons
are also available on the TinyMCE and HTML editors for the add/edit pages, posts, etc.<p>
HEREDOC;

$ob_SM->plugin_shortcodes_title = 'Shortcodes and Widgets';
$ob_SM->plugin_shortcodes = <<<HEREDOC
<p>This plugin comes with two shortcodes: [CodeInsert] and [CodeHighlight]. These shortcodes are only available
anywhere HTML is placed. If you define shortcodes inside of your HTML script, they will also be expanded.  Please
be careful to not have shortcode loops: shortcode that expands to the current shortcode that expands to the
current shortcode.... That can very quckly kill your server.</p>
<p>Both shortcodes have the same inputs: "lang", "name", and "params".  The "lang" parameter specifies the language
of the script. It can be "HTML", "WPPHP", "JavaScript", "SQL", "CSS", or "LESS".  "WPPHP" is a PHP script that uses
WordPress functions.  Your PHP script does not have to have WordPress functions.  We only make the distinction for future expanding
to a PHP ajax call that does not load any WordPress functionality for speed.  The "name" parameter specifies the
name of the script.  The "param" parameter allows you to add customiztion to a script call.  For HTML, PHP, CSS,
and LESS, whatever is in the "param" field is appended to the top of the script.  JavaScript appends it to the
bottom of the script.  Most often, this will be used to set variables inside of your script.</p>
<p>On your widgets page, you now have a new widget called "Insert Script".  Place this widget in any widget area,
specify the parameters, and off you go.  It is a very easy way to add scripts to any location your theme defines
as a widget area.</p>
HEREDOC;

$ob_SM->plugin_actions_title = 'Actions';
$ob_SM->plugin_actions = <<<HEREDOC
<p>WordPress allows you to expand and/or modify the behavior of WordPress by the use of Actions and Filters.
The only difference between actions and filters is their basic functions.  Actions can do anything, can
have inputs, and can have outputs.  Filters always has an input that your function is to modify and return.
Actions can act like filters, but really filters cannot behave like Actions.</p>
<p>To add to a new Action, simply go to the Actions tab and click "New".  You will be requested for the name
of the action, the priority of the action (default is 10), and the arguements for the action. If that action,
like 'wp_footer', does not have any arguments, simply leave that field blank. Click 'New' and you just added
your new hook into a WordPress Action. Now select your new Action, add code in the code edit area, save, and
you are now hooked in to a WordPress Action.  <span style='font-weight: bold;'>Be careful</span>, bad code will literally crash your web site.  It is
best to test such code on a local computer test site before using on the web itself.</p>
<p>Actions are processed like HTML.  Therefore, you can add anything that you can write HTML for: insert PHP
code, insert JavaScript Code, use any WordPress shortcode, or just HTML.  The arguments are inserted by using
the PHP inserting HTML tag.</p>
<p>Actions can also be deleted when you are no longer using them. You should delete unused Actions so that WordPress
will not be slowed down with the extra processing for nothing.</p>
HEREDOC;

$ob_SM->plugin_filters_title = 'Filters';
$ob_SM->plugin_filters = <<<HEREDOC
<p>WordPress allows you to expand and/or modify the behavior of WordPress by the use of Actions and Filters.
The only difference between actions and filters is their basic functions.  Actions can do anything, can
have inputs, and can have outputs.  Filters always has an input that your function is to modify and return.
Actions can act like filters, but really filters cannot behave like Actions.</p>
<p>To add to a new Filter, simply go to the Filters tab and click "New".  You will be requested for the name
of the filter, the priority of the filter (default is 10), and the arguements for the filter. Click 'New' and you
just added your new hook into a WordPress Filter. Now select your new Filter, add code in the code edit area,
save, and you are now hooked in to a WordPress Filter.  <span style='font-weight: bold;'>Be careful</span>, bad code will literally crash your web site.
It is best to test such code on a local computer test site before using on the web itself.</p>
<p>Filters are processed as PHP functions.  Treat the script area as the body of a function with a return at
the end of the script.</p>
<p>Filters can also be deleted when you are no longer using them. You should delete unused Filters so that WordPress
will not be slowed down with the extra processing for nothing.</p>
HEREDOC;

$ob_SM->plugin_software_title = 'Software used';

$ob_SM->plugin_software = <<<HEREDOC
<p>All code in this plugin is original code by Richard Guay, expect for the following:
<br>
<p><a href="http://codemirror.net/">CodeMirror</a>:  The following is their license agreement.</p>
<p>Copyright (C) 2011 by Marijn Haverbeke <marijnh@gmail.com><br>
<br>
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
<br>
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
<br>
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
<br>
Please note that some subdirectories of the CodeMirror distribution
include their own LICENSE files, and are released under different
licences.</p>
<p>We also use the Silk Icon set that is under Creative Commons license. Mark James, a web developer from Birmingham, UK,
designed the set and is giving free license to use them in any way.  Thank you Mark!
You can download the icon set at <a href="http://www.famfamfam.com/lab/icons/silk/">Silk</a>.
<p>We are also using <a href="http://lesscss.org">LESS 1.3.0</a> that was developed by <a href="http://cloudhead.io/">Alexis Sellier</a>, more commonly known as cloudhead.</p>
HEREDOC;

$ob_SM->plugin_EULA_title = 'End User License Agreement (EULA)';

$ob_SM->plugin_EULA = <<<HEREDOC
<p>END-USER LICENSE AGREEMENT FOR SOFTWARE AND SERVICES PROVIDED BY CUSTOM COMPUTER TOOLS IMPORTANT PLEASE READ THE TERMS AND CONDITIONS OF THIS LICENSE AGREEMENT CAREFULLY BEFORE CONTINUING WITH THIS PROGRAM INSTALL: Custom
Computer Tools End-User License Agreement ("EULA") is a legal agreement between you (either an individual or a single entity), Richard Guay, and Custom Computer Tools for the Custom Computer Tools Script Manager plugin for WordPress(s) and services which may include associated software components, media, printed materials, and "online" or electronic documentation ("Script Manager plugin for WordPress"). By installing, copying, or otherwise using the Script Manager plugin for WordPress, you agree to be bound by the terms of this EULA. This license agreement represents the entire agreement concerning the program between you and Custom Computer Tools, (referred to as "licenser"), and it supersedes any prior proposal, representation, or understanding between the parties. If you do not agree to the terms of this EULA, do not install or use the Script Manager plugin for WordPress.</p>

<p>The Script Manager plugin for WordPress is protected by copyright laws and international copyright treaties, as well as other intellectual property laws and treaties. The Script Manager plugin for WordPress is licensed, not sold.

<ol><li> GRANT OF LICENSE. <br>
The Script Manager plugin for WordPress is licensed as follows: <br>
(a) Installation and Use.<br>
Custom Computer Tools grants you the right to install and use one copy of the Script Manager plugin for WordPress on one of your web site(s). You must purchase a license for each web site that the software is in use.<br>
(b) Backup Copies.<br>
You may also make copies of the Script Manager plugin for WordPress as may be necessary for backup and archival purposes.</li>

<li>DESCRIPTION OF OTHER RIGHTS AND LIMITATIONS.<br>
(a) Maintenance of Copyright Notices.<br>
You must not remove or alter any copyright notices on any and all copies of the Script Manager plugin for WordPress.<br>
(b) Distribution.<br>
You may not distribute registered copies of the Script Manager plugin for WordPress to third parties. Evaluation versions available for download from Custom Computer Tools's websites may be freely distributed.<br>
(c) Prohibition on Reverse Engineering, Decompilation, and Disassembly.<br>
You may not reverse engineer, decompile, or disassemble the Script Manager plugin for WordPress, except and only to the extent that such activity is expressly permitted by applicable law notwithstanding this limitation. <br>
(d) Rental.<br>
You may not rent, lease, or lend the Script Manager plugin for WordPress.<br>
(e) Support Services.<br>
Custom Computer Tools may provide you with support services related to the Script Manager plugin for WordPress ("Support Services"). Any supplemental software code provided to you as part of the Support Services shall be considered part of the Script Manager plugin for WordPress and subject to the terms and conditions of this EULA. <br>
(f) Compliance with Applicable Laws.<br>
You must comply with all applicable laws regarding use of the Script Manager plugin for WordPress.</li>

<li>TERMINATION <br>
Without prejudice to any other rights, Custom Computer Tools may terminate this EULA if you fail to comply with the terms and conditions of this EULA. In such event, you must destroy all copies of the Script Manager plugin for WordPress in your possession.</li>

<li>COPYRIGHT<br>
All title, including but not limited to copyrights, in and to the Script Manager plugin for WordPress and any copies thereof are owned by Custom Computer Tools and Richard Guay. All title and intellectual property rights in and to the content which may be accessed through use of the Script Manager plugin for WordPress is the property of the respective content owner and may be protected by applicable copyright or other intellectual property laws and treaties. This EULA grants you no rights to use such content. All rights not expressly granted are reserved by Custom Computer Tools and Richard Guay.</li>

<li> NO WARRANTIES<br>
Custom Computer Tools expressly disclaims any warranty for the Script Manager plugin for WordPress. The Script Manager plugin for WordPress is provided 'As Is' without any express or implied warranty of any kind, including but not limited to any warranties of merchantability, noninfringement, or fitness of a particular purpose. Custom Computer Tools does not warrant or assume responsibility for the accuracy or completeness of any information, text, graphics, links or other items contained within the Script Manager plugin for WordPress. Custom Computer Tools makes no warranties respecting any harm that may be caused by the transmission of a computer virus, worm, time bomb, logic bomb, or other such computer program. Custom Computer Tools further expressly disclaims any warranty or representation to Authorized Users or to any third party.</li>

<li> LIMITATION OF LIABILITY<br>
In no event shall Custom Computer Tools be liable for any damages (including, without limitation, lost profits, business interruption, or lost information) rising out of 'Authorized Users' use of or inability to use the Script Manager plugin for WordPress, even if Custom Computer Tools has been advised of the possibility of such damages. In no event will Custom Computer Tools be liable for loss of data or for indirect, special, incidental, consequential (including lost profit), or other damages based in contract, tort or otherwise. Custom Computer Tools shall have no liability with respect to the content of the Script Manager plugin for WordPress or any part thereof, including but not limited to errors or omissions contained therein, libel, infringements of rights of publicity, privacy, trademark rights, business interruption, personal injury, loss of privacy, moral rights or the disclosure of confidential information.</li>
</ol>
HEREDOC;

$ob_SM->plugin_sidebar = <<<HEREDOC
<p>For more great themes, plugins, help files, and tutorials, please visit our web site
<a href='http://customct.com'>Custom Computer Tools</a>.</p>
HEREDOC;

?>
