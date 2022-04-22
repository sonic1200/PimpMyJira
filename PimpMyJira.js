// ==UserScript==
// @name        Pimp My Jira!
// @description Enhances RapidBoard in Jira
// @author       Nicolas Mivielle
// @copyright    2021+, Nicolas Mivielle
// @match        https://*/jira/secure/RapidBoard.jspa*
// @match        https://*/jira/browse*
// @match        https://*/jira/projects*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @version     4.2
// @grant       none
// ==/UserScript==


// ====================================================================
//             CONFIGURATION SECTION
// ====================================================================

// This will activate the colorization of each issues in Jira with the selected color that you defined in your board configuration for each issue types.
var colorize_issues=true;

//This will remove the type icon to gain some space and to avoid the double information with the color on the card.
var remove_type_icon=false;

//This will move and 'stylize' all the extra fields that you configure in your board configuration. theses extra fields will be shown like Epics and Versions 'style'.
var add_extra_fields=true;

//This will update the jira card action toolbar to expand all workflows under the 'workflow' button with REAL buttons!
var update_action_toolbar=true;

//This will add background colors to the new action buttons expanded when the parameter above (update_action_toolbar) is activated.
var colorize_action_toolbar=true;

//Remove Ubi Left Toolbar which is automatically added for every pages when browsing Jira. This can cause some erratic bahavior with certain plugins (like roadmap or timeline)
var removeUbiToolbar=true;

//This will add background color to the Epic panel that follow the color set for the Epic. (it extend the color from the border right) available only on JIRA 8.
var colorize_epic_panel=true;

//This will reduce height size of each row in backlog
var reduce_height = true;

//CSS statuses colors
var blue = ".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-blue-gray jira-issue-status-lozenge-new aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium";
var yellow = ".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium";
var green = ".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-green jira-issue-status-lozenge-done aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium";
var flag = "{'background':'red','color':'white'}";

//Dictionnary for all mapped statuses
var statuses = { 'Reopened': blue,
                'Open' : blue,
                'Submitted' : blue,
                'Need Approval' : blue,
                'In Progress' : yellow,
                'In Design' : yellow,
                'In Development' : yellow,
                'QC test Request' : yellow,
                'Need More Info' : [yellow,flag],
                'Blocked' : [yellow,flag],
                'In Review' : yellow,
                'Waiting For' : [yellow,flag],
                'Suspended' : [yellow,flag],
                'Work Completed' : yellow,
                'In Dev Test' : yellow,
                'Resolved' : green,
                'Could Not Verified' : green,
                'Closed' : green,
                'Verified' : green,
                'Rejected' : green
               };


// ====================================================================
//            END OF CONFIGURATION SECTION
//=====================================================================


// initialize modification flag :
var doing_modifications=false;

// init Jira Version :
var JIRAversion = returnJiraVersion();

// initiatilize my specific jQuery and avoid conflicts with Jira one
var $j = jQuery.noConflict(true);

var matched,j_browser;
$j.uaMatch = function (ua) {
  ua = ua.toLowerCase();
  var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
  /(webkit)[ \/]([\w.]+)/.exec(ua) ||
  /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
  /(msie) ([\w.]+)/.exec(ua) ||
  ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
  [];
  return {
    j_browser: match[1] || '',
    version: match[2] || '0'
  };
};
matched = $j.uaMatch(navigator.userAgent);
j_browser = {
};
if (matched.j_browser) {
  j_browser[matched.j_browser] = true;
  j_browser.version = matched.version;
}
// Chrome is Webkit, but Webkit is also Safari.

if (j_browser.chrome) {
  j_browser.webkit = true;
} else if (j_browser.webkit) {
  j_browser.safari = true;
}
$j.browser = j_browser;
// end of initialization


$j(document).ready(function () {
  var timer=0;
  //updateToolbarForJira6();
  $j( "body" ).bind("DOMSubtreeModified", function(){
    if (timer)
      window.clearTimeout(timer);
    if(! doing_modifications) {
        timer = window.setTimeout(function() {
                UpdateDOMPage();
            if (update_action_toolbar) {
                updateToolbarforJira7();
            }
        }, 100);
    }
    });
});

function returnJiraVersion() {
    JIRAversion = AJS.$('meta[name=ajs-version-number]').attr('content');
    var res = JIRAversion.slice(0, 1);
    console.log("JIRA VERSION = " + JIRAversion);
    console.log("JIRA FAMILLY = " + res);
    return res;
}

