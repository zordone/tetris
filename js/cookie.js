// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// cookie manager singleton
define([], function () {

    "use strict";

    // private
    var cookie = {},
        values = {},
        // functions
        save, load;

    // save current values to the cookie
    save = function () {
        var expdate = new Date(),
            expires;
        expdate.setDate(expdate.getDate() + 100 * 365);
        expires = "; expires=" + expdate.toUTCString();
        Object.keys(values).forEach(function (name) {
            document.cookie = name + "=" + values[name] + expires;
        });
    };

    // load values from the cookie
    load = function () {
        var list = document.cookie.split(";"),
            parts, name, value;
        list.forEach(function (item) {
            parts = item.split("=");
            if (parts.length === 2) {
                name  = parts[0].trim();
                value = parts[1].trim();
                values[name] = value;
            }
        });
    };

    // set a value
    cookie.set = function (name, value) {
        if (values[name] !== value) {
            values[name] = value;
            save();
        }
    };

    // get a value
    cookie.get = function (name, defaultValue) {
        if (Object.keys(values).length === 0) {
            load();
        }
        if (values[name] === undefined && defaultValue !== undefined) {
            values[name] = defaultValue;
        }
        return values[name];
    };

    // return cookie object
    return cookie;

});
