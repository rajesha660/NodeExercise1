var https = require('https')
	, fs = require('fs')
	, cluster = require('cluster')
	, numCPUs = require('os').cpus().length
	, domain = require('domain')
	, express = require('express')
	, app = express()
	, cons = require('consolidate')
	, multipart = require('connect-multiparty')
	, fs = require('fs');
	
var options = {
	key: fs.readFileSync(__dirname + '/ssl/nodeexercise1.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/nodeexercise2.crt')
};

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(multipart());
app.use(function(req, res, next) {

	var message = "Path:"+req.path;
	console.log(message);
	fs.appendFileSync('log.txt', message);
	next();
});

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

	var files = fs.readdirSync('./uploads/');
	res.render('home', { 'files': files});
});

app.post('/fileupload', function(req, res) {
	
	var temp_path = req.files.fileupload.path;
	
	var target_path = './uploads/' + req.files.fileupload.name;
	
	console.log(temp_path);
	console.log(target_path);
	
	var is = fs.createReadStream(temp_path);
	var os = fs.createWriteStream(target_path);

	is.pipe(os);
	is.on('end',function() {
		fs.unlinkSync(temp_path);
	});
	res.redirect('/');
});

app.get('/filedownload/:name', function(req, res) {
	
	console.log(req.params.name);
	var filename = req.params.name;
	res.download('./uploads/'+filename, function(err) {
		// res.redirect('/');
	});
});

