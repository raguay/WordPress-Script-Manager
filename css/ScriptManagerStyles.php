<?php
//
// Reference all the globals we will be using in this script.
//
global $ob_SM;

//
// Get the basecolor for the plugin based on user admin panel color.
//
$basecolor = '#B0C8D8';
switch(get_userdata( wp_get_current_user()->ID )->admin_color) {
  case 'clasic':
    $basecolor = '#B0C8D8';
    break;

  case 'fresh':
    $basecolor = 'lightgrey';
    break;
}
$location = plugins_url( '' , __FILE__ );
?>

@comment:         <?php echo $ob_SM->get_color_db('comment'); ?>;
@keyword:         <?php echo $ob_SM->get_color_db('keyword'); ?>;
@string:          <?php echo $ob_SM->get_color_db('string'); ?>;
@builtin:         <?php echo $ob_SM->get_color_db('builtin'); ?>;
@special:         <?php echo $ob_SM->get_color_db('special'); ?>;
@variable:        <?php echo $ob_SM->get_color_db('variable'); ?>;
@number:          <?php echo $ob_SM->get_color_db('number'); ?>;
@atom:            <?php echo $ob_SM->get_color_db('atom'); ?>;
@meta:            <?php echo $ob_SM->get_color_db('meta'); ?>;
@def:             <?php echo $ob_SM->get_color_db('def'); ?>;
@variable-2:      <?php echo $ob_SM->get_color_db('variable-2'); ?>;
@variable-3:      <?php echo $ob_SM->get_color_db('variable-3'); ?>;
@property:        <?php echo $ob_SM->get_color_db('property'); ?>;
@operator:        <?php echo $ob_SM->get_color_db('operator'); ?>;
@error:           <?php echo $ob_SM->get_color_db('error'); ?>;
@qualifier:       <?php echo $ob_SM->get_color_db('qualifier'); ?>;
@bracket:         <?php echo $ob_SM->get_color_db('bracket'); ?>;
@tag:             <?php echo $ob_SM->get_color_db('tag'); ?>;
@attribute:       <?php echo $ob_SM->get_color_db('attribute'); ?>;
@header:          <?php echo $ob_SM->get_color_db('header'); ?>;
@quote:           <?php echo $ob_SM->get_color_db('quote'); ?>;
@hr:              <?php echo $ob_SM->get_color_db('hr'); ?>;
@link:            <?php echo $ob_SM->get_color_db('link'); ?>;
@alcolor:         <?php echo $ob_SM->get_color_db('alcolor'); ?>;
@codeareaColor:   <?php echo $ob_SM->get_color_db('codeareaColor'); ?>;
@numberscolor:    <?php echo $ob_SM->get_color_db('numberscolor'); ?>;
@bkgnumbers:      <?php echo $ob_SM->get_color_db('bkgnumbers'); ?>;
@basecolor:       <?php echo $basecolor; ?>; 
@tableheader:     <?php echo $ob_SM->get_color_db('tableheader'); ?>;
@tableroweven:     <?php echo $ob_SM->get_color_db('tableroweven'); ?>;
@tablerowodd:     <?php echo $ob_SM->get_color_db('tablerowodd'); ?>;

.basecolor {
  background:    <?php echo $basecolor; ?>;
}

#DBM_Data_table {
  border:              1px solid @tableheader; 
  border-radius:       5px; 
  -moz-border-radius:  5px;

  table {
    -webkit-border-horizontal-spacing: 0px;
    -webkit-border-vertical-spacing: 0px;
    border-spacing: 0px;
  }

  .DBM_Table_header_row{
    background: @tableheader;
  }

  .DBM_Table_header {
    padding-left:   5px;
    padding-right:  5px;
  }

  .DBM_Table_row_odd {
    background: @tablerowodd;
  }

  .DBM_Table_row_even {
    background: @tableroweven;
  }

  .DBM_Table_data {
    padding-left:   5px;
    padding-right:  5px;
  }
}

