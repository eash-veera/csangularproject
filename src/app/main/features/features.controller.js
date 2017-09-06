(function() {
    'use strict';
  
    angular
      .module('csangularproject')
      .controller('FeaturesController', FeaturesController);
  
    /** @ngInject */
    function FeaturesController() {
      var vm = this;
        
      vm.creationDate = 1504687197991;
      
      console.log('coming from the features controller !');
    }
  })();
  