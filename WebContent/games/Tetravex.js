dojo.provide(
    "games.Tetravex", null, {
      p_tileSize : 40
    });

dojo.require("dojox.gfx");
dojo.require("dojox.gfx.move");

// set up a name space
games.Tetravex = function() {
};

// better as just variables?
games.Tetravex._props = {
  suface_width : 400,
  suface_height : 200,
  tileSize : 40,
  indent : 20,
  padding : 0,
  boardSize : 3
};

// set the padding and then reset the board grid arrays.
games.Tetravex.setPadding = function(padding) {
  games.Tetravex._props.padding = padding;
  games.Tetravex._boardX = games.Tetravex.init_boardX(games.Tetravex._props.boardSize);
  games.Tetravex._boardY = games.Tetravex.init_boardY(games.Tetravex._props.boardSize);
};

games.Tetravex.setBoardSize = function(size) {
  games.Tetravex._props.boardSize = size;
};

games.Tetravex._half_square = (games.Tetravex._props.tileSize / 2) + (games.Tetravex._props.padding); // convenience

// board grid x co-ords
games.Tetravex._boardX = [];
games.Tetravex.init_boardX = function(boardSize) {
  var boardX = [];
  boardX[0] = games.Tetravex._props.indent;
  for ( var f = 1; f < (2 * boardSize) + 2; f++) {
    boardX[f] = games.Tetravex._props.indent
        + ((games.Tetravex._props.tileSize + games.Tetravex._props.padding * 2) * (f));
  }
  return boardX;
};
games.Tetravex._boardX = games.Tetravex.init_boardX(3);

// The tiles are squares so the Y co-ords are the same as the first X co-ords
games.Tetravex._boardY = [];
games.Tetravex.init_boardY = function() {
  for ( var y = 0; y <= games.Tetravex._props.boardSize; y++) {
    games.Tetravex._boardY[y] = games.Tetravex._boardX[y];
  }
};
games.Tetravex.init_boardY();

// TODO:
// A sparse array of square objects that store references to the tiles.??
games.Tetravex.squares = [];

// Initialise the game.
games.Tetravex.initialize = function() {
  var container = dojo.byId("tetravex");
  var surface = dojox.gfx.createSurface(
      container, games.Tetravex._props.suface_width, games.Tetravex._props.suface_height);
  surface.whenLoaded(function() {
    games.Tetravex._initSurface(surface);
  });
  return;
};

games.Tetravex._drawBoard = function(surface) {
  // summary: Use the global this._boardX and this._boardY arrays to draw the board grid

  var path = surface.createPath().setStroke(
      "black");

  // left board horizontal lines
  var i;
  for (i = 0; i <= games.Tetravex._props.boardSize; i++) {
    var x = games.Tetravex._boardX[0];
    var y = games.Tetravex._boardY[i];
    var h = games.Tetravex._boardX[games.Tetravex._props.boardSize];
    path.moveTo(
        x, y);
    path.hLineTo(h);
    path.closePath();
  }

  // left board vertical lines
  for (i = 0; i <= games.Tetravex._props.boardSize; i++) {
    path.moveTo(
        games.Tetravex._boardX[i], games.Tetravex._boardY[0]).vLineTo(
        games.Tetravex._boardY[games.Tetravex._props.boardSize]).closePath();
  }

  // right board horizontal lines
  for (i = 0; i <= games.Tetravex._props.boardSize; i++) {
    path.moveTo(
        games.Tetravex._boardX[games.Tetravex._props.boardSize + 1], games.Tetravex._boardY[i]).hLineTo(
        games.Tetravex._boardX[(games.Tetravex._props.boardSize * 2) + 1]).closePath();
  }
  // right board vertical lines
  for (i = 4; i <= (games.Tetravex._props.boardSize * 2) + 1; i++) {
    path.moveTo(
        games.Tetravex._boardX[i], games.Tetravex._boardY[0]).vLineTo(
        games.Tetravex._boardY[games.Tetravex._props.boardSize]).closePath();
  }
};

