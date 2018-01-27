// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// tetris game singleton
define(["config", "settings", "input", "sound", "Rect"], function (config, settings, input, sound, Rect) {

    "use strict";

    // private
    var game = {
            running: false,
            paused: false,
            gameover: true
        },
        tetris = null,
        brickSize = config.size.brick,
        w = config.size.width,
        h = config.size.height + brickSize,
        table = null,
        brick = null,
        next = null,
        pos = { x: 0, y: 0 },
        blowRows = [],
        score = 0,
        spree = { count: 0, sum: 0 },
        down = { fastCount: 0, speedCounts: [0, 0, 0] },
        onTouchDown = null,
        // functions
        safeTable, safeBrick, brickBoundsRect, collisionCheck, createArray, rotateBrick,
        random, blowUpFullRows, gameOver, touchDown, difficultyPoints, achievement, downCounter;

    // bounds safe accessor for table[x][y] (returns 0 for blowing cells)
    safeTable = function (x, y) {
        if (x < 0 || x >= w || y < 0 || y >= h) { return null; }
        if (blowRows.indexOf(y) !== -1) { return 0; }
        return table[x][y];
    };

    // bounds safe accessor for brick/next[x][y]
    safeBrick = function (x, y, nextMode) {
        if (x < 0 || x >= brickSize || y < 0 || y >= brickSize) { return null; }
        return nextMode ? next[x][y] : brick[x][y];
    };

    // real bounding box for a brick (inTable: true = table coorniates, false = brick coordinates)
    brickBoundsRect = function (brick, inTable) {
        var bx1 = brickSize,
            by1 = brickSize,
            bx2 = 0,
            by2 = 0,
            x, y;
        for (y = 0; y < brickSize; y++) {
            for (x = 0; x < brickSize; x++) {
                if (brick[x][y] === 1) {
                    bx1 = Math.min(x, bx1);
                    by1 = Math.min(y, by1);
                    bx2 = Math.max(x, bx2);
                    by2 = Math.max(y, by2);
                }
            }
        }
        if (inTable) {
            bx1 += pos.x;
            by1 += pos.y;
            bx2 += pos.x;
            by2 += pos.y;
        }
        return new Rect().setABS(bx1, by1, bx2, by2);
    };

    // collision check
    collisionCheck = function (brick, posX, posY) {
        var x, y, collision = false;
        // floor
        if (posY + brickBoundsRect(brick, false).y2 === h) {
            return true;
        }
        // table
        for (y = 0; y < brickSize && !collision; y++) {
            for (x = 0; x < brickSize && !collision; x++) {
                if (brick[x][y] === 1 && safeTable(posX + x, posY + y) === 1) {
                    collision = true;
                }
            }
        }
        return collision;
    };

    // create a 2 dimensional array, and fill it with zeros
    createArray = function (width, height) {
        var array = [], x, y;
        for (x = 0; x < width; x++) {
            array[x] = [];
            for (y = 0; y < height; y++) {
                array[x][y] = 0;
            }
        }
        return array;
    };

    // rotate brick 0..3 times (0 is just a clone, without rotation)
    rotateBrick = function (brick, times) {
        var bs, rot, x, y;
        if (times === 0) { return brick; }
        bs = brickSize - 1;
        rot = createArray(brickSize, brickSize);
        for (y = 0; y < brickSize; y++) {
            for (x = 0; x < brickSize; x++) {
                if      (times === 3) { rot[x][y] = brick[     y][bs - x]; }
                else if (times === 2) { rot[x][y] = brick[bs - x][bs - y]; }
                else if (times === 1) { rot[x][y] = brick[bs - y][     x]; }
            }
        }
        return rot;
    };

    // random number betwwen min and max
    random = function (min, max) {
        return Math.floor(min + (Math.random() * (max - min)));
    };

    // counting fast play
    downCounter = function (speed, speedLimit, speedIndex, targetCount, decrease, bonusPoints, bonusName) {
        var sI,
            bonus = false,
            delta = speed > speedLimit ? 1 : decrease;
        down.speedCounts[speedIndex] = Math.max(0, down.speedCounts[speedIndex] + delta);
        if (down.speedCounts[speedIndex] > targetCount) {
            achievement(bonusPoints, bonusName);
            bonus = true;
            // reset this, and slower speed counts
            for (sI = speedIndex; sI >= 0; sI--) {
                down.speedCounts[sI] = 0;
            }
        }
        return bonus;
    };

    // start the next brick
    game.next = function () {
        var setMax, index, bounds, speed;
        // speed bonus calculation
        if (brick) {
            speed = down.fastCount / (pos.y - pos.startY - 1);
            if (     !downCounter(speed, 0.85, 2, 30, -3, 5000, "Lightspeed")) {
                if ( !downCounter(speed, 0.7,  1, 20, -2,  500, "Supersonic")) {
                      downCounter(speed, 0.55, 0, 10, -1,   50, "Speedy");
                }
            }
            down.fastCount = 0;
        }
        // next brick
        setMax = Math.min(
            config.bricks.length,
            settings.get("Brick Set")
        );
        index = random(0, setMax);
        brick = next;
        next = config.bricks[index];
        next = rotateBrick(next, random(0, 3));
        if (brick === null) { return; }
        bounds = brickBoundsRect(brick);
        pos = {
            x: random(-bounds.x1, w - 1 - bounds.x2),
            y: brickSize - bounds.y2 - 1
        };
        pos.startY = pos.y;
    };

    // clear the table and create new game
    game.clear = function () {
        var x, y;
        game.gameover = false;
        game.paused = false;
        table = [];
        for (x = 0; x < w; x++) {
            table[x] = [];
            for (y = 0; y < h; y++) {
                table[x][y] = 0;
            }
        }
        score = 0;
        spree = { count: 0, sum: 0 };
        // two times, to create first & next
        game.next();
        game.next();
    };

    // get data bundle for rendering
    game.getRenderData = function () {
        return {
            table: table,
            brick: brick,
            brickBounds: brickBoundsRect(brick, false),
            next: next,
            nextBounds: brickBoundsRect(next, false),
            pos: pos,
            blowRows: blowRows
        };
    };

    // get data for score panel
    game.getScore = function () {
        return score;
    };

    // scale points based on difficulty
    difficultyPoints = function (points) {
        return Math.round(points * 100 / settings.get("Difficulty"));
    };

    // blows up
    blowUpFullRows = function () {
        var bonuses, points,
            x, y, full;
        // find complete rows
        for (y = 0; y < h; y++) {
            full = true;
            for (x = 0; x < w && full; x++) {
                full = full && table[x][y] === 1;
            }
            if (full) {
                blowRows.push(y);
            }
        }
        // points & bonuses
        if (blowRows.length > 0) {
            // blow up bonus
            points = Math.pow(blowRows.length, 2) * 10;
            bonuses = ["", "Single row", "Double row", "Triple row", "Quadruple row"];
            achievement(points, bonuses[blowRows.length]);
            // spree bonus
            spree.count += 1;
            if (spree.count > 1) {
                achievement(spree.count * spree.sum, "Spree x" + spree.count);
            }
            sound.play("blowup");
        } else {
            spree = { count: 0, sum: 0 };
        }
    };

    // reward an achievement
    achievement = function (points, name) {
        points = difficultyPoints(points);
        score += points;
        spree.sum += points;
        tetris.bonus.add(name);
    };

    // game over
    gameOver = function () {
        tetris.stop(false);
        sound.play("gameover");
    };

    // brick touchdown
    touchDown = function () {
        var x, y, count = 0, minY = h;
        for (y = 0; y < brickSize; y++) {
            for (x = 0; x < brickSize; x++) {
                if (brick[x][y] === 1) {
                    table[pos.x + x][pos.y + y] = 1;
                    minY = Math.min(minY, pos.y + y);
                    count += 1;
                }
            }
        }
        if (minY < brickSize + 1) {
            gameOver();
        } else {
            score += difficultyPoints(count);
            sound.play("touchdown");
            blowUpFullRows();
            if (onTouchDown) { onTouchDown(blowRows.length > 0); }
            game.next();
        }
    };

    // update the table
    game.step = function () {
        var yFrom, yTo, nextY, x, cleanup;
        if (blowRows.length > 0) {
            // remove blowed up rows
            yFrom = h - 1;
            yTo = h - 1;
            while (yTo >= 0) {
                if (blowRows.indexOf(yFrom) === -1) {
                    for (x = 0; x < w; x++) {
                        table[x][yTo] = yFrom < 0 ? 0 : table[x][yFrom];
                    }
                    yTo -= 1;
                }
                yFrom -= 1;
            }
            blowRows = [];
            // cleanup bonus
            cleanup = table.filter(function (col) { return col[h-1] !== 0; }).length === 0;
            if (cleanup) {
                achievement(5000, "Cleanup");
            }
        } else {
            // next step
            nextY = pos.y + 1;
            if (collisionCheck(brick, pos.x, nextY)) {
                touchDown();
            } else {
                pos.y = nextY;
            }
        }
    };

    // find the neighours of a table cell
    game.neighbors = function (x, y, nextMode) {
        var bx, by, inBrick, result;
        // table
        result = {
            top:    safeTable(x, y - 1) === 1,
            left:   safeTable(x - 1, y) === 1,
            bottom: safeTable(x, y + 1) === 1,
            right:  safeTable(x + 1, y) === 1
        };
        // brick
        inBrick = false;
        if (nextMode) {
            bx = x;
            by = y;
            inBrick = true;
        } else {
            if (pos.x <= x && x < pos.x + brickSize && pos.y <= y && y < pos.y + brickSize) {
                bx = x - pos.x;
                by = y - pos.y;
                inBrick = true;
            }
        }
        if (inBrick) {
            result.top    = result.top    || safeBrick(bx, by - 1, nextMode) === 1;
            result.left   = result.left   || safeBrick(bx - 1, by, nextMode) === 1;
            result.bottom = result.bottom || safeBrick(bx, by + 1, nextMode) === 1;
            result.right  = result.right  || safeBrick(bx + 1, by, nextMode) === 1;
        }
        return result;
    };

    // process input events
    game.processInput = function () {
        var rotate, nextX, nextY, nextBrick, oldB, newB, bounds,
            modified = false,
            touchedDown = false;
        if (!input.hasKeys()) { return false; }
        if (!game.paused && blowRows.length === 0) {
            nextX = pos.x;
            nextY = pos.y;
            rotate = input.rotate > 0;
            nextBrick = rotateBrick(brick, rotate ? 1 : 0);
            // rotation compensation
            if (rotate) {
                // brick center
                oldB = brickBoundsRect(brick, false);
                newB = brickBoundsRect(nextBrick, false);
                nextX += Math.round(oldB.cX - newB.cX);
                nextY += Math.round(oldB.cY - newB.cY);
                // wall
                nextX = Math.max(nextX, -newB.x1);
                nextX = Math.min(nextX, w - 1 - newB.x2);
                // floor
                nextY = Math.min(nextY, h - 1 - newB.y2);
                modified = true;
            } else {
                // move
                bounds = brickBoundsRect(nextBrick, true);
                if (input.down) {
                    if (collisionCheck(nextBrick, nextX, nextY + 1)) {
                        touchDown();
                        touchedDown = true;
                        modified = false;
                    } else {
                        nextY += 1;
                        modified = true;
                    }
                }
                if (!touchedDown) {
                    if (input.left > 0 && input.right === 0 && bounds.x1 > 0 && !collisionCheck(nextBrick, nextX - 1, nextY)) {
                        nextX -= 1;
                        modified = true;
                    }
                    if (input.right > 0 && input.left === 0 && bounds.x2 < w - 1 && !collisionCheck(nextBrick, nextX + 1, nextY)) {
                        nextX += 1;
                        modified = true;
                    }
                }
            }
            // if no collision, apply
            if (modified && !collisionCheck(nextBrick, nextX, nextY)) {
                pos.x = nextX;
                pos.y = nextY;
                brick = nextBrick;
                if (rotate) {
                    sound.play("rotate");
                } else if (input.down > 0) {
                    down.fastCount += 1;
                    sound.play("down");
                }
            } else {
                modified = false;
            }
        }
        input.next();
        return modified;
    };

    // delayed dependency for tetris
    game.init = function (ptetris, pOnTouchDown) {
        tetris = ptetris;
        onTouchDown = pOnTouchDown;
    };

    // return singleton
    return game;

});
