// Copyright 2013 Csaba Hellinger
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.


// renderer object
define(["config", "game", "color", "Rect"], function (config, game, color, Rect) {

    "use strict";

    // return constructor
    return function (context, nextMode, onBlowEnd) {

        // private
        var self = this,
            stepFrames,
            w = 0,
            h = 0,
            brick = { size: 5, width: 0, height: 0 },
            table = {
                width:  nextMode ? brick.size : config.size.width,
                height: nextMode ? brick.size : config.size.height + brick.size
            },
            canvas = { width: 0, height: 0 },
            bg = { front: null, back: null },
            blowFrame = 0,
            blowDur = config.speed.frames * 0.3,
            rowOffsets = [],
            nextOffset = { x: 0, y: 0 },
            needRender = false,
            renderOrder = [],
            // functions
            getBackRect, getCellRect, drawText, setCubeFaceColors, drawLine,
            drawPoly, drawCubeFace, drawCube, drawBackground, calcRenderOrder;

        // set the speed (on difficulty change)
        this.setStepFrames = function (pStepFrames) {
            stepFrames = pStepFrames;
        };

        // grid perspective
        getBackRect = function (rect) {
            var p = config.perspective[nextMode ? "next" : "game"],
                bx1 = rect.x1 + (p.left + (rect.x1 / w) * (p.right  - p.left)) * w,
                by1 = rect.y1 + (p.top  + (rect.y1 / h) * (p.bottom - p.top )) * h,
                bx2 = rect.x2 + (p.left + (rect.x2 / w) * (p.right  - p.left)) * w,
                by2 = rect.y2 + (p.top  + (rect.y2 / h) * (p.bottom - p.top )) * h;
            return new Rect().setABS(bx1, by1, bx2, by2);
        };

        // handle window resize
        this.resize = function (width, height) {
            var tableRealH = table.height;
            if (!nextMode) { tableRealH -= brick.size; }
            brick.width = Math.floor(width / table.width);
            brick.height = Math.floor(height / tableRealH);
            w = brick.width * table.width;
            h = brick.height * tableRealH;
            bg.front = new Rect(0, 0, w, h);
            bg.back = getBackRect(bg.front);
            canvas = { width: width, height: height };
            needRender = true;
        };

        // clear canvas
        this.clear = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
        };

        // front rectangle of a cell
        getCellRect = function (x, y, withOffset) {
            var cy, ofs = 0;
            if (withOffset === undefined || withOffset === true) {
                ofs = rowOffsets[y] || 0;
            }
            cy = nextMode ? y : y - brick.size;
            return new Rect(x * brick.width, ofs + cy * brick.height, brick.width, brick.height);
        };

        // draw a label (paused, game over)
        drawText = function (text) {
            var halfH = 20,
                textX = Math.round(w / 2),
                textY = Math.round(h / 2),
                fill = context.createLinearGradient(textX, textY - halfH, textX, textY + halfH);
            fill.addColorStop(0.0, "#E0E0E0");
            fill.addColorStop(0.3, "#FFFFFF");
            fill.addColorStop(0.7, "#FFFFFF");
            fill.addColorStop(1.0, "#C0C0C0");
            // font
            context.font = "bold 40px Verdana";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.shadowBlur = 13;
            context.shadowColor = "#606060";
            context.shadowOffsetY = -13;
            // fill
            context.fillStyle = fill;
            context.fillText(text, textX, textY);
            context.shadowBlur = 0;
            context.shadowOffsetY = 0;
            // stroke
            context.strokeStyle = "#909090";
            context.strokeText(text, textX, textY);
        };

        // set context colors for a cube face
        setCubeFaceColors = function (faceColor, faceShade) {
            var colorIndex = faceColor === color.groups.BRICK ? 0 : null;
            context.fillStyle   = color.get(faceColor, colorIndex, color.parts.FILL,   faceShade);
            context.strokeStyle = color.get(faceColor, colorIndex, color.parts.STROKE, faceShade);
        };

        // draw a line
        drawLine = function (x1, y1, x2, y2) {
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        };

        // draw a polygon, with fill and/or stroke
        drawPoly = function (points, fill, stroke) {
            var pI;
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);
            for (pI = 1; pI < points.length; pI++) {
                context.lineTo(points[pI].x, points[pI].y);
            }
            context.closePath();
            if (fill) { context.fill(); }
            if (stroke) { context.stroke(); }
        };

        // draw one side of a cube
        drawCubeFace = function (points, faceShade, frontRect) {
            var pI, point, offsetPoints, toDraw = faceShade === color.shades.FRONT;
            // need to draw?
            if (!toDraw && frontRect) {
                toDraw = true;
                for (pI = 0; pI < points.length && toDraw; pI++) {
                    point = points[pI];
                    toDraw = !frontRect.isCovering(point.x, point.y);
                }
            }
            if (toDraw) {
                offsetPoints = [];
                for (pI = 0; pI < points.length; pI++) {
                    point = points[pI];
                    offsetPoints[pI] = {
                        x: point.x + nextOffset.x,
                        y: point.y + nextOffset.y
                    };
                }
                drawPoly(offsetPoints, true, true);
            }
        };

        // draw a cube
        drawCube = function (front, neighbours, faceColor) {
            var back = getBackRect(front);
            // left
            setCubeFaceColors(faceColor, color.shades.LEFTRIGHT);
            if (!neighbours.left) {
                drawCubeFace([
                    { x: front.x1, y: front.y1 },
                    { x: back.x1,  y: back.y1  },
                    { x: back.x1,  y: back.y2  },
                    { x: front.x1, y: front.y2 }
                ], color.shades.LEFTRIGHT, front);
            }
            // right
            if (!neighbours.right) {
                drawCubeFace([
                    { x: front.x2, y: front.y1 },
                    { x: back.x2,  y: back.y1  },
                    { x: back.x2,  y: back.y2  },
                    { x: front.x2, y: front.y2 }
                ], color.shades.LEFTRIGHT, front);
            }
            // top
            setCubeFaceColors(faceColor, color.shades.UPDOWN);
            if (!neighbours.top) {
                drawCubeFace([
                    { x: front.x1, y: front.y1 },
                    { x: back.x1,  y: back.y1  },
                    { x: back.x2,  y: back.y1  },
                    { x: front.x2, y: front.y1 }
                ], color.shades.UPDOWN, front);
            }
            // bottom
            if (!neighbours.bottom) {
                drawCubeFace([
                    { x: front.x1, y: front.y2 },
                    { x: back.x1,  y: back.y2  },
                    { x: back.x2,  y: back.y2  },
                    { x: front.x2, y: front.y2 }
                ], color.shades.UPDOWN, front);
            }
        };

        // draw the background
        drawBackground = function (data) {
            var front, back, x, y, guideX1, guideX2, isGuide;
            if (nextMode) { return; }
            // back
            context.fillStyle = "#F0F0F0";
            drawPoly([
                { x: bg.back.x1, y: 0          },
                { x: bg.back.x2, y: 0          },
                { x: bg.back.x2, y: bg.back.y2 },
                { x: bg.back.x1, y: bg.back.y2 }
            ], true, false);
            // bottom
            context.fillStyle = "#B0B0B0";
            drawPoly([
                { x: bg.front.x1, y: bg.front.y2 },
                { x: bg.back.x1,  y: bg.back.y2  },
                { x: bg.back.x2,  y: bg.back.y2  },
                { x: bg.front.x2, y: bg.front.y2 }
            ], true, false);
            // left
            context.fillStyle = "#DCDCDC";
            drawPoly([
                { x: bg.front.x1, y: 0           },
                { x: bg.back.x1,  y: 0           },
                { x: bg.back.x1,  y: bg.back.y2  },
                { x: bg.front.x1, y: bg.front.y2 }
            ], true, false);
            // right
            drawPoly([
                { x: bg.front.x2, y: 0           },
                { x: bg.back.x2,  y: 0           },
                { x: bg.back.x2,  y: bg.back.y2  },
                { x: bg.front.x2, y: bg.front.y2 }
            ], true, false);
            // front bottom
            context.strokeStyle = "#A0A0A0";
            drawLine(bg.front.x1, bg.front.y2, bg.front.x2, bg.front.y2);
            // front side
            drawLine(bg.front.x1, bg.front.y2, bg.front.x1, bg.front.y1);
            drawLine(bg.front.x2, bg.front.y2, bg.front.x2, bg.front.y1);
            // back bottom
            context.strokeStyle = "#E8E8E8";
            drawLine(bg.back.x1, bg.back.y2, bg.back.x2, bg.back.y2);
            // back side
            drawLine(bg.back.x1, bg.back.y2, bg.back.x1, bg.back.y1);
            drawLine(bg.back.x2, bg.back.y2, bg.back.x2, bg.back.y1);
            // grid lines
            guideX1 = data.pos.x + data.brickBounds.x - 1;
            guideX2 = data.pos.x + data.brickBounds.x + data.brickBounds.w;
            for (y = 0; y < table.height; y++) {
                front = getCellRect(0, y, false);
                front = new Rect(front.x1, front.y1, table.width * brick.width, brick.height);
                back = getBackRect(front);
                // side
                context.strokeStyle = "#CCCCCC";
                drawLine(front.x2, front.y1, back.x2, back.y1);
                drawLine(front.x1, front.y1, back.x1, back.y1);
                // back
                context.strokeStyle = "#E2E2E2";
                drawLine(back.x1, back.y1, back.x2, back.y1);
            }
            for (x = 0; x < table.width - 1; x++) {
                front = getCellRect(x, 0, false);
                front = new Rect(front.x1, front.y1, brick.width, table.height * brick.height);
                back = getBackRect(front);                
                isGuide = x === guideX1 || x === guideX2;
                // bottom
                context.strokeStyle = isGuide ? "#8080A0" : "#A0A0A0";
                drawLine(front.x2, front.y2, back.x2, back.y2 + 1);
                // back
                context.strokeStyle = isGuide ? "#C2C2E2" : "#E2E2E2";
                drawLine(back.x2, back.y1, back.x2, back.y2);
            }
        };

        // calculate cell rendering order to avoid overwrites
        calcRenderOrder = function () {
            var tw = table.width,
                th = table.height,
                cx = Math.floor(tw / 2),
                cy = Math.floor(th / 2),
                order = [],
                tx, ty, distance;
            // normal order
            for (ty = 0; ty < th; ty++) {
                for (tx = 0; tx < tw; tx++) {
                    distance = Math.sqrt(
                        Math.pow(cx - tx, 2) +
                        Math.pow(cy - ty, 2)
                    );
                    order.push({ x: tx, y: ty, distance: distance });
                }
            }
            // sort by descending distance
            order.sort(function (a,b) {
                return b.distance - a.distance;
            });
            renderOrder = order;
        };

        // render to canvas
        this.update = function (forceRender) {
            var data, y, x, bx, by,
                isBlow, isBrick, isPile,
                neighbours, rect, faceColor,
                offsetBase, offsetSum,
                colBlow, frontFaces, oI,
                group, gI,
                faces, fI;
            // table render data
            data = game.getRenderData();
            isBlow = !nextMode && data.blowRows.length > 0;
            if (!(forceRender || needRender || isBlow)) { return; }
            needRender = false;
            // clear
            self.clear();
            drawBackground(data);
            if (!nextMode && game.paused) {
                drawText("Paused");
                return;
            }
            // rows to blow up
            if (isBlow) {
                if (blowFrame === 0) {
                    blowFrame = blowDur;
                } else {
                    offsetBase = Math.pow(Math.pow(brick.height, 1 / blowDur), blowDur - blowFrame);
                    offsetSum = 0;
                    for (y = h - 1; y >= 0; y--) {
                        rowOffsets[y] = offsetSum;
                        if (data.blowRows.indexOf(y) !== -1) { offsetSum += offsetBase; }
                    }
                    blowFrame -= 1;
                    if (blowFrame === 0 && onBlowEnd) { onBlowEnd(); }
                }
            } else if (rowOffsets.length > 0) {
                rowOffsets = [];
            }
            // next mode offset
            if (nextMode) {
                nextOffset = {
                    x: ((data.nextBounds.x1 + brick.size - data.nextBounds.x2 - 1) / 2 - data.nextBounds.x1) * brick.width,
                    y: ((data.nextBounds.y1 + brick.size - data.nextBounds.y2 - 1) / 2 - data.nextBounds.y1) * brick.height
                };
            }
            // draw side faces, queue front faces grouped by type
            if (!nextMode || !game.gameover) {
                // cache currently blowing rows
                colBlow = [];
                for (y = 0; y < table.height; y++) {
                    colBlow.push(!nextMode && data.blowRows.indexOf(y) !== -1);
                }
                // render cells in order, side faces first
                frontFaces = { pile: [], bricks: [] };
                for (oI = 0; oI < renderOrder.length; oI++) {
                    x = renderOrder[oI].x;
                    y = renderOrder[oI].y;
                    if (!colBlow[y]) {
                        if (nextMode) {
                            bx = 0;
                            by = 0;
                            isBrick = data.next[x][y] === 1;
                            isPile = false;
                        } else {
                            bx = x - data.pos.x;
                            by = y - data.pos.y;
                            isBrick = 0 <= bx && bx < brick.size && 0 <= by && by < brick.size && data.brick[bx][by] === 1;
                            isPile = data.table[x][y] === 1;
                        }
                        if (isBrick || isPile) {
                            neighbours = game.neighbors(x, y, nextMode);
                            rect = getCellRect(x, y, !isBrick);
                            faceColor = nextMode || !isBrick ? color.groups.PILE : color.groups.BRICK;
                            drawCube(rect, neighbours, faceColor);
                            // stash front faces, grouped by color group
                            frontFaces[faceColor].push(rect.pointsArray());
                        }
                    }
                }
                // draw front faces: pile first, then brick
                for (gI = 0; gI < 2; gI++) {
                    group = gI === 0 ? color.groups.PILE : color.groups.BRICK;
                    faces = frontFaces[group];
                    setCubeFaceColors(group, color.shades.FRONT);
                    for (fI = 0; fI < faces.length; fI++) {
                        drawCubeFace(faces[fI], color.shades.FRONT, null);
                    }
                }
            }
            // game over label
            if (!nextMode && game.gameover) {
                drawText("Game Over");
            }
        };

        // init
        calcRenderOrder();
    };

});
