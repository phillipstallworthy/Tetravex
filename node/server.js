var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/json'});
  res.end('{"n":[[7,4,2,4],[3,9,6,4],[6,6,4,8],[2,8,5,1]],"cs":1029384756}\n');
}).listen(8124, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8124/');
