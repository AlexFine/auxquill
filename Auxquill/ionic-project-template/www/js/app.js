// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'ngTagsInput'])

.run(function ($ionicPlatform, $rootScope, $state, spellcheck) {

        Parse.initialize("FAs7XLJDkIIkJXvHx3Z0UqLvxxKwNJ8VUpJfBDej", "cUbsuBR1F3E6pCyMecLQIRtEJDQcLHtjxuTp2Qri");

        var currentUser = Parse.User.current();
        currentUser = null;
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;

        if (currentUser) {
            $rootScope.user = currentUser;
            $rootScope.isLoggedIn = true;
            $state.go('tab.dash');
        }
        //  spellcheck.prepare();
        $ionicPlatform.ready(function () {



            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
    })
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $stateProvider
            .state('intro', {
                url: '/intro',
                templateUrl: 'templates/intro.html',
                controller: 'IntroCtrl'
            })
            .state('welcome', {
                url: '/welcome?clear',
                templateUrl: 'templates/welcome.html',
                controller: 'WelcomeController'
            })
            .state('analyze', {
                url: '/analyze',
                templateUrl: 'templates/analyze.html',
                controller: 'AnalyzeController'
            })
            .state('Account', {
                url: '/Account',
                templateUrl: 'templates/Account.html',
                controller: 'AccountController'
            })
            .state('login', {
                url: '/login',
                views: {
                    '': {
                        templateUrl: 'templates/login-page.html',
                        controller: 'LoginController'
                    }
                }
            })
            .state('signup', {
                url: '/signup',
                views: {
                    '': {
                        templateUrl: 'templates/signup-page.html',
                        controller: 'RegisterController'
                    }
                }
            })
            .state('webHome', {
                url: '/webHome',
                templateUrl: 'templates/webHome.html',
                controller: 'webHomeController'
            })
            .state('webHome2', {
                url: '/webHome2',
                templateUrl: 'templates/webHome2.html',
                controller: 'webHome2Controller'
            })

        .state('capture', {
            url: '/capture',
            templateUrl: 'templates/capture.html',
            controller: 'captureController'
        })

        .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })
            // Each tab has its own nav history stack:
            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })

        .state('tab.chats', {
                url: '/chats',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/tab-chats.html',
                        controller: 'ChatsCtrl'
                    }
                }
            })
            .state('tab.chat-detail', {
                url: '/chats/:chatId',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/chat-detail.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            })
            .state('webchat', {
                url: '/webchat/:chatId',
                templateUrl: 'templates/webchat.html',
                controller: 'webchatController'
            })
            .state('tab.info', {
                url: '/info',
                views: {
                    'tab-info': {
                        templateUrl: 'templates/tab-info.html',
                        controller: 'InfoCtrl'
                    }
                }
            })
            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            })
            /* .state('tab.instructions', {
                 url: '/instructions',
                 views: {
                     'tab-instructions': {
                         templateUrl: 'templates/tab-instructions.html',
                         controller: 'instructCtrl'
                     }
                 }
             })*/
            .state('tab.share', {
                url: '/share',
                views: {
                    'tab-share': {
                        templateUrl: 'templates/tab-share.html',
                        controller: 'shareCtrl'
                    }
                }
            })
            // if none of the above states are matched, use this as the fallback

        $urlRouterProvider.otherwise('/intro');

        // $urlRouterProvider.otherwise('/welcome?clear');


        $ionicConfigProvider.views.transition('none'); //Disables transitions
    })

.filter('trusted', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}])


.controller('MainCtrl', function ($scope, Camera, $http) {
    $scope.getPhoto = function () {
        Camera.getPicture().then(function (imageURI) {
            console.log(imageURI);
            $scope.lastPhoto = imageURI;
        }, function (err) {
            console.err(err);
        }, {
            quality: 75,
            targetWidth: 320,
            targetHeight: 320,
            saveToPhotoAlbum: false
        });
    };

    $scope.tags = [
        {
            text: 'Tag1'
        },
        {
            text: 'Tag2'
        },
        {
            text: 'Tag3'
        }
  ];
});
