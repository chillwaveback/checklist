angular.module('Checklist').controller('testController',
    function($scope, $rootScope, _, testService) {
        $scope.saveTest = function() {
            $scope.test.release = $scope.releaseNumber;
            if(null != $scope.test.verified_by) {
                if($scope.test.verified_by.toLowerCase().indexOf($scope.verifiedBy.toLowerCase()) < 0) {
                    $scope.test.verified_by += ', ' + $scope.verifiedBy;
                }
            } else {
                $scope.test.verified_by = $scope.verifiedBy;
            }

            testService.saveTest($scope.test).then(
                function(data) {
                    // Refresh the test list and growl
                    // $rootScope.$broadcast('update:releaseList');
                    $rootScope.$broadcast('growl:success', 'Saved ' + $scope.test.name + ' successfully!');
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', 'Error saving ' + $scope.test.name + '!');
                }
            );
        }

        $scope.flushTest = function(filename) {
            testService.flushTest(filename, $scope.releaseNumber).then(
                function(data) {
                    $rootScope.$broadcast('refresh:test', filename);
                    $rootScope.$broadcast('growl:success', 'Flushed ' + $scope.test.name + ' successfully!');
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "error flushing: " + filename);
                }
            );
        }

        $scope.getVerifyClass = function(verify) {
            if(verify.verified) {
                if(verify.verified == 'pass') {
                    return 'bg-success text-success'
                } else {
                    return 'bg-danger text-danger'
                }
            } else {
                return '';
            }
        }

        $scope.shouldShow = function(verify) {
            var tests = _.pluck($scope.selectedFilters, 'test');
            return _.contains(tests, verify.verified);
        }

        $scope.shouldShowStep = function(step) {
            var tests = _.pluck($scope.selectedFilters, 'test');
            var toReturn = false;
            if(step.automated) {
                toReturn = _.contains(tests, 'automated');
            } else {
                _.each(step.verify, function(verify) {
                    toReturn = toReturn || _.contains(tests, verify.verified);
                });
            }
            return toReturn;
        }

        //button actions
        $scope.success = function(verify) {
            verify.verified = 'pass';
            verify.verified_by = $scope.verifiedBy;
            $scope.saveTest();
        }

        $scope.successAll = function(step) {
            _.each(step.verify, function(verify) {
                verify.verified = 'pass';
                verify.verified_by = $scope.verifiedBy;
            });
            $scope.saveTest();
        }

        $scope.fail = function(verify) {
            verify.verified = 'fail';
            verify.verified_by = $scope.verifiedBy;
            $scope.saveTest();
        }

        $scope.failAll = function(step) {
            _.each(step.verify, function(verify) {
                verify.verified = 'fail';
                verify.verified_by = $scope.verifiedBy;
            });
            $scope.saveTest();
        }

        $scope.reset = function(verify) {
            verify.verified = null;
            verify.verified_by = null;
            verify.note = null;
            $scope.saveTest();
        }

        //broadcast event handlers
        $rootScope.$on('update:verifiedBy', function(event, verifiedBy) {
            $scope.verifiedBy = verifiedBy;
        });

        $rootScope.$on('update:releaseNumber', function(event, releaseNumber) {
            $scope.releaseNumber = releaseNumber;
        });

        $rootScope.$on('update:test', function(event, test) {
            $scope.test = test;
        });

        $scope.filters = [
            { 
                icon: "<span class='glyphicon glyphicon-ok'></span>", 
                name: "Show Successes",
                test: 'pass',
                ticked: true  
            },
            { 
                icon: "<span class='glyphicon glyphicon-remove'></span>", 
                name: "Show Failures",
                test: 'fail',
                ticked: true  
            },
            { 
                icon: "<span class='glyphicon glyphicon-info-sign'></span>", 
                name: "Show Untested",
                test: null,
                ticked: true  
            },
            { 
                icon: "<span class='glyphicon glyphicon-cog'></span>", 
                name: "Show Automated",
                test: 'automated',
                ticked: false  
            }
        ];
});