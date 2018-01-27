// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// settings controller singleton
define(["config", "cookie"], function (config, cookie) {

    "use strict";

    // private
    var settings = {},
        parentDiv,
        titleWidth = 180,
        onChanged = null,
        // functions
        createSetting, makeOnClick, refreshButtons;

    // refresh button on/off styles based on current setting values
    refreshButtons = function () {
        var settingNames, snI, settingName, setting,
            itemNames, inI, itemName, item;
        // remove on/off classes
        $(".setBtn")
            .removeClass("setBtnOn")
            .removeClass("setBtnOff");
        // assign new classes
        settingNames = Object.keys(config.settings);
        for (snI = 0; snI < settingNames.length; snI++) {
            settingName = settingNames[snI];
            setting = config.settings[settingName];
            itemNames = Object.keys(setting.items);
            for (inI = 0; inI < itemNames.length; inI++) {
                itemName = itemNames[inI];
                item = setting.items[itemName];
                setting.buttons[itemName].addClass(setting.selected === itemName ? "setBtnOn" : "setBtnOff");
            }
        }
    };

    // get the current value for a setting
    settings.get = function (name) {
        var setting = config.settings[name];
        return setting.items[setting.selected];
    };

    // save changes
    settings.save = function () {
        var names, nI, name, setting,
            modified = false;
        names = Object.keys(config.settings);
        for (nI = 0; nI < names.length; nI++) {
            name = names[nI];
            setting = config.settings[name];
            if (setting.selected !== setting.newSelected) {
                setting.selected = setting.newSelected;
                cookie.set(name, setting.selected);
                modified = true;
            }
        }
        if (modified && onChanged) { onChanged(); }
    };

    // cancel changes
    settings.cancel = function () {
        var names, nI, name, setting;
        names = Object.keys(config.settings);
        for (nI = 0; nI < names.length; nI++) {
            name = names[nI];
            setting = config.settings[name];
            setting.newSelected = setting.selected;
        }
        refreshButtons();
    };

    // creates an onclick handler for a setting button
    makeOnClick = function (setting, itemName, div, btn) {
        return function () {
            if (setting.newSelected !== itemName) {
                setting.newSelected = itemName;
                div.children(".setBtn").removeClass("setBtnOn").addClass("setBtnOff");
                btn.removeClass("setBtnOff").addClass("setBtnOn");
            }
        };
    };

    // creates the elements for one setting group
    createSetting = function (settingName, setting) {
        var div, titleDiv, setDiv, btn,
            names, nI, nLen, name, item, posClass;
        // parent div
        div = $("<div>");
        // label div
        titleDiv = $("<div>")
            .css({
                marginTop: 5,
                width: titleWidth,
                float: "left",
                clear: "both"
            })
            .text(settingName)
            .addClass("bigFont");
        // parent div for the buttons
        setDiv = $("<div>")
            .css("marginLeft", titleWidth);
        // loop over the settings
        names = Object.keys(setting.items);
        nLen = names.length;
        for (nI = 0; nI < nLen; nI++) {
            name = names[nI];
            item = setting.items[name];
            // position class
            if      (nI === 0)        { posClass = "setBtnFirst"; }
            else if (nI === nLen - 1) { posClass = "setBtnLast"; }
            else                      { posClass = "setBtnMid"; }
            // create button
            btn = $("<button>")
                .text(name)
                .css("width", 100 / nLen + "%")
                .addClass("setBtn")
                .addClass(posClass);
            setting.buttons[name] = btn;
            btn.click(makeOnClick(setting, name, setDiv, btn));
            setDiv.append(btn);
        }
        div.append(titleDiv).append(setDiv);
        parentDiv.append(div);
    };

    // init settings, based on config
    settings.init = function (divSelector, pOnChanged) {
        var names, nI, name, setting;
        parentDiv = $(divSelector);
        onChanged = pOnChanged;
        names = Object.keys(config.settings);
        for (nI = 0; nI < names.length; nI++) {
            name = names[nI];
            setting = config.settings[name];
            // cookie value
            setting.selected = cookie.get(name);
            // or default value
            if (!setting.selected) {
                setting.selected = setting.defaultName;
            }
            setting.newSelected = setting.selected;
            // buttons
            setting.buttons = {};
            createSetting(name, setting);
        }
        refreshButtons();
    };

    // return singleton
    return settings;

});
