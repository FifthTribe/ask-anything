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

  askAnything.controller("FirebaseCtrl", function ($scope, $firebaseArray, $location) {

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

    //     Log-in    
    $scope.loginUser = function () {
      userRef.authWithPassword({
        email: $scope.user,
        password: $scope.password,
      }, function (error, authData) {
        if (error) {
          console.log("Login fail " + error);
          $scope.alert = "Invalid username and/or password";
        } else {
          console.log("Login sucess");
          //Route to main if login success
          $location.path("/main");
        }
      });
    }

    //MAIN DATA STARTS HERE//-----------

    // create a synchronized array
    $scope.questions = $firebaseArray(ref);

    // add new question
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


    $scope.answerQuestion = function (question) {
      ref.child(question.$id).update({
        "answer": question.answer,
        "status": 1
      })
    }

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