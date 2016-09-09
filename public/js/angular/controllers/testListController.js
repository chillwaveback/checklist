angular.module('Checklist').controller('testListController',
    function($scope, $rootScope, $timeout, socket, testService) {

        $scope.getTestList = function() {
            testService.getTests($scope.releaseNumber).then(
                function(data) {
                    $scope.tests = data;
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "error getting tests list for release: " + $scope.releaseNumber);
                }
            );
        }

        $scope.handleTestClick = function(test) {
            window.scrollTo(0, 0);
            $scope.setCurrentTest(test);
        }

        $scope.setCurrentTest = function(test) {
            testService.getTest(test, $scope.releaseNumber).then(
                function(data) {
                    $scope.activeTest = test;
                    $rootScope.$broadcast('update:test', data);
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "error getting test: " + test);
                }
            );
        }

        //update release scope
        $scope.validateRelease = function() {
            if($scope.releaseForm.releaseYear.$valid && $scope.releaseForm.releaseWeekNum.$valid) {
                var releaseWeekNumPadded = $scope.releaseWeekNum;
                if(releaseWeekNumPadded < 10) {
                    releaseWeekNumPadded = '0' + releaseWeekNumPadded;
                }

                $scope.releaseNumber = $scope.releaseYear + '.' + releaseWeekNumPadded;
                $rootScope.$broadcast('growl:info', 'release updated to: ' + $scope.releaseNumber);
                $rootScope.$broadcast('update:releaseNumber', $scope.releaseNumber);
                $scope.getTestList();
                var pathName = window.location.pathname;
                if(pathName.startsWith('/test/')) {
                    $scope.setCurrentTest(pathName.split('/')[2]);
                }
            }
        }

        //default release to this week
        var today = new moment();
        var weekNum = today.week();
        //if the week number is odd, fall back to previous week
        if(weekNum % 2 != 0) {
            weekNum = weekNum - 1;
        }
        $scope.releaseWeekNum = weekNum;
        //TODO: update this in the year 3000
        $scope.releaseYear = today.subtract('2000', 'years').year();

        $timeout(function() {
            $scope.validateRelease();
        }, 25);

        $rootScope.$on('refresh:test', function(event, test) {
            $scope.getTestList();
            $scope.setCurrentTest(test);
        });

        socket.on('checklist:reloadReleases', function(releaseNumber, test) {
            //send release #, check if they're the same and update, otherwise nah
            if(releaseNumber == $scope.releaseNumber) {
                if($scope.activeTest && $scope.activeTest == test) {
                    $scope.setCurrentTest(test);
                }
                $scope.getTestList();
            }
        });
});