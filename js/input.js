// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// keyboard handling
define(["config"], function (config) {

    "use strict";

    // private
    var input = {},
        keyNames = {},
        realDowns = {},
        // functions
        setKey, onKeyDown, onKeyUp, init;

    // increase / decrease / reset key counter
    setKey = function (keyCode, increase) {
        var name = keyNames[keyCode];
        if (name !== undefined) {
            if (input[name] === undefined || increase === 0) {
                input[name] = increase;
            } else {
                input[name] = Math.max(0, input[name] + increase);
            }
        }
    };

    // keydown event handler
    onKeyDown = function (event) {
        if (keyNames[event.keyCode] === undefined) { return; }
        if (realDowns[event.keyCode] !== true) {
            realDowns[event.keyCode] = true;
            setKey(event.keyCode, +1);
        }
    };

    // keyup event handler
    onKeyUp = function (event) {
        if (keyNames[event.keyCode] === undefined) { return; }
        if (realDowns[event.keyCode] === true) {
            realDowns[event.keyCode] = false;
            if (config.keys[keyNames[event.keyCode]].repeat) {
                setKey(event.keyCode, -1);
            }
        }
    };

    // after the client processed the current keys, calls this to reset non-repeatable keys
    input.next = function () {
        var keys, kI, keyData;
        keys = Object.keys(config.keys);
        for (kI = 0; kI < keys.length; kI++) {
            keyData = config.keys[keys[kI]];
            if (!keyData.repeat) {
                setKey(keyData.code, -1);
            }
        }
    };

    // is there any keys to process?
    input.hasKeys = function () {
        return Object.keys(keyNames).some(function (code) {
            return input[keyNames[code]] > 0;
        });
    };

    // init key variables and event handlers
    init = function () {
        var code, names, nI, name;
        names = Object.keys(config.keys);
        for (nI = 0; nI < names.length; nI++) {
            name = names[nI];
            code = config.keys[name].code;
            keyNames[code] = name;
            input[name] = 0;
        }
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
    };

    init();

    // return singleton
    return input;

});
