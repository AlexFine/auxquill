angular.module('starter.controllers', ['ionic', 'ngCordova', 'starter.services', 'ui.router'])
    .controller('ChatDetailCtrl', function ($scope, $stateParams, photos, Chats, $ionicNavBarDelegate, $ionicModal, noteCreation, videos, summary, spellcheck, $cordovaGoogleAnalytics) {
        $scope.myIndex = $stateParams.chatId;
        $scope.photos = photos.queryNewEntries();
        $scope.numConcepts;

        $scope.callFunc = function () {
            var index = $scope.myIndex;
            $scope.photos = photos.queryNewEntries();
            $scope.photos[index].summary = "" + summary.summarize($scope.photos[index].text);
            var tmpvar = noteCreation.getNotes($scope.photos[index].text);
            $scope.notes = tmpvar;
            var tmpvar = ["Europe of the Scientific Revolution"];
            $scope.videos = videos.retrieveVideoList(tmpvar);
        }
        $scope.swipe = function (direction) {
            console.warn('Swipe:  ' + direction);
            $ionicNavBarDelegate.back();
        }

        $ionicModal.fromTemplateUrl('chat-detail.html', function ($ionicModal) {
            $scope.modal = $ionicModal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
    })
    .controller('ChatsCtrl', function ($scope, photos, $cordovaSocialSharing, $ionicLoading, $http, $ionicActionSheet, $cordovaFile, $cordovaCamera, $ionicPopup, Upload, $cordovaFileTransfer, $state, spellcheck, noteCreation, $cordovaGoogleAnalytics) {
        $scope.checkedArr = [];
        $scope.photos = photos.queryNewEntries();
        var saveToParse = function (data) {
            var Entry = Parse.Object.extend("Entry");
            var entry = new Entry();
            entry.save({
                createdBy: Parse.User.current(),
                time: data.time,
                text: "" + data.text,
                summary: "" + data.sentences.join(" "),
                notes: "" + data.notes.join("~")
            }, {
                success: function (gameScore) {
                    //alert("successfully saved to parse " + new Date(gameScore.get("time")).toString());
                    //$state.go('tab-account', {url: '/account', templateUrl: '/templates/tab-account.html', controller: 'AccountCtrl'})
                    $scope.doRefresh();
                },
                error: function (gameScore, error) {
                    alert("error saving to parse: " + JSON.stringify(error));
                }
            });
        }
        var shareArr = [];
        $scope.isChecked = false;
        $scope.takePic = function ($state) {
            var options = {
                quality: 80, //highest quality
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 1280,
                targetHeight: 1280
            };
            $cordovaCamera.getPicture(options).then(function (imageData) {
                $scope.loading = $ionicLoading.show({
                    content: 'Uploading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });
                var x = "" + (imageData);
                var fd = new FormData();
                fd.append("data", x);
                $http.post("http://quillapp.io/cgi-bin/sumpic.py", fd, {
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity
                }).success(function (data) {
                    //alert("success line 48: " + JSON.stringify(data).replace(/(\r\n|\n|\r)/gm, " "));
                    //var text2 = rmgarbage.clean(data.text);
                    //summary.summarize(data.text);

                    data.notes = noteCreation.getNotes(data.text)

                    saveToParse(data);
                    $scope.doRefresh();
                    $ionicLoading.hide();
                }).
                error(function (data) {
                    alert('error posting to server: ' + JSON.stringify(data));
                    $ionicLoading.hide();
                });
            }, function (err) {
                //                alert("Could not take picture: " + JSON.stringify(err));
            });
        };

        $scope.checkShared = function (index) {
            if ($scope.checkedArr[index]) {
                var x = noteCreation.getNotes(index);
                var xxx = noteCreation.retNotes2(index);
                shareArr.push("Notes:\n" + x.toString() + "\n\n" + "Summary:\n" + $scope.photos[index].summary + "\n\n");
            } else {
                shareArr.splice(index, 1);
            }
        };

        $scope.$on('$ionicView.enter', function () {
            $scope.doRefresh();
        });
        $scope.doRefresh = function () {
            $scope.photos = photos.queryNewEntries();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$apply();
        };

        $scope.callStuff = function () {
            if ($scope.photos != null) {
                for (var i = 0; i < photos.length; i++) {
                    //alert(photos[i].summary);
                }
            }
        };

        $scope.shareDialog = function (n) {
            var msgTest = $scope.photos[n].summary || "Invalid/Error Summary";
            window.plugins.socialsharing.share(msgTest, "Notes from Quill", null, null);
        };

        $scope.share = function () {
            var strshare = shareArr.join();
            window.plugins.socialsharing.share(strshare, "Notes from Quill", null, null);
        }

        $scope.remove = function (indexToDelete) {
            photos.deleteFromParse(indexToDelete);
        }
    })
    .controller('AccountCtrl', function ($scope, $state, $rootScope, $ionicHistory, $stateParams, $ionicModal, $cordovaGoogleAnalytics) {

        if ($stateParams.clear) {
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
        }
        $scope.logout = function () {
            Parse.User.logOut();
            $rootScope.user = null;
            $rootScope.isLoggedIn = false;
            window.localStorage['rememberme'] = "false";
            $state.go('intro');
        };
        $scope.refer = "";
        if (Parse.User.current() != null) {

            $scope.email = Parse.User.current().get("username");
            $scope.refer = $scope.email;
            //            var tm = Parse.User.current().get("referredBy");
            //            $scope.refer = tm.substring(0,tm.indexOf("@"));
        } else
            $scope.logout();
        /*.filter('split', function () {
            return function (input, splitChar, splitIndex) {
                // do some bounds checking here to ensure it has that index
                return input.split(splitChar)[splitIndex];
            }
        });*/
    })

.controller('LoginController', function ($scope, $state, $rootScope, $ionicLoading, $ionicSlideBoxDelegate, $cordovaGoogleAnalytics) {


        if (Parse.User.current() == null)
            window.localStorage['rememberme'] === "false";

        if (window.localStorage['rememberme'] === "true") {
            console.log('remember me checked');
            $state.go('tab.chats');
        }

        $scope.user = {
            username: null,
            password: null
        };

        $scope.error = {};

        $scope.login = function () {
            $scope.loading = $ionicLoading.show({
                content: 'Logging in',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            var user = $scope.user;
            Parse.User.logIn(("" + user.email).toLowerCase(), "" + user.password, {
                success: function (user) {
                    $ionicLoading.hide();
                    $rootScope.user = user;
                    $rootScope.isLoggedIn = true;
                    if (user.get("emailVerified") == false) {
                        alert("Please verify your email: " + user.get("email"));
                    }
                    $state.go('tab.chats', {
                        clear: true
                    });

                },
                error: function (user, err) {
                    $ionicLoading.hide();
                    $scope.error.message = err.message;
                    $scope.$apply();
                }
            });
        };

        $scope.forgot = function () {
            $state.go('app.forgot');
        };

        $scope.rememberMe = function () {
            window.localStorage['rememberme'] = true;
            //window.localStorage['username'] = $rootScope.user.username;
            //window.localStorage['password'] = $rootScope.user.password;
            //alert('h');
        }
        $scope.nextSlide = function () {
            $ionicSlideBoxDelegate.next();
        }
    })
    .controller('IntroCtrl', function ($scope, $state, $ionicSlideBoxDelegate, $rootScope, $ionicHistory, $stateParams, $ionicLoading, $cordovaGoogleAnalytics) {

        $scope.checkLogged = function () {
            $scope.startApp();
        };

        if ($stateParams.clear) {
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
        };

        $scope.login = function () {
            $state.go('login');
        };

        if ($rootScope.isLoggedIn) {
            $state.go('tab.chats');
        }

        $scope.startApp = function () {
            if (window.localStorage['rememberme'] == "true") {
                $state.go('tab.chats');
            } else {
                //DECIDES THE OPENING PAGE 
                $state.go('intro');
                window.localStorage['didTutorial'] = true;
            }
        };

        if (window.localStorage['didTutorial'] === "true") {
            //DOES THIS AGAIN. THINK IT'S BECAUSE OUR DID TUTORIAL SHIT IS KIND OF A LITTLE BIT VERY FUCKED UP
            console.log('Skip intro');
            $state.go('intro');
        }

        $scope.next = function () {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function () {
            $ionicSlideBoxDelegate.previous();
        };

        // Called each time the slide changes
        $scope.slideChanged = function (index) {
            $scope.slideIndex = index;
        };
        $scope.user = {};
        $scope.error = {};
        $scope.test = function (n) {
            //alert(n);
        }
        $scope.register = function () {
            function isEmail(email) {
                return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(email);
            }
            if (!isEmail($scope.user.username + "") || ($scope.user.password + "").length == 0) {
                alert("Please enter email & password correctly.");
                return;
            }
            $scope.loading = $ionicLoading.show({
                content: 'Sending',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            var user = new Parse.User();
            var tmpref = $scope.user.ref || "";
            user.set("username", ($scope.user.username + "").toLowerCase());
            user.set("password", $scope.user.password + "");
            user.set("referredBy", tmpref + "");

            user.signUp(null, {
                success: function (user) {
                    $ionicLoading.hide();
                    $rootScope.user = user;
                    $rootScope.isLoggedIn = true;
                    $state.go('tab.dash', {
                        clear: true
                    });

                },
                error: function (user, error) {
                    $ionicLoading.hide();
                    $scope.error.message = error.message;
                    $scope.$apply();
                }
            });
        };
        $scope.slideNext = function () {
            $ionicSlideBoxDelegate.next();
            $ionicSlideBoxDelegate.next();
            $ionicSlideBoxDelegate.next();
        }
    })

.controller('webHomeController', function ($scope, photos, $cordovaSocialSharing, $ionicLoading, $http, $ionicActionSheet, $cordovaFile, $cordovaCamera, $ionicPopup, Upload, $cordovaFileTransfer, $state, spellcheck, noteCreation, $cordovaGoogleAnalytics, $ionicSlideBoxDelegate, $rootScope, $ionicHistory, $stateParams) {
        $scope.checkLogged = function () {
            $scope.startApp();
        };

        if ($stateParams.clear) {
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
        };

        $scope.login = function () {
            //$state.go('login');
        };

        if ($rootScope.isLoggedIn) {
            $state.go('webHome');
        }

        $scope.startApp = function () {
            if (window.localStorage['rememberme'] == "true") {
                $state.go('webHome');
            } else {
                //DECIDES THE OPENING PAGE 
                $state.go('webHome');
                window.localStorage['didTutorial'] = true;
            }
        };

        if (window.localStorage['didTutorial'] === "true") {
            //DOES THIS AGAIN. THINK IT'S BECAUSE OUR DID TUTORIAL SHIT IS KIND OF A LITTLE BIT VERY FUCKED UP
            console.log('Skip intro');
            $state.go('webHome');
        }

        $scope.next = function () {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function () {
            $ionicSlideBoxDelegate.previous();
        };

        // Called each time the slide changes
        $scope.slideChanged = function (index) {
            $scope.slideIndex = index;
        };
        $scope.user = {};
        $scope.error = {};
        $scope.test = function (n) {
            //alert(n);
        };
        $scope.register = function () {
            function isEmail(email) {
                return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(email);
            }
            if (!isEmail($scope.user.username + "") || ($scope.user.password + "").length == 0) {
                alert("Please enter email & password correctly.");
                return;
            }
            $scope.loading = $ionicLoading.show({
                content: 'Sending',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            var user = new Parse.User();
            var tmpref = $scope.user.ref || "";
            user.set("username", ($scope.user.username + "").toLowerCase());
            user.set("password", $scope.user.password + "");
            user.set("referredBy", tmpref + "");

            user.signUp(null, {
                success: function (user) {
                    $ionicLoading.hide();
                    $rootScope.user = user;
                    $rootScope.isLoggedIn = true;
                    $state.go('analyze', {
                        clear: true
                    });

                },
                error: function (user, error) {
                    $ionicLoading.hide();
                    $scope.error.message = error.message;
                    $scope.$apply();
                }
            });
        };
        $scope.slideNext = function () {
            $ionicSlideBoxDelegate.next();
            $ionicSlideBoxDelegate.next();
            $ionicSlideBoxDelegate.next();
        };
        $scope.webHome = function () {
            $state.go('webHome');
        };

        $scope.Capture = function () {
            $state.go('capture');
        };

        $scope.Analyze = function () {
            $state.go('analyze');
        };

        $scope.Account = function () {
            $state.go('Account');
        };
    })
    .controller('captureController', function ($scope, photos, $cordovaSocialSharing, $ionicLoading, $http, $ionicActionSheet, $cordovaFile, $cordovaCamera, $ionicPopup, Upload, $cordovaFileTransfer, $state, spellcheck, noteCreation, $cordovaGoogleAnalytics) {

        $scope.webHome = function () {
            $state.go('webHome');
        };

        $scope.Capture = function () {
            $state.go('capture');
        };

        $scope.Analyze = function () {
            $state.go('analyze');
        };

        $scope.Account = function () {
            $state.go('Account');
        };
    })
    .controller('AccountController', function ($scope, photos, $stateParams, $cordovaSocialSharing, $ionicLoading, $http, $ionicActionSheet, $cordovaFile, $cordovaCamera, $ionicPopup, Upload, $cordovaFileTransfer, $state, spellcheck, noteCreation, $cordovaGoogleAnalytics, $rootScope) {
        if ($stateParams.clear) {
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
        }
        $scope.logout = function () {
            Parse.User.logOut();
            $rootScope.user = null;
            $rootScope.isLoggedIn = false;
            window.localStorage['rememberme'] = "false";
            $state.go('intro');
        };
        $scope.refer = "";
        if (Parse.User.current() != null) {

            $scope.email = Parse.User.current().get("username");
            $scope.refer = $scope.email;
            //            var tm = Parse.User.current().get("referredBy");
            //            $scope.refer = tm.substring(0,tm.indexOf("@"));
        } else
            $scope.logout();

        $scope.webHome = function () {
            $state.go('webHome');
        };

        $scope.Capture = function () {
            $state.go('capture');
        };

        $scope.Analyze = function () {
            $state.go('analyze');
        };

        $scope.Account = function () {
            $state.go('Account');
        };
    })
    .controller('AnalyzeController', function ($scope, photos, $cordovaSocialSharing, $ionicLoading, $http, $ionicActionSheet, $cordovaFile, $cordovaCamera, $ionicPopup, Upload, $cordovaFileTransfer, $state, spellcheck, noteCreation, $cordovaGoogleAnalytics) {
        $scope.checkedArr = [];
        $scope.photos = photos.queryNewEntries();
        var saveToParse = function (data) {
            var Entry = Parse.Object.extend("Entry");
            var entry = new Entry();
            entry.save({
                createdBy: Parse.User.current(),
                time: data.time,
                text: "" + data.text,
                summary: "" + data.sentences.join(" "),
                notes: "" + data.notes.join("~")
            }, {
                success: function (gameScore) {
                    //alert("successfully saved to parse " + new Date(gameScore.get("time")).toString());
                    //$state.go('tab-account', {url: '/account', templateUrl: '/templates/tab-account.html', controller: 'AccountCtrl'})
                    $scope.doRefresh();
                },
                error: function (gameScore, error) {
                    alert("error saving to parse: " + JSON.stringify(error));
                }
            });
        }
        var shareArr = [];
        $scope.isChecked = false;
        $scope.takePic = function ($state) {
            var options = {
                quality: 80, //highest quality
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 1280,
                targetHeight: 1280
            };
            $cordovaCamera.getPicture(options).then(function (imageData) {
                $scope.loading = $ionicLoading.show({
                    content: 'Uploading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });
                var x = "" + (imageData);
                var fd = new FormData();
                fd.append("data", x);
                $http.post("http://quillapp.io/cgi-bin/sumpic.py", fd, {
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity
                }).success(function (data) {
                    //alert("success line 48: " + JSON.stringify(data).replace(/(\r\n|\n|\r)/gm, " "));
                    //var text2 = rmgarbage.clean(data.text);
                    //summary.summarize(data.text);

                    data.notes = noteCreation.getNotes(data.text)

                    saveToParse(data);
                    $scope.doRefresh();
                    $ionicLoading.hide();
                }).
                error(function (data) {
                    alert('error posting to server: ' + JSON.stringify(data));
                    $ionicLoading.hide();
                });
            }, function (err) {
                //                alert("Could not take picture: " + JSON.stringify(err));
            });
        };

        $scope.checkShared = function (index) {
            if ($scope.checkedArr[index]) {
                var x = noteCreation.getNotes(index);
                var xxx = noteCreation.retNotes2(index);
                shareArr.push("Notes:\n" + x.toString() + "\n\n" + "Summary:\n" + $scope.photos[index].summary + "\n\n");
            } else {
                shareArr.splice(index, 1);
            }
        };

        $scope.$on('$ionicView.enter', function () {
            $scope.doRefresh();
        });
        $scope.doRefresh = function () {
            $scope.photos = photos.queryNewEntries();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$apply();
        };

        $scope.callStuff = function () {
            if ($scope.photos != null) {
                for (var i = 0; i < photos.length; i++) {
                    //alert(photos[i].summary);
                }
            }
        };

        $scope.shareDialog = function (n) {
            var msgTest = $scope.photos[n].summary || "Invalid/Error Summary";
            window.plugins.socialsharing.share(msgTest, "Notes from Quill", null, null);
        };

        $scope.share = function () {
            var strshare = shareArr.join();
            window.plugins.socialsharing.share(strshare, "Notes from Quill", null, null);
        }

        $scope.remove = function (indexToDelete) {
            photos.deleteFromParse(indexToDelete);
        }
        $scope.webHome = function () {
            $state.go('webHome');
        };

        $scope.Capture = function () {
            $state.go('capture');
        };

        $scope.Analyze = function () {
            $state.go('analyze');
        };

        $scope.Account = function () {
            $state.go('Account');
        };
    });