(function () {

  // Start App Module
  var askAnything = angular.module("askAnything", ['ngRoute', 'firebase']);

  //NG-ROUTE CONFIGURATION -------------------- 

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

  //FIREBASE --------------------

  askAnything.controller("FirebaseCtrl", function ($scope, $firebaseArray, $location, $timeout) {

    var userRef = new Firebase("https://askanything.firebaseio.com");
    var ref = new Firebase("https://askanything.firebaseio.com/questions");

    //USER AUTHENTICATION STARTS HERE//-----------

    $scope.user = "";
    $scope.password = "";
    $scope.confirm = "";
    $scope.userName = "";
    $scope.alert = "";
    $scope.userLogin = "";
    $scope.passwordLogin = "";
    $scope.loginAlert = "";


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
            $scope.alert = "Error creating user:", error;
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
              }
            });
          }
        });
        //Then route to main
        $location.path("/main");
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
          //Route to main if login success
        }
      });
    }

    //REDIRECT FROM MAIN TO INDEX IF LOGGED OUT
    var authData = userRef.getAuth();
    if (authData) {
      console.log("User " + authData.uid + " is logged in with " + authData.provider);
    } else {
      console.log("User is logged out");
      $location.path("/");
    }

    //LOG-OUT    
    $scope.logoutUser = function () {
      userRef.unauth();
      $location.path("/");
    }

    //ADDING QUESTION LOGIC//-----------

    // Create a synchronized array
    $scope.questions = $firebaseArray(ref);

    // Add new question
    $scope.addQuestion = function () {
      var timestamp = new Date();
      $scope.questions.$add({
        text: $scope.newQuestionText,
        date: timestamp.getTime(),
        answer: "",
        status: 0,
        heart: 0,
      });

      $scope.newQuestionText = "";

    };

    // Edit answer
    $scope.answerQuestion = function (question) {
      ref.child(question.$id).update({
        "answer": question.answer,
        "status": 1
      })
    }

    // Add hearts
    $scope.heartQuestion = function (question) {
      ref.child(question.$id).update({
        "heart": question.heart + 1,
      })
    }

  });

  //Monitoring User Authentication State//-----------


  //  Automatically take user to main if they're logged in
  askAnything.controller("LoggedIn", function ($scope, $firebaseArray, $location) {
    var stateRef = new Firebase("https://askanything.firebaseio.com");

    var authData = stateRef.getAuth();
    if (authData) {
      console.log("User " + authData.uid + " is logged in with " + authData.provider);
      $location.path("/main");
    } else {
      console.log("User is logged out");
    }
  });

})();

//Clear form after submit
function submitForm() {
  document.forms["myForm"].reset();
};