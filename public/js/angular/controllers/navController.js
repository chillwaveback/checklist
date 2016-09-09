angular.module('Checklist').controller('navController',
    function($scope, $rootScope, growl, testService) {
        //get user identity
        $scope.getUser = function() {
            testService.whoami().then(
                function(data) {
                    $scope.user = data.name;
                    $rootScope.$broadcast('update:verifiedBy', $scope.user);
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "Error getting current user");
                }
            );
        }

        $rootScope.$on('growl:info', function(event, message) {
            growl.info(message, {});
        });

        $rootScope.$on('growl:success', function(event, message) {
            growl.success(message, {});
        });

        $rootScope.$on('growl:error', function(event, message) {
            growl.error(message, {});
        });

        $rootScope.$on('growl:warning', function(event, message) {
            growl.warning(message, {});
        });

        $scope.getUser();
});