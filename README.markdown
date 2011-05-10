Another clone of Tetravex
=========================

http://en.wikipedia.org/wiki/Tetravex
I am writing this web version as an exercise in JavaScript and Dojo, Dijits and unit testing.

---------------------------------------
Game play
---------
Move the tiles from the right to the left, matching the edge numbers
Play here http://phillipstallworthy.github.com/

---------------------------------------
Cool Design Features
--------------------

- The game is written in Javascript and Dojo, so it will run on any modern browser or smart phone.

- The graphics are rendered by the dojo.gfx library. This means that the game will be displayed 
  using SVG, VML, Silverlight or Canvas, depending what is available in the browser.

- The data for the tile numbers is retrieved with an Ajax call utilising the Dojo JSONP technique from a node.js application
  hosted on duostack. The code starts to asynchronously fetch the data early in game initialisation and a Dojo deferred reference
  is kept. The board and grid is drawn and then if the deferred not ready then another callback function is added to the chain so
  that the tiles will be drawn when the server does return. If this all takes longer that 0.5 second then the data is generated
  locally.

- Some of algorithms in the code are unit tested with the DOH Dojo unit testing framework.

---------------------------------------

TODO:
-----
The game is not yet playable, it's a work in progress.
- There seems to be a tile drop issue, revisit the unit tests
- Add unit tests for the node.js code, hosted on duostack. correct data, random tiles, solution not supplied
- Add logic to prevent a tile being dropped in an occupied square.
- Add logic to prevent a tile being dropped in a right side square
  when the edges to adjacent tiles do not match
- Logic to recognise when the game is finished, and stop the clock
- Dojo slider to change the board size.
- High score table
- Dojo menu dijit - start, reset, high scores etc
- Dojo timer 
- I have an idea that the server could supply a checksum with the tile data so that only server supplied
  data would be valid for a global high score table. Locally created data could be read when in the 
  ordered state making cheating fairly easy. Game result + checksum would be checked on the server. Needs login name and db.

Phill.