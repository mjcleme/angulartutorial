
angular.module('weatherNews', ['ui.router'])
.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl'
    })
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostsCtrl'
    });

  $urlRouterProvider.otherwise('home');
}])
.factory('postFactory', ['$http', function($http){
  var o = {
    posts: [],
    post: {}
  };
  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      console.log("getAll");
      console.log(data);
      angular.copy(data, o.posts);
    });
  };
  o.create = function(post) {
    return $http.post('/posts', post).success(function(data){
      console.log("o.create");
      console.log(data);
      o.posts.push(data);
    });
  };
  o.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote')
      .success(function(data){
        post.upvotes += 1;
      });
  };
  o.getPost = function(id) {
    return $http.get('/posts/' + id).success(function(data){
      console.log("get");
      console.log(data);
      angular.copy(data, o.post);
    });
  };
  o.addNewComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment);
  };
  o.upvoteComment = function(selPost, comment) {
    return $http.put('/posts/' + selPost._id + '/comments/'+ comment._id + '/upvote')
      .success(function(data){
        comment.upvotes += 1;
      });
  };
  return o;
}])
.controller('MainCtrl', [
'$scope',
'postFactory',
function($scope, postFactory){
  console.log("In MainCtrl");
  $scope.test = 'Hello world!';
  postFactory.getAll();

  $scope.posts = postFactory.posts;

  $scope.addPost = function(){
    if($scope.title === '') { return; }
    console.log("addPost "+$scope.title);
    postFactory.create({
      title: $scope.title,
    });
    $scope.title = '';
  };

  $scope.incrementUpvotes = function(post) {
    postFactory.upvote(post);
  };

}])
.controller('PostsCtrl', [
'$scope',
'$stateParams',
'postFactory',
function($scope, $stateParams, postFactory){
//  $scope.post = postFactory.posts[$stateParams.id];
  var mypost = postFactory.posts[$stateParams.id];
  console.log("PostsCtrl: "+$stateParams.id);
  console.log(mypost);
  postFactory.getPost(mypost._id);
  $scope.post = postFactory.post;

  $scope.incrementUpvotes = function(comment){
    console.log("incrementUp "+postFactory.post._id+" comment "+comment._id);
    postFactory.upvoteComment(postFactory.post, comment);
  };
  $scope.addComment = function(){
    if($scope.body === '') { return; }
    console.log("addComment ",postFactory.post._id);
    postFactory.addNewComment(postFactory.post._id, {
      body:$scope.body
    }).success(function(comment) {
      console.log("addComment success");
      console.log("comment");
      mypost.comments.push(comment);
      postFactory.post.comments.push(comment);
    });
    $scope.body = '';
  };

}]);
