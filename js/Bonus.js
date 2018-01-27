// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// line display object for bonuses
define([], function () {

    "use strict";

    // return constructor
    return function (parentDiv) {

        // private
        var parent = $(parentDiv),
            // settings
            lineH = 30,
            times = { change: 400, show: 1000, fade: 10000 },
            fades = [],
            fadeInterval = null,
            // functions
            onTimer, slowFade;

        // fade timer
        onTimer = function () {
            var newFade = [],
                fI, fade;
            for (fI = 0; fI < fades.length; fI++) {
                fade = fades[fI];
                fade.opacity = Math.max(0, fade.opacity - 0.02);
                fade.div.css("opacity", fade.opacity);
                if (fade.opacity > 0) {
                    newFade.push(fade);
                } else {
                    fade.div.remove();
                }
            }
            fades = newFade;
            if (fades.length === 0) {
                window.clearInterval(fadeInterval);
                fadeInterval = null;
            }
        };

        // long fade out (because jquery animate is really slow for that)
        // also this is using a single timer for multiple divs
        slowFade = function (div) {
            fades.push({ opacity: 1, div: div });
            if (fadeInterval === null) {
                fadeInterval = window.setInterval(onTimer, 200);
            }
        };

        // add new line
        this.add = function (message) {
            var next = $("<div>")
                .text(message)
                .css({
                    width: "100%",
                    position: "relative",
                    opacity: 0,
                    top: -lineH,
                    height: 0
                });
            parent.prepend(next);
            next.animate({ height: lineH }, times.change, function () {
                next.css("top", -lineH)
                    .animate({
                        top: 0,
                        opacity: 1
                    }, times.change, function () {
                        window.setTimeout(function () {
                            slowFade(next);
                        }, times.show);
                    });
            });
        };

        // init
        parent.css("overflow", "hidden").empty();
    };

});
