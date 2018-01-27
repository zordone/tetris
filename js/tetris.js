// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// tetris singleton
define(["config", "settings", "game", "cookie", "gui", "input", "sound", "Render", "Odometer", "Bonus"],
    function (config, settings, game, cookie, gui, input, sound, Render, Odometer, Bonus) {

    "use strict";

    // private
    var gameCanvas, nextCanvas,
        timerInterval = null,
        frame = 0,
        updateTime = 0,
        stepFrames = 0,
        inputFrames = 0,
        blowAnim = false,
        tetris = {
            gameRender: null,
            nextRender: null,
            score: null,
            highscore: null,
            bonus: null
        },
        // functions
        onTimer, switchTimer, updateButtons, resizeWindow, soundsLoaded,
        onSettingsChanged, onTouchDown, onBlowEnd;

    // refresh
    onTimer = function () {
        var forceRender = false;
        if (frame % inputFrames === 0) {
            if (input.pause > 0) {
                tetris.pause();
                forceRender = true;
            }
            forceRender = game.processInput() || forceRender;
        }
        if (blowAnim) {
            forceRender = true;
        } else if (!game.paused && frame % stepFrames === 0) {
            game.step();
            forceRender = true;
        }
        tetris.gameRender.update(forceRender);
        tetris.nextRender.update(true);
        if (!blowAnim) { frame += 1; }
    };

    // turn the timer on/off
    switchTimer = function (on) {
        if (!timerInterval && on) {
            timerInterval = window.setInterval(onTimer, updateTime);
        } else if (timerInterval && !on) {
            window.clearInterval(timerInterval);
            timerInterval = null;
        }
    };

    // update the buttons
    updateButtons = function () {
        gui.updateButtons(game.running, game.paused, game.gameover);
    };

    // start the game
    tetris.start = function () {
        if (!game.running) {
            // refresh size before starting
            resizeWindow(true);
            // clear the table
            game.clear();
            tetris.score.reset();
            blowAnim = false;
            // set speed
            stepFrames = Math.round(config.speed.frames / config.speed.steps * settings.get("Difficulty") / 100);
            tetris.gameRender.setStepFrames(stepFrames);
            tetris.nextRender.setStepFrames(stepFrames);
            // redraw
            tetris.gameRender.update(true);
            tetris.nextRender.update(true);
            // show game page
            gui.shiftTo(gui.states.GAME, function () {
                frame = 0;
                game.running = true;
                game.paused = false;
                switchTimer(true);
                updateButtons();
            });
            // start music
            sound.musicOn(5000);
        }
    };

    // stop the game
    tetris.stop = function (isAbort) {
        var score;
        if (game.running) {
            game.running  = false;
            game.gameover = true;
            game.paused   = false;
            switchTimer(false);
            updateButtons();
            tetris.gameRender.update(true);
            sound.musicOff(isAbort ? 3000 : 1000);
            score = game.getScore();
            if (score > cookie.get("HighScore", 0)) {
                cookie.set("HighScore", score);
                tetris.highscore.set(score);
                if (!isAbort) {
                    gui.showCongrats();
                }
            }
        }
    };

    // abort the game, and return to menu
    tetris.abort = function () {
        tetris.stop(true);
        gui.hideCongrats(true);
        gui.shiftTo(gui.states.MENU, function () {
            updateButtons();
        });
    };

    // pause / resume the game
    tetris.pause = function () {
        game.paused = !game.paused;
        tetris.gameRender.update(true);
        updateButtons();
        sound.musicPause(1000);
    };

    // dynamic resize
    resizeWindow = function (forced) {
        gui.resize();
        if (game.running || forced === true) {
            tetris.score.resize();
            tetris.highscore.resize();
            tetris.gameRender.resize(gameCanvas.width, gameCanvas.height);
            tetris.nextRender.resize(nextCanvas.width, nextCanvas.height);
            // if paused or gameover, force update
            if (game.gameover || game.paused || forced === true) {
                tetris.gameRender.update(true);
                tetris.nextRender.update(true);
            }
        }
    };

    // settings changed
    onSettingsChanged = function () {
        sound.refreshSettings();
    };

    // a brick touched down
    onTouchDown = function (startBlow) {
        tetris.score.set(game.getScore());
        if (startBlow) {
            blowAnim = true;
        }
    };

    // the blow animation ended
    onBlowEnd = function () {
        blowAnim = false;
        frame = -1;
    };

    // init after all sounds loaded
    soundsLoaded = function() {
        // tetris table
        game.init(tetris, onTouchDown);
        game.clear();
        cookie.get("HighScore", 0);
        // game renderer
        gameCanvas = $("#canvas").get(0);
        tetris.gameRender = new Render(gameCanvas.getContext("2d"), false, onBlowEnd);
        // next renderer
        nextCanvas = $("#next").get(0);
        tetris.nextRender = new Render(nextCanvas.getContext("2d"), true);
        // init bindings
        gui.initBindings(tetris);
        // dynamic resize
        window.addEventListener("resize", resizeWindow, false);
        resizeWindow(false);
        updateButtons();
        gui.showContents();
    };

    // init the game
    tetris.init = function () {
        var fps;
        // config
        fps = config.speed.frames;
        updateTime = 1000 / fps;
        inputFrames = Math.round(fps / config.speed.keys);
        // helpers
        tetris.bonus     = new Bonus("#bonusDiv");
        tetris.score     = new Odometer("#scoreDiv", 9);
        tetris.highscore = new Odometer("#highscoreDiv", 9);
        tetris.highscore.set(cookie.get("HighScore", 0));
        settings.init("#settingsDiv .formContent", onSettingsChanged);
        sound.init(soundsLoaded);
    };

    // return the tetris singleton
    return tetris;

});
