dojo.provide("games.Tetravex");

dojo.require("dojox.gfx");
dojo.require("dojox.gfx.move");

// set up a name space (page 45 Dojo: The Definitive Guide, 1st Edition)
games.Tetravex = function() {

};

// properties object
games.Tetravex.prototype._props = {
  suface_width : 420,
  suface_height : 200,
  tile_size : 40, // keep me even.
  startX : 20,
  startY : 20,
  pad : 10,
  plus_pad : 0, // normally zero, used when not dropping tiles in the gap
  minus_gap : 0
};

games.Tetravex.prototype._half_tile = function() {
  return (this._props.tile_size / 2) + (this._props.pad / 2); // convenience
};

// 3x3 board - need to create these arrays dynamically for different size
// playing boards
// is the top left co-ordinated of the squares that make up the two boards
// TODO - does this need to be a function? see page 24 dtdg
/*
 * games.Tetravex.prototype._boardX = function() { return [ this._props.startX,
 * this._props.startX + this._props.tile_size + this._props.pad,
 * this._props.startX + ((this._props.tile_size + this._props.pad) * 2),
 * this._props.startX + ((this._props.tile_size + this._props.pad) * 3),
 * this._props.startX + ((this._props.tile_sizeh + this._props.pad) * 4),
 * this._props.startX + ((this._props.tile_size + this._props.pad) * 5),
 * this._props.startX + ((this._props.tile_size + this._props.pad) * 6),
 * this._props.startX + ((this._props.tile_size + this._props.pad) * 7) ]; };
 */
games.Tetravex.prototype._boardX = [ 20, 70, 120, 170, 220, 270, 320, 370 ];

/*
games.Tetravex.prototype._boardY = function() {
  return [ this._props.startY, this._props.startY + this._props.tile_size + this._props.pad,
      this._props.startY + ((this._props.tile_size + this._props.pad) * 2),
      this._props.startY + ((this._props.tile_size + this._props.pad) * 3) ];
};
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
  dojo
      .extend(
          dojox.gfx.Moveable,
          {
            onMoving : function(mover, shift) {
              if (mover.shape.matrix) {
                // don't go over the left or right edges - optimize by choosing
                // on x
                // value, 2 is the border??
                if ((shift.dx > 0 && mover.shape.matrix.dx > (games.Tetravex.prototype._props.suface_width - games.Tetravex.prototype._props.tile_size - 2))
                    || (shift.dx < 0 && mover.shape.matrix.dx < 2)) {
                  shift.dx = 0;
                }
                // don't go ovet the top or bottom
                if ((shift.dy < 0 && mover.shape.matrix.dy < 2)
                    || (shift.dy > 0 && mover.shape.matrix.dy > (games.Tetravex.prototype._props.suface_height - games.Tetravex.prototype._props.tile_size - 2))) {
                  shift.dy = 0;
                }
              }
            }
          });

  // make the tile movable.
  moveMe = new dojox.gfx.Moveable(
      rectangle);

  // subscribe to the global moving object stop event. Any time a tile
  // stops moving this is called.
  dojo.subscribe(
      "/gfx/move/stop", this, function moveToNearestSquare(mover) {

        // During game play will also need to call the check if tile is allowed
        // to be dropped
        // based on tile numbers
        function findNearestX(tileX) {
          // summary: Examine all the possible x co-ord board values that
          // the tile may be dropped on and return the nearest.
          // tileX: the x co-od of the top left corner of the tile

          // Quickly find if the tile is in a posistion less than
          // half way through the first square
          console.log("x + gap" + games.Tetravex.prototype._boardX[0] + " " + games.Tetravex.prototype._half_tile());
          if (tileX < games.Tetravex.prototype._boardX[0] + games.Tetravex.prototype._half_tile()) {
            return games.Tetravex.prototype._boardX[0];
          }

          var i;
          // iterate over the middle sqaure options.
          for (i = 1; i <= 5; i++) {

            // include half the gap when looking at the sqaure after it
            if (i == 2) {
              games.Tetravex.prototype._props.plus_pad = games.Tetravex.prototype._half_tile();
            }

            // this is the gap between the boards, no tile drop allowed.
            if (i == 3) {
              continue;
            }

            // include half the gap when looking at the sqaure after it
            if (i == 4) {
              games.Tetravex.prototype._props.minus_gap = games.Tetravex.prototype._half_tile();
            }

            console.log("Interation " + i + " x > " + (games.Tetravex.prototype._boardX[i] - games.Tetravex.prototype._half_tile()) + " x < "
                + (games.Tetravex.prototype._boardX[i] + games.Tetravex.prototype._half_tile()));

            if (tileX > (games.Tetravex.prototype._boardX[i] - games.Tetravex.prototype._half_tile() - games.Tetravex.prototype._props.minus_gap)
                && tileX < (games.Tetravex.prototype._boardX[i] + games.Tetravex.prototype._half_tile() + games.Tetravex.prototype._props.plus_pad)) {
              console.log("returning x of " + games.Tetravex.prototype._boardX[i]);
              return games.Tetravex.prototype._boardX[i];
            }
            games.Tetravex.prototype._props.plus_pad = games.Tetravex.prototype._props.minus_gap = 0;
          }
          // or greater than the last.
          return games.Tetravex.prototype._boardX[6];
        }
        ;

        function findNearestY(tileY) {
          return 30;
          // Quickly find if the tile is in a posistion less than
          // half way through the first square
          console.log("find nearest Y");
          if (tileY < games.Tetravex.prototype._boardY[0] + games.Tetravex.prototype._half_tile()) {
            return games.Tetravex.prototype._boardY[0];
          }

          var i;
          // iterate over the middle square options.
          for (i = 1; i <= 1; i++) {
            if (tileY > (games.Tetravex.prototype._boardY[i] - games.Tetravex.prototype._half_tile()) && tileY < games.Tetravex.prototype._boardY[i] + games.Tetravex.prototype._half_tile()) {
              console.log("returning y of " + games.Tetravex.prototype._boardY[i]);
              return games.Tetravex.prototype._boardY[i];
            }
          }

          return games.Tetravex.prototype._boardY[2];
        }
        ;

        console.clear();
        console.log("tile X is " + mover.shape.matrix.dx + "  Y is " + mover.shape.matrix.dy);

        var deltaX = findNearestX(mover.shape.matrix.dx) - mover.shape.matrix.dx;
        var deltaY = findNearestY(mover.shape.matrix.dy) - mover.shape.matrix.dy;

        mover.shape.applyLeftTransform({
          dx : deltaX,
          dy : deltaY
        });
      });
};