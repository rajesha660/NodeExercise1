var https = require('https')
	, fs = require('fs');
	
var options = {
	key: fs.readFileSync(__dirname + '/ssl/nodeexercise1.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/nodeexercise2.crt')
};

https.createServer(options, function(req, res) {
	res.writeHead(200);
	res.end("Hello world \n");
}).listen(8080);