<?php
    if($ob_SM->pagename == 'WP_SM_plugin_page') {
      //
      // This is the LESS style sheet for the Script Manager plugin page.
      //
?>

#Header_div {
  font-family:         "HelveticaNeue-Light","Helvetica Neue Light","Helvetica Neue",sans-serif;
  font-size:           12px;
  line-height:         1.4em;
  padding:             10px 0px 10px 0px;
  margin-bottom:       20px;
  margin-top:          20px;
  width:               980px;
  height:              50px;
  clear:               right;
  border:              1px solid @basecolor; 
  border-radius:       15px; 
  -moz-border-radius:  15px;
  background-image:    -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0, lighten(@basecolor,10%)),
    color-stop(1, darken(@basecolor,10%))
  );
  background-image:    -moz-linear-gradient(
    center top,
    lighten(@basecolor,10%) 0%,
    darken(@basecolor,10%) 100%
  );
  vertical-align:      middle;
  -mox-box-shadow:     0 0 10px lighten(@basecolor,10%);
  -webkit-box-shadow:  0 0 10px lighten(@basecolor,10%);
  box-shadow:          0 0 10px lighten(@basecolor,10%);
}

#Header_text_div {
  text-align:     left;
  font-weight:    bold;
  padding-left:   10px;
  padding-top:    5px;
  text-shadow:    white 0 1px 0;
}

.version {
  font-size:     12px;
  font-weight:   normal;
  line-height:   12px;
}

.name {
  font-size:     26px;
  line-height:   26px;
}

#SM_Container {
   float: left;
   width: 980px;

   .tabselected {
      background: white !important;
   }

   .tabunselected {
      background:              @basecolor;
      background:              -moz-linear-gradient(top, lighten(@basecolor,10%) 0%, darkern(@basecolor,10%) 100%);
      background:              -webkit-gradient(linear, 0% 0%, 0% 100%, from(lighten(@basecolor,10%)), to( darken(@basecolor,10%) ));
   }

   ul {
      margin-left: 120px;
      z-index: 100;
      width: 840px;

      li {
        display:                 inline;
        padding:                 5px;
        border:                  1px solid lighten(@basecolor,10%); 
        border-top-left-radius:  3px; 
        border-top-right-radius: 3px;
        border-bottom:           0px;
        text-shadow:             white 0 1px 0;
        margin-left:             0px;
        margin-right:            5px;
        margin-bottom:           -3px;
        cursor:                  default;
        font-family:             "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, Verdana, sans-serif;
        font-size:               14px;
        font-weight:             normal;
        line-height:             1;
      }
      li:hover {
        background: @basecolor;
        background: -moz-linear-gradient(top, lighten(@basecolor,30%) 0%, darken(@basecolor,5%) 100%);
        background: -webkit-gradient(linear, 0% 0%, 0% 100%, from( lighten(@basecolor,30%) ), to( darken(@basecolor,5%) ));
      }
   }

  #SM_Container_div {
    display: inline-block;
    width: 100%;
    margin: 3px auto;
    text-align: center;
    vertical-align: top;
    z-index: -100;

    #SM_Script_Function_div {
      display: inline-block;
      width:  100px;
      vertical-align: top;

      button.SM_Script_button:hover {
        background: @basecolor;
        background: -moz-linear-gradient(top, lighten(@basecolor,30%) 0%, darken(@basecolor,5%) 100%);
        background: -webkit-gradient(linear, 0% 0%, 0% 100%, from( lighten(@basecolor,30%) ), to( darken(@basecolor,5%) ));
        border-top: 1px solid lighten(@basecolor,20%);
        border-left: 1px solid lighten(@basecolor,20%);
        border-bottom: 1px solid lighten(@basecolor,20%);
        border-right: 1px solid lighten(@basecolor,20%);
        border-radius:       15px; 
        -moz-border-radius:  15px;
        -moz-box-shadow: inset 0 1px 0 0 lighten(@basecolor,20%);
        -webkit-box-shadow: inset 0 1px 0 0 lighten(@basecolor,20%);
        box-shadow: inset 0 1px 0 0 lighten(@basecolor,20%);
        color:  black;
        cursor: pointer;
      }

      button.SM_Script_button:active {
        border: 1px solid lighten(@basecolor,20%);
        -moz-box-shadow: inset 0 0 4px 2px darken(@basecolor,20%), 0 0 1px 0 @basecolor;
        -webkit-box-shadow: inset 0 0 4px 2px darken(@basecolor,20%), 0 0 1px 0 @basecolor;
        box-shadow: inset 0 0 4px 2px darken(@basecolor,20%), 0 0 1px 0 @basecolor;
      }

      button.SM_Script_button::-moz-focus-inner {
        border: 0;
      }

      button.SM_Script_button {
        background: @basecolor;
        background: -moz-linear-gradient(top, lighten(@basecolor,10%) 0%, darkern(@basecolor,10%) 100%);
        background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(lighten(@basecolor,10%)), to( darken(@basecolor,10%) ));
        border-top: 1px solid lighten(@basecolor,20%);
        border-left: 1px solid lighten(@basecolor,20%);
        border-bottom: 1px solid lighten(@basecolor,20%);
        border-right: 1px solid lighten(@basecolor,20%);
        border-radius:       15px; 
        -moz-border-radius:  15px;
        -moz-box-shadow: inset 0 1px 0 0 lighten(@basecolor,20%);
        -webkit-box-shadow: inset 0 1px 0 0 lighten(@basecolor,20%);
        box-shadow: inset 0 1px 0 0 lighten(@basecolor,20%);
        color: black;
        cursor: pointer;
        font-family: "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, Verdana, sans-serif;
        font-size: 14px;
        font-weight: normal;
        line-height: 1;
        padding: 6px 0 7px 0;
        text-align: center;
        text-shadow: 0 1px 1px #fff;
        width: 100px;
      }
   }

   #ScriptList {
      width: 870px;
      height: 200px;
      border: 1px solid @basecolor; 
      border-radius: 15px; 
      -moz-border-radius: 15px;
      display: inline-block;

      #innerScriptList {
         display: block;
         width: 860px;
         height: 100%;
         overflow-y: auto;
        
         .selected {
            background: @basecolor;
         }

         .unselected {
            background: white;
         }
      }
    }
  }
}