function updateToolbarforJira7() {
    // I check if I updated the CSS and if the transition toolbar is present
    if ($j('div#opsbar-opsbar-transitions').length && $j('.issueaction-workflow-transition').css('background') == 'rgba(9, 30, 66, 0.08) none repeat scroll 0% 0% / auto padding-box border-box') {

        // I check if I already tranformed the page and expanded the workflow dropdown
         if ($j('a#opsbar-transitions_more').length) {
             var bgcolor="#FFD1D7";
             $j('.dropdown-text').each(function (index) {
                 // Findind all the Workflows available in the dropdown
                 if ($j(this).text().indexOf("Workflow") >= 0) {
                     $j('aui-dropdown-menu#opsbar-transitions_more_drop').find('.issueaction-workflow-transition').each(function (index2) {
                         //console.log($j(this).text()); //--DEBUG
                         //console.log($j(this).children().attr('href')); //-- DEBUG
                         //console.log($j(this).attr('id')); //-- DEBUG
                         // Expanding the workflows dropdown by creating all buttons in the ops toolbar
                         $j('div#opsbar-opsbar-transitions').append("<a id=" + $j(this).attr('id') + " class='aui-button toolbar-trigger issueaction-workflow-transition' href=" + $j(this).children().attr('href') + " resolved><span class='trigger-label'>" + $j(this).text() + "</span></a>");
                     });
                     // removing the dropdown workflow
                     $j(this).parent().remove();
                 }

             });
         }
        if (colorize_action_toolbar) {
            // Findind all buttons about transition workflows and applying colors background to them
            $j('.issueaction-workflow-transition').each(function (index2) {
                switch ($j(this).text().toLowerCase()) {
                    case 'none' :
                        bgcolor="#FFD1D7"
                        break;
                    case 'reopened' :
                        bgcolor="#93C9FF"
                        break;
                    case 'reopen' :
                        bgcolor="#93C9FF"
                        break;
                    case 'open' :
                        bgcolor="#93C9FF"
                        break;
                    case 'need approval' :
                        bgcolor="#93C9FF"
                        break;
                    case 'resolve' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'resolved' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'test success' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'rejected' :
                        bgcolor="#ADADAD"
                        break;
                    case 'closed' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'issue closed' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'close' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'close - cannot reproduce' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'close - duplicate' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'close - not a defect' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'close - will not fix' :
                        bgcolor="#C1FFC4"
                        break;
                    case 'waiting for' :
                        bgcolor="#FFD1D7"
                        break;
                    case 'need more info' :
                        bgcolor="#FFD1D7"
                        break;
                    case 'blocked' :
                        bgcolor="#FFD1D7"
                        break;
                    case 'test fail' :
                        bgcolor="#FFD1D7"
                        break;
                    default :
                        bgcolor="#FFD351"
                        break;
                }
                $j(this).css({'background': bgcolor });
            });
         }
    }
}

function updateToolbarForJira6() {
    if ($j('div#opsbar-opsbar-transitions').length) {
        if ($j('a#opsbar-transitions_more').length) {
        $j('.toolbar-item').each(function (index) {
            if ($j(this).text().indexOf("Workflow") >= 0) {
                $j(this).find('li.aui-list-item').each(function (index2) {
                    $j('ul#opsbar-opsbar-transitions').append("<li class='toolbar-item'><a id=" + $j(this).children().attr('id') + "' class='toolbar-trigger issueaction-workflow-transition' href=" + $j(this).children().attr('href') + "><span class='trigger-label'>" + $j(this).text() + "</span></a></li>");
                      });
               $j(this).remove();
          }

         });
}
      }

    }

function updateExtraFieldsJira8(){
               $j('.ghx-issue-content').each(function (index) {
                  if ($j(this).find('div.ghx-row').next().length) {
                      $j(this).find($("[class*='ghx-plan-extra-fields']")).insertAfter($j(this).find('div.ghx-summary'));
                      }
            });

 }

function updateEpicColorsJira8(){
         if (colorize_epic_panel) {
              $j('div.ghx-inner').each(function (index) {
                var epic_string = $j(this).parent().css("border-right");
                var epic_color = epic_string.substring(epic_string.lastIndexOf( "rgb" ), epic_string.length );
                  if(epic_color.indexOf('a') == -1){
                    var colorstart = epic_color.replace(')', ', 0)').replace('rgb', 'rgba');
                    var colorstop = epic_color.replace(')', ', 1)').replace('rgb', 'rgba');
                    // compute gradient and set to the current object
                    $j(this).css({ "background": "linear-gradient(to right, " + colorstart + " 50%, " + colorstop + ")"});
                   }
            });
          }
 }

function updateExtraFieldsJira7(){
         $j('.ghx-plan-extra-fields').each(function (index) {
                if ($j(this).find('span.ghx-end.ghx-extra-field-estimate').length) {
                    $j(this).find('.ghx-extra-field').prependTo($j(this).find('span.ghx-end.ghx-extra-field-estimate'));
                    $j(this).find('span.ghx-end.ghx-extra-field-estimate').unwrap();
                }
                  else {
                     $j(this).find('.ghx-extra-field').prependTo($j(this).prev());
                }
            });
 }


