'use strict';

(function() {
    var COMPOSE = 'http://localhost:59691/';
    var PROJECT_ID = '85e06f31-6a8f-405c-ba9c-dc7aed4ed373';

    angular
        .module('myApp.compose', ['ngSanitize', 'angularLoad', 'customWidget'])
        .directive(
            'editableArea', 
            [
                '$http', 'angularLoad', '$sce',
                function($http, angularLoad, $sce) {
                    var 
                    
                    registerComponents = function(register) {
                        // Test of custom widget made in Angular
                        register("customWidget");
                    },

                    initComponents = function() {
                        cmsrequire(['jQuery', 'Activator'], function($, activator) {
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
                        if (window.FX == undefined)
                        {
                            window.FX = {
                                appPath: COMPOSE
                            };

                            angularLoad.loadScript(COMPOSE + 'js/RequireJS/require.js').then(function() {
                                angularLoad.loadScript(COMPOSE + 'js/RequireJS/config.js').then(function() {
                                    cmsrequire(['WidgetManager']);

                                    initComponents();
                                });
                            });
                        }
                    };

                    return {
                        scope: {
                            areaId: '@'
                        },
                        template : '<div class="compose" ng-bind-html="areaHtml"></div>',

                        controller: function($scope, $element, $attrs, $location) {
                            var url = COMPOSE + 'widgets/editablearea?location=' + PROJECT_ID + ':' + $scope.areaId;
                            $scope.areaHtml = 'Loading editable area content ...';
                                                
                            $http({
                                url : url
                            }).then(function (response) {
                                $scope.areaHtml = $sce.trustAsHtml(response.data);
                            }, function (error) {
                                console.log(error);
                            });

                            initDesign();
                        }
                    }
                }
            ]
        );
})();