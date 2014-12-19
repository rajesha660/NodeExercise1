var https = require('https')
	, fs = require('fs')
	, cluster = require('cluster')
	, numCPUs = require('os').cpus().length
	, domain = require('domain')
	, express = require('express')
	, app = express()
	, cons = require('consolidate');
	
var options = {
	key: fs.readFileSync(__dirname + '/ssl/nodeexercise1.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/nodeexercise2.crt')
};

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

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
		cluster.fork();
	});
	
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});
} else {

	var server = https.createServer(options, app);
	
	app.use(function(req, res, next) {
	
		var d = domain.create();
		d.on('error', function(err) {
			
			console.error('error', err.stack);
			try {
				
				var killerTimer = setTimeout(function() {
					process.exit(1);
				}, 30000);
				killtimer.unref();
				server.close();
				cluster.worker.disconnect();
				res.statusCode = 500;
				res.setHeader('content-type', 'text/plain');
				res.end('Oops, there was a problem!\n');
			} catch(er2) {
				console.error('Error sending 500!', er2.stack);
			}	
		});
	
		d.add(req);
		d.add(res);
		
		next();
	});
	
	server.listen(8080);
}

app.get('/', function(req, res) {
	res.render('home');
});

