(function() { 
  angular
    .module('meanApp')
    .controller('detailController', detailController);
  detailController.$inject = ['$location','$http','$scope','$stateParams','meanData', 'authentication', 'meanData', 'filepickerService', '$state','$window'];

  function detailController ($location, $http, $scope, $stateParams, meanData,authentication, meanData, filepickerService, $state,$window) {
   
    $scope.item = {};
    $scope.cartQuantity = 1;
    let id = $stateParams.random;

    $http.get('/api/product/getOne/'+id)
      .success(function(data){
        console.log(JSON.stringify(data));
        $scope.item = data;
      })
      .error(function(error) {
        console.log('Error: ' + error);
      });
    // google map direction service 
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    function calculateAndDisplayRoute(desLat, desLng) {
        directionsService.route({
          origin: {lat:37.335 ,lng: -121.881},
          destination: {lat: desLat,lng: desLng},
          travelMode: 'DRIVING'
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }  // end google map direction service
    function initMap(lat,lng){
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: {lat: lat , lng: lng}    // 37.712 , -122.092
        });
        directionsDisplay.setMap(map);
        var marker = new google.maps.Marker({
          position: {lat: lat, lng: lng},
          map: map,
          title : 'Your Location (Shipping Address)'
        });// end marker
        calculateAndDisplayRoute(lat,lng);
        console.log("who win first !!!");
    }  // end function initMap
    var service = new google.maps.DistanceMatrixService;  
    meanData.getProfile()
            .success(function(data) {
              $scope.user = data;
 if(data.lat == undefined ){
  window.alert("Please update your Address for calculating SHIPPING TIME!!! Now We assume YOU ARE IN THE STORE");
  data.lat =   37.335;
  data.lng = -121.881;
 }  
              service.getDistanceMatrix({
              origins: [{lat:37.335 ,lng: -121.881}],
              destinations: [{lat: data.lat, lng: data.lng}],
              travelMode: 'DRIVING',
              unitSystem: google.maps.UnitSystem.IMPERIAL,
              avoidHighways: false,
              avoidTolls: false
              }, function(response, status) {
                if (status !== 'OK') {
                  alert('Error was: ' + status);
                } else {
                  var originList = response.originAddresses;
                  var destinationList = response.destinationAddresses;        
                  console.log ("get DistanceMatrixService is ok"+ originList + " des "+destinationList+" result "+ response.rows[0].elements[0].distance.text);
                  $scope.shipping = response.rows[0].elements[0].distance.text;
                  // assign delivery fact to item
                  $scope.item.deliveryDistance = response.rows[0].elements[0].distance.text;
                  $scope.item.deliveryTime = response.rows[0].elements[0].duration.text;
                  document.getElementById('kh').innerHTML = "Delivery:"+ $scope.shipping+" For "+response.rows[0].elements[0].duration.text ;
                }
              });  // end service.getDistanceMatrix
              
              // not in use yet
               initMap(data.lat,data.lng);
               
            })
            .error(function (e) {
               console.log(e);
            });
    
    //Redirects to Paypal Payment
    $scope.makePaypalPayment = function(){
      console.log("Paypal Payment Processing");
      $http.post('/create', $scope.item)
        .success(function(data){
          console.log('Paypal Payment Success: '+JSON.stringify(data));   
          $window.location.href=data.link;
        })
        .error(function(data) {
          console.log('Paypal Payment Error: ' + data);
        });
    };// end make paypal payment


    // add item to shopping cart
    /*need these inputs: productId, accountId, quantity, price 
     * 
     */

    $scope.addToShoppingCart =  function(){
      if ($scope.cartQuantity>$scope.item.quantity){
        $window.alert("Please Input Quantity Less Than The Available Number");
        return;
      }

      if (authentication.isLoggedIn()){
        var item = {
                accountId: authentication.currentUser()._id,
                productId: $scope.item.productId,
                price: $scope.item.price,
                quantity: $scope.cartQuantity,
                name: $scope.item.name,
                image: $scope.item.image1URL,
                deliveryDistance: $scope.item.deliveryDistance,
                deliveryTime: $scope.item.deliveryTime
              };
          console.log('before adding to shopping cart successfully: '); 
        $http.post('/api/shoppingCart/add',item)
            .success(function(data){
              console.log('adding to shopping cart successfully: '+data);   
              $window.alert("successfully Add Item to Your shoppingCart");
            })
            .error(function(data) {
              console.log('adding to shoppin g cart error: ' + data);
            });// end $http call
      }// end if 
      else{
        $window.alert("Please Signup or Signin To Add Item To Your Cart");
        return;
      }

      
    }; //end add to shopping cart 
    
    
  }// end detailController function

})();