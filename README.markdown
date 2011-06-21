Another clone of Tetravex
=========================

I am writing this web version as an exercise in JavaScript, [Dojo](http://dojotoolkit.org/) and [Node.js](http://nodejs.org/)


Game play
---------
Move the tiles from the right to the left, matching the edge numbers.

Play here http://phillipstallworthy.github.com/


Cool Design Features
--------------------

- The game is written in Javascript and Dojo, so it will run on any modern browser or smart phone.

- The graphics are rendered by the dojo.gfx library. This means that the game will be displayed 
  using SVG, VML, Silverlight or Canvas, depending what is available in the browser.

- The data for the tile numbers is retrieved with an Ajax call utilising the Dojo JSONP cross-site technique from a node.js application
  hosted on [Joyent](http://phillipstallworthy.no.de/?size=10&tileDataCallback=callback). The code starts to asynchronously fetch the data early in game initialisation and a Dojo deferred reference
  is kept. The board and grid are drawn and then if the deferred response is not ready another function is added to the call back chain so
  that the tiles will be drawn when the server does return. If this all takes longer that 0.5 second then the data is generated
  locally.

- Some of algorithms in the code are unit tested with the DOH Dojo unit testing framework. The function that drops a tile into its nearest
  square is tested, as is the function that resizes the board when then size is changed.

- Each tile has a call back function attached to the onMouseDown event that keeps a reference to its Dojo movable object so that it
  knows the original coordinates of the tile in case it needs to be send back. The reference is kept by providing the call back 
  from within a closure. This causes it to keep a reference to data only available when the call back is registered, normally 
  when call backs are called they only get the event object. An alternative way to do this would be to use the mouse coordinates
  in the event object and the function that finds the nearest square.


TODO:
-----
The game is not yet playable, it's a work in progress.

- There seems to be a tile drop issue, revisit the unit tests

- It's possible to end up with a double set of tiles if you press  + or - really quick. I guess it's catching an event before deciding that it shouldn't.

- Add the random tile algorithm to the local code: alert, ok, check while waiting on user if this happens.

- Add unit tests for the node.js code, hosted on duostack. correct data, random tiles, solution not supplied

- Add logic to prevent a tile being dropped in an occupied square.

- Logic to prevent a tile being dropped in a right side square when the edges to adjacent tiles do not match, IE game play logic.

- Logic to recognise when the game is finished, and stop the clock, Dojo timer maybe. 

- Dojo slider to change the board size.

- High score table. Dojo tabbed table - local user, global - all users.

- Dojo menu dijit - start, reset, high scores etc

- I have an idea that the server could supply a checksum with the tile data so that only server supplied
  data would be valid for a global high score table. Locally created data could be read when in the 
  ordered state making cheating fairly easy. Game result + checksum would be checked on the server. Needs login name and db.
  
HOWTO:
-----

- Play/hack locally.
Check out all the code, edit dev.html and change dataUrl to either a local node instance, or use the Joyent one.
Then just open dev.html in a browser

- Make a Github home page release.
GitHub offer a web page [hosting service](http://pages.github.com/) that I use for hosting Tetravex just now.
To build the Javascript artifacts run build script in the build directory and then check in the updated files in the
phillipstallworthy.github.com project. Manually check that any changes to dev.html are reflected in index.html
