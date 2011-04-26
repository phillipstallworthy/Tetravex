dojo.provide(
    "games.Tetravex", null, {
      p_tileSize : 40
    }); // how do I get to this, do all my functins need to be in here.

dojo.require("dojox.gfx");
dojo.require("dojox.gfx.move");

// set up a name space (page 45 Dojo: The Definitive Guide, 1st Edition)
games.Tetravex = function() {

};

// properties object - normally only stuff that doesn't change goes in the prototype
// because when many objects are created of the same type there is only one prototype.
// can this whole thing be a object? What is provide providing again?
games.Tetravex._props = {
  suface_width : 400,
  suface_height : 200,
  tileSize : 40,
  indent : 20,
  padding : 5
};

games.Tetravex._half_square = function() {
  return (this._props.tileSize / 2) + (this._props.padding); // convenience
};

// 3x3 board - need to create these arrays dynamically for different size
// playing boards
// is the top left co-ordinated of the squares that make up the two boards
games.Tetravex._boardX = [ games.Tetravex._props.indent,
    games.Tetravex._props.indent + games.Tetravex._props.tileSize + games.Tetravex._props.padding * 2,
    games.Tetravex._props.indent + ((games.Tetravex._props.tileSize + games.Tetravex._props.padding * 2) * 2),
    games.Tetravex._props.indent + ((games.Tetravex._props.tileSize + games.Tetravex._props.padding * 2) * 3),
    games.Tetravex._props.indent + ((games.Tetravex._props.tileSize + games.Tetravex._props.padding * 2) * 4),
    games.Tetravex._props.indent + ((games.Tetravex._props.tileSize + games.Tetravex._props.padding * 2) * 5),
    games.Tetravex._props.indent + ((games.Tetravex._props.tileSize + games.Tetravex._props.padding * 2) * 6),
    games.Tetravex._props.indent + ((games.Tetravex._props.tileSize + games.Tetravex._props.padding * 2) * 7) ];

// The tiles are squares so the Y co-ords are the same as the first 3 X co-ords
var y;
games.Tetravex._boardY = [];
for (y = 0; y < 4; y++) {
  games.Tetravex._boardY[y] = games.Tetravex._boardX[y];
}

games.Tetravex.initialize = function() {
  var container = dojo.byId("tetravex");
  var surface = dojox.gfx.createSurface(
      container, this._props.suface_width, this._props.suface_height);
  surface.whenLoaded(function() {
    games.Tetravex._initSurface(surface);
  });
  return;
};

games.Tetravex._drawBoard = function(surface) {
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
};

games.Tetravex._tile = [ 3 ];

games.Tetravex._initSurface = function(surface) {
  // summary: draw the board, make the tiles
  games.Tetravex._drawBoard(surface);

  // override onMoving on your object and modify the "shift" object
  // so it never moves a shape outside of a specified boundaries.
  // http://dojo-toolkit.33424.n3.nabble.com/gfx-constrainedMoveable-td176539.html
  dojo.extend(
      dojox.gfx.Moveable, {
        onMoving : function(mover, shift) {
          if (mover.shape.matrix) {
            // don't go over the left or right edges - optimize by choosing
            // on x
            // value, 2 is the border??
            if ((shift.dx > 0 && mover.shape.matrix.dx > (games.Tetravex._props.suface_width
                - games.Tetravex._props.tileSize - 2))
                || (shift.dx < 0 && mover.shape.matrix.dx < 2)) {
              shift.dx = 0;
            }
            // don't go over the top or bottom
            if ((shift.dy < 0 && mover.shape.matrix.dy < 2)
                || (shift.dy > 0 && mover.shape.matrix.dy > (games.Tetravex._props.suface_height
                    - games.Tetravex._props.tileSize - 2))) {
              shift.dy = 0;
            }
          }
        }
      });

  // this section needs some tidy up
  games.Tetravex._tile[0] = createTile(
      1, 2, 3, 4);
  games.Tetravex._tile[0].applyLeftTransform({
    dx : games.Tetravex._boardX[4] + (games.Tetravex._props.padding),
    dy : games.Tetravex._boardY[0] + (games.Tetravex._props.padding)
  });

  games.Tetravex._tile[1] = createTile(
      5, 6, 7, 8);
  games.Tetravex._tile[1].applyLeftTransform({
    dx : games.Tetravex._boardX[5] + (games.Tetravex._props.padding),
    dy : games.Tetravex._boardY[0] + (games.Tetravex._props.padding)
  });

  games.Tetravex._tile[2] = createTile(
      9, 0, 1, 2);
  games.Tetravex._tile[2].applyLeftTransform({
    dx : games.Tetravex._boardX[6] + (games.Tetravex._props.padding),
    dy : games.Tetravex._boardY[0] + (games.Tetravex._props.padding)
  });

  for ( var t = 0; t < games.Tetravex._tile.length; t++) {
    // add tile to the surface
    // games.Tetravex._tile[t] = createTile("green",games.Tetravex._boardX[4], games.Tetravex._boardY[0]);
    // and make it moveable
    moveMe = new dojox.gfx.Moveable(
        games.Tetravex._tile[t]);
    dojo.subscribe(
        "/gfx/move/stop", this, function(mover) {
          moveToNearestSquare(mover);
        });
  }

  // I think maybe remove the transform, just make it a create tile function
  // and the colour should be a number.
  function createTile(topNum, leftNum, bottomNum, rightNum) {
    var tileSize = games.Tetravex._props.tileSize;
    var middle = games.Tetravex._props.tileSize / 2;
    var tileGroup = surface.createGroup();
    // can this come from CSS?
    // 0 black, 1 brown, 2 red, 3 orange, 4 yellow, 5 green, 6 blue, 7 purple, 8 grey, 9 white.
    var colour = [ "black", "#C17D11", "#CC0000", "#F57900", "#EDD400", "#73D216", "#3465A4", "#75507B", "#BABDB6",
        "white" ];

    var top = tileGroup.createPolyline([ 0, 0, tileSize, 0, middle, middle, 0, 0 ]);
    var left = tileGroup.createPolyline([ 0, 0, middle, middle, 0, tileSize, 0, 0 ]);
    var bottom = tileGroup.createPolyline([ 0, tileSize, middle, middle, tileSize, tileSize, 0, tileSize ]);
    var right = tileGroup.createPolyline([ tileSize, tileSize, middle, middle, tileSize, 0, tileSize, tileSize ]);

    top.setFill(
        colour[topNum]).setStroke(
        "black");
    left.setFill(
        colour[leftNum]).setStroke(
        "black");
    bottom.setFill(
        colour[bottomNum]).setStroke(
        "black");
    right.setFill(
        colour[rightNum]).setStroke(
        "black");

    var text = tileGroup.createText({
      x : 15,
      y : 13,
      text : "1"
    });
    text.setStroke(
        "white");
    text.setFill("white");
    text.setFont({
      family : "sans-serif"
    });
    console.log("font" + text.getFont() + "colour " + text.color);
    // .setFill( colour["blacka"]).setStroke("black");

    // is shape/group an object? can I add properties to it, IE top 1, left 4, the numbers.?
    return tileGroup;

  }
};

