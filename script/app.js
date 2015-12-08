(function () {

  // Start App Module
  var askAnything = angular.module("askAnything", ['ui.router', 'firebase']);

  // This part control App Views

  //  askAnything.config(['$stateProvider', '$locationProvider', function ($stateProvider, $locationProvider) {
  //    $locationProvider.html5Mode({
  //      enabled: true,
  //      requireBase: false
  //    });
  //
  //    $stateProvider.state('home', {
  //      url: '/',
  //      controller: 'home.controller',
  //      templateUrl: '/templates/home.html'
  //    });
  //
  //    $stateProvider.state('main', {
  //      url: '/main',
  //      controller: 'main.controller',
  //      templateUrl: '/templates/main.html'
  //    });
  //}]);
  //
  //  askAnything.controller('home.controller', ['$scope', function ($scope) {}]);
  //
  //  askAnything.controller('main.controller', ['$scope', function ($scope) {}]);


  //Firebase stuff starts here

  askAnything.controller("FirebaseCtrl", function ($scope, $firebaseArray) {
    var ref = new Firebase("https://askanything.firebaseio.com/questions");

    // create a synchronized array
    $scope.questions = $firebaseArray(ref);

    // add new question
    $scope.addQuestion = function () {
      var timestamp = new Date();
      var timestampDate = timestamp.getDate();
      var timestampMonth = timestamp.getMonth();
      $scope.questions.$add({
        text: $scope.newQuestionText,
        date: timestampDate,
        month: timestampMonth,
        answer: $scope.newAnswerText
      });
    };

    // Answer
    $scope.questionAnswer = function (question) {
      // task.completed = true;
      task.asnwer = $scope.newAnswerText;
      // $scope.tasks.set({task});
      console.log(task);

      var taskRef = new Firebase('"https://askanything.firebaseio.com/questions"/' + question.$id);

      taskRef.update({
        "answer": $scope.newAnswerText;
      });
    }

  });

})();

//Clear form after submit
function submitForm() {
  document.forms["myForm"].reset();
};


//Idenity question

function verifyAnswer() {
  var value = document.getElementById("verifyAnswer").value;
  if (value == "Anh") {
    window.location.href = 'main.html';
  } else {
    window.alert("try again");
  }
}