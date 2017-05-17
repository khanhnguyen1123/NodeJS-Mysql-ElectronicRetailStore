(function() { 
  angular
    .module('meanApp')
    .controller('productCtrl', productCtrl);
   productCtrl.$inject = ['$location','$http','$scope','authentication'];

    function productCtrl ($location,$http,$scope, authentication) {
      $scope.categories = ['All', 'TV','Tablet','Laptop','Smart Phone'];
      $scope.selectedCategory = $scope.categories[0];
      $scope.displayedItems = [];
      $scope.loggedIn = authentication.isLoggedIn();
      $scope.products =[];
      //Retrieve all the products to show on product page
      $http.get('/api/product/getAll')
        .success(function(data){
          //console.log(JSON.stringify(data));
          $scope.displayedItems = data;
          $scope.products = data;
        })
        .error(function(error) {
          console.log('Error: ' + error);
        });

      $scope.filter = function(category) {
        //console.log("Filtered Category: " + category);
        $scope.selectedCategory = category;
        if (category == "All") {
          $scope.displayedItems = $scope.products;
          return;
        }
        if (category == 'TV'){ // TV id is 1
          $scope.displayedItems = [];
          for (var i = 0; i < $scope.products.length; i++) { 
            var item = $scope.products[i];
            if (item.categoryId == 1)
              $scope.displayedItems.push(item);
          }
          return;
        }// end if 
        if (category == 'Tablet'){ // TV id is 2
          $scope.displayedItems = [];
          for (var i = 0; i < $scope.products.length; i++) { 
            var item = $scope.products[i];
            if (item.categoryId == 2)
              $scope.displayedItems.push(item);
          }
          return;
        }// end if
        if (category == 'Laptop'){ // TV id is 3
          $scope.displayedItems = [];
          for (var i = 0; i < $scope.products.length; i++) { 
            var item = $scope.products[i];
            if (item.categoryId == 3)
              $scope.displayedItems.push(item);
          }
          return;
        }// end if
        if (category == 'Smart Phone'){ // TV id is 4
          $scope.displayedItems = [];
          for (var i = 0; i < $scope.products.length; i++) { 
            var item = $scope.products[i];
            if (item.categoryId == 4)
              $scope.displayedItems.push(item);
          }
          return;
        }// end if

/*        $http.get('/api/lendingItemCategory/get/'+category)
        .success(function(data){
          console.log(JSON.stringify(data));
          $scope.requestedItems = data;
        })
        .error(function(error) {
          console.log('Error: ' + error);
        });
    

        $scope.displayedItems = [];
        for (let i = 0; i < $scope.rentItems.length; i++) { 
          let item = $scope.rentItems[i];
          if (item.category == category)
            $scope.displayedItems.push(item);
        }
  */      
      }  // end filter function


      
    }// end requestController

})();