var moveToNearestSquare = function(mover) {

  // console.clear();
  // console.log("tile X is " + mover.shape.matrix.dx + " Y is " + mover.shape.matrix.dy);

  var deltaX = games.Tetravex._findNearestX(mover.shape.matrix.dx) - mover.shape.matrix.dx
      + (games.Tetravex._props.padding);
  var deltaY = games.Tetravex._findNearestY(mover.shape.matrix.dy) - mover.shape.matrix.dy
      + (games.Tetravex._props.padding);

  mover.shape.applyLeftTransform({
    dx : deltaX,
    dy : deltaY
  });
};

games.Tetravex._findNearestY = function findNearestY(tileY) {
  // summary: Examine all the possible y co-ord board values that
  // the tile may be dropped on and return the nearest.
  // tileX: the y co-ord of the top left corner of the tile

  // Quickly find if the tile is in a position less than half way through the first square
  if (tileY < (games.Tetravex._boardY[0] + games.Tetravex._half_square())) {
    return games.Tetravex._boardY[0];
  }

  // iterate over the middle square options
  var i;
  for (i = 1; i <= 1; i++) {
    var lowerLimit = games.Tetravex._boardY[i] - games.Tetravex._half_square();
    var upperLimit = games.Tetravex._boardY[i] + games.Tetravex._half_square();
    // console.log("lower limit > = " + lowerLimit + " Y:" + tileY + " > upper limit" + upperLimit);
    if (upperLimit >= tileY && tileY > lowerLimit) {
      return games.Tetravex._boardY[i];
    }
  }
  return games.Tetravex._boardY[2];
};

games.Tetravex._findNearestX = function(tileX) {
  // summary: Examine all the possible x co-ord board values that
  // the tile may be dropped on and return the nearest.
  // tileX: the x co-od of the top left corner of the tile

  // pseudo code algorithm for working out where to drop the tile in a 3x3 grid
  // slightly tricky because of the gap between the boards.
  // p0 if (tilex <= 20 + half_square) return 20
  // p1 if (70 + half_square) >= tilex > (70 - half_square) return 70
  // p2 if (120 + half_square) >= tilex > (120 - half_square) return 120
  // p3 if (170 + (padding) >= tilex > (170 - half_square) return 120
  // p4 if (220 + half_square) >= tilex > (220 - half_square - tile_width - (pad/2))
  // p5 if (270 + half_square) >= tilex > (270 - half_square) return 270
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
  if (tileX <= games.Tetravex._boardX[0] + games.Tetravex._half_square()) {
    return games.Tetravex._boardX[0];
  }

  var p;
  // iterate over the middle square options.
  for (p = 1; p <= 5; p++) {
    var f = 0;
    var upperLimit = games.Tetravex._boardX[p] + games.Tetravex._half_square();
    var lowerLimit = games.Tetravex._boardX[p] - games.Tetravex._half_square();

    if (p == 3) {
      upperLimit = games.Tetravex._boardX[p] + (games.Tetravex._props.padding);
      f = 1;
    }

    if (p == 4) {
      lowerLimit = games.Tetravex._boardX[p] - games.Tetravex._half_square() - games.Tetravex._props.tileSize
          - (games.Tetravex._props.padding);
    }

    // console.log("Interation " + p + " - Is " + upperLimit + " >= " + tileX + " > " + lowerLimit + " therefore square
    // "
    // + games.Tetravex._boardX[p]);

    if ((upperLimit >= tileX) && (tileX > lowerLimit)) {
      return games.Tetravex._boardX[p - f];
    }
  }
  // must be p6
  return games.Tetravex._boardX[6];
};