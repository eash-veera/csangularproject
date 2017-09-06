(function() {
  'use strict';

  angular
    .module('csangularproject')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
