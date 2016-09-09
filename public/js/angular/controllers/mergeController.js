angular.module('Checklist').controller('mergeController',
    function($scope, $rootScope, moment, _, testService) {
        $scope.getTestList = function() {
            testService.getMergeList().then(
                function(data) {
                    $scope.mergeList = data;
                    $rootScope.$broadcast('growl:success', "Updated merge list");
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "Error getting merge list");
                }
            );
        }

        $scope.mergeRelease = function(releaseIndex) {
            var release = $scope.mergeList[releaseIndex];
            testService.mergeRelease(release.release).then(
                function(data) {
                    $rootScope.$broadcast('growl:success', "Merged Release " + release.release + " successfully!");
                    $scope.getTestList();
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "Error Merging Release " + release.release);
                }
            );
        }

        $scope.mergeReleaseTest = function(releaseIndex, filename) {
            var release = $scope.mergeList[releaseIndex];
            testService.mergeReleaseTest(release.release, filename).then(
                function(data) {
                    $rootScope.$broadcast('growl:success', "Merged " + filename + " to regression successfully!");
                    $scope.getTestList();
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "Error Merging " + filename);
                }
            );
        }

        $scope.deleteReleaseTest = function(releaseIndex, filename) {
            var release = $scope.mergeList[releaseIndex];
            testService.deleteReleaseTest(release.release, filename).then(
                function(data) {
                    $rootScope.$broadcast('growl:success', "Deleted " + filename + " successfully!");
                    $scope.getTestList();
                },
                function(data) {
                    $rootScope.$broadcast('growl:error', "Error Deleting " + filename);
                }
            );
        }

        $scope.getTestList();
    });