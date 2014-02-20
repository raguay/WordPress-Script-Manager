<?php
//
// Glocal Varaiables:
//
global $cct_SM_AF, $wpdb, $ob_SM;

//
// Class:       action_filters
//
// Description: This class is a holder for all the functions used to 
//              perform the different actions and filters.
//
class cct_SM_action_filters {
  //
  // Class Variables:
  //
  //       arg1       The first argument sent to the action/filter
  //       arg2       The second argument sent to the action/filter
  //
  public $arg = array();

  //
  // The following are WordPress Actions:
  //

  //
  // Function:         ActionNoArgs
  //
  // Description:      This function is called to run any of the action
  //                   hooks in wordpress that do not send data.
  //
  function ActionNoArgs() {
    global $ob_SM;

    $action = current_filter();
    echo $ob_SM->Eval_Script(98,$action,'');
  }
  
  //
  // Function:         ActionOneArg
  //
  // Description:      This function is called to run any of the action
  //                   hooks in wordpress that have one argument.
  //
  function ActionOneArg($arg) {
    global $wpdb, $ob_SM;

    $this->arg[0] = &$arg;
    $action = current_filter();

    //
    // Get the argument names for this action and create the assignment string.
    //
    $args = $wpdb->get_var("SELECT args FROM sm_actions where name = '" . $action . "'");
    if(!is_null($args)) {
      $argstr = "global \$cct_SM_AF; " . $args . "=& \$cct_SM_AF->arg[0]; ";
    }

    //
    // Execute the code and echo the results.
    //
    echo $ob_SM->Eval_Script(98,$action,$argstr);
  }

  //
  // Function:         ActionTwoArgs
  //
  // Description:      This function is called to run any of the action
  //                   hooks in wordpress that have two argument.
  //
  function ActionTwoArgs($arg1, $arg2) {
    global $wpdb, $ob_SM;

    $this->arg[0] = &$arg1;
    $this->arg[1] = &$arg2;
    $action = current_filter();

    //
    // Get the argument names for this action and create the assignment string.
    //
    $args = $wpdb->get_results("SELECT args FROM sm_actions where name = '" . $action . "'", ARRAY_N);
    if(!is_null($args)) {
      $argstr = "global \$cct_SM_AF; " . $args[0][0] . "=& \$cct_SM_AF->arg[0]; " . $args[1][0] . "=& \$cct_SM_AF->arg[1]; ";
    }

    //
    // Execute the code and echo the results.
    //
    echo $ob_SM->Eval_Script(98,$action,$argstr);
  }
}

//
// Create an instance of the class.
//
$cct_SM_AF = new cct_SM_action_filters();

?>