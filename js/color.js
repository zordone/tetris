// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// color manager singleton
define(["config"], function (config) {

    "use strict";

    // private
    var color = {},
        colors = config.colors,
        // functions
        getGroupItem, hex, rgbParse, rgbShade, preCalcPart, preCalcColor, init;

    // enums
    color.groups = { PILE: "pile", BRICK: "bricks" };
    color.parts  = { FILL: "fill", STROKE: "stroke" };
    color.shades = { FRONT: "front", UPDOWN: "updown", LEFTRIGHT: "leftright" };

    // get color item (standalone or from a group)
    getGroupItem = function (group, index) {
        var item = colors[group];
        if (group === color.groups.BRICK) { item = item[index]; }
        return item;
    };

    // get a specific color
    color.get = function (group, index, part, shade) {
        var item = getGroupItem(group, index);
        return item[part][shade];
    };

    // convert decimal to 2 digit hexadecimal
    hex = function (num) {
        var res = num.toString(16);
        return (res.length === 1 ? "0" : "") + res;
    };

    // parse html color code to rgb color
    rgbParse = function (html) {
        return [
            parseInt(html.substring(1, 3), 16),
            parseInt(html.substring(3, 5), 16),
            parseInt(html.substring(5, 7), 16)
        ];
    };

    // adjust brightness of an rgb color
    rgbShade = function (rgb, ratio) {
        var shaded = [], cI;
        for (cI = 0; cI < 3; cI++) {
            shaded[cI] = Math.round(rgb[cI] * ratio);
        }
        return shaded;
    };

    // precalculate shades of a part
    preCalcPart = function (item, part) {
        var calc = {},
            rbgBase = rgbParse(item[part]),
            shades, sI, shade;
        shades = Object.keys(color.shades);
        for (sI = 0; sI < shades.length; sI++) {
            shade = color.shades[shades[sI]];
            calc[shade] = "#" + rgbShade(rbgBase, colors.shades[shade]).map(hex).join("");
        }
        item[part] = calc;
    };

    // precalculate parts of a color
    preCalcColor = function (group, index) {
        var item = getGroupItem(group, index);
        preCalcPart(item, color.parts.FILL);
        preCalcPart(item, color.parts.STROKE);
    };

    // precalculate all colors
    init = function () {
        var gI, group;
        group = colors[color.groups.BRICK];
        preCalcColor(color.groups.PILE, null);
        for (gI = 0; gI < group.length; gI++) {
            preCalcColor(color.groups.BRICK, gI);
        }
    };

    init();

    // return singleton
    return color;

});