// the array that stores the tiles.
games.Tetravex._tile = [];
games.Tetravex._origin = {
  x : 0,
  y : 0
};

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
            // don't go over the left or right
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

  // create and place the tiles
  var t = 0;
  for ( var y = 0; y < games.Tetravex._props.boardSize; y++) { // one for now.
    for ( var x = 1; x <= games.Tetravex._props.boardSize; x++) {
      games.Tetravex._tile[t] = createTile(
          Math.ceil(Math.random() * 9), Math.ceil(Math.random() * 9), Math.ceil(Math.random() * 9), Math.ceil(Math
              .random() * 9));
      games.Tetravex._tile[t].applyLeftTransform({
        dx : games.Tetravex._boardX[games.Tetravex._props.boardSize + x] + (games.Tetravex._props.padding),
        dy : games.Tetravex._boardY[y] + (games.Tetravex._props.padding)
      });
      t++;
    }
  }

  // make tiles movable, and subscribe them to call back functions
  // that makes sure they drop to the nearest square, move then to the front, and record their original location in case
  // they need to be moved back
  for ( var t = 0; t < games.Tetravex._tile.length; t++) {
    var moveMe = [];
    moveMe[t] = new dojox.gfx.Moveable(
        games.Tetravex._tile[t]);
    dojo.subscribe(
        "/gfx/move/stop", this, function(mover) {
          moveToNearestSquare(mover);
        });
    dojo.subscribe(
        "/gfx/move/start", this, function(mover) {
          ;
          mover.shape.moveToFront();
        });
    dojo.connect(
        moveMe[t], "onMouseDown", null, (function(moveMe) {
          // a call back closure that remembers each moveMe that it's given, sweet!
          return function(evt) {
            games.Tetravex._origin.x = moveMe.shape.matrix.dx;
            games.Tetravex._origin.y = moveMe.shape.matrix.dy;
          };
        })(moveMe[t]));
  }

  // construct a tile from triangles and numbers.
  function createTile(topNum, leftNum, bottomNum, rightNum) {
    var tileSize = games.Tetravex._props.tileSize;
    var middle = games.Tetravex._props.tileSize / 2;
    var tileGroup = surface.createGroup();
    // from CSS? - 0 black, 1 brown, 2 red, 3 orange, 4 yellow, 5 green, 6 blue, 7 purple, 8 grey, 9 white.
    var tileColour = [ "black", "#C17D11", "#CC0000", "#F57900", "#EDD400", "#73D216", "#3465A4", "#75507B", "#BABDB6",
        "white" ];
    var NumColour = [ "white", "white", "white", "black", "black", "black", "white", "white", "black", "black" ];

    var top = tileGroup.createPolyline([ 0, 0, tileSize, 0, middle, middle, 0, 0 ]);
    var left = tileGroup.createPolyline([ 0, 0, middle, middle, 0, tileSize, 0, 0 ]);
    var bottom = tileGroup.createPolyline([ 0, tileSize, middle, middle, tileSize, tileSize, 0, tileSize ]);
    var right = tileGroup.createPolyline([ tileSize, tileSize, middle, middle, tileSize, 0, tileSize, tileSize ]);

    top.setFill(
        tileColour[topNum]).setStroke(
        "black");
    left.setFill(
        tileColour[leftNum]).setStroke(
        "black");
    bottom.setFill(
        tileColour[bottomNum]).setStroke(
        "black");
    right.setFill(
        tileColour[rightNum]).setStroke(
        "black");

    // the x and y co-ord the text is related to a fraction of the tile size, plus or minus a fraction of the font size,
    // which is itself a fraction of the tile size.
    var topText = tileGroup.createText(
        {
          x : (games.Tetravex._props.tileSize / 2) - (0.4 * games.Tetravex._props.tileSize / 4),
          y : (games.Tetravex._props.tileSize / 4) + (0.3 * games.Tetravex._props.tileSize / 4),
          text : topNum
        }).setStroke(
        NumColour[topNum]).setFill(
        NumColour[topNum]).setFont(
        {
          family : "sans-serif",
          size : games.Tetravex._props.tileSize / 4 + "pt"
        });

    var leftText = tileGroup.createText(
        {
          x : (games.Tetravex._props.tileSize / 4) - (0.7 * games.Tetravex._props.tileSize / 4),
          y : (games.Tetravex._props.tileSize / 2) + (0.5 * games.Tetravex._props.tileSize / 4),
          text : leftNum
        }).setStroke(
        NumColour[leftNum]).setFill(
        NumColour[leftNum]).setFont(
        {
          family : "sans-serif",
          size : games.Tetravex._props.tileSize / 4 + "pt"
        });

    var bottomText = tileGroup.createText(
        {
          x : (games.Tetravex._props.tileSize / 2) - (0.4 * games.Tetravex._props.tileSize / 4),
          y : ((games.Tetravex._props.tileSize / 4) * 3) + (0.7 * games.Tetravex._props.tileSize / 4),
          text : bottomNum
        }).setStroke(
        NumColour[bottomNum]).setFill(
        NumColour[bottomNum]).setFont(
        {
          family : "sans-serif",
          size : games.Tetravex._props.tileSize / 4 + "pt"
        });

    var rightText = tileGroup.createText(
        {
          x : ((games.Tetravex._props.tileSize / 4) * 3) - (0.1 * games.Tetravex._props.tileSize / 4),
          y : (games.Tetravex._props.tileSize / 2) + (0.5 * games.Tetravex._props.tileSize / 4),
          text : rightNum
        }).setStroke(
        NumColour[rightNum]).setFill(
        NumColour[rightNum]).setFont(
        {
          family : "sans-serif",
          size : games.Tetravex._props.tileSize / 4 + "pt"
        });

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

  // TODO:
  // each square needs a tile property, a reference to a tile
  // and an above, below, left and right tile so that the numbers can be checked.

  // always return home, needs to be wrapped in a test.
  // deltaX = games.Tetravex._origin.x - mover.shape.matrix.dx + (games.Tetravex._props.padding);
  // deltaY = games.Tetravex._origin.y - mover.shape.matrix.dy + (games.Tetravex._props.padding);

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
  if (tileY < (games.Tetravex._boardY[0] + games.Tetravex._half_square)) {
    return games.Tetravex._boardY[0];
  }

  // iterate over the middle square options
  for ( var i = 1; i <= games.Tetravex._props.boardSize - 2; i++) {
    var lowerLimit = games.Tetravex._boardY[i] - games.Tetravex._half_square;
    var upperLimit = games.Tetravex._boardY[i] + games.Tetravex._half_square;
    // console.log("lower limit > = " + lowerLimit + " Y:" + tileY + " > upper limit" + upperLimit);
    if (upperLimit >= tileY && tileY > lowerLimit) {
      return games.Tetravex._boardY[i];
    }
  }
  return games.Tetravex._boardY[games.Tetravex._props.boardSize - 1];
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
  if (tileX <= games.Tetravex._boardX[0] + games.Tetravex._half_square) {
    return games.Tetravex._boardX[0];
  }

  // iterate over the middle square options.
  for ( var p = 1; p <= (games.Tetravex._props.boardSize * 2) - 1; p++) {
    var f = 0;
    var upperLimit = games.Tetravex._boardX[p] + games.Tetravex._half_square;
    var lowerLimit = games.Tetravex._boardX[p] - games.Tetravex._half_square;

    if (p == games.Tetravex._props.boardSize) {
      upperLimit = games.Tetravex._boardX[p] + (games.Tetravex._props.padding);
      f = 1;
    }

    if (p == games.Tetravex._props.boardSize + 1) {
      lowerLimit = games.Tetravex._boardX[p] - games.Tetravex._half_square - games.Tetravex._props.tileSize
          - (games.Tetravex._props.padding);
    }

    // console.log("Interation " + p + " - Is " + upperLimit + " >= " + tileX + " > " + lowerLimit + " therefore square"
    // + games.Tetravex._boardX[p]);

    if ((upperLimit >= tileX) && (tileX > lowerLimit)) {
      return games.Tetravex._boardX[p - f];
    }
  }
  // must be the last square
  return games.Tetravex._boardX[games.Tetravex._props.boardSize * 2];
};