function UpdateDOMPage(){
    try{
        doing_modifications=true;

        if ((removeUbiToolbar)) {
        $j("#dw-sm-verticalManaBarContainer").remove();
        $j("#dw-sm-loadingOverlay ").remove();
        $j('body').attr('style', 'padding-left: 0px !important');
        //console.log($j("body").css('padding-left'));
        }


        $j('span.jira-issue-status-lozenge').each(function(index) {
            if ($j(this).text() == 'Suspended' || $j(this).text() == 'Waiting For' || $j(this).text() == 'Need More Info' )
                $j(this).css({'background':'red','color':'white'});
        });

        if ((add_extra_fields)) {
            switch (JIRAversion) {
                case '7' :
                    updateExtraFieldsJira7()
                    break;
                 case '8' :
                    updateExtraFieldsJira8()
                    updateEpicColorsJira8()
                    if (reduce_height){
                        $j('div.ghx-row').css({"margin" : "2px"});
                        }
                    break;
                 default :
                    console.log("ERROR WHILE DETECTING JIRA VERSION = " + JIRAversion);
                    }

            $j('.ghx-issue-content').each(function (index) {

               if (( ! $j(this).find('.ghx-extra-field-content').hasClass('aui-label ghx-label ghx-label-10')) && ( ! $j(this).find('.ghx-extra-field-content').hasClass('aui-lozenge') )) {
                    $j(this).find('.ghx-extra-field').each(function() {

                        // Replace print glitch for field Last Public Comment.
                        if ($j(this).text().indexOf('<!--') >= 0) {
                                var newString = $j(this).html().substring($j(this).html().lastIndexOf( "--&gt;" ) +6, $j(this).html().length );
                                $j(this).html('<span class="ghx-extra-field-content">' + newString + '</span>');
                             }

                        switch ($j(this).text()) {
                            case 'None' :
                                $j(this).remove();
                                break;
                            case 'Reopened' :
                            case 'To Do' :
                            case 'Open' :
                            case 'Submitted' :
                            case 'Need Approval' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-blue-gray jira-issue-status-lozenge-new aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            case 'In Progress':
                            case 'In Design':
                            case 'In Review' :
                            case 'Work Completed' :
                            case 'In Development' :
                            case 'In Dev Test' :
                            case 'QC test Request' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            case 'Need More Info':
                            case 'Waiting For':
                            case 'Blocked':
                            case 'Suspended' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                $j(this).find('.ghx-extra-field-content').css({'background':'red','color':'white'});
                                break;
                            case 'Closed':
                            case 'Done':
                            case 'Resolved' :
                            case 'Verified' :
                            case 'Could Not Verified' :
                            case 'Rejected':
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-green jira-issue-status-lozenge-done aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            default :
                                $j(this).find('.ghx-extra-field-content').toggleClass("aui-label ghx-label ghx-label-10");
                                break;
                        }
                        $j(this).find('.ghx-extra-field-content').css('margin-right','5px');

                    });
                }

            });

            $j('.ghx-extra-field-seperator').remove();
            $j('.ghx-issue-compact .ghx-row').css('height', 'auto');
            $j('span.ghx-extra-field-content.aui-label.ghx-label.ghx-label-10').css({"background-color": "#fff", "border-color" : "#c1c7d0", "color" : "#42526e", "border ": "1px solid #dfe1e6", "border-radius" : "3px", "font-weight" : "bold", "padding" : "1px 2px"});

            //Kanban WIP add more warnings...
            $j('.ghx-column-headers .ghx-column.ghx-busted-max').css({"color" : "#FFFFFF","font-weight" : "bold","background" : "#d04437", "border-bottom-color" : "#d04437", "padding-left" : "10px"});
            $j('.ghx-column-headers .ghx-column.ghx-busted-max h2').css({"color" : "#FFFFFF"});
            $j('.ghx-column-headers .ghx-column.ghx-busted-max div.ghx-qty').css({"text-shadow" : "2px 2px 3px #000000"});
            $j('.ghx-column-headers .ghx-constraint.ghx-busted').css({"color" : "#000000", "font-style" : "italic"});

            $j('.ghx-column-headers .ghx-column.ghx-busted-min').css({"color" : "#FFFFFF","font-weight" : "bold", "background" : "#f6c342", "border-bottom-color" : "#f6c342", "padding-left" : "10px"});
            $j('.ghx-column-headers .ghx-column.ghx-busted-min h2').css({"color" : "#FFFFFF"});
            $j('.ghx-column-headers .ghx-column.ghx-busted-min div.ghx-qty').css({"text-shadow" : "2px 2px 3px #000000"});
        }

        if (colorize_issues) {
            $j('.js-issue').each(function (index) {
                var color = $j(this).find('.ghx-grabber').css("background-color");
                //check that is not already a 'rgba'
                if(color.indexOf('a') == -1){
                    var colorstart = color.replace(')', ', 0)').replace('rgb', 'rgba');
                    var colorstop = color.replace(')', ', 1)').replace('rgb', 'rgba');
                    // compute gradient and set to the current object
                    if (! $j(this).find('.ghx-flag').length) {
                        $j(this).find('.ghx-issue-content').css({ "background": "linear-gradient(to left, " + colorstart + " 75%, " + colorstop + ")"});
                        //$j(this).prev().css({ "background": "linear-gradient(to left, " + colorstart + " 75%, " + colorstop + ")"});
                    }
                    if (remove_type_icon) {
                        $j(this).find('.ghx-type').remove();
                    }
                }
            });
        }
    } catch (exception) {
        doing_modifications=false;
        console.log("Error found on the page :" + exception);
    }
    doing_modifications=false;
}