div.normal {
  background: white;
  border: 1px solid white; 
  border-radius: 15px; 
  -moz-border-radius: 15px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

div.selected {
  background: @basecolor;
  border: 1px solid @basecolor; 
  border-radius: 15px; 
  -moz-border-radius: 15px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

div.Script_Image_div_class {
  display: table-cell;
  padding: 5px;
  cursor: default;
  text-align: center;
  float: left;
}

img.Script_Image_class {
  height: 45px;
  width: 40px;
  margin-left: auto;
  margin-right: auto;
}

#EditorDiv {
  background: @basecolor;
  margin-top: 15px;
  border: 1px solid @basecolor; 
  border-radius: 15px; 
  -moz-border-radius: 15px;
  min-height: 100%;

  textarea {
    height: 100%;
    width: 100%;
    margin-left: 3px;
    margin-right: 3px;
    font-family: Arial,"Bitstream Vera Sans",Helvetica,Verdana,sans-serif;
    font-size: 12px;
    line-height: 1;
  }
}

#EditorBar {
  background: @basecolor;
  width: 100%;
  height: 20px;
  border: 1px solid @basecolor; 
  border-top-left-radius: 13px; 
  border-top-right-radius: 13px;
  -moz-border-radius: 13px;

  a {
    margin: 1px 1px 0px 1px;
    padding: 3px;
  }

  img {
    cursor: pointer;
  }
}

