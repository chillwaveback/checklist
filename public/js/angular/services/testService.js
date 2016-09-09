angular.module('Checklist').service("testService", 
    function( $http, $q) {
        return({
            whoami: whoami,
            iam: iam,
            getReleases: getReleases,
            getTests: getTests,
            getRegressions: getRegressions,
            getTest: getTest,
            getTemplate: getTemplate,
            flushTest: flushTest,
            saveTest: saveTest,
            saveRelease: saveRelease,
            saveRegression: saveRegression,
            getMergeList: getMergeList,
            mergeRelease: mergeRelease,
            mergeReleaseTest: mergeReleaseTest,
            deleteReleaseTest: deleteReleaseTest
        });

        function whoami() {
            var request = $http({
                method: "get",
                url: "/api/whoami/?"+new Date().getTime(),
                responseType: "json",
            });

            return (request.then(handleSuccess, handleError));
        }

        function iam(name) {
            var request = $http({
                method: "post",
                url: "/api/whoami/?"+new Date().getTime(),
                responseType: "json",
                data: {
                    name: name
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        function getReleases() {
            var request = $http({
                method: "get",
                url: "/api/releases"+"?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function getTests(release) {
            var request = $http({
                method: "get",
                url: "/api/tests/"+release+ "?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function getRegressions(release) {
            var request = $http({
                method: "get",
                url: "/api/test/regression?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function getTest(test_name, release) {
            var request = $http({
                method: "get",
                url: "/api/test/"+test_name+"/"+release+"?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function getTemplate(test_name, release) {
            var request = $http({
                method: "get",
                url: "/api/template/"+test_name+"/"+release+"?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function flushTest(file_name, release_number) {
            var request = $http({
                method: "delete",
                url: "/api/test/" + file_name + "/" + release_number + "?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function saveTest(test) {
            var request = $http({
                method: "post",
                url: "/api/test/"+test.filename+"?"+new Date().getTime(),
                responseType: "json",
                data: test
            });

            return (request.then(handleSuccess, handleError));
        }

        function saveRelease(release_number, test) {
            var request = $http({
                method: "post",
                url: "/api/test/release/"+release_number+"?"+new Date().getTime(),
                responseType: "json",
                data: test
            });

            return (request.then(handleSuccess, handleError));
        }

        function saveRegression(file_name, test) {
            var request = $http({
                method: "post",
                url: "/api/test/regression/"+file_name+"?"+new Date().getTime(),
                responseType: "json",
                data: test
            });

            return (request.then(handleSuccess, handleError));
        }

        function getMergeList() {
            var request = $http({
                method: "get",
                url: "/api/test/merge?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function mergeRelease(release_number) {
            var request = $http({
                method: "post",
                url: "/api/test/merge/" + release_number + "?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function mergeReleaseTest(release_number, file_name) {
            var request = $http({
                method: "post",
                url: "/api/test/merge/" + release_number + "/" + file_name + "?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function deleteReleaseTest(release_number, file_name) {
            var request = $http({
                method: "delete",
                url: "/api/test/merge/" + release_number + "/" + file_name + "?"+new Date().getTime(),
            });

            return (request.then(handleSuccess, handleError));
        }

        function handleError(response) {
            if(! angular.isObject(response.data) || ! response.data.message) {
                return($q.reject("An unknown error occurred."));
            }

            return( $q.reject(response.data.message));
        }

        function handleSuccess(response) {
            return (response.data);
        }
    }
);