(function () {

  // Start App Module
  var askAnything = angular.module("askAnything", ['ui.router', 'firebase']);

  //---------------------------------------------------------
  //UI Router Config
  askAnything.config(function ($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/home");
    //
    // Now set up the states
    $stateProvider
      .state('log-in', {
        url: "",
        templateUrl: "templates/home.html"
      })
      .state('main', {
        url: "/main",
        templateUrl: "templates/main.html"
      })
  });

  //---------------------------------------------------------

  //Firebase data
  askAnything.controller("FirebaseCtrl", function ($scope, $firebaseArray) {

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