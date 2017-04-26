(function() {

   angular
      .module('meanApp')
      .controller('profileCtrl', profileCtrl);
   profileCtrl.$inject = ['$scope', '$location', 'meanData', '$http', 'authentication', '$state', 'filepickerService'];
   
   function profileCtrl($scope,$location, meanData,$http,authentication, $state, filepickerService) {      
      $scope.reload = function(){
         meanData.getProfile()
            .success(function(data) {
               data.profileImage = 'https://previews.123rf.com/images/triken/triken1608/triken160800028/61320729-Male-avatar-profile-picture-Default-user-avatar-guest-avatar-Simply-human-head-Vector-illustration-i-Stock-Vector.jpg';
               $scope.user = data;
               console.log('Profile Controller: ' + data.email+ 'account id'+data.accountID);
            })
            .error(function (e) {
               console.log(e);
            });
         $scope.closeAlert();
      };
      var geocoder = new google.maps.Geocoder();

      // get all transaction history
      $scope.transactionHistory;
      $http.post('/api/transaction/getTransactionFact', authentication.currentUser())
      .success(function(data){
         console.log(JSON.stringify(data));     
         $scope.transactionHistory = data;                 
      })
      .error(function(data) {
         console.log('Error: ' + data);
      });// end get all transaction history

      // get all transaction fact about this loggedin user
      $scope.transactionFactDetail;
      $http.post('/api/transaction/getTransactionFactDetail', authentication.currentUser())
      .success(function(data){
         console.log(JSON.stringify(data));     
         $scope.transactionFactDetail = data;                 
      })
      .error(function(data) {
         console.log('Error: ' + data);
      });// end get all transaction fact detail history

      $scope.uploadUserPhoto = function () {  // not in used yet [update this if have time KHANH]
         filepickerService.pick({
            mimetype: 'image/*',
            language: 'en',
            services: ['COMPUTER','DROPBOX','GOOGLE_DRIVE','IMAGE_SEARCH', 'FACEBOOK', 'INSTAGRAM'],
            openTo: 'IMAGE_SEARCH'
         },
            function(data){
            console.log(JSON.stringify(data));
            $scope.user.profileImage = data;
            $scope.updateUserPhoto();
         });
      };
      $scope.updateUserPhoto = function () {   // not in used yet [update this if have time KHANH]
         console.log("Upload Profile Picture");
         $http.post('/api/profile/updateUserPhoto', $scope.user)
            .success(function(data){
               console.log(JSON.stringify(data));                      
            })
            .error(function(data) {
               console.log('Error: ' + data);
            });
      };
      //update user profile
      $scope.updateUser1 = function () {
         $http.post('/api/profile/updateUser', $scope.user)
            .success(function(data){
               console.log(JSON.stringify(data));
               $scope.editMessage = "Profile Updated Successful!";
               document.getElementById('editAlert').classList.add("alert-success");
            })
            .error(function(data){
               console.log('Profile Controller Error on Updating User');
               console.log(data);
               $scope.editMessage = "Profile Update Failed";
               document.getElementById('editAlert').classList.add("alert-danger");
            })
         $('.alert').show();
      };
      $scope.closeAlert = function () {
         console.log("Closing");
         if ($scope.editMessage == "Profile Updated Successful!")
            document.getElementById('editAlert').classList.remove('alert-success');
         else
            document.getElementById('editAlert').classList.remove('alert-danger');
         $scope.editMessage = "";
         document.getElementById('editAlert').style.display = "none";
      }

      $scope.user = {};
      if (!authentication.isLoggedIn()) {
         $state.go("login");
      } else {
         $scope.reload();
      }

      $scope.updateUser= function() {
         
        var address = $scope.user.address+" "+$scope.user.city+' '+$scope.user.state+" "+$scope.user.zipcode;
        console.log("address is "+ address);
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
     /*       resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: resultsMap,
              position: results[0].geometry.location
            }); */
            $scope.user.lat = results[0].geometry.location.lat();
            $scope.user.lng = results[0].geometry.location.lng();
            console.log(" lat long: "+ $scope.user.lat+" | "+$scope.user.lng+ "result "+results[0].geometry.location);
            $scope.updateUser1();
            $scope.editMessage = "Profile Updated Successful!";
            document.getElementById('editAlert').classList.add("alert-success");
          } else {
            console.log('Geocode was not successful for the following reason: ' + status );      
          }
        });
      }// end convert geocoder address
   } // profile ctrl
})();