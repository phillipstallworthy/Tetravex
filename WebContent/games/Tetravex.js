dojo.provide(
    "games.Tetravex", null, {});

dojo.require("dojox.gfx");
dojo.require("dojox.gfx.move");
dojo.require("dojo.io.script"); // for the JSONP function
dojo.require("games.tileData");

// set up a name space
games.Tetravex = function() {
};

games.Tetravex._props = {
  suface_width : 400,
  suface_height : 200,
  padding : 0
};
// _underscored as should be set by function
games.Tetravex._boardX = [];
games.Tetravex._boardY = [];
games.Tetravex._half_square = 0; // half a square including padding
games.Tetravex._tileSize = 0;
games.Tetravex._boardSize = 2;
games.Tetravex._surface = null;
// TODO: A sparse array of square objects that store references to the tiles.??
games.Tetravex.squares = [];
// the array that stores the tiles.
games.Tetravex._tile = [];
games.Tetravex._tileData = []; // xhr retrieved
games.Tetravex._origin = {
  x : 0,
  y : 0
};
games.Tetravex._timeout = 500; // the timeout for fetching game data from the server

// Set the padding and then reset the board grid arrays.
games.Tetravex.setPadding = function(padding) {
  games.Tetravex._props.padding = padding;
};

// Set the board size, and then reset the board grid arrays.
// Note: not called yet, maybe by resize board function.
games.Tetravex.setTileSize = function(size) {
  games.Tetravex._tileSize = size;
};

// Initialise the game.
games.Tetravex.initialize = function(createBoard) {
  // first asynchronously get the data, then do some setup while waiting for the return.
  var deferred = games.Tetravex._xhrGameData();

  // temp module testing
  console.log("games.tileData.top " + games.tileData.top);
  console.log("games.tileData.bottom " + games.tileData.bottom);
  console.log("games.tileData.logSize(size) " + games.tileData.logSize(games.Tetravex._boardSize));

  var container = dojo.byId("tetravex");

  if (createBoard) {
    games.Tetravex._surface = dojox.gfx.createSurface(
        container, games.Tetravex._props.suface_width, games.Tetravex._props.suface_height);
  } else {
    games.Tetravex._surface.clear();
  }
  games.Tetravex._surface.whenLoaded(function() {
    games.Tetravex._drawBoard();
    games.Tetravex._extendOnMoving();

    // If the call back has finished or erred then create the tiles ( on error local data is produced)
    // We will only actually get the 1, error condition if the XHR fails before it gets here
    // which would require a very small local time out, 1ms on my dev machine was still too long.
    // else
    // If we are still waiting for a return then add deferred call backs to the chain that will fire when it does.
    // Calls to createTiles cannot be put into the original call back functions as there is a chance
    // they will fire before the surface is loaded, which would be bad.
    console.debug("XHR fired " + deferred.fired);
    if (deferred.fired == 0 || deferred.fired == 1) {
      console.debug("XHR was finished");
      games.Tetravex._createTiles();
    } else {
      deferred.addCallback(function(response) {
        console.debug("XHR not finished, this additional callback fires when it does.");
        games.Tetravex._createTiles();
        return response;
      });
      deferred.addErrback(function(response) {
        console.debug("XHR not finished, this additional errback fires when it does.");
        games.Tetravex._createTiles();
        return response;
      });
    }
    // If the local time out is long then maybe a call back has not even been fired yet.
    // Very cool IMHO, because they will get called, and still work.
    console.debug("Returning from initialize function. ");
  });
  return;
};

// reset the board with new tiles
games.Tetravex.reset = function() {
  games.Tetravex._tile = [];
  games.Tetravex.initialize(false);
};

// reset the board and re-initialise to a size one greater than current
games.Tetravex.resetPlus = function() {
  if (games.Tetravex._boardSize < 5) {
    games.Tetravex._boardSize++;
    games.Tetravex._tile = [];
    games.Tetravex.initialize(false);
  }
};

// reset the board and re-initialise to a size one less than current
games.Tetravex.resetMinus = function() {
  if (games.Tetravex._boardSize > 2) {
    games.Tetravex._boardSize--;
    games.Tetravex._tile = [];
    games.Tetravex.initialize(false);
  }
};

// this is the JSONP version
games.Tetravex._xhrGameData = function() {
  return dojo.io.script.get({
    callbackParamName : "tileDataCallback", // Read by the jsonp service to set the name of the function returned, set
                                            // by Dojo. IE Dojo sets the name of the call back and the client and the server
                                            // use this parameter to pass the value.
    url : games.Tetravex._dataUrl,
    handleAs : "json", // Strip the comments and eval to a JavaScript object
    timeout : games.Tetravex._timeout, // Call the error handler if nothing after .5 seconds
    preventCache : true,
    content : {
      format : "json",
      size : games.Tetravex._boardSize
    }, // content is the query string
    // Run this function if the request is successful
    load : function(response, ioArgs) {
      console.debug(
          "successful xhrGet", response, ioArgs);
      games.Tetravex._tileData = response.n;
      return response; // always return the response back
    },
    // Run this function if the request is not successful
    error : function(response, ioArgs) {
      console.debug("failed xhrGet");
      games.Tetravex._tileData = games.Tetravex._localTileNumbers.n;
      return response; // always return the response back
    }
  });
};

