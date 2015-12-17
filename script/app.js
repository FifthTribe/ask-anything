(function () {

  // Start App Module
  var askAnything = angular.module("askAnything", ['ngRoute', 'firebase']);

  //VIEW CONFIGURATION -------------------- 

  askAnything.config(['$routeProvider',
  function ($routeProvider) {
      $routeProvider.
      when('/', {
        templateUrl: 'templates/index.html',
        controller: 'FirebaseCtrl'
      }).
      when('/main', {
        templateUrl: 'templates/main.html',
        controller: 'FirebaseCtrl'
      }).
      when('/signup', {
        templateUrl: 'templates/signup.html',
        controller: 'FirebaseCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

  //FIREBASE CONTROLLER--------------------

  askAnything.controller("FirebaseCtrl", function ($scope, $firebaseArray, $location, $timeout) {

    var userRef = new Firebase("https://askanything.firebaseio.com");
    var ref = new Firebase("https://askanything.firebaseio.com/questions");
    var userProfile = new Firebase("https://askanything.firebaseio.com/users");

    //USER AUTHENTICATION STARTS HERE//-----------

    $scope.user = "";
    $scope.password = "";
    $scope.confirm = "";
    $scope.userName = "";
    $scope.alert = "";

    $scope.loggedInUser = "";

    //SIGN UP
    $scope.createUser = function () {

      //Check if email matching @fifthtribe.com
      if ($scope.user.indexOf("@fifthtribe.com") == -1) {
        $scope.alert = "Not a Fifth Tribe email address.";

        //Check if password confirm match
      } else if ($scope.password != $scope.confirm) {
        $scope.alert = "Password doesn't match.";

        //If everything passes, create an account
      } else {
        userRef.createUser({
          email: $scope.user,
          password: $scope.password,
          name: $scope.userName,
        }, function (error, userData) {
          if (error) {
            $scope.alert = "Error creating user";
            console.log(error);
          } else {
            console.log("Successfully create acount " + $scope.userName);

            //Then log user in
            userRef.authWithPassword({
              email: $scope.user,
              password: $scope.password,
            }, function (error, authData) {
              if (error) {
                console.log("Login fail " + error);
              } else {
                console.log("Login sucess");

                //Then route to main
                $timeout(function () {
                  $location.path("/main");
                }, 0);

                //Then store user custom
                var isNewUser = true;
                userRef.onAuth(function (authData) {
                  if (authData && isNewUser) {
                    userRef.child("users").child(authData.uid).set({
                      provider: authData.provider,
                      name: $scope.userName,
                    });
                  }
                });
              }
            });
          }
        });
      }

    }

    //LOG-IN    
    $scope.loginUser = function () {
      userRef.authWithPassword({
        email: $scope.user,
        password: $scope.password,
      }, function (error, authData) {
        if (error) {
          console.log("Login fail " + error);
          $scope.alert = "Invalid username and/or password";
        } else {
          $timeout(function () {
            $location.path("/main");
          }, 0);
          console.log("Login sucess");

        }
      });
    }

    //LOG-OUT    
    $scope.logoutUser = function () {
      userRef.unauth();
      $location.path("/");
    }

    //REDIRECT DEPENDS ON LOG IN/OUT STATE
    var authData = userRef.getAuth();
    var currentPath = $location.path();

    if (authData) {
      console.log("User " + authData.uid + " is logged in with " + authData.provider);
      if (currentPath == "/") {
        $location.path("/main");
      } else {};
    } else {
      console.log("User is logged out");
      if (currentPath == "/main") {
        $location.path("/");
      } else {}
    }

    // Find username
    $scope.listUser = function () {
      userProfile.on("value", function (snapshot) {
          var userListObject = snapshot.val();
          var userListArray = [];
          var currentID = authData.uid;
          console.log(Object.keys(userListObject));
          console.log(userListObject);
          for (var prop in userListObject) {
            if (currentID == prop) {
              $scope.loggedInUser = userListObject[prop].name;
            }
          }
        },
        function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
    }

    //ADDING QUESTION LOGIC//-----------

    // Create a synchronized array
    $scope.questions = $firebaseArray(ref);
    $scope.users = $firebaseArray(userProfile);


    // Add new question
    $scope.addQuestion = function () {
      var timestamp = new Date();
      $scope.questions.$add({
        text: $scope.newQuestionText,
        date: timestamp.getTime(),
        author: $scope.loggedInUser,
        answers: {},
        status: 0,
        heart: 0,
      });
      $scope.newQuestionText = "";
    };

    // Edit answer
    $scope.addAnswer = function (question) {
      var questionRef = ref.child(question.$id);
      questionRef.child("answers").push({
        text: question.answer,
        author: $scope.loggedInUser,
      });
      ref.child(question.$id).update({
        "status": 1,
      })
    }


    // Add hearts
    $scope.heartQuestion = function (question) {
      ref.child(question.$id).update({
        "heart": question.heart + 1,
      })
    }

  });
})();

//Clear form after submit
function submitForm() {
  document.forms["myForm"].reset();
};