#EditorBarButtons {
  padding-top: 2px;
  width: 192px;
  margin: auto;

  label {
    cursor: default;
    padding-right: 5px;
    margin-top: 7px;
    vertical-align: middle;
  }
  
  input {
    vertical-align: top;
    margin-top: 7px;
  }
}

.editorcheckbox {
  vertical-align: top;
  text-align: middle;
}

.editorButton {
}

.fullscreen{
  display:    block;
  position:   fixed;
  top:        0px;
  left:       0px;
  margin-top: 10px;
  width:      100%;
  height:     100%;
  z-index:    99999;
}

#SM_Options_Container {  
  width: 980px;
  height: 200px;
  border: 1px solid @basecolor; 
  border-radius: 15px; 
  -moz-border-radius: 15px;
  display: inline-block;
}

.right-side { 
  float: right;
}

.left-side {  
  float: left;
}

#loadingDiv {
  margin-top:   30px; 
  margin-left:  35px;
  width:        30px;
  height:       30px;
}

#loadingDiv img { 
  width: 30px;
  height: 30px;
}

<?php
    }
    if($ob_SM->pagename == 'WP_SM_plugin_options') {
      //
      // The following style sheet is for the options page.
      //
?>

#loadingDiv {
  margin-top:   20px; 
  margin-left:  30px;
  width:        30px;
  height:       30px;
  display:      inline;
  position:     relative;
}

#loadingDiv img { 
  width: 30px;
  height: 30px;
}

#Header_div {
  font-family:         "HelveticaNeue-Light","Helvetica Neue Light","Helvetica Neue",sans-serif;
  font-size:           12px;
  line-height:         1.4em;
  padding:             10px 0px 10px 0px;
  margin-bottom:       20px;
  margin-top:          20px;
  width:               980px;
  height:              50px;
  clear:               right;
  border:              1px solid @basecolor; 
  border-radius:       15px; 
  -moz-border-radius:  15px;
  background-image:    -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0, lighten(@basecolor,10%)),
    color-stop(1, darken(@basecolor,10%))
  );
  background-image:    -moz-linear-gradient(
    center top,
    lighten(@basecolor,10%) 0%,
    darken(@basecolor,10%) 100%
  );
  vertical-align:      middle;
  -mox-box-shadow:     0 0 10px lighten(@basecolor,10%);
  -webkit-box-shadow:  0 0 10px lighten(@basecolor,10%);
  box-shadow:          0 0 10px lighten(@basecolor,10%);
}

#Header_text_div {
  text-align:     left;
  font-weight:    bold;
  padding-left:   10px;
  padding-top:    5px;
  text-shadow:    white 0 1px 0;
}

.version {
  font-size:     12px;
  font-weight:   normal;
  line-height:   12px;
}

.name {
  font-size:     26px;
  line-height:   26px;
}

#Options {
  font-family:         "HelveticaNeue-Light","Helvetica Neue Light","Helvetica Neue",sans-serif;
  font-size:           12px;
  line-height:         1.4em;
  width:               980px;

  p {
    margin-left:       10px;
    font-family:       "HelveticaNeue-Light","Helvetica Neue Light","Helvetica Neue",sans-serif;
    font-size:         14px;
  }
}

#optiontabs{
  float:            left;
  width:            70px;
  height:           500px;

  ul {
    list-style:                   none;
  
    li {
      background: @basecolor;
      background: -moz-linear-gradient(top, lighten(@basecolor,10%) 0%, darkern(@basecolor,10%) 100%);
      background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(lighten(@basecolor,10%)), to( darken(@basecolor,10%) ));
      padding:                    10px;
      border:                     1px solid @basecolor;
      border-right:               none; 
      border-top-left-radius:     5px;
      border-bottom-left-radius:  15px 30px; 
      text-shadow:                #eee 0px 0px 2px;
      margin:                     0px;
      margin-bottom:              5px;
    } 

    li:hover {
      background: @basecolor;
      background: -moz-linear-gradient(top, lighten(@basecolor,30%) 0%, darken(@basecolor,5%) 100%);
      background: -webkit-gradient(linear, 0% 0%, 0% 100%, from( lighten(@basecolor,30%) ), to( darken(@basecolor,5%) ));
      cursor:     pointer;
    }
  }
}

