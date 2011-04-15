dojo.provide("games.Tetravex");

dojo.require("dojox.gfx");
dojo.require("dojox.gfx.move");

// set up a name space (page 45 Dojo: The Definitive Guide, 1st Edition)
games.Tetravex = function() {

};

// properties object
// can I just use 'this' object?
games.Tetravex.prototype._props = {
  suface_width : 420,
  suface_height : 200,
  tile_size : 40, // keep me even.
  startX : 20,
  startY : 20,
  padding : 10
// the total padding around the tile. IE 5 each side time 2.
};

games.Tetravex.prototype._half_square = function() {
  return (this._props.tile_size / 2) + (this._props.padding / 2); // convenience
};

// 3x3 board - need to create these arrays dynamically for different size
// playing boards
// is the top left co-ordinated of the squares that make up the two boards
// TODO - does this need to be a function? see page 24 dtdg
/*
 * games.Tetravex.prototype._boardX = function() { return [ this._props.startX, this._props.startX +
 * this._props.tile_size + this._props.padding, this._props.startX + ((this._props.tile_size + this._props.padding) *
 * 2), this._props.startX + ((this._props.tile_size + this._props.padding) * 3), this._props.startX +
 * ((this._props.tile_sizeh + this._props.padding) * 4), this._props.startX + ((this._props.tile_size +
 * this._props.padding) * 5), this._props.startX + ((this._props.tile_size + this._props.padding) * 6),
 * this._props.startX + ((this._props.tile_size + this._props.padding) * 7) ]; };
 */
games.Tetravex.prototype._boardX = [ 20, 70, 120, 170, 220, 270, 320, 370 ];

/*
 * games.Tetravex.prototype._boardY = function() { return [ this._props.startY, this._props.startY +
 * this._props.tile_size + this._props.padding, this._props.startY + ((this._props.tile_size + this._props.padding) *
 * 2), this._props.startY + ((this._props.tile_size + this._props.padding) * 3) ]; };
 */

games.Tetravex.prototype._boardY = [ 20, 70, 120, 170 ];

games.Tetravex.prototype.initialize = function() {
  var container = dojo.byId("tetravex");
  var surface = dojox.gfx.createSurface(
      container, this._props.suface_width, this._props.suface_height);
  surface.whenLoaded(function() {
    games.Tetravex.prototype._initSurface(surface);
  });
  console.log("done");
  return;
};
console.log("Yes it does.");

games.Tetravex.prototype._drawBoard = function(surface) {
  // summary: Use the global this._boardX and this._boardY arrays to draw the
  // board grid
  // lines.

  var path = surface.createPath().setStroke(
      "black");

  // left board horizontal lines
  var i;
  for (i = 0; i < 4; i++) {
    var x = this._boardX[0];
    var y = this._boardY[i];
    var h = this._boardX[3];
    path.moveTo(
        x, y);
    path.hLineTo(h);
    path.closePath();
  }

  // left board vertical lines
  for (i = 0; i < 4; i++) {
    path.moveTo(
        this._boardX[i], this._boardY[0]).vLineTo(
        this._boardY[3]).closePath();
  }

  // right board horizontal lines
  for (i = 0; i < 4; i++) {
    path.moveTo(
        this._boardX[4], this._boardY[i]).hLineTo(
        this._boardX[7]).closePath();
  }
  // right board vertical lines
  for (i = 4; i < 8; i++) {
    path.moveTo(
        this._boardX[i], this._boardY[0]).vLineTo(
        this._boardY[3]).closePath();
  }
  console.log("draw board end");
};

games.Tetravex.prototype._initSurface = function(surface) {
  // summary: draw the board, make the tiles
  console.log("init");
  games.Tetravex.prototype._drawBoard(surface);

  rectangle = surface.createRect(
      {
        x : 0, // what are you - offset, do I need you?
        y : 0,
        width : this._props.tile_size,
        height : this._props.tile_size,
        r : 3
      }).setFill(
      "red").setStroke(
      "blue");

  // override onMoving on your object and modify the "shift" object
  // so it never moves a shape outside of a specified boundaries.
  // from here
  // http://dojo-toolkit.33424.n3.nabble.com/gfx-constrainedMoveable-td176539.html
  dojo.extend(
      dojox.gfx.Moveable, {
        onMoving : function(mover, shift) {
          mover
          if (mover.shape.matrix) {
            // don't go over the left or right edges - optimize by choosing
            // on x
            // value, 2 is the border??
            if ((shift.dx > 0 && mover.shape.matrix.dx > (games.Tetravex.prototype._props.suface_width
                - games.Tetravex.prototype._props.tile_size - 2))
                || (shift.dx < 0 && mover.shape.matrix.dx < 2)) {
              shift.dx = 0;
            }
            // don't go ovet the top or bottom
            if ((shift.dy < 0 && mover.shape.matrix.dy < 2)
                || (shift.dy > 0 && mover.shape.matrix.dy > (games.Tetravex.prototype._props.suface_height
                    - games.Tetravex.prototype._props.tile_size - 2))) {
              shift.dy = 0;
            }
          }
        }
      });

  // make the tile movable.
  moveMe = new dojox.gfx.Moveable(
      rectangle);
  console.log("Yes it does.");
  // subscribe to the global moving object stop event. Any time a tile
  // stops moving this is called.
  dojo.subscribe(
      "/gfx/move/stop", this, function moveToNearestSquare(mover) {

        console.clear();
        console.log("tile X is " + mover.shape.matrix.dx + "  Y is " + mover.shape.matrix.dy);

        var deltaX = games.Tetravex.prototype._findNearestX(mover.shape.matrix.dx) - mover.shape.matrix.dx
            + (this._props.padding / 2);
        var deltaY = games.Tetravex.prototype._findNearestY(mover.shape.matrix.dy) - mover.shape.matrix.dy
            + (this._props.padding / 2);

        mover.shape.applyLeftTransform({
          dx : deltaX,
          dy : deltaY
        });
      });
};

