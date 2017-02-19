# Picobrew Control Program Persistence

A UserScript that allows for saving/loading programs for the Picobrew Zymatic's "Advanced Recipe Control Program Editor".

The UserScript just adds a little widget to the side of the 'Advanced Recipe Editor' that allows you to save and load the profiles that the editor creates - independent of the recipes themselves.

![http://i.imgur.com/PvfwjGk.png](http://i.imgur.com/PvfwjGk.png)


###### Installing


- First install either [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) (if using Chrome) or [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) (if using Firefox).
- Then install the script by visiting [this link](https://github.com/toddq/picobrew_control_program_persistence/raw/master/picobrew_control_program_persistence.user.js) and clicking 'Install'.


###### Using

- The first time you load the Picobrew Advanced Editor after installing this, it will attempt to determine your user id to use for saving programs.  If it's unable to determine this (they've recently made this hard to glean) it will prompt you for one.  Please enter something unique to you (if prompted).
- Adjust your Advanced settings the way you want them to be, enter a name to save it as in the 'Control Program Name' box (if it's new) and click save.
- **MAKE SURE TO ALSO CLICK SAVE AT THE BOTTOM OF THE PAGE**
- Saving the control programs as a set of re-usable steps and saving it to the recipe are two separate steps.  The standard saving functionality has not been altered in any way.
- Next time you make changes to your recipe in the standard recipe editor and are bummed because it then deleted the custom advanced settings that you configured, you can now find it in the 'Saved Programs' list, click load, then **click save at the bottom of the page** to save it back to the recipe again.

