module.exports = function (app) {

	app.all('*', function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "http://localhost:8080");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
		res.header("X-Powered-By", ' 3.2.1');
		res.header("Content-Type", "application/json;charset=utf-8");
		next();
	});

	app.post('/login', function (req, res) {
		console.log(req.body.email,req.body.password);
		
		var obj = {
			email: req.body.email,
			password: req.body.password
		}

		res.send(obj);
	});

	app.post('/register', function (req, res) {

	})
}