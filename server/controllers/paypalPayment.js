var dbConnection = require('../../dbConnection');
dbConnection.connect();
var paypal = require('paypal-rest-sdk');

var config = {
  "port" : 5000,
  "api" : {
    "host" : "api.sandbox.paypal.com",
    "port" : "",            
    "client_id" : "Adp4zWEwj4Z6y4F-6KcSgKm4v5DCeuLdXW0y3Ajxg25uVjJvJxTRhen8W9Yg5jsCiWXw-Ka-PnzmLUIi",  // your paypal application client id
    "client_secret" : "EElohP0Qu611Q1Dxu6RuKFkQWBfNrEP72Nj3vl5Id_ufLxwPUcuYVN6OyfzDzll3C7FYmn3PQoq2Qjvo" // your paypal application secret id
  }
};

// initially configuration paypal module
paypal.configure(config.api);

var paypalPaymentID;
var body = {};
// this method will creat a payment for lending item
// @parameter: item price, owner id of the item (that use to get owner paypal email)
exports.create = function (req, res) {
	//console.log("khanh inside create method in the paypal payment js file checking $price: "+req.body.price);
	body = {
		accountId: req.body.accountId,
    	amount: req.body.amount,
        deliveryTime: req.body.deliveryTime,
        deliveryDistance: req.body.deliveryDistance
	};
	var payment = {
		"intent": "sale",
		"payer": {
			"payment_method": "paypal"
		},
		"redirect_urls":{
			"return_url": "http://localhost:5000/execute",   
			"cancel_url": "http://localhost:5000/cancel"
		},
		"transactions": [{
			"amount": {
				"currency": 'USD',
				"total": req.body.price
			},
			"description": 'awesomeness ohhh hoooo'
		}]
	};
	

	paypal.payment.create(payment, function (error, payment) {
	  if (error) {
	    console.log("khanh falling to call create payment"+error);
	  } else {
	     // need to use session for storing this paymentID
	     // req.session.paymentId = payment.id;
	      paypalPaymentID = payment.id;
	      console.log('print out payment id: '+paypalPaymentID);
	      var redirectUrl={};
	      for(var i=0; i < payment.links.length; i++) {
	        var link = payment.links[i];
	        if (link.method === 'REDIRECT') {
	          redirectUrl.link = link.href;
	        }
	      }
	      //res.redirect(redirectUrl);
	      res.status(200).json(redirectUrl);
	  }
	});
	
}; // end creat method

exports.execute = function (req, res) {
	//var paymentId = req.session.paymentId;
	var paymentId = paypalPaymentID;
	var payerId = req.param('PayerID');

	var details = { "payer_id": payerId };
	//console.log("print out payment id inside execute method:"+paymentId);
	var payment = paypal.payment.execute(paymentId, details, function (error, payment) {
		if (error) {
	      console.log(error);
	    } else {
	      
	      add(body);
	    //  res.send("Hell yeah complete payment!"+" <a href='/'> "+"click here to go back to home page"+"</a>");
	      res.redirect("/#/profile");	
	    }
	});
};

exports.cancel = function (req, res) {
 // res.redirect('/cancel');
 	//res.send("Your payment is canceled"+" <a href='/'> "+"click here to go back to home page"+"</a>");
 	res.redirect("/#/profile");
};

var add = function(body){
	console.log("inside adding to transaction: "+ body.accountId + " "+body.amount);
	var trans = {
    		accountId: body.accountId,
    		amount: body.amount,
            deliveryTime: body.deliveryTime,
            deliveryDistance: body.deliveryDistance
    	};
	// query to insert item to shopping cart
    dbConnection.get().query('INSERT INTO transaction SET ?',[trans],function(err, outResult){
    		if (err) throw err;
            // insert into transaction fact table 
            dbConnection.get().query('SELECT * FROM shoppingcart WHERE accountId = ? ',[body.accountId],function(err, result){
                if (err) throw err;
                console.log("inside add transaction test lenght: "+result.length+"insertId "+outResult.insertId +" "+result[0].price);
                for (var i=0;i<result.length;i++){
                    var transactionFact={
                        accountId: body.accountId,
                        name: result[i].name,
                        productId: result[i].productId,
                        price: result[i].price,
                        quantity: result[i].quantity,
                        transactionId: outResult.insertId
                    };
                    // query to insert item to shopping cart
                    dbConnection.get().query('INSERT INTO transactionfact SET ?',[transactionFact],function(err, result){
                            if (err) throw err;
                            console.log("test inside insert to transactionfact table");
                        });// end query insert item to transaction fact
                    // update product quantity
                    dbConnection.get().query("UPDATE product SET quantity= quantity- ? WHERE productId = ? ",
			      	  	[result[i].quantity,result[i].productId], function(err, insideRows){
			      	  	  if (err){
					          console.log('error form query dbConnection');
					          
					      }    
					      else{
						      	console.log("update product Successfully with new data ");
						      	
					      }
			      	  
			      	  })// end dbConnection query update user
                }// end for loop
                
                // delete from shopping cart  after making payment
                dbConnection.get().query("DELETE FROM shoppingcart WHERE accountId = ? ",[body.accountId],function(err, result){
                    if (err) throw err;
                });    
                //end delete from shopping cart
            
            });
            // end insert into transaction face table

            

    		
            
    	});
}; // end add function