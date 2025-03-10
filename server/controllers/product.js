var dbConnection = require('../../dbConnection');
dbConnection.connect();

// get all products in the store
module.exports.getAll = function(req, res){
	// query to get all products from product table
    dbConnection.get().query("SELECT * FROM product ", function(err, rows){
         if(err) res.send(err);
         //If no errors, send them back to the client
         res.json(rows);
    });
}; // end get all products

// get a product in the store with product id
module.exports.getOne = function(req, res){
	// query to get all products from product table
    dbConnection.get().query("SELECT * FROM product where productId = ?",[req.params.id], function(err, rows){
         if(err) res.send(err);
         //If no errors, send them back to the client
         res.json(rows[0]);
    });
}; // end get one product

// search product by product name
module.exports.search = function(req, res){
	// query to get all products from product table
	console.log('inside search funtion looking for  : '+req.params.key);
    dbConnection.get().query("SELECT * FROM product where name LIKE ? ", '%'+req.params.key+'%', function(err, rows){
         if(err) res.send(err);
         //If no errors, send them back to the client
        // console.log('inside search for result: '+rows[0]);
         res.json(rows);
    });
}; // end search product by name