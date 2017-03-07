angular.module('CST')
.factory('FileLoader', function($http){
    return {
        getFile: function(file) {
              return $http.get(file);
        }
    };
});