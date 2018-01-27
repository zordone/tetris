// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// gui manager singleton
define(["config", "settings", "sound"], function (config, settings, sound) {

    "use strict";

    // private
    var gui = {},
        divs = {},
        sizes = {},
        pos = {},
        state,
        prevW, prevH,
        gameCanvas, nextCanvas,
        // private functions
        init, flash;

    // gui states enum
    gui.states = { MENU: "menu", GAME: "game", SETTINGS: "settings" };

    // show contents when everything loaded
    gui.showContents = function () {
        $(".contentDiv").animate({ opacity: 1 }, 1000);
        $("#waitDiv"   ).animate({ opacity: 0 }, 500);
    };

    // calculate div positions for all states, apply current
    gui.resize = function () {
        var m = config.style.margin,
            w = window.innerWidth - 2,
            h = window.innerHeight,
            brickW = Math.floor(w / 2 / config.size.width),
            canvasW = Math.floor(w / 2 / brickW) * brickW,
            sideW = Math.floor((w - canvasW) / 2),
            sideW2m = sideW - 2 * m,
            names, nI, name;
        // ignore repeated events
        if (w === prevW && h === prevH) { return; }
        prevW = w;
        prevH = h;
        // menu state
        pos[gui.states.MENU] = {
            left: {
                left: -sideW2m - m,
                top: 0,
                width: sideW2m
            },
            center: {
                left: sideW + 1,
                top: -(h - m),
                width: canvasW,
                height: h - m
            },
            right: {
                left: w + 2,
                top: 0,
                width: sideW2m,
                height: h - 2 * m
            },
            menu: {
                top: (h - sizes.menu.height - 100) / 2
            },
            settings: {
                top: h + ((h - sizes.settings.height - 200) / 2)
            },
            congrats: {
                left: (w - sizes.congrats.width)  / 2,
                top:  (h - sizes.congrats.height) / 2
            }
        };
        // game state
        pos[gui.states.GAME] = {
            left: {
                left: 0,
                top: 0,
                width: sideW2m
            },
            center: {
                left: sideW + 1,
                top: 0,
                width: canvasW,
                height: h - m
            },
            right: {
                left: sideW + canvasW + 2,
                top: 0,
                width: sideW2m,
                height: h - 2 * m
            },
            menu: {
                top: h + ((h - sizes.menu.height - 100) / 2)
            },
            settings: {
                top: h + ((h - sizes.settings.height - 200) / 2)
            },
            congrats: {
                left: (w - sizes.congrats.width)  / 2,
                top:  (h - sizes.congrats.height) / 2
            }
        };
        // settings state
        pos[gui.states.SETTINGS] = {
            left: {
                left: -sideW2m - m,
                top: 0,
                width: sideW2m
            },
            center: {
                left: sideW + 1,
                top: -(h - m),
                width: canvasW,
                height: h - m
            },
            right: {
                left: w + 2,
                top: 0,
                width: sideW2m,
                height: h - 2 * m
            },
            menu: {
                top: -sizes.menu.height - 100 - (h - sizes.menu.height - 100) / 2
            },
            settings: {
                top: (h - sizes.settings.height - 200) / 2
            },
            congrats: {
                left: (w - sizes.congrats.width)  / 2,
                top:  (h - sizes.congrats.height) / 2
            }
        };
        // apply current state
        names = Object.keys(divs);
        for (nI = 0; nI < names.length; nI++) {
            name = names[nI];
            divs[name].css(pos[state][name]);
        }
        // resize content elements
        gameCanvas.width  = pos[state].center.width;
        gameCanvas.height = pos[state].center.height;
        nextCanvas.width  = pos[state].right.width / 2;
        nextCanvas.height = pos[state].right.width / 2; // width!
    };

    // animate divs to a new state
    gui.shiftTo = function (newState, onReady) {
        var dur1 = 600,
            dur2 = 900,
            shift = state + "-" + newState,
            newPos = pos[newState];
        if (shift === "game-menu") {
            divs.menu.show();
            divs.left      .animate(newPos.left,   dur1);
            divs.right     .animate(newPos.right,  dur1, function () {
                divs.center.animate(newPos.center, dur2);
                divs.menu  .animate(newPos.menu,   dur2, function () {
                    divs.left  .hide();
                    divs.right .hide();
                    divs.center.hide();
                    if (onReady) { onReady(); }                    
                });
            });
        } else if (shift === "menu-game") {
            divs.left  .show();
            divs.right .show();
            divs.center.show();            
            divs.center    .animate(newPos.center, dur2);
            divs.menu      .animate(newPos.menu,   dur2, function () {
                divs.left  .animate(newPos.left,   dur1);
                divs.right .animate(newPos.right,  dur1, function () {
                    divs.menu.hide();
                    if (onReady) { onReady(); }
                });
            });
        }
        else if (shift === "menu-settings") {
            divs.settings.show();
            divs.settings.animate(newPos.settings, dur2);
            divs.menu    .animate(newPos.menu,     dur2, function () {
                divs.menu.hide();
                if (onReady) { onReady(); }
            });
        }
        else if (shift === "settings-menu") {
            divs.menu.show();
            divs.settings.animate(newPos.settings, dur2);
            divs.menu    .animate(newPos.menu,     dur2, function () {
                divs.settings.hide();
                if (onReady) { onReady(); }
            });
        }
        state = newState;
    };

    // update button states
    gui.updateButtons = function (running, paused, gameover) {
        $("#btnStart").prop("disabled", running);
        $("#btnAbort").prop("disabled", !(running || gameover));
        $("#btnPause").prop("disabled", !(running || gameover)).text(paused ? "Resume" : "Pause");
    };

    // flash a div
    flash = function (div, times) {
        var dur = 50,
            onStep = function () {
                var dataColor = Math.round(this.dataColor),
                    htmlColor = "rgb(250," + dataColor + "," + dataColor + ")";
                div.css("backgroundColor", htmlColor);
            },
            onComp = function () {
                if (times > 1) {
                    flash(div, times - 1);
                }
            };
        div .css({ backgroundColor: "rgb(250,250,250)" })
            .prop({ dataColor: 250 })
            .animate({ dataColor: 220 }, { duration: dur, step: onStep })
            .delay(dur)
            .animate({ dataColor: 250 }, { duration: dur * 10, step: onStep, complete: onComp });
    };

    // show conrats div
    gui.showCongrats = function () {
        divs.congrats
            .css({
                opacity: 0,
                display: "block"
            })
            .animate({
                opacity: 1
            }, 200, function () {
                flash($(this), 5);
            });
    };

    // hide conrats div
    gui.hideCongrats = function (isAbort) {
        // false or undefined
        if (isAbort !== true) {
            sound.play("congrats");
        }
        divs.congrats
            .stop(true, false)
            .animate({ opacity: 0 }, 200, function () {
                divs.congrats.css({ display: "none" });
            });
    };

    // show the settings page
    gui.showSettings = function () {
        gui.shiftTo(gui.states.SETTINGS);
    };

    // save settings
    gui.saveSettings = function () {
        settings.save();
        gui.shiftTo(gui.states.MENU);
    };

    // cancel settings
    gui.cancelSettings = function () {
        settings.cancel();
        gui.shiftTo(gui.states.MENU);
    };

    // init bindgins
    gui.initBindings = function (tetris) {
        // tetris
        $("#btnStart").click(tetris.start);
        $("#btnAbort").click(tetris.abort);
        $("#btnPause").click(tetris.pause);
        // settings
        $("#btnShowSettings"  ).click(gui.showSettings);
        $("#btnSaveSettings"  ).click(gui.saveSettings);
        $("#btnCancelSettings").click(gui.cancelSettings);
        // gui
        $("#btnShowCongrats").click(gui.showCongrats);
        $("#btnHideCongrats").click(gui.hideCongrats);
        // sounds
        $("button")
            .on("mousedown", function () { sound.play("btndown"); })
            .on("mouseup",   function () { sound.play("btnup"  ); });
    };

    // get handles, set
    init = function () {
        // divs
        divs.left     = $("#leftDiv");
        divs.center   = $("#centerDiv");
        divs.right    = $("#rightDiv");
        divs.menu     = $("#menuDiv");
        divs.settings = $("#settingsDiv");
        divs.congrats = $("#congratsDiv");
        // canvases
        gameCanvas = $("#canvas")[0];
        nextCanvas = $("#next"  )[0];
        // frequently used fix sizes
        sizes.menu     = { height: divs.menu.height() };
        sizes.settings = { height: divs.settings.height() };
        sizes.congrats = { width: divs.congrats.width(), height: divs.congrats.height() };
        // default state (the opacities are already 0)
        $(".contentDiv").not(divs.menu).hide();
        state = gui.states.MENU;
        gui.resize();
    };

    init();

    // return singleton
    return gui;

});