.savebuttondiv {
  position:         relative;
  width:            900px;
  height:           2em;
  top:              590px;
  z-index:          99;
}

.savebutton {
  margin:           10px;
  padding-left:     5px;
  padding-right:    5px;  
}

.tabselected {
  background:   white !important;
}

#optiontextbox {
  width:              900px;
  height:             630px;
  float:              left;
  border:             1px solid @basecolor;
  border-radius:      15px;
  -moz-border-radius: 15px;
}

.optiontbBase {
  position:           absolute;
  background:         white;
  float:              left;
  width:              870px;
  height:             600px;
  padding:            15px;
  border-radius:      15px;
  -moz-border-radius: 15px;
  z-index:            0;
}

.optiontbTop {
  z-index:        99 !important;
}

.themecolor {
  width:          75px;
  float:          left;
}

.colorpicker {
  height:             20px;
  width:              20px;
  border:             1px solid black;
  border-radius:      5px;
  -moz-border-radius: 5px;
  float:              right;
}

.colorpickerwrap {
  height:         25px;
  width:          120px;
}

#colorpicker {
  position:           relative;
  background:         black;
  border:             1px solid black;
  border-radius:      15px;
  -moz-border-radius: 15px;
  padding:            5px;
}

#colorpickerouter {
  position:           absolute;
  background:         lightgrey;
  z-index:            999;
  border:             1px solid lightgray;
  border-radius:      15px;
  -moz-border-radius: 15px;
  padding:            10px;
}

