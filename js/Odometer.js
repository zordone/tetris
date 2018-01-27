// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// odometer style output
define([], function () {

    "use strict";

    // return constructor
    return function (parentDiv, digits) {

        // private
        var self = this,
            parent = $(parentDiv),
            main = null,
            elems = [],
            colsAndDigits,
            valueNum = 0,
            valueStr = "",
            digitH = 30,
            spacingW = 1,
            thousandW = 7,
            changeTime = 400,
            // functions
            createDiv, createSep, createCol, createDigit, init, makeHider;

        // create a basic div
        createDiv = function (parent, className) {
            var div = $("<div>");
            if (className) { div.addClass(className); }
            parent.append(div);
            return div;
        };

        // create a separator div
        createSep = function (parent, w, h) {
            return createDiv(parent, null)
                .css({
                    width: w,
                    height: h,
                    float: "left"
                });
        };

        // create a column div
        createCol = function (parent, w, h) {
            return createDiv(parent, "odoCol")
                .css({
                    width: w,
                    height: h,
                    float: "left",
                    overflow: "hidden",
                    borderWidth: 1
                });
        };

        // create a digit div
        createDigit = function (parent, w, h) {
            return createDiv(parent, "odoDigit")
                .text("0")
                .css({
                    width: w,
                    height: h,
                    padding: 0,
                    borderWidth: 0,
                    borderBottomWidth: 1,
                    lineHeight: h + "px", // this needs the "px", or else the text won't be affected by the offset
                    position: "relative",
                    top: -h - 1
                });
        };

        // make a complete callback function for a digit
        makeHider = function (col, digit, newDigit) {
            return function () {
                digit.text(newDigit);
                col.css({ top: -digitH - 1 });
            };
        };

        // set new value
        this.set = function (newValue) {
            var str, dI, oldDigit, newDigit, elem;
            // ignore repeated calls
            if (newValue === valueNum) { return; }
            // left padded string
            str = String(newValue);
            while (str.length < digits) { str = "0" + str; }
            // animate digit change
            for (dI = 0; dI < digits; dI++) {
                oldDigit = valueStr[dI];
                newDigit = str[dI];
                if (oldDigit !== newDigit) {
                    elem = elems[dI];
                    elem.temp.text(newDigit);
                    elem.col.animate({ top: -1 }, changeTime, makeHider(elem.col, elem.digit, newDigit));
                }
            }
            valueStr = str;
            valueNum = newValue;
        };

        // reset value to zero
        this.reset = function() {
            var dI;
            valueStr = "";
            valueNum = 0;
            for (dI = 0; dI < digits; dI++) {
                elems[dI].digit.text("0");
                valueStr += "0";
            }
        };

        // resize
        this.resize = function() {
            var thoCount   = Math.floor((digits - 1) / 3),
                spaCount   = digits - 1 - thoCount,
                spaAndThoW = spaCount * spacingW + thoCount * thousandW,
                parentW    = parent.parent().width(),
                digitW     = Math.floor((parentW - spaAndThoW) / digits),
                usedW      = digits * digitW + spaAndThoW;
            // resize and center
            parent.css({ marginLeft: (parentW - usedW) / 2 });
            colsAndDigits.width(digitW - 2);
        };

        // init the odometer
        init = function () {
            var dI, colDiv, digit, temp;
            // init parent
            parent
                .empty()
                .addClass("odoMain")
                .css({ height: digitH + 2 });
            // create digits
            valueStr = "";
            valueNum = 0;
            for (dI = 0; dI < digits; dI++) {
                if (dI > 0 && (digits - dI) % 3 === 0) {
                    createSep(parent, thousandW, digitH);
                } else if (dI > 0) {
                    createSep(parent, spacingW, digitH);
                }
                colDiv = createCol(parent,  1, digitH);
                temp  = createDigit(colDiv, 1, digitH);
                digit = createDigit(colDiv, 1, digitH);
                valueStr += "0";
                // cache elements
                elems[dI] = {
                    col:   $([digit[0], temp[0]]),
                    digit: digit,
                    temp:  temp
                };
            }
            parent.append(main);
            colsAndDigits = parent.find(".odoCol, .odoDigit");
            self.resize();
        };

        init();
    };

});
