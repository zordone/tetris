// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// main module
(function () {

    "use strict";

    requirejs.config({
        baseUrl: "js",
        paths: {
            jquery: "lib/jquery-1.10.2.min"
        },
        config: {
            waitSeconds: 30
        }
    });

    require(["jquery"], function ($) {
        // please wait
        var wait = $("#waitDiv");
        wait.css({
            left: (window.innerWidth  - wait.width())  / 2,
            top:  (window.innerHeight - wait.height()) / 2,
            opacity: 1
        });
        // start
        require(["tetris"], function (tetris) {
            $(function () {
                tetris.init();
            });
        });
    });

}());



