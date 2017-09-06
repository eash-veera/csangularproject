(function() {
  'use strict';

  angular
    .module('csangularproject')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'app/main/home/home.html',
        controller: 'HomeController',
        controllerAs: 'home'
      })
      .state('features', {
        url:'/features',
        templateUrl: 'app/main/features/features.html',
        controller: 'FeaturesController',
        controllerAs: 'features'
      });

    $urlRouterProvider.otherwise('/home');
  }

})();
