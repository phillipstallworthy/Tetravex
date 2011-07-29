dependencies = {
  layers: [
    {
      // This is a specially named layer, literally 'dojo.js'
      // adding dependencies to this layer will include the modules
      // in addition to the standard dojo.js base APIs.
      name: "tetravex.js",
      dependencies: [
        "games.Tetravex",
        "game.tileData"
      ]
    }
  ],

  prefixes: [
    [ "games", "../../games" ],
    [ "dojox", "../dojox" ]
  ]
};