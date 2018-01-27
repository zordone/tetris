// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// rectangle helper object
define([], function () {

    "use strict";

    // the Rect variable is representing a constructor, so the uppercase is justified
    //noinspection LocalVariableNamingConventionJS
    var Rect = function (x, y, w, h) {
        this.setWH(x, y, w, h);
    };
    
    // prototype methods

    // clone a rect
    Rect.prototype.clone = function () {
        return new Rect(this.x, this.y, this.w, this.h);
    };

    // set the rectangle by top-left and width-height
    Rect.prototype.setWH = function (x, y, w, h) {
        // top-left, width-height
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.w = Math.round(w);
        this.h = Math.round(h);
        // top-left, bottom-right
        this.x1 = this.x;
        this.y1 = this.y;
        this.x2 = this.x + this.w;
        this.y2 = this.y + this.h;
        // center
        this.cX = this.x + Math.round(this.w / 2);
        this.cY = this.y + Math.round(this.h / 2);
        return this;
    };

    // set the rectangle by top-left and bottom-right
    Rect.prototype.setABS = function (x1, y1, x2, y2) {
        return this.setWH(x1, y1, x2 - x1, y2 - y1);
    };

    // aplly an offset to the rect
    Rect.prototype.offset = function (offsetX, offsetY) {
        return this.setWH(this.x + offsetX, this.y + offsetY, this.w, this.h);
    };

    // tests if the rectangle covers a point
    Rect.prototype.isCovering = function (x, y) {
        return (this.x1 < x && x < this.x2 && this.y1 < y && y < this.y2);
    };

    // get points array
    Rect.prototype.pointsArray = function () {
        return [
            { x: this.x1, y: this.y1 },
            { x: this.x2, y: this.y1 },
            { x: this.x2, y: this.y2 },
            { x: this.x1, y: this.y2 }
        ];
    };

    // return constructor
    return Rect;

});
