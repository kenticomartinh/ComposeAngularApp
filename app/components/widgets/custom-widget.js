

angular.module('customWidget', [])
.directive('customWidget', function() {
  return {
    replace: true,
    
    scope: {
        cssClass: '@'
    },

    template: '<h2 className={{cssClass}}>Angular widget {{now}}</h2>',

    controller: function($scope, $element, $attrs, $location) {
        $scope.now = new Date().toLocaleTimeString();
        
        setInterval(
            function() {
                $scope.$apply(function () {
                    $scope.now = new Date().toLocaleTimeString();
                });
            }, 
            1000
        );
    }
  };
});

