module.exports = function (app) {
	// app.get('*',function (req,res) {
	// 	res.writeHead(200,{
	// 		''
	// 	})
	// })
	app.get('/login', function (req, res) {
		console.log(req.param.email);
		console.log(req.param.password);
	})
}