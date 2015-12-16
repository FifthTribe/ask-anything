(function () {

  // Start App Module
  var askAnything = angular.module("askAnything", ['ngRoute', 'firebase']);

  //---------------------------------------------------------
  //UI Router Config
  askAnything.config(['$routeProvider',
  function ($routeProvider) {
      $routeProvider.
      when('/', {
        templateUrl: 'templates/home.html',
        controller: 'FirebaseCtrl'
      }).
      when('/main', {
        templateUrl: 'templates/main.html',
        controller: 'FirebaseCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

  //---------------------------------------------------------

  //Firebase data
  askAnything.controller("FirebaseCtrl", function ($scope, $firebaseArray, $location) {

    var userRef = new Firebase("https://askanything.firebaseio.com");

    $scope.user = "";
    $scope.password = "";
    $scope.confirm = "";
    $scope.userName = "";
    $scope.alert = "";
    $scope.userLogin = "";
    $scope.passwordLogin = "";
    $scope.loginAlert = "";




    //    Create Account
    $scope.createUser = function () {
      //If email match @fifthtribe
      if ($scope.user.indexOf("@fifthtribe.com") == -1) {

        //If email not matching @fifthtribe
        $scope.alert = "Not a Fifth Tribe email address.";
      } else if ($scope.password != $scope.confirm) {
        //If email not matching @fifthtribe
        $scope.alert = "Password doesn't match.";
      } else {
        //Create an account
        userRef.createUser({
          email: $scope.user,
          password: $scope.password,
          name: $scope.userName,
        }, function (error, userData) {
          if (error) {
            $scope.alert = "Error creating user:", error;
          } else {
            console.log("Successfully create acount " + $scope.userName);
            $location.path("/main");
          }
        });
      }
    }

    //     Log-in    
    $scope.loginUser = function () {
      userRef.authWithPassword({
        email: $scope.userLogin,
        password: $scope.passwordLogin,
      }, function (error, authData) {
        if (error) {
          console.log("Login fail");
          $scope.loginAlert = "Invalid username and/or password";
        } else {
          $location.path("/main");
        }
      });
    }

    var ref = new Firebase("https://askanything.firebaseio.com/questions");

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