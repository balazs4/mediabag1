require('./app')
	.get('server')
	.listen(5555, () => {
		console.log("Server is running...");
	});