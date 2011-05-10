dojo.provide("games.tileData");
// DOJO //
games.tileData =
  
//Same object in the node module
  
// --------8<--------//
{
  top : 0,
  left : 1,
  bottom : 2,
  right : 3,
  moduleSize : undefined,
  logSize : function(size) {
    this.moduleSize = size;
    console.log(this.moduleSize);
  }
};
// --------8<--------//
