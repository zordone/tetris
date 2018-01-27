// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// music and sound manager singleton
define(["config", "settings"], function (config, settings) {

    "use strict";

    // private
    var sound = {},
        body,
        loading = 0,
        sounds = { music: null },
        onReady = null,
        isMusicOn, isSoundOn,
        // functions
        createAudio, onLoaded;

    // turn on music
    sound.musicOn = function (time) {
        var music = sounds.music;
        if (isMusicOn) {
            $(music).stop(true, true);
            music.volume = 0;
            music.play();
            music.currentTime = 0;
            $(music).animate({ volume: 1 }, time);
        }
    };

    // turn off music
    sound.musicOff = function (time) {
        var music = sounds.music;
        if (isMusicOn) {
            $(music)
                .stop(true, false)
                .animate({ volume: 0 }, time, function () {
                    music.pause();
                });
        }
    };

    // pause / resume music
    sound.musicPause = function (time) {
        var music = sounds.music;
        if (isMusicOn) {
            $(music).stop(true, false);
            if (music.paused) {
                music.play();
                $(music).animate({ volume: 1 }, time);
            } else {
                $(music).animate({ volume: 0 }, { duration: time, always: music.pause });
            }
        }
    };

    // play a sound
    sound.play = function (name) {
        var snd, node;
        if (isSoundOn) {
            snd = sounds[name];
            if (snd) {
                node = snd.cloneNode(true);
                node.volume = snd.volume;
                node.play();
            }
        }
    };

    // cache settings on change
    sound.refreshSettings = function () {
        isMusicOn = settings.get("Music");
        isSoundOn = settings.get("Sound");
    };

    // one sound ready
    onLoaded = function () {
        loading -= 1;
        if (loading === 0 && onReady) {
            onReady();
        }
    };

    // create an audio tag for a sound file
    createAudio = function (url, volume, loop) {
        var audio = document.createElement("audio");
        loading += 1;
        body.append(audio);
        // we don't really care if a sound failed
        audio.addEventListener("canplaythrough", onLoaded);
        audio.addEventListener("error", onLoaded);
        audio.src = url;
        audio.volume = volume;
        audio.loop = loop;
        return audio;
    };

    // preload all sounds
    sound.init = function (pOnReady) {
        var sI, params;
        onReady = pOnReady;
        body = $("body");
        for (sI = 0; sI < config.sounds.length; sI++) {
            params = config.sounds[sI];
            sounds[params.name] = createAudio(params.url, params.vol, params.loop);
        }
        sound.refreshSettings();
    };

    // return singleton
    return sound;

});