<?php
    }
  if(!is_admin() || ($ob_SM->pagename == 'WP_SM_plugin_page')) {
    //
    // The rest are LESS style sheet for everywhere.
    //
?>

.errorMsg {
  border-style: solid;
  border-width: 2px;
  border-color: red;
  clear: both;
}

.clear { 
  clear: both;
  height: 0px;
}

.codemirrortext { 
  display:      inline;
  top:          0px;
  left:         25px;
  line-height:  1.5em;
  font-family:  monospace;
  min-height:   100%;
  width:        90%;
  white-space:  pre;
  float:        left;
  margin-left:  5px;
  margin-right: 0px;
  margin-top:   0px;
  margin-bottom: 0px;
}

.CodeMirror {
  line-height: 1.5em;
  font-family: monospace;
  min-height: 100%;
  max-height: inherit;
  margin-top: 0px;
  background: @codeareaColor;

  pre {
    -moz-border-radius: 0;
    -webkit-border-radius: 0;
    -o-border-radius: 0;
    border-radius: 0;
    border-width: 0; margin: 0; padding: 0; background: transparent;
    padding: 0; margin: 0;
    white-space: pre;
    word-wrap: normal;
    overflow:  hidden;
    font-family:  inherit !important;
    font-size:    inherit !important;
    margin: 0px !important;
  }

  textarea {
    background:    @codeareaColor;
    font-family:   inherit !important;
    font-size:     inherit !important;
  }
}

.codearea { 
  line-height:  1.5em;
  font-family:  monospace;
  min-height:   100%;
  white-space:  pre;
  margin-left:  5px;
  margin-right: 0px;
  margin-top:   0px;
  margin-bottom: 0px;
  overflow-y:    hidden;
  overflow-x:    auto;
  background:    @codeareaColor;

  pre { 
    line-height:    1.5em;
    height:         1.5em;
    padding:        0px;
    margin:         0px;
    white-space:    pre;
    overflow:       visible;
  }
}
  
.codemirrornumbers { 
  display:         inline;
  position:        relative;
  top:             0px;
  left:            0px;
  line-height:     1.5em;
  font-family:     monospace;
  min-height:      100%;
  max-height:      inherit;
  width:           25px;
  vertical-align:  top;
  float:           left;
  color:           @numberscolor;
  background:      @bkgnumbers !important;

  pre { 
    line-height:   1.5em;
    height:        1.5em;
    padding:       0px;
    margin:        0px;
    background:    @bkgnumbers !important;
    overflow:      hidden;
  }
}

.CodeMirror-scroll {
  overflow: auto;
  height: 100%;
  min-height: 100%;
  background: white;
  position: relative;
}

.CodeMirror-gutter {
  position: absolute; left: 0; top: 0;
  background-color: @bkgnumbers;
  border-right: 1px solid @basecolor;
  min-width: 2em;
  height: 100%;
  min-height: 100%;
}

.CodeMirror-gutter-text {
  color: #aaa;
  text-align: right;
  padding: .4em .2em .4em .4em;
  color:    @numberscolor;
  background: @bkgnumbers;
}

.CodeMirror-lines {
  padding: .4em;
}

.CodeMirror-cursor {
  z-index: 10;
  position: absolute;
  visibility: hidden;
  border-left: 1px solid black !important;
}

.CodeMirror-focused .CodeMirror-cursor {
  visibility: visible;
}

span.CodeMirror-selected {
  background: #ccc !important;
  color: HighlightText !important;
}

.CodeMirror-focused span.CodeMirror-selected {
  background: Highlight !important;
}

.CodeMirror-matchingbracket {color: #0f0 !important;}
.CodeMirror-nonmatchingbracket {color: #f22 !important;}

.cm-s-neat span.cm-comment { color: @comment; }
.cm-s-neat span.cm-keyword { font-weight: bold; color: @keyword; }
.cm-s-neat span.cm-string { color: @string; }
.cm-s-neat span.cm-builtin { font-weight: bold; color: @builtin; }
.cm-s-neat span.cm-special { font-weight: bold; color: @special; }
.cm-s-neat span.cm-variable { color: @variable; }
.cm-s-neat span.cm-number { color: @number; }
.cm-s-neat span.cm-atom { color: @atom; }
.cm-s-neat span.cm-meta {color: @meta;}
.cm-s-neat span.cm-def {color: @def;}
.cm-s-neat span.cm-variable-2 {color: @variable-2;}
.cm-s-neat span.cm-variable-3 {color: @variable-3;}
.cm-s-neat span.cm-property {color: @property;}
.cm-s-neat span.cm-operator {color: @operator;}
.cm-s-neat span.cm-error {color: @error;}
.cm-s-neat span.cm-qualifier {color: @qualifier;}
.cm-s-neat span.cm-bracket {color: @bracket;}
.cm-s-neat span.cm-tag {color: @tag;}
.cm-s-neat span.cm-attribute {color: @attribute;}
.cm-s-neat span.cm-header { color: @header; }
.cm-s-neat span.cm-quote { color: @quote; }
.cm-s-neat span.cm-hr { color: @hr; }
.cm-s-neat span.cm-link { color: @link; }

.CodeMirror-dialog {
  position: relative;
  div {
    position: absolute;
    top: 0; left: 0; right: 0;
    background: white;
    border-bottom: 1px solid @basecolor;
    z-index: 15;
    padding: .1em .8em;
    overflow: hidden;
    color: #333;
  }

  input {
    border: none;
    outline: none;
    background: transparent;
    width: 20em;
    color: inherit;
    font-family: monospace;
  }
}

.CodeMirror-completions {
  position: absolute;
  z-index: 10;
  overflow: hidden;
  -webkit-box-shadow: 2px 3px 5px rgba(0,0,0,.2);
  -moz-box-shadow: 2px 3px 5px rgba(0,0,0,.2);
  box-shadow: 2px 3px 5px rgba(0,0,0,.2);
}
  
.CodeMirror-completions select {
  background: #fafafa;
  outline: none;
  border: none;
  padding: 0;
  margin: 0;
  font-family: monospace;
}

.activeline {
  background: @alcolor !important;
}

<?php
  }
?>
