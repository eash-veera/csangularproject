(function ()
{
    'use strict';

    angular
        .module('app.profile')
        .controller('ProfileController', ProfileController);

    /** @ngInject */
    function ProfileController($rootScope, $scope, $state, $serviceCall, instanceContextService, ccPackageService, $mdDialog, $mdToast, $imageUploader)
    {
        var vm = this;

        vm.querySearchCountry = querySearchCountry;
        vm.editProfileDetails = editProfileDetails;
        vm.saveProfileDetails = saveProfileDetails;
        vm.cancelProfileDetailChanges = cancelProfileDetailChanges;
        vm.changePassword = changePassword;
        vm.navigateplanupgrade = navigateplanupgrade;
        vm.addAlacart = addAlacart;
        vm.setProfilePic = setProfilePic;
        vm.deleteCard = deleteCard;
        vm.makeCardDefault = makeCardDefault;

        vm.profileDetails = angular.copy($rootScope.instanceProfileDetails);

        var profileDetailsTemp;

        vm.isEditable = true;  

        vm.allCountries = [];

        vm.currentProfilePlanDetail;

        vm.userSlotCount = 3;

        vm.currentPlanDesc;

        vm.isProfileFreePlan = true;

        vm.allPaymentRecords;

        vm.allCardDetails;

        vm.profilePicConfig = {
            restrict : "image/png", // upload type if this is image then use `application/*`
            size : "1MB",
            crop : true,      // enable/disable the croping feature. by defualt make it false
            type : "image", // types available are `brochure`,`image` and `all`
            maxCount : 1       // upload file count 
        }

        //live (test) key - pk_test_ZsNRcfDr9sSVVVlT10wPdIPb
        //dev (test) key - pk_test_RVbf1rRmq4fv8rbGNt3QMXnV

        vm.cardAddStripeConfig = {
            publishKey: 'pk_test_ZsNRcfDr9sSVVVlT10wPdIPb',
            title: '12thDoor',
            description: "Invoicing made simple.",
            logo: '/assets/images/branding/12thDoorCygilBlue.png',
            label: 'Add Card'
        }

        /*Profile Operations - start*/

        function editProfileDetails(){
          vm.isEditable = false;
          profileDetailsTemp = angular.copy(vm.profileDetails);
        };

        function saveProfileDetails(){
          vm.isEditable = true;

          instanceContextService.setProfileDetails(vm.profileDetails)
            .then(function(response){
                if(response.IsSuccess = true){
                    angular.copy(vm.profileDetails, $rootScope.instanceProfileDetails);
                    // $rootScope.instanceProfileDetails = vm.profileDetails;
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Successfully saved changes.')
                        .position('bottom right' )
                        .hideDelay(3000)
                    );
                }else{
                    vm.isEditable = false;
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Error saving profile changes')
                            .textContent('There was an error in saving profile details.')
                            .ariaLabel('Error Profile Update')
                            .ok('Got it!')
                            .targetEvent(ev)
                    );
                }
                
            });
        };

        function cancelProfileDetailChanges(){
          vm.isEditable = true;
          vm.profileDetails = angular.copy(profileDetailsTemp);
        }

        function changePassword(ev){
            $mdDialog.show({
                templateUrl: 'app/main/profile/views/profile-details/modals/changePassword-modal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                controller: chngPasswordController,
                clickOutsideToClose: true
            })
            .then(function (answer) {}, function () {});

            chngPasswordController.$inject = ['$scope', '$rootScope', '$window', '$mdDialog', '$mdToast', 'instanceContextService'];

            function chngPasswordController($scope, $rootScope, $window, $mdDialog, $mdToast, instanceContextService){

                $scope.submitChangePassword = function(){
                    instanceContextService.setNewPassword($scope.changePasswordDetails.OldPassword,$scope.changePasswordDetails.Password)
                        .then(function(response){
                            $mdDialog.hide();

                            if(response.isSuccess === true){
                                $mdToast.show(
                                    $mdToast.simple()
                                    .textContent('Successfully changed password')
                                    .position('bottom right' )
                                    .hideDelay(3000)
                                );
                            }else{
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Incorrect password details')
                                        .textContent('Current password does not exist.')
                                        .ariaLabel('Incorrect password details')
                                        .ok('Got it!')
                                        .targetEvent(ev)
                                );
                            }
                        });
                };

                $scope.cancelChngPassword = function(){
                    $mdDialog.hide();
                };
            }
        };

        function querySearchCountry(query){
        	vm.results = [];
            for (var i = 0, len = vm.allCountries.length; i < len; ++i) {
               
                if (vm.allCountries[i].country.toUpperCase().startsWith(query.toUpperCase()) ) {
                    vm.results.push(vm.allCountries[i]);
                }
            }
            return vm.results;
        };

        function loadCountries(){
          var client =  $serviceCall.setClient("getCountries","profile"); // method name and service
          client.ifSuccess(function(data){   
            if(data.length > 0){
               for (var i = data.length - 1; i >= 0; i--) {
                 vm.allCountries.push({
                  country: data[i].country_name
                 })
               }
            }
          })
          client.ifError(function(data){ 
          
          })
          client.postReq();
        }

        loadCountries();

        /*Profile Operations - end*/

        /*Plan Operations - start*/

        function checkProfileCurrentplan(){

            ccPackageService.getSubscriptionPlan()
                .then(function(response){

                response = response.data;

                if(response.success === true){
                    $rootScope.instanceCurrentPlanDetails = response.data;

                    if($rootScope.instanceCurrentPlanDetails.codename === '12_pkg_personal'){
                        vm.isProfileFreePlan = true;
                        vm.currentPlanDesc = "Personal";
                    }else{
                        vm.isProfileFreePlan = false;
                        vm.currentPlanDesc = "Business";
                    }

                }else{
                    console.log('Could not retrive instance current plan !');
                }
                    
            });

        }

        checkProfileCurrentplan();
        

        function navigateplanupgrade(){
            $state.go('app.planupgrade.main');
        }

        /*Plan Operations - end*/


        /*User slot Operations - start*/

        function addAlacart(ev){
            $mdDialog.show({
                templateUrl: 'app/main/profile/views/manage-plan/modals/alacartVariant.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    updatePlanDetail: checkProfileCurrentplan
                },
                controller: addAlacartController,
                clickOutsideToClose: true
            })
            .then(function (answer) {}, function () {});

            /** @ngInject */
            function addAlacartController($scope, $rootScope, $window, ccPackageService, updatePlanDetail, $mdDialog){
                $scope.slots = 1;
                $scope.minSlots = 1;
                $scope.maxSlots = 25;

                $scope.slotPrices = {
                    monthly:6,
                    yearly:48
                };

                console.log($rootScope.instanceCurrentPlanDetails);

                $scope.selectedAlacartVariantIndex = 0;

                var injectablePlanPackageCodes = {"injPlanCode":$rootScope.instanceCurrentPlanDetails.codename,"injAlacartCode":""};

                console.log(injectablePlanPackageCodes);

                $scope.buyAlacartOption = function(ev){

                    if($scope.selectedAlacartVariantIndex === 0){
                        injectablePlanPackageCodes.injAlacartCode = "12_alacart_user_perM";
                    }else{
                        injectablePlanPackageCodes.injAlacartCode = "12_alacart_user_perY";
                    }

                    var alacartPackageStack = {
                        "tenantId": ""+$rootScope.cc_sessionInfo.Domain+"",
                        "alacartes":[
                            {"acode": ""+injectablePlanPackageCodes.injAlacartCode+"", "quantity":""+$scope.slots+"","action":"add"}
                        ]
                    };

                    ccPackageService.customizeSubscriptionPlan(alacartPackageStack)
                        .then(function(response){

                            // response = response.data; 

                            if(response.status === true){

                                updatePlanDetail();

                                $mdDialog.show(
                                      $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('User slots purchased')
                                        .textContent('Successfully purchased user slots, you can now add more users to your business.')
                                        .ariaLabel('User slots purchased')
                                        .ok('Got it!')
                                        .targetEvent(ev)
                                    );

                                // $state.go('app.profile');
                            }else{
                                $mdDialog.show(
                                      $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Purchasing user slots Failed')
                                        .textContent('Failed to purchase user slots.')
                                        .ariaLabel('Purchase user slots failed.')
                                        .ok('Got it!')
                                        .targetEvent(ev)
                                    );
                            }
                        });

                } 

            }
        }

        /*User slot Operations - end*/

        /*Profile pic update - start*/

        function setProfilePic(res){
            if(res.hasOwnProperty('image')){
                console.log(res.image[0]);

                var client = $imageUploader.setImage(vm.profileDetails.Email+'.png','profilePictures');
                    client.ifSuccess(function(data){ 
                        console.log('success image uploaded',data);
                        $rootScope.instanceProfileDetails.ProfilePicture = "http://"+$rootScope.cc_sessionInfo.Domain+"/apis/media/tenant/image/profilePictures/"+$rootScope.cc_sessionInfo.Username+".png?decache="+Math.random(); 
                    });
                    client.ifError(function(data){
                        console.log('error image was not uploaded',data); 
                    });
                    client.sendImage(res.image[0])
            } 
        }

        /*Profile pic update - end*/

        /*Purchase records operation - start*/
        function getPaymentLedger(){
            ccPackageService.getPaymentRecords()
                .then(function(response){
                    vm.allPaymentRecords = response.data;
                    console.log(vm.allPaymentRecords);
                });
        }

        getPaymentLedger();

        // vm.allPaymentRecords = [
        //     {'docLink':'024856','status':'succeeded', 'type':'One time payment', 'amount':875, 'receivedDate':new Date()},
        //     {'docLink':'033966','status':'failed', 'type':'Ala cart payment', 'amount':175, 'receivedDate':new Date()},
        //     {'docLink':'024969','status':'succeeded', 'type':'Ala cart payment', 'amount':235, 'receivedDate':new Date()}
        // ];

        console.log(vm.allPaymentRecords);
        /*Purchase records operation - end*/

        /*Manage cards operations -start*/
        function getAllCardDetails(){
            ccPackageService.getCreditCards()
                .then(function(response){
                    console.log(response);
                    vm.allCardDetails = response.data;
                });
        }

        getAllCardDetails();

        $rootScope.$on('add-stripecard-token-received', function(event, args) {
            
            var addCardDetails = {
                "token":""+args.id+"",
                "default":false
            };

            if(args.id){

                console.log(addCardDetails);

                ccPackageService.setCreditCard(addCardDetails)
                    .then(function(response){
                        if(response.data.status === true){
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Add card successfull')
                                    .textContent('Successfully added card, you can use this card by setting it as the default card.')
                                    .ariaLabel('Add card successfull')
                                    .ok('Got it!')
                                );

                            getAllCardDetails();
                        }else{
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Add card failed')
                                    .textContent('Failed to add card, please try again.')
                                    .ariaLabel('Add card failed.')
                                    .ok('Got it!')
                                );
                        }
                    });
            }
        });

        function makeCardDefault(defaultCardInfo, ev){
            defaultCardInfo = {"card_id":""+defaultCardInfo+""};

            ccPackageService.setDefaultCreditCard(defaultCardInfo)
                .then(function(response){
                    if(response.data.status === true){

                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Default card successfull')
                                .textContent('Successfully set card as default card, all transactions will be billed to this.')
                                .ariaLabel('Default card successfull')
                                .ok('Got it!')
                                .targetEvent(ev)
                            );

                        getAllCardDetails();
                    }else{
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Default card failed')
                                .textContent('Failed to set card as default.')
                                .ariaLabel('Default card failed.')
                                .ok('Got it!')
                                .targetEvent(ev)
                            );
                    }
                });

        }

        function deleteCard(deleteCardInfo, ev){
            deleteCardInfo = {"card_id":""+deleteCardInfo+""};

            ccPackageService.removeCreditCard(deleteCardInfo)
                .then(function(response){
                    if(response.data.status === true){
                        
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Delete card successfull')
                                .textContent('Successfully deleted card details.')
                                .ariaLabel('Delete card successfull')
                                .ok('Got it!')
                                .targetEvent(ev)
                            );

                        getAllCardDetails();
                    }else{
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Delete card failed')
                                .textContent('Failed to delete card details.')
                                .ariaLabel('Delete card failed')
                                .ok('Got it!')
                                .targetEvent(ev)
                            );
                    }
                });
        }
        /*Manage cards operations -end*/

    }
})();
