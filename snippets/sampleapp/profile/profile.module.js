////////////////////////////////
// App : Profile Module
// Owner  : Eshwaran Veerabahu
// Last changed date : 2017/02/05
// Version : 6.1.0.8
// Modified By : Eshwaran Veerabahu
/////////////////////////////////

(function ()
{
    'use strict';

    angular
        .module('app.profile', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {

        console.log("Profile Module 6.1.0.8");

        $stateProvider
            //Parent State
            .state('app.profile',{
                url : '/profile',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/profile/profile.html',
                        controller : 'ProfileController as vm'
                    }
                }
            });
    }
})();