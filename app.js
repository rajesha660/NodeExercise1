var https = require('https')
	, fs = require('fs')
	, cluster = require('cluster')
	, numCPUs = require('os').cpus().length;
	
var options = {
	key: fs.readFileSync(__dirname + '/ssl/nodeexercise1.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/nodeexercise2.crt')
};


if(cluster.isMaster) {
	for(var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	
	cluster.on('fork', function(worker) {
		console.log(worker + "Worker is forked");
	});
	
	cluster.on('listening', function(worker, address) {
		console.log(worker + "is listening on " + address);
	});
	
	cluster.on('online', function(worker) {
		console.log(worker + "Worker is online");
	});
	
	cluster.on('disconnect', function(worker) {
		console.log(worker + "Worker is disconnect");
	});
	
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});
} else {
	https.createServer(options, function(req, res) {
		res.writeHead(200);
		res.end("Hello world \n");
	}).listen(8080);
}