// ==UserScript==
// @name        Pimp My Jira!
// @description Enhances RapidBoard in Jira
// @author       Nicolas Mivielle
// @copyright    2016+, Nicolas Mivielle
// @include     https://*/secure/RapidBoard.jspa*
// @match        https://*/secure/RapidBoard.jspa*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @version     3.0
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

//CSS statuses colors
var blue = ".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-blue-gray jira-issue-status-lozenge-new aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium";
var yellow = ".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium";
var green = ".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-green jira-issue-status-lozenge-done aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium";
var flag = "{'background':'red','color':'white'}";

//Dictionnary for all mapped statuses
var statuses = { 'Reopened': blue,
                'Open' : blue,
                'In Progress' : yellow,
                'Need More Info' : [yellow,flag],
                'In Review' : yellow,
                'Waiting For' : [yellow,flag],
                'Suspended' : [yellow,flag],
                'Work Completed' : yellow,
                'Resolved' : green,
                'Closed' : green,
                'Rejected' : green
               };


// ====================================================================
//            END OF CONFIGURATION SECTION
//=====================================================================


// initialize modification flag :
var doing_modifications=false;

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
  
  $j( "body" ).bind("DOMSubtreeModified", function(){
    if (timer)
      window.clearTimeout(timer);
    
    if(! doing_modifications) {
        timer = window.setTimeout(function() {
            updateExtraFields();
            //initvar();
            //resizablePanel();
        }, 100);
    }
    });
});

//FUNCTION TO RESIZE RIGHT PANEL
function initvar(){
    var stateMouseDown = false;
    var mouseStartX = 0;
    var jiraStartWidth, jiraHeaderWidth;
    var currentStylesheet;
    var dragBar = document.getElementById("ghx-detail-head");
    var detailView = document.getElementById("ghx-detail-view");
    var headerGroup = document.getElementById("ghx-column-header-group");
    var controlGroup = document.getElementById("ghx-detail-head");
    var dragElem = tmpElem.childNodes[0];
}

function startJiraDrag (ev) {
        if (currentStylesheet){
            document.body.removeChild(currentStylesheet);
        }
        stateMouseDown = true;
        mouseStartX = ev.pageX;
        jiraStartWidth = detailView.clientWidth;
        jiraHeaderWidth = headerGroup.clientWidth;
        document.addEventListener ("mousemove" , continueJiraDrag , false);
        document.addEventListener ("mouseup" , endJiraDrag , false);
}
function continueJiraDrag (ev){
        var pX = ev.pageX;
        detailView.style.width = (jiraStartWidth + mouseStartX - pX) + "px";
        headerGroup.style.width = (jiraHeaderWidth - mouseStartX + pX) + "px";
}
function endJiraDrag () {
        currentStylesheet = document.createElement('style');
        currentStylesheet.innerHTML = '#ghx-detail-view{ width: ' + detailView.style.width + ' !important;}';
        document.body.insertBefore(currentStylesheet, document.body.childNodes[0]);
        localStorage.setItem('jiraWidth',detailView.style.width);
        document.removeEventListener ("mousemove" , continueJiraDrag , false);
        document.removeEventListener ("mouseup" , endJiraDrag , false);
}

function resizablePanel(){
    var tmpElem = document.createElement('div');
    tmpElem.innerHTML = '<span style="display: block;" id="js-sizer" class="ghx-sizer ui-resizable-handle ui-resizable-w" data-tooltip="Resize Detail View" original-title=""><span class="ghx-icon ghx-icon-sizer"></span></span>';
    controlGroup.insertBefore(dragElem,controlGroup.childNodes[0]);
    var currentWidth = localStorage.getItem('jiraWidth') || '400px';currentStylesheet = document.createElement('style');
    currentStylesheet.innerHTML = '#ghx-detail-view{ width: ' + currentWidth + ' !important;}';
    document.body.insertBefore(currentStylesheet, document.body.childNodes[0]);
    dragBar.addEventListener ("mousedown" , startJiraDrag , false);
}

function updateExtraFields(){
    try{
        doing_modifications=true;
        if ((add_extra_fields)) {
            
              $j('.ghx-plan-extra-fields').each(function (index) {
                if ($j(this).find('span.ghx-end.ghx-extra-field-estimate').length) {
                    $j(this).find('.ghx-extra-field').prependTo($j(this).find('span.ghx-end.ghx-extra-field-estimate'));
                    $j(this).find('span.ghx-end.ghx-extra-field-estimate').unwrap();
                }
                  else {
                     $j(this).find('.ghx-extra-field').prependTo($j(this).prev());
                }
            });
            
            $j('.ghx-issue-content').each(function (index) {
                
               if (( ! $j(this).find('.ghx-extra-field-content').hasClass('aui-label ghx-label ghx-label-10')) && ( ! $j(this).find('.ghx-extra-field-content').hasClass('aui-lozenge') )) {
                    $j(this).find('.ghx-extra-field').each(function() {

                        switch ($j(this).text()) {
                            case 'None' :
                                $j(this).remove();
                                break;
                            case 'Reopened' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-blue-gray jira-issue-status-lozenge-new aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            case 'Open' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-blue-gray jira-issue-status-lozenge-new aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            case 'In Progress' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            case 'Need More Info' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                $j(this).find('.ghx-extra-field-content').css({'background':'red','color':'white'});
                                break;
                            case 'In Review' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            case 'Waiting For' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                $j(this).find('.ghx-extra-field-content').css({'background':'red','color':'white'});
                                break;
                            case 'Suspended' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                $j(this).find('.ghx-extra-field-content').css({'background':'red','color':'white'});
                                break;
                            case 'Work Completed' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            case 'Resolved' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-green jira-issue-status-lozenge-done aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            case 'Closed' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-green jira-issue-status-lozenge-done aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            case 'Rejected' :
                                $j(this).find('.ghx-extra-field-content').toggleClass(".jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-green jira-issue-status-lozenge-done aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium");
                                break;
                            default :
                                $j(this).find('.ghx-extra-field-content').toggleClass("aui-label ghx-label ghx-label-10");
                                break;
                        }

                    });
                }
                
            });
                
            $j('.ghx-extra-field-seperator').remove();
            $j('.ghx-issue-compact .ghx-row').css('height', 'auto');
            $j('span.ghx-extra-field-content.aui-label.ghx-label.ghx-label-10').css('background', '#add');
            $j('span.ghx-extra-field-content.aui-label.ghx-label.ghx-label-10').css('color', '#000000');
            $j('span.ghx-extra-field-content.aui-label.ghx-label.ghx-label-10').css('margin-left', '5px');

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
