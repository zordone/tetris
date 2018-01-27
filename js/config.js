// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// configuration singleton
define([], function () {

    "use strict";

    // return config object
    return  {
        "speed": {
            "frames": 60,       // drawing frames per second
            "steps": 1.5,       // tetris steps per second
            "keys": 13.0        // input checks per second
        },

        "size": {
            "width": 12,        // tetris table columns
            "height": 22,       // tetris table rows
            "brick": 5          // brick size (n x n)
        },

        "style": {
            "margin": 10        // px
        },

        "keys": {                                           // keyboard controls
            "rotate": { "code": 38, "repeat": false },
            "left":   { "code": 37, "repeat": true  },
            "right":  { "code": 39, "repeat": true  },
            "down":   { "code": 40, "repeat": true  },
            "pause":  { "code": 80, "repeat": false }
        },

        "perspective": {                // perspectivic distortion
            "game": {                   // for game canvas
                "top":     0.02,
                "bottom": -0.035,
                "left":    0.08,
                "right":  -0.08
            },
            "next": {                   // for next canvas
                "top":    0.03,
                "bottom": 0.05,
                "left":  -0.06,
                "right": -0.18
            }
        },

        "bricks": [                     // brick definitions
            [                           // standard set
                [0,0,0,0,0],
                [0,0,1,0,0],
                [0,1,1,0,0],
                [0,0,1,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,1,1,1,1],
                [0,0,0,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,1,0,0,0],
                [0,1,1,0,0],
                [0,0,1,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,1,0,0],
                [0,1,1,0,0],
                [0,1,0,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,1,1,0,0],
                [0,1,1,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,0,1,0],
                [0,1,1,1,0],
                [0,0,0,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,1,1,1,0],
                [0,0,0,1,0],
                [0,0,0,0,0]
            ],
            [                           // extended set
                [0,0,0,0,0],
                [0,0,1,0,0],
                [0,1,1,1,0],
                [0,0,1,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,1,0,1,0],
                [0,1,1,1,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,1,0,0,0],
                [0,1,0,0,0],
                [0,1,1,1,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,1,1,0],
                [0,0,1,0,0],
                [0,1,1,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,1,1,0,0],
                [0,0,1,0,0],
                [0,0,1,1,0],
                [0,0,0,0,0]
            ]
        ],

        "colors": {
            "shades": {  // brightness values
                "front": 1.0,
                "updown": 0.80,
                "leftright": 0.83
            },
            "pile":
                { "fill": "#DADADA", "stroke": "#989898" },
            "bricks": [
                { "fill": "#B6C0FF", "stroke": "#3240FF" },
                { "fill": "#b6f0ff", "stroke": "#32c8ff" },
                { "fill": "#b6ffc8", "stroke": "#2eeb6a" },
                { "fill": "#fffbb6", "stroke": "#dce12c" },
                { "fill": "#ffdbb6", "stroke": "#ffa932" },
                { "fill": "#ffb6c2", "stroke": "#ff3246" },
                { "fill": "#eeb6ff", "stroke": "#dd32ff" }
            ]
        },

        "settings": {
            "Brick Set" : {
                "items": { "Standard": 7, "Extended": 99 },
                "defaultName": "Standard"
            },
            "Difficulty": {
                "items": { "Easy": 150, "Normal": 100, "Hard": 50 },
                "defaultName": "Normal"
            },
            "Music": {
                "items": { "On": true, "Off": false },
                "defaultName": "Off"
            },
            "Sound": {
                "items": { "On": true, "Off": false },
                "defaultName": "Off"
            }
        },

        "sounds": [
            { "name": "music",     "url": "sound/music.mp3",     "vol": 1.0,  "loop": true  },
            { "name": "gameover",  "url": "sound/gameover.mp3",  "vol": 0.8,  "loop": false },
            { "name": "rotate",    "url": "sound/rotate.mp3",    "vol": 0.8,  "loop": false },
            { "name": "touchdown", "url": "sound/touchdown.mp3", "vol": 0.4,  "loop": false },
            { "name": "blowup",    "url": "sound/blowup.mp3",    "vol": 1.0,  "loop": false },
            { "name": "down",      "url": "sound/down.mp3",      "vol": 0.15, "loop": false },
            { "name": "congrats",  "url": "sound/congrats.mp3",  "vol": 1.0,  "loop": false },
            { "name": "btndown",   "url": "sound/btndown.mp3",   "vol": 0.5,  "loop": false },
            { "name": "btnup",     "url": "sound/btnup.mp3",     "vol": 0.5,  "loop": false }
        ]

    };

});
