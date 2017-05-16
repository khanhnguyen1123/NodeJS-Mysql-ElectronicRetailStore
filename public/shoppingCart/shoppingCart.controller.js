(function() { 
  angular
    .module('meanApp')
    .controller('shoppingCartController', shoppingCartController);
  shoppingCartController.$inject = ['$location','$http','$scope', 'authentication', 'meanData', 'filepickerService', '$state','$window'];

  function shoppingCartController ($location, $http, $scope, authentication, meanData, filepickerService, $state,$window) {
   
    $scope.shoppingCartItems = {};
    $scope.total=0 ;
    $scope.itemCost ={};
    // dont need to check for thic loggedin but just do it anyway for making sure
    if (authentication.isLoggedIn()){
       //user.accountId= authentication.currentUser()._id;
  
    }
    else{
      return;
    }  
    var distance, time;
    // get all items in shopping cart
    $http.post('/api/shoppingCart/get',authentication.currentUser())
      .success(function(data){
        console.log(JSON.stringify(data));
        $scope.shoppingCartItems = data;
        if (data[0] != undefined){
          distance = data[0].deliveryDistance;
          time = data[0].deliveryTime;
        }  
        // calculate total from items in shopping cart
        for(var i=0; i<Object.keys(data).length;i++){
          $scope.total += (data[i].price*data[i].quantity) ;
        }
        console.log("testing for total : "+ $scope.total+ " lenght " + Object.keys(data).length);
      })
      .error(function(error) {
        console.log('Error: ' + error);
      });

    // delete this item from shopping cart
    $scope.delete = function(id){
      console.log("inside delete test id : "+id);
      var theItem = {
        productId : id,
        accountId: authentication.currentUser()._id
      };
      
        var confirm = $window.confirm("Want to DELETE This Item?");
        if (confirm){
          $scope.total = 0; //reset total value
          $http.post('/api/shoppingCart/delete',theItem)
          .success(function(data){
                //recall get all items in shopping cart
                $http.post('/api/shoppingCart/get',authentication.currentUser())
                  .success(function(indata){
                    console.log(JSON.stringify(indata));
                    $scope.shoppingCartItems = indata;
                    // calculate total from items in shopping cart
                    for(var i=0; i<Object.keys(indata).length;i++){
                      $scope.total += (indata[i].price*indata[i].quantity) ;
                    }
                    console.log("testing for total again: "+ $scope.total+ " lenght " + Object.keys(indata).length);
                  })
                  .error(function(error) {
                    console.log('Error: ' + error);
                  });// end inside http call
           })
          .error(function(error) {
            console.log('Error: ' + error);
          }); // end http call
            
        }
        else{
          return;
        }

    }// end delete function
    
    //Redirects to Paypal Payment
    $scope.makePaypalPayment = function(){
      
      if ($scope.total> 0){
        var confirm = $window.confirm("Confirm Your payment for "+$scope.total);
       // $scope.itemCost.price = $scope.total;
        $scope.itemCost={
          accountId: authentication.currentUser()._id,
          amount: $scope.total,
          deliveryDistance: distance,
          deliveryTime: time,
          price : $scope.total
        };
        if (confirm) {
          $http.post('/create', $scope.itemCost)
            .success(function(data){
         //     $scope.transaction();
              console.log('khanh successfully inside make paypal payment scope '+JSON.stringify(data));   
              $window.location.href = data.link;
            })
            .error(function(data) {
              console.log('Error fail calling makePaypalPayment: ' + data);
            });
        }
        
      }
      else
        return;
      
    };// end make paypal payment

    // transaction for cheking out items in shopping cart
    $scope.transaction=function(){
      var trans = {
        accountId: authentication.currentUser()._id,
        amount: $scope.total,
        deliveryDistance: distance,
        deliveryTime: time
      };

      $http.post('/api/transaction/add',trans)
      .success(function(data){
        console.log(JSON.stringify(data));
        
        //$window.alert("Payment Successfull !! Thank You For Your Purchase");
    //    $location.path('profile');  // after payment redirect to profile page
      })// end success
      .error(function(error) {
        console.log('Error: ' + error);
      });// end http call

    }; // end transaction function

   
    
    
  }// end detailController function

})();