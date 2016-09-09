'use strict';

var checklist = angular.module('Checklist', ['btford.socket-io', 'angular-growl', 'isteven-multi-select'])
    .constant('moment', moment)
    .factory('socket', function (socketFactory) {
        return socketFactory({
            prefix: 'checklist:'
        });
    })
    .factory('_', ['$window', function($window) {
        return $window._;
    }]);

checklist.config(['growlProvider', function (growlProvider) {
  growlProvider.globalTimeToLive(3000);
  growlProvider.onlyUniqueMessages(false);
  growlProvider.globalPosition('top-center');
}]);