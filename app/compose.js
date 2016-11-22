'use strict';

var COMPOSE = 'http://localhost:59691/';

angular.module('myApp.compose', ['ngSanitize', 'angularLoad', 'customWidget'])
.directive(
    'widgetZone', 
    [
        '$http', 'angularLoad', '$sce',
        function($http, angularLoad, $sce) {
            var 
            
            registerComponents = function(register) {
                // Test of custom widget made in Angular
                register("customWidget");
            },

            initComponents = function() {
                cmsrequire(['jQuery', 'FX/Activator'], function($, activator) {
                    registerComponents(function (name) { 
                        activator.registerActivation(
                            'angular-component-' + name.toLowerCase(),
                            function (node) {
                                var $component = $(node),
                                    props = $.parseJSON($component.attr('data-props')),
                                    markup,
                                    $widget;
                                    
                                name = snake_case(name);
                                markup = '<' + name;
                                for (var property in props) {
                                    if (props.hasOwnProperty(property)) {
                                        markup += ' ' + snake_case(property) + '="' + props[property] + '"';
                                    }
                                }
                                markup += '></' + name + '>';
                                $widget = $(markup);

                                try {
                                    angular.element($component).injector().invoke(function($compile) {
                                        var $scope = angular.element($component).scope();
                                        $component.empty();
                                        $component.append($compile($widget)($scope));
                                        $scope.$apply();
                                    });
                                }
                                catch (e) {
                                    alert(e);
                                }
                            },
                            true
                        );          
                    });
                });
            },

            snake_case = function (name) {
                return name.replace(/[A-Z]/g, function(letter, pos) {
                    return (pos ? '-' : '') + letter.toLowerCase();
                });
            },

            initDesign = function() {
                if (!window.FX.loaded) {
                    window.FX.loaded = true;

                    angularLoad.loadScript(COMPOSE + 'js/FX/RequireJS/require.js').then(function() {
                        angularLoad.loadScript(COMPOSE + 'js/FX/RequireJS/config.js').then(function() {
                            cmsrequire(['FX/WidgetManager']);

                            initComponents();
                        });
                    });
                }
            };

            return {
                scope: {
                    zoneId: '@'
                },
                template : '<div class="compose" ng-bind-html="zoneHtml"></div>',

                controller: function($scope, $element, $attrs, $location) {
                    var url = COMPOSE + 'WidgetManager/Zone?design=1&location=data:' + $scope.zoneId;
                    $scope.zoneHtml = 'Loading zone content ...';
                                        
                    $http({
                        url : url
                    }).then(function (response) {
                        $scope.zoneHtml = $sce.trustAsHtml(response.data);
                    }, function (error) {
                        console.log(error);
                    });

                    initDesign();
                }
            }
        }
    ]
);

window.FX = window.FX || {
    appPath: COMPOSE
};