// if the XHR times out or errors then generate the numbers locally
// If created locally then the cs check sum will be incorrect and the score
// will not be eligible for the global high score table, should really be a UI option
games.Tetravex._localTileNumbers = {
  "n" : [ [ 1, 1, 1, 1 ], [ 2, 2, 2, 2 ], [ 3, 3, 3, 3 ], [ 4, 4, 4, 4 ] ],
  "cs" : null
};

games.Tetravex._drawBoard = function() {
  // summary: Initialise board size variables and draw the board on the surface

  games.Tetravex._initGlobals();

  var path = games.Tetravex._surface.createPath().setStroke(
      "black");

  // left board horizontal lines
  var i;
  for (i = 0; i <= games.Tetravex._boardSize; i++) {
    var x = games.Tetravex._boardX[0];
    var y = games.Tetravex._boardY[i];
    var h = games.Tetravex._boardX[games.Tetravex._boardSize];
    path.moveTo(
        x, y);
    path.hLineTo(h);
    path.closePath();
  }

  // left board vertical lines
  for (i = 0; i <= games.Tetravex._boardSize; i++) {
    path.moveTo(
        games.Tetravex._boardX[i], games.Tetravex._boardY[0]).vLineTo(
        games.Tetravex._boardY[games.Tetravex._boardSize]).closePath();
  }

  // right board horizontal lines
  for (i = 0; i <= games.Tetravex._boardSize; i++) {
    path.moveTo(
        games.Tetravex._boardX[games.Tetravex._boardSize + 1], games.Tetravex._boardY[i]).hLineTo(
        games.Tetravex._boardX[(games.Tetravex._boardSize * 2) + 1]).closePath();
  }
  // right board vertical lines
  for (i = games.Tetravex._boardSize + 1; i <= (games.Tetravex._boardSize * 2) + 1; i++) {
    path.moveTo(
        games.Tetravex._boardX[i], games.Tetravex._boardY[0]).vLineTo(
        games.Tetravex._boardY[games.Tetravex._boardSize]).closePath();
  }
};

games.Tetravex._initGlobals = function() {
  // initialize the game global variables that are based on board size
  // used by draw board, and the unit tests
  games.Tetravex._tileSize = games.Tetravex._props.suface_width / ((2 * games.Tetravex._boardSize) + 2);
  games.Tetravex._half_square = (games.Tetravex._tileSize / 2) + (games.Tetravex._props.padding);
  games.Tetravex._boardX = [];
  games.Tetravex._boardY = [];
  games.Tetravex._boardX[0] = games.Tetravex._tileSize / 2;
  // console.debug("board x " + games.Tetravex._boardX[0]);
  for ( var f = 1; f < (2 * games.Tetravex._boardSize) + 2; f++) {
    games.Tetravex._boardX[f] = (games.Tetravex._tileSize / 2)
        + ((games.Tetravex._tileSize + games.Tetravex._props.padding * 2) * (f));
    // console.debug("board x " + games.Tetravex._boardX[f]);
  }
  for ( var y = 0; y <= games.Tetravex._boardSize; y++) {
    games.Tetravex._boardY[y] = games.Tetravex._boardX[y];
  }
};

games.Tetravex._extendOnMoving = function() {

  // override onMoving on your object and modify the "shift" object
  // so it never moves a shape outside of a specified boundaries.
  // http://dojo-toolkit.33424.n3.nabble.com/gfx-constrainedMoveable-td176539.html
  dojo
      .extend(
          dojox.gfx.Moveable, {
            onMoving : function(mover, shift) {
              if (mover.shape.matrix) {
                // don't go over the left or right
                if ((shift.dx > 0 && mover.shape.matrix.dx > (games.Tetravex._props.suface_width
                    - games.Tetravex._tileSize - 2))
                    || (shift.dx < 0 && mover.shape.matrix.dx < 2)) {
                  shift.dx = 0;
                }
                // don't go over the top or bottom
                if ((shift.dy < 0 && mover.shape.matrix.dy < 2)
                    || (shift.dy > 0 && mover.shape.matrix.dy > (games.Tetravex._props.suface_height
                        - games.Tetravex._tileSize - 2))) {
                  shift.dy = 0;
                }
              }
            }
          });

};

