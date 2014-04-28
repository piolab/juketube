'use strict';

angular.module('jukeboxApp')
  .controller('MainCtrl', function ($scope, $log, Youtubeservice,$http) {
        $scope.upcoming = Youtubeservice.upcoming;
        $scope.history = Youtubeservice.history;
        $scope.playing = Youtubeservice.playing;
        if ($scope.upcoming.length > 0){
            $scope.tab = 1;
        }
        else {
            $scope.tab = 2;
        }
        $scope.searchBoxFocus = function(){
            $scope.tab = 0;
        }
        $scope.relateTabClick = function(){
            $scope.tab = 1;
            $scope.newRelates = false;
        }
        $scope.historyTabClick = function(){
            $scope.tab = 2;
        }
        $scope.search = function(query){
            $scope.searchYoutube(query);
        }
        $scope.searchYoutube = function(query){
            Youtubeservice.search(query)
                .success(function(response){
                    $scope.youtubeResult = response['data']['items'];
                });
        };
        $scope.relateYoutube = function(videoId){
            Youtubeservice.relate(videoId)
                .success(function(response){
                    $scope.youtubeRelate = response['data']['items'];
                })
        };
        $scope.suggestQueries = function(query){
            var url = "http://suggestqueries.google.com/complete/search";
            var params = {
                hl: "vn",
                ds: "yt",
                client: "youtube",
                hjson: "t",
                q: query,
                callback:"JSON_CALLBACK"
            }
            return $http.jsonp(url, {params: params})
                .then(function(response){
                    var queries = [];
                    angular.forEach(response.data[1], function(item){
                        queries.push(item[0]);
                    });
                    return queries;
                });
        };
        $scope.queue = function(id, title){
            Youtubeservice.queueVideo(id, title);
        };

        $scope.play = function(index){
            Youtubeservice.launchPlayer(index);
        };

        $scope.deleteUpcoming = function(index){
            Youtubeservice.deleteUpcomingVideo(index);
        };
        $scope.newRelates = false;
        $scope.$watch('upcoming[0].id',function(newVal){
            if ($scope.tab!==1){
                $scope.newRelates = true;
            }
            $scope.relateYoutube(newVal);
        });
        $scope.indexOf = function (list,item) {
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i].id === item.id) {
                    return i;
                    break;
                }
            }
            return -1;
        };
  });
