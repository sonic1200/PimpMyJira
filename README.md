# PimpMyJira! UserScript for GreaseMonkey and TamperMonkey
**Author:** Nicolas Mivielle

Provide enhancement on JIRA RapidBoards.

![Pimp My Jira logo](https://github.com/sonic1200/PimpMyJira/raw/master/PimpMyJira_new2.png)

Provide enhancement on JIRA RapidBoards.

Feel free to contribute by sending PRs or forking it :-)

# How To Install

Please folow the Install Guide which is available here : ['install'](https://github.com/sonic1200/PimpMyJira/blob/master/INSTALL.md)

<a href="https://raw.githubusercontent.com/sonic1200/PimpMyJira/master/PimpMyJira.js">Click to install script PimpMyJira</a>
<small>(A userscript engine, like Tampermonkey, is required.)</small>

# Usage

- Be sure to have the extension 'GreaseMonkey' for Firefox or 'TamperMonkey' for Chrome
- Install or Copy the PimpMyJira.js userscript into the browser extension
- Go browsing on your JIRA instance.
- For adding extra fields, on your Board Configuration, in the section ['Card Layout'](https://confluence.atlassian.com/agile/jira-agile-user-s-guide/configuring-a-board/customising-cards#CustomisingCards-fieldsAddingfieldstocards), activate all the extra fields that you want.
- For configuring Jira card colors, on your Board Configuration, change the colors for each type in the section ['Card colors'](https://confluence.atlassian.com/agile067/jira-agile-user-s-guide/configuring-a-board/customising-cards).
- You can activate or deactivate PimpMyJira! features in the 'configuration section' of the UserScript.

# Screenshot of current features
**Kanban View :**
![Kanban Board](https://github.com/sonic1200/PimpMyJira/raw/master/screen1.png)

**Backlog View :**
![Backlog Board](https://github.com/sonic1200/PimpMyJira/raw/master/screen2.png)

# Versions
- **Version 4.0** : Stable support for JIRA 8. Extra field placement is now correctly set. Still a known issue with colors not updated correctly (missing refresh event will be added in a future update). Add NEW feature to add color on the Epics button in the Epic panel in backlog view (use the color set from the Epic panel). Reduced height of all lines in backlog view to add more lines on screen (can be switched to OFF in the configuration section of the script). Small cleanup of unused functions.
- **Version 3.9** : Add preliminary support for JIRA 8. New function to detect Jira version and apply correct script branch. Repair broken extra fields on JIRA 8 - WORK IN PROGRESS - NEED MORE WORK but functionnal. **Known issue** : line colorization is not correctly updated in backlog and sprint view. Partial update. Need to rework this script section. Some code cleanup - Prepare for version 4.0 !
		    
- **Version 3.3** : Add new feature to expand all the possible workflow action (transitions) from the current status in the issue Jira page. You can add background color to that action buttons to add action categorization (like lozenge color code into Jira).

- **Version 3.0** : New code architecture and refactoring for better DOM change detection that only trigger when needed. This should use less CPU and need less refresh on the page (rewrite page only when needed).
					New feature with extra fields configuration : From now, if you choose to add statuses as an extra field in your board configuration, all common JIRA statuses are automatically detected and properly labelled moreover all common blocking statuses are colored in RED. Statuses list will be configurable in a future version.
                    Here is the list of the current supported statuses : Reopened, Open, In Progress, Need More Info (flagged in red), In Review, Waiting For (flagged in red), Suspended (flagged in red), Work Completed, Resolved, Closed, Rejected. If you need to add specific statuses, please ask for an update (see capture below).
                    New feature with Kanban boards to have a better visibility for columns that have busted their limits (max and min). Now the column color is extended to the header and the title of the header is tweaked for better warning visibility (see capture below).
                    Bugfix : No more 'None' Labels printed as extra fields. All 'None' data will be hidden automatically - 26-10-2017

- **Version 2.4** : Add compatibility with JIRA version 7 and JIRA in the cloud - 22-11-2016

- **Version 2.3** : Add new feature for changing 'extra-fields' colors with 'dirty blue' - 13-11-2016

- **Version 2.2** : internal compat - 17-10-2016

- **Version 2.1** : internal compat - 03-05-2016

- **Version 2.0** : New DOM detection change system. The modifications will be set as soon as the DOM is ready to be rendered. You no longer have to wait 2 seconds after the page has been loaded.
                    New feature which add issue type color on each line of issue in all boards views. You can configure the printed color by using the 'Board Configuration' under the section 'Card colors'. The issue type icon could be disabled too.
                    Added 'Configuration Section' in the PimpMyJira! UserScript in order to activate or deactivate features. - 18-03-2016

- **Version 1.1** : Fix compatibility with new Jira 6.4.x SideBar for refreshing content - 26-02-2016

- **Version 1.0** : Initial revision of 'PimpMyJira' - 10-02-2016


# Features

PimpMyJira! support the following features :

- Add one or multiples extra fields as a 'fancy' label in the Backlog and Work view for Agile boards. You can by example add 'Components' and 'Due Date' field for a better visibility on your project management.
- Multiples entry for the same field are parsed and will be screened like this : "entry1, entry2, etc..."
- You can configure which field you want by using the JIRA board configure screen, in the section ['Card Layout'](https://confluence.atlassian.com/agile/jira-agile-user-s-guide/configuring-a-board/customising-cards#CustomisingCards-fieldsAddingfieldstocards)
- Tooltip support on MouseOver for each label for full description and type of field.
- You can expand card color on the Board view for a better visibility of each issue types.
- The color for each issue types can be configured directly in the Board configuration, in section ['Card colors'](https://confluence.atlassian.com/agile067/jira-agile-user-s-guide/configuring-a-board/customising-cards).
- You are able to remove the issue type icon in order to gain some space on the card and if it's redondant with the card color for you.
- Flagged issues will stay in Yellow. Issue color will not override the flag color.
- Most common Statuses added as extra field are now automaticaly detected and formatted like JIRA status lozenge. Blocking statuses are put in red for better visibility ('Need More Info',  'Waiting For' and 'Suspended').
- Kanban boards are optimized to have a better visibility on columns that have their limits busted (max or min). The header of the columns are now colored in red or yellow depending of the limit. Titles are also tweaked to get better warning informations.
- Remove the 'Workflow' dropdown button and expand all the possible workflows steps from the current status directly in the operation toolbar as separate buttons. Bonus : you can add background button color to differentiate action workflow.
- You can activate or deactivate all features by using the configuration section in the UserScript.
 - colorize_issue = true : Activate the card colorization in JIRA boards.
 - remove_type_icon = true : Remove the issue type icon on each JIRA cards.
 - add_extra_fields = true : Add configured extra-fields (like labels, components,…) directly near the EPIC in each JIRan card.
 - update_action_toolbar = true : Activate the expansion of unique action workflow button in toolbar and remove the 'More Workflows' button.
 - colorize_action_toolbar = true : If 'update_action_toolbar' is used, will activate the background color for each workflow action button. (not really configurable yet)


# Future

- ~~Remove the 'timer' for parsing the DOM and find a way to bind to the success to the last Ajax call to render the new DOM.~~ (DONE in v2.0)
- The userscript should be compatible with 'native' Google Chrome user script system. (without using TamperMonkey)
- Be able to add different color on each components randomly.
- Retreive the list of components for a project and give color attribute which is unique for each.
- Adding multiple fields will use different colors.
- Statuses list detection will be configurable in a future version

## Note on PimpMyJira

This tool is provided as is and will not be maintained... or maybe... but no confidence!
You can also contribute to this userscript by sending your pull request.
PimpMyJira has been tested from Firefox 43.0.4 - 44.0 to latest and Chrome 39.0.2171.71 to latest
