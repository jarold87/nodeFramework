var args = process.argv.slice(2);
var port = 3000;
var env = 'dev';
if (args[0]) port = args[0];
if (args[1]) env = args[1];
var server = require(__dirname + '/app/lib/server.js');
var Server = new server(env, port);
Server.createServer();