games.Tetravex.prototype._findNearestY = function findNearestY(tileY) {
  // summary: Examine all the possible y co-ord board values that
  // the tile may be dropped on and return the nearest.
  // tileX: the y co-od of the top left corner of the tile
  
  // Quickly find if the tile is in a position less than half way through the first square
  if (tileY < (games.Tetravex.prototype._boardY[0] + games.Tetravex.prototype._half_square())) {
    return games.Tetravex.prototype._boardY[0];
  }

  // iterate over the middle square options
  var i;
  for (i = 1; i <= 1; i++) {
    var lowerLimit = games.Tetravex.prototype._boardY[i] - games.Tetravex.prototype._half_square();
    var upperLimit = games.Tetravex.prototype._boardY[i] + games.Tetravex.prototype._half_square();
    console.log("lower limit > = " + lowerLimit + "   Y:" + tileY + "  > upper limit" + upperLimit);
    if (upperLimit >= tileY && tileY > lowerLimit) {
      return games.Tetravex.prototype._boardY[i];
    }
  }
  return games.Tetravex.prototype._boardY[2];
};

games.Tetravex.prototype._findNearestX = function(tileX) {
  // summary: Examine all the possible x co-ord board values that
  // the tile may be dropped on and return the nearest.
  // tileX: the x co-od of the top left corner of the tile

  // pseudo code algorithm for working out where to drop the tile in a 3x3 grid
  // slightly tricky because of the gap between the boards.
  // p0 if (tilex <= 20 + half_square) return 20 simple
  // p1 if (70 + half_square) >= tilex > (70 - half_square) return 70 same
  // p2 if (120 + half_square) >= tilex > (120 - half_square) return 120 same
  // p3 if (170 + (padding / 2) >= tilex > (170 - half_square) return 120 tricky - note diff return
  // p4 if (220 + half_square) >= tilex > (220 - half_square - tile_width - (pad/2)) tricky
  // p5 if (270 + half_square) >= tilex > (270 - half_square) return 270 same
  // p6 if (tilex > 320 - half_square)
  //
  // 
  // p0____|_________p1|_________p2|_____p3|_____________p4|_________p5|__________p6
  // |_:___.___:_|_:___.___:_|_:___.___:_|_:___.___:_|_:___.___:_|_:___.___:|_:___.___:_|
  // 20__________70_________120_________170_________220_________270________320
  //
  // | square line
  // : padding
  // . half_square

  // p0
  if (tileX <= games.Tetravex.prototype._boardX[0] + games.Tetravex.prototype._half_square()) {
    return games.Tetravex.prototype._boardX[0];
  }

  var p;
  // iterate over the middle square options.
  for (p = 1; p <= 5; p++) {
    var f = 0;
    var upperLimit = games.Tetravex.prototype._boardX[p] + games.Tetravex.prototype._half_square();
    var lowerLimit = games.Tetravex.prototype._boardX[p] - games.Tetravex.prototype._half_square();

    if (p == 3) {
      upperLimit = games.Tetravex.prototype._boardX[p] + (games.Tetravex.prototype._props.padding / 2);
      f = 1;
    }

    if (p == 4) {
      lowerLimit = games.Tetravex.prototype._boardX[p] - games.Tetravex.prototype._half_square()
          - games.Tetravex.prototype._props.tile_size - (games.Tetravex.prototype._props.padding / 2);
    }

    console.log("Interation " + p + " - Is " + upperLimit + " >= " + tileX + " > " + lowerLimit + " therefore square "
        + games.Tetravex.prototype._boardX[p]);

    if ((upperLimit >= tileX) && (tileX > lowerLimit)) {
      return games.Tetravex.prototype._boardX[p - f];
    }
  }
  // must be p6
  return games.Tetravex.prototype._boardX[6];
};