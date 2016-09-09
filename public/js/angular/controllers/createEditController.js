angular.module('Checklist').controller('createEditController',
    function($scope, $rootScope, moment, _, testService, configs) {
        $scope.getTestList = function() {
            testService.getRegressions().then(
                function(data) {
                    $scope.tests = data;
                    var pathName = window.location.pathname;
                    if(pathName.startsWith('/edit/')) {
                        $scope.isEdit = true;
                        //path is /edit/test_name/16.20 if it's release specific
                        //path is /edit/test_name/ if it's regression
                        if(!_.isUndefined(pathName.split('/')[3])) {
                            $scope.releaseYear = parseInt(pathName.split('/')[3].split('.')[0]);
                            $scope.releaseWeekNum = parseInt(pathName.split('/')[3].split('.')[1]);
                            $scope.releaseNumber = $scope.releaseYear + '.' + $scope.releaseWeekNum;
                        }
                        $scope.setCurrentTest(pathName.split('/')[2], pathName.split('/')[3]);
                    } else {
                        $scope.test = {
                            description: null,
                            filename: null,
                            name: null,
                            start_url: configs.startingUrl,
                            release: null,
                            verified_by: null,
                            test_group: $scope.testGroups[0],
                            steps: [{
                                name: null,
                                verify: [
                                    {
                                        data: null,
                                        name: null,
                                        note: null,
                                        verified: null,
                                        verified_by: null
                                    },
                                ]
                            }]
                        };
                        $scope.isReleaseSpecific = false;
                    }
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "error getting tests list for release: " + $scope.releaseNumber);
                }
            );
        }

        $scope.setCurrentTest = function(test, releaseNumber) {
            testService.getTemplate(test, releaseNumber).then(
                function(data) {
                    $scope.test = data;
                    var isRegression = _.find($scope.tests, function(testName) {
                        return testName.name == test;
                    });
                    $scope.isReleaseSpecific = !isRegression;
                    $scope.toMerge = $scope.test.merge_into;
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "error getting test: " + test);
                }
            );
        }

        $scope.saveTest = function() {
            if($scope.test.filename == null) {
                $scope.test.filename = $scope.test.name.replace(/\s/g, "") + '.json';
            }

            if(!$scope.test.filename.endsWith('.json')) {
                $scope.test.filename = $scope.test.filename + '.json';
            }

            if($scope.isReleaseSpecific) {
                $scope.test.merge_into = $scope.toMerge;

                testService.saveRelease($scope.releaseNumber, $scope.test).then(
                    function(data) {
                        $rootScope.$broadcast('growl:success', 'Saved ' + $scope.releaseNumber + '::' + $scope.test.name + ' successfully!');
                    },
                    function(data) {
                        $rootScope.$broadcast('growl:error', 'Error saving ' + $scope.test.name + '!');
                    }
                );
            } else {
                testService.saveRegression($scope.test.filename, $scope.test).then(
                    function(data) {
                        $rootScope.$broadcast('growl:success', 'Updated ' + $scope.test.name + ' successfully!');
                    },
                    function(data) {
                        $rootScope.$broadcast('growl:error', 'Error updating ' + $scope.test.name + '!');
                    }
                );
            }
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
            }
        }

        $scope.addVerify = function(step) {
            step.verify.push(
                {
                    data: null,
                    name: null,
                    note: null,
                    verified: null,
                    verified_by: null
                });
        }

        $scope.removeVerify = function(parentIndex, removalIndex) {
            $scope.test.steps[parentIndex].verify.splice(removalIndex, 1);
        }

        $scope.addStep = function() {
            $scope.test.steps.push(
                {
                    name: null,
                    verify: []
                });
            $scope.addVerify($scope.test.steps[$scope.test.steps.length-1]);
        }

        $scope.removeStep = function(removalIndex) {
            $scope.test.steps.splice(removalIndex, 1);
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
        $scope.releaseNumber = $scope.releaseYear + '.' + $scope.releaseWeekNum;

        $scope.testGroups = configs.testGroups;

        $scope.getTestList();
    });