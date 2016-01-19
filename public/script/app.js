(function () {

  // Start App Module
  var askAnything = angular.module("askAnything", ['ngRoute', 'ngDialog', 'firebase']);

  //VIEW CONFIGURATION -------------------- 

  askAnything.config(['$routeProvider',
  function ($routeProvider) {
      $routeProvider.
      when('/', {
        templateUrl: 'templates/login.html',
        controller: 'FirebaseCtrl'
      }).
      when('/main', {
        templateUrl: 'templates/main.html',
      }).
      when('/signup', {
        templateUrl: 'templates/signup.html',
        controller: 'FirebaseCtrl'
      }).
      when('/reset-password', {
        templateUrl: 'templates/reset-password.html',
        controller: 'FirebaseCtrl'
      }).
      when('/change-password', {
        templateUrl: 'templates/change-password.html',
        controller: 'FirebaseCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

  //  Modal controller

  askAnything.controller('ModalCtrl', function ($scope, ngDialog) {
    $scope.clickToOpen = function () {
      ngDialog.open({
        template: 'templates/change-password.html',
        controller: 'FirebaseCtrl'
      });
    };
  });

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
    $scope.email = "";
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
                      email: $scope.user,
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
          $timeout(function () {
            console.log("Login fail " + error);
            $scope.alert = "Invalid username and/or password";
          });
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
      console.log("User is logged in");
      // Find username
      userProfile.on("value", function (snapshot) {
          var userListObject = snapshot.val();
          var currentID = authData.uid;
          for (var prop in userListObject) {
            if (currentID == prop) {
              $scope.loggedInUser = userListObject[prop].name;
              console.log($scope.loggedInUser);
            }
          }
        },
        function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
      if (currentPath == "/") {
        $location.path("/main");
      } else {};
    } else {
      console.log("User is logged out");
      if (currentPath == "/main") {
        $location.path("/");
      } else {}
    }

    // RESET PASSWORD
    $scope.resetPassword = function () {
      userRef.resetPassword({
        email: $scope.email
      }, function (error) {
        if (error) {
          switch (error.code) {
          case "INVALID_USER":
            $scope.alert = "The specified user account does not exist.";
            break;
          default:
            $scope.alert = "Error resetting password:" + error;
          }
        } else {
          $timeout(function () {
            $scope.alert = "Password reset email sent successfully!";
          }, 0);
        }
      })
    }

    // CHANGE PASSWORD
    $scope.directChangePassword = function () {
      $location.path("/change-password");
    };

    $scope.changePassword = function () {
      userRef.changePassword({
        email: authData.password.email,
        oldPassword: $scope.currentPassword,
        newPassword: $scope.newPassword,
        confirmPassword: $scope.confirmPassword,
      }, function (error) {
        $timeout(function () {
          if ($scope.newPassword == $scope.confirmPassword) {
            if (error) {
              switch (error.code) {
              case "INVALID_PASSWORD":
                console.log("The specified user account password is incorrect.");
                break;
              case "INVALID_USER":
                $scope.alert = "The specified user account does not exist.";
                break;
              default:
                $scope.alert = "Error changing password:" + error;
              }
            } else {
              $scope.alert = "User password changed successfully!";
            }
          } else {
            $scope.alert = "Confirm password does not match"
          }
        }, 0);
      });
    }



    //    ADMIN MODE
    if ($scope.loggedInUser.indexOf("Anh" || "Khuram" || "Asif") == 1) {
      $scope.admin = false;
      console.log($scope.loggedInUser);
    } else {
      $scope.admin = true;
    };

    $scope.adminMode = false;

    $scope.adminOn = function () {
      $scope.adminMode = true;
      $scope.anonymous = false;
      console.log("You're in admin mode " + $scope.adminMode)
    }

    $scope.adminOff = function () {
      $scope.adminMode = false;
    }

    //    ANONYMOUS MODE
    $scope.anonymous = false;

    console.log($scope.anonymous);
    $scope.anonymousOn = function () {
      $scope.anonymous = true;
      $scope.adminMode = false;
    }

    $scope.anonymousOff = function () {
      $scope.anonymous = false;
    }




    //ADDING QUESTION LOGIC//-----------

    // Create a synchronized array
    $scope.questions = $firebaseArray(ref);
    $scope.users = $firebaseArray(userProfile);


    // ADD NEW QUESTION
    $scope.addQuestion = function () {
      var timestamp = new Date();
      $scope.questions.$add({
        text: $scope.newQuestionText,
        important: false,
        date: timestamp.getTime(),
        author: $scope.loggedInUser,
        anonymous: $scope.anonymous,
        admin: $scope.adminMode,
        answers: {},
        status: 0,
        heart: 0,
        likeBy: [],
      });
      $scope.newQuestionText = "";
    };

    // MAKE IMPORTANT
    $scope.important = function (question) {
      ref.child(question.$id).update({
        "important": true
      })
    };

    // Add hearts
    $scope.heartQuestion = function (question) {
      //      This is the path to the answer
      var questionPath = ref.child(question.$id);
      var hasLiked = $firebaseArray(questionPath.child("likeBy"));

      //      Find out if user has voted
      var cannotLikeAgain = false;

      //      Loop through voteBy object to take snapshot of it's child value and match with user's name
      questionPath.child("likeBy").once("value", function (snapshot) {
        // The callback function will get called twice, once for "fred" and once for "barney"
        snapshot.forEach(function (childSnapshot) {
          // key will be "fred" the first time and "barney" the second time
          var key = childSnapshot.key();
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();
          console.log(childData);
          for (var i = 0; i < childData.length; i++) {
            if (childData == $scope.loggedInUser) {
              cannotLikeAgain = true;
              console.log("You've already liked")
              break;
            }
          }

        });
      });

      //      If user has not voted
      if (!cannotLikeAgain) {
        console.log("You can Like now");
        questionPath.update({
          heart: question.heart + 1
        });
        hasLiked.$add($scope.loggedInUser);
      }
    }

    // ADD ANSWER
    $scope.addAnswer = function (question) {
      var timestamp = new Date();
      var questionKey = question.$id;
      //      Start a table called "answers"
      var answersRef = ref.child(question.$id).child("answers");
      //      Generate object with unique id into the answers table
      var eachAnswer = answersRef.push({
        text: question.answer,
        date: timestamp.getTime(),
        author: $scope.loggedInUser,
        anonymous: $scope.anonymous,
        admin: $scope.adminMode,
        vote: 0,
        voteBy: [],
      });
      //      Now that the answer is created get the id of that answer
      var answerKey = eachAnswer.key();
      console.log(answerKey);
      //      Log the both question and answer ids into the object to call them out when needed  
      answersRef.child(answerKey).update({
        qid: questionKey,
        aid: answerKey
      });
      //      Update number of responses to this question
      ref.child(question.$id).update({
        "status": question.status + 1,
      });
    }

    // ADD VOTES
    $scope.voteAnswer = function (answer) {
      //      This is the path to the answer
      var answerPath = ref.child(answer.qid).child("answers").child(answer.aid);
      var hasVoted = $firebaseArray(answerPath.child("voteBy"));

      //      Find out if user has voted
      var cannotVoteAgain = false;

      //      Loop through voteBy object to take snapshot of it's child value and match with user's name
      answerPath.child("voteBy").once("value", function (snapshot) {
        // The callback function will get called twice, once for "fred" and once for "barney"
        snapshot.forEach(function (childSnapshot) {
          // key will be "fred" the first time and "barney" the second time
          var key = childSnapshot.key();
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();
          console.log(childData);
          for (var i = 0; i < childData.length; i++) {
            if (childData == $scope.loggedInUser) {
              cannotVoteAgain = true;
              console.log("You've already voted")
              break;
            }
          }

        });
      });

      //      If user has not voted
      if (!cannotVoteAgain) {
        console.log("You can vote now");
        answerPath.update({
          vote: answer.vote + 1
        });
        hasVoted.$add($scope.loggedInUser);
      }
    }


  });
})();

//Clear form after submit
function submitForm() {
  document.forms["myForm"].reset();
};