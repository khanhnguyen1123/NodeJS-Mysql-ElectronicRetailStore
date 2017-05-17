(function() { 
   angular
      .module('meanApp')
      .controller('searchController', searchController);
   searchController.$inject = ['$location', '$http', '$scope', '$window', '$stateParams'];

   function searchController ($location,$http,$scope,$window, $stateParams) {      
      $scope.results=[];
      $scope.key = $stateParams.key;

      function getResults() {
         $http.get('/api/product/search/'+$scope.key)
            .success( function(data) {
               $scope.results = data;
               if ($scope.results.length == 0 )
                  $scope.message = "No Items Found";
               else
                  $scope.message = "";
            })
            .error ( function(error) {
               console.log(error);
            });         
      } // end getResults

      getResults();


         
      
   } // end searchController 

})();
