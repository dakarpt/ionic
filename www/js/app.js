// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var APPverion = "0.1";
var APPtutorial = 0;
var APPfirstTime = 0;

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      console.log("ionic platform  ready");
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      console.log("ionic platform db: init"); // #### DB #########

      window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory,
        function (confDir) {
          console.log("Got directory: " + confDir.fullPath);
          var dbFullPath = cordova.file.externalDataDirectory + "2014110801.sqlite";
          confDir.getFile("2014110801.sqlite", {create: true},
            function (confFile) {
              console.log("Got file: " + confFile.fullPath);
              cordovaSQLite.openDatabase(dbFullPath, true,
                function () {
                  cordovaSQLite.execQueryArrayResult("select value from info where name=?", ["APP"],
                    function (version) {
                      if (version != "")
                        console.log("Got APP version: Installed v" + version);
                      else {
                        console.warn("Got APP empty version");
                      }
                    },
                    function (error) {
                      console.warn("##execQueryArrayResult: " + error);
                      //CREATE TABLE `info` ( `name`	TEXT,	`value`	TEXT);
                      cordovaSQLite.execQueryNoResult("CREATE TABLE `info` ( `name`	TEXT,	`value`	TEXT);", function (res) {
                          console.log("Created table info");
                          cordovaSQLite.execQueryNoResult("INSERT INTO `info` (name,value) VALUES ('APP', " + APPverion + ");", function (res) {
                              console.log("Inserted APP version: v" + APPverion + " tutorial: ON");
                              APPfirstTime = 1;
                              cordovaSQLite.execQueryNoResult("INSERT INTO `info` (name,value) VALUES ('APPtutorial', 'Sim');", function (res) {
                                  console.log("Inserted APP tutorial: Sim");
                                  APPtutorial = 1;
                                },
                                function (error) {
                                  console.warn("##execQueryArrayResult: " + error);
                                });
                            },
                            function (error) {
                              console.warn("##execQueryArrayResult: " + error);
                            });

                        },
                        function (error) {
                          console.warn("##execQueryArrayResult: " + error);
                        });
                    });
                },
                function (error) {
                  console.warn("##openDatabase: " + error);
                });
            },
            function (error) {
              console.warn("##getFile: " + error);
            });
        }, // Success callback [resolveLocalFileSystemURL]
        function (error) {
          console.warn(error);
        }); // Failure callback [resolveLocalFileSystemURL]

    });
  })
  .controller("IbeaconController", function ($scope, $rootScope, $ionicPlatform) {

    $scope.beacons = {};
    $scope.myRegion = null;
    var myRegion = null;

    var uuid = '74278BDA-B644-4520-8F0C-720E1F6EF512'; // mandatory
    var identifier = 'PIs'; // mandatory
    var minor = 64001; // optional, defaults to wildcard if left empty
    var major = 4660; // optional, defaults to wildcard if left empty
    // throws an error if the parameters are not valid
    console.log("ionic controller IBEACON ready");
    $ionicPlatform.ready(function () {
      console.log("ionic controller platform ready");
      if (!myRegion) {
        myRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major);
        console.log("myRegion Created");
        $scope.myRegion = myRegion;
      }
    });

    $scope.startScan = function () {
      var delegate = new cordova.plugins.locationManager.Delegate();

      delegate.didDetermineStateForRegion = function (pluginResult) {
      };

      delegate.didStartMonitoringForRegion = function (pluginResult) {
      };

      delegate.didRangeBeaconsInRegion = function (pluginResult) {
        var i = 0;
        console.log('XX: didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
        // cordova.plugins.locationManager.appendToDeviceLog('didRangeBeaconsInRegion:' + JSON.stringify(pluginResult));
        // console.log("event, plug res: UUID: %s prox: %s lenght: %s", pluginResult.beacons[i].uuid, pluginResult.beacons[i].proximity, pluginResult.beacons[i].length, event, pluginResult.beacons[i]);
        var uniqueBeaconKey;
        for (i = 0; i < pluginResult.beacons.length; i++) {
          pluginResult.beacons[i].nome = "PI 1-2";
          uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;
          $scope.beacons[uniqueBeaconKey] = pluginResult.beacons[i];
          // console.log("FOUND: ", pluginResult.beacons[i].uuid, pluginResult.beacons[i].proximity)
        }
        $scope.$apply();
      };

      cordova.plugins.locationManager.setDelegate(delegate);
      //  required in iOS 8+
      // cordova.plugins.locationManager.requestWhenInUseAuthorization();
      cordova.plugins.locationManager.requestAlwaysAuthorization();

      cordova.plugins.locationManager.startRangingBeaconsInRegion($scope.myRegion)
        .fail(function (e) {
          console.log("ERROR: START SCAN ", e);
        })
        .done(function (e) {
          console.log("Done: START SCAN", e);
        });
    };

    $scope.stopScan = function () {

      cordova.plugins.locationManager.stopRangingBeaconsInRegion($scope.myRegion)
        .fail(function (e) {
          console.log("ERROR STOP SCAN", e);
        })
        .done(function (e) {
          console.log("Done: STOP SCAN", e);
          $scope.beacons = {};
          $scope.$apply();
        });
    };
  })
  // .controller('MainCtrl2', function ($scope, Camera) {
  //   console.log("ionic controller MainCtrl ready");
  //   $scope.getPhoto = function () {
  //     options = {
  //       destinationType: 1, // Camera.DestinationType.FILE_URI,
  //       // sourceType: Camera.PictureSourceType.CAMERA,
  //       quality : 75,
  //       encodingType: 1, // Camera.EncodingType.JPEG,
  //       // targetWidth: 320,
  //       // targetHeight: 200,
  //       // sourceType: 0,
  //       // quality: 75,
  //       // targetWidth: 320,
  //       // targetHeight: 320,
  //       saveToPhotoAlbum: false
  //       // sourceType: 2
  //       // destinationType: Camera.DestinationType.FILE_URI
  //     };
  //
  //     Camera.getPicture().then(function (imageURI) {
  //       console.log(imageURI);
  //       $scope.lastPhoto = imageURI;
  //     }, function (err) {
  //       console.log(err);
  //     }, options);
  //   };
  //
  // })
  // .controller("BarCodeReaderController", function ($scope) {
  //   console.log("ionic controller BarCodeReaderController ready");
  //   $scope.getBarcode = function () {
  //     cordova.plugins.barcodeScanner.scan(
  //       function (result) {
  //         $scope.code = result.text;
  //         $scope.$apply();
  //         console.debug("Código lido\n" +
  //           "Resultado: " + result.text + "\n" +
  //           "Formato: " + result.format + "\n" +
  //           "Cancelado: " + result.cancelled);
  //       },
  //       function (error) {
  //         console.warn("Scanning failed: " + error);
  //       }
  //     );
  //   };
  //
  // })
  .controller('CameraCtrl', function ($scope, $cordovaCamera) {

    // $scope.lastPhoto ="";

    document.addEventListener("deviceready", function () {

    console.log("camera controller ready 1");
    // $scope.getPhoto = function () {
    //   var options = {
    //     destinationType: Camera.DestinationType.FILE_URI,
    //     sourceType: Camera.PictureSourceType.CAMERA,
    //     // targetWidth: 100,
    //     // targetHeight: 100,
    //     // encodingType: 0,
    //   };
    //
    //   $cordovaCamera.getPicture(options).then(function (imageURI) {
    //     console.log(imageURI);
    //     $scope.lastPhoto = imageURI;
    //     $scope.$apply();
    //   }, function (err) {
    //     console.log("ERROR: getPicture", err);
    //   });
    //

      function movePic(file){
        // window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError);
        window.resolveLocalFileSystemURL(file, resolveOnSuccess, resOnError);
      }

//Callback function when the file system uri has been resolved
      function resolveOnSuccess(entry){
        var d = new Date();
        var n = d.getTime();
        //new file name
        var newFileName = n + ".jpg";
        var myFolderApp = "images";

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
            //The folder is created if doesn't exist
            fileSys.root.getDirectory( myFolderApp,
              {create:true, exclusive: false},
              function(directory) {
                entry.moveTo(directory, newFileName,  successMove, resOnError);
              },
              resOnError);
          },
          resOnError);
      }

//Callback function when the file has been moved successfully - inserting the complete path
      function successMove(entry) {
        //I do my insert with "entry.fullPath" as for the path
        $scope.lastPhoto = entry.toURL();
        $scope.$apply();
        console.log("Success moved file, new URL: %s", entry.toURL());
      }

      function resOnError(error) {
        console.log(error, error.code);
      }

      $scope.takePicture = function () {
        console.log("take picture ready");
        if ($scope.takingPicture)
          return;
        $scope.takingPicture = 1;
        navigator.camera.getPicture(onSuccess, onFail, {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          encodingType: 0,
        });

        function onSuccess(imageURI) {
          console.log(imageURI);
          $scope.takingPicture = 0;
          // $scope.lastPhoto = imageURI;
          // $scope.$apply();
          movePic(imageURI);
        }

        function onFail(message) {
          console.error('Failed because: ' + message);
          $scope.takingPicture = 0;
        }
      };

      $cordovaCamera.cleanup().then(function () {
        console.log("CleanUP Enter");

      }); // only for FILE_URI

    // }
    }, false);
  })
  .controller("BarCodeReaderController", function ($scope, $cordovaBarcodeScanner) {
    console.log("ionic controller BarCodeReaderController ready");
    $scope.getBarcode = function () {
      console.log("Calling scanbarcode");
      $cordovaBarcodeScanner
        .scan({
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : false, // iOS and Android
          "prompt" : "Coloque um código barras dentro da área", // supported on Android only
          // "formats" : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
          "orientation" : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
        })
        .then(function(barcodeData) {
          // Success! Barcode data is here
          $scope.code = barcodeData.text;
          $scope.barcodeData = barcodeData;
              // $scope.$apply();
        }, function(error) {
          // An error occurred
          console.error("Failed QR coe scan!", error)
        });
      // cordova.plugins.barcodeScanner.scan(
      //   function (result) {
      //     $scope.code = result.text;
      //     $scope.$apply();
      //     console.debug("Código lido\n" +
      //       "Resultado: " + result.text + "\n" +
      //       "Formato: " + result.format + "\n" +
      //       "Cancelado: " + result.cancelled);
      //   },
      //   function (error) {
      //     console.error("Scanning failed: " + error);
      //   },
      //   {
      //     "preferFrontCamera" : true, // iOS and Android
      //     "showFlipCameraButton" : true, // iOS and Android
      //     "prompt" : "Coloque um código barras dentro da área", // supported on Android only
      //     "formats" : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
      //     "orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
      //   }
      // );
    };

  })
  .controller("SQLliteController", function ($scope, $ionicPlatform) {
    $scope.tutorial = "Não";
    $scope.firstTime = "Não";

    if (APPfirstTime)
      $scope.firstTime = "Sim";
    if (APPtutorial)
      $scope.tutorial = "Sim";

    console.log("ionic controller SQLliteController ready");

    $scope.isTutorial = function () {

      console.log("ionic controller SQLliteController isTutotial");
      $ionicPlatform.ready(function () {
        cordovaSQLite.execQuerySingleResult("select value from info where name=?", ["APPtutorial"], function (res) {
            console.log("Result from APPtutorial: " + res);
            $scope.tutorial = res;
            $scope.$apply();
            // APPtutorial = 1;
          },
          function (error) {
            console.warn("##execQueryArrayResult: " + error);
          });
      })
    };

    $scope.updateTutorial = function () {
      console.log("ionic controller SQLliteController updateTutorial");
      $ionicPlatform.ready(function () {
        cordovaSQLite.execQueryNoResult("update info set value='Não' where name='APPtutorial';", function () {
            console.log("update APPtutorial");
            // $scope.tutorial = "Não";
            // $scope.$apply();
            APPtutorial = 0;
          },
          function (error) {
            console.warn("##execQueryArrayResult: " + error);
          });
      })
    }

    $scope.moreTutorial = function () {
      console.log("ionic controller SQLliteController moreTutorial");
      $ionicPlatform.ready(function () {
        cordovaSQLite.execQueryNoResult("update info set value='Sim' where name='APPtutorial';", function () {
            console.log("more update APPtutorial");
            // $scope.tutorial = "Sim";
            // $scope.$apply();
            APPtutorial = 0;
          },
          function (error) {
            console.warn("##execQueryArrayResult: " + error);
          });
      })
    }
  })
  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
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
      .state('tab.camera', {
        url: '/camera',
        views: {
          'tab-camera': {
            templateUrl: 'templates/tab-camera.html',
            controller: 'CameraCtrl'
          }
        }
      })
      .state('tab.ibeacon', {
        url: '/ibeacon',
        views: {
          'tab-ibeacon': {
            templateUrl: 'templates/tab-ibeacon.html',
            controller: 'IbeaconController'
          }
        }
      })
      .state('tab.bcreader', {
        url: '/bcreader',
        views: {
          'tab-bcreader': {
            templateUrl: 'templates/tab-bcreader.html',
            controller: 'BarCodeReaderController'
          }
        }
      })
      .state('tab.sqllite', {
        url: '/sqllite',
        views: {
          'tab-sqllite': {
            templateUrl: 'templates/tab-sqllite.html',
            controller: 'SQLliteController'
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

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

  });