games.Tetravex._createTiles = function() {
  // create and place the tiles
  var t = 0;
  for ( var y = 0; y < games.Tetravex._boardSize; y++) {
    for ( var x = 1; x <= games.Tetravex._boardSize; x++) {

      // random tiles, not playable
      // games.Tetravex._tile[t] = createTile(Math.ceil(Math.random() * 9), Math.ceil(Math.random() * 9),
      // Math.ceil(Math.random() * 9), Math.ceil(Math.random() * 9));

      // console.debug("tile data " + games.Tetravex._tileData);
      // console.debug("tile data " + games.Tetravex._tileData[t][0] + " " + games.Tetravex._tileData[t][1] + " "
      // + games.Tetravex._tileData[t][2] + " " + games.Tetravex._tileData[t][3]);

      // use the tile data to populate the tiles
      games.Tetravex._tile[t] = createTile(
          games.Tetravex._tileData[t][0], games.Tetravex._tileData[t][1], games.Tetravex._tileData[t][2],
          games.Tetravex._tileData[t][3]);

      games.Tetravex._tile[t].applyLeftTransform({
        dx : games.Tetravex._boardX[games.Tetravex._boardSize + x] + (games.Tetravex._props.padding),
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
    var tileSize = games.Tetravex._tileSize;
    var middle = games.Tetravex._tileSize / 2;
    var tileGroup = games.Tetravex._surface.createGroup();
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
          x : (games.Tetravex._tileSize / 2) - (0.4 * games.Tetravex._tileSize / 4),
          y : (games.Tetravex._tileSize / 4) + (0.3 * games.Tetravex._tileSize / 4),
          text : topNum
        }).setStroke(
        NumColour[topNum]).setFill(
        NumColour[topNum]).setFont(
        {
          family : "sans-serif",
          size : games.Tetravex._tileSize / 4 + "pt"
        });

    var leftText = tileGroup.createText(
        {
          x : (games.Tetravex._tileSize / 4) - (0.7 * games.Tetravex._tileSize / 4),
          y : (games.Tetravex._tileSize / 2) + (0.5 * games.Tetravex._tileSize / 4),
          text : leftNum
        }).setStroke(
        NumColour[leftNum]).setFill(
        NumColour[leftNum]).setFont(
        {
          family : "sans-serif",
          size : games.Tetravex._tileSize / 4 + "pt"
        });

    var bottomText = tileGroup.createText(
        {
          x : (games.Tetravex._tileSize / 2) - (0.4 * games.Tetravex._tileSize / 4),
          y : ((games.Tetravex._tileSize / 4) * 3) + (0.7 * games.Tetravex._tileSize / 4),
          text : bottomNum
        }).setStroke(
        NumColour[bottomNum]).setFill(
        NumColour[bottomNum]).setFont(
        {
          family : "sans-serif",
          size : games.Tetravex._tileSize / 4 + "pt"
        });

    var rightText = tileGroup.createText(
        {
          x : ((games.Tetravex._tileSize / 4) * 3) - (0.1 * games.Tetravex._tileSize / 4),
          y : (games.Tetravex._tileSize / 2) + (0.5 * games.Tetravex._tileSize / 4),
          text : rightNum
        }).setStroke(
        NumColour[rightNum]).setFill(
        NumColour[rightNum]).setFont(
        {
          family : "sans-serif",
          size : games.Tetravex._tileSize / 4 + "pt"
        });

    return tileGroup;

  }
};

var moveToNearestSquare = function(mover) {

  // console.clear();
  // console.debug("tile X is " + mover.shape.matrix.dx + " Y is " + mover.shape.matrix.dy);

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
  for ( var i = 1; i <= games.Tetravex._boardSize - 2; i++) {
    var lowerLimit = games.Tetravex._boardY[i] - games.Tetravex._half_square;
    var upperLimit = games.Tetravex._boardY[i] + games.Tetravex._half_square;
    // console.debug("lower limit > = " + lowerLimit + " Y:" + tileY + " > upper limit" + upperLimit);
    if (upperLimit >= tileY && tileY > lowerLimit) {
      return games.Tetravex._boardY[i];
    }
  }
  return games.Tetravex._boardY[games.Tetravex._boardSize - 1];
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
  // console.debug("Interation " + 0 + " - Is " + tileX + " <= " + (games.Tetravex._boardX[0] +
  // games.Tetravex._half_square));
  if (tileX <= games.Tetravex._boardX[0] + games.Tetravex._half_square) {
    return games.Tetravex._boardX[0];
  }

  // iterate over the middle square options.
  for ( var p = 1; p <= (games.Tetravex._boardSize * 2) - 1; p++) {
    var f = 0;
    var upperLimit = games.Tetravex._boardX[p] + games.Tetravex._half_square;
    var lowerLimit = games.Tetravex._boardX[p] - games.Tetravex._half_square;

    if (p == games.Tetravex._boardSize) {
      upperLimit = games.Tetravex._boardX[p] + (games.Tetravex._props.padding);
      f = 1;
    }

    if (p == games.Tetravex._boardSize + 1) {
      lowerLimit = games.Tetravex._boardX[p] - games.Tetravex._half_square - games.Tetravex._tileSize
          - (games.Tetravex._props.padding);
    }

    // console.debug("Interation " + p + " - Is " + upperLimit + " >= " + tileX + " > " + lowerLimit + " therefore
    // square"
    // + games.Tetravex._boardX[p]);

    if ((upperLimit >= tileX) && (tileX > lowerLimit)) {
      return games.Tetravex._boardX[p - f];
    }
  }
  // must be the last square
  return games.Tetravex._boardX[games.Tetravex._boardSize * 2];
};