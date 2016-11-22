# PimpMyJira! UserScript for GreaseMonkey and TamperMonkey
**Author:** Nicolas Mivielle

Provide enhancement on JIRA RapidBoards.

![Pimp My Jira logo](https://github.com/sonic1200/PimpMyJira/raw/master/PimpMyJira_new2.png)

# Usage

- Be sure to have the extension 'GreaseMonkey' for Firefox or 'TamperMonkey' for Chrome
- Install or Copy the PimpMyJira.js userscript into the browser extension
- Go browsing on JIRA.
- For adding extra fields, on your Board Configuration, in the section ['Card Layout'](https://confluence.atlassian.com/agile/jira-agile-user-s-guide/configuring-a-board/customising-cards#CustomisingCards-fieldsAddingfieldstocards), activate all the extra fields that you want.
- For configuring Jira card colors, on your Board Configuration, change the colors for each type in the section ['Card colors'](https://confluence.atlassian.com/agile067/jira-agile-user-s-guide/configuring-a-board/customising-cards).
- You can activate or deactivate PimpMyJira! features in the 'configuration section' of the UserScript.


# Versions
- **Version 2.4** : Add compatibility with JIRA version 7 and JIRA in the cloud - 22-11-2016

- **Version 2.3** : Add new feature for changing 'extra-fields' colors with 'dirty blue' - 13-11-2016

- **Version 2.2** : internal fixes - 17-10-2016

- **Version 2.1** : internal fixes - 03-05-2016

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
- You can activate or deactivate all features by using the configuration section in the UserScript.
 - colorize_issue = true : Activate the card colorization in JIRA boards.
 - remove_type_icon = true : Remove the issue type icon on each JIRA cards.
 - add_extra_fields= true : Add configured extra-fields (like labels, components,…) directly near the EPIC in each JIRan card.


# How To Install

Please folow the Install Guide which is available here : [Installation Guide](INSTALL.md)

# Future

- ~~Remove the 'timer' for parsing the DOM and find a way to bind to the success to the last Ajax call to render the new DOM.~~ (DONE in v2.0)
- The userscript should be compatible with 'native' Google Chrome user script system. (without using TamperMonkey)
- Be able to add different color on each components randomly.
- Retreive the list of components for a project and give color attribute which is unique for each.
- Adding multiple fields will use different colors

## Note on PimpMyJira

This tool is provided as is and wil be maintained as far as possible.
You can also contribute to this userscript by sending your pull request.
PimpMyJira has been tested on Firefox 43.0.4 - 44.0 and Chrome 39.0.2171.71

