'use strict';

angular.module('jukeboxApp')
    .service('Youtubeservice',['$http','$rootScope','$window','$log','localStorageService',
        function Youtubeservice($http,$rootScope,$window,$log,localStorageService) {
            var service = this;
            var youtube = {
                ready: false,
                player: null,
                playerId: null,
                videoId: null,
                videoTitle: null,
                playerHeight: '360',
                playerWidth: '600',
                state: 'stopped'
            };

            this.upcoming = localStorageService.get('upcoming');
            this.history = localStorageService.get('history');
            if (!this.upcoming){
                this.upcoming = [];
                localStorageService.add('upcoming',this.upcoming);
            }else if (this.upcoming.length>0){
                youtube.videoId = this.upcoming[0].id;
                youtube.videoTitle = this.upcoming[0].title;
            }

            if (!this.history){
                this.history = [];
                localStorageService.add('history',this.history);
            }

            var indexOf = function (list,item) {
                for (var i = list.length - 1; i >= 0; i--) {
                    if (list[i].id === item.id) {
                        return i;
                        break;
                    }
                }
                return -1;
            };
            $window.onYouTubeIframeAPIReady = function () {
                $log.info('Youtube API is ready');
                youtube.ready = true;
                service.bindPlayer('placeholder');
                service.loadPlayer();
                $rootScope.$apply();
            };

            function onYoutubeReady (event) {
                $log.info('YouTube Player is ready');
                if (youtube.videoId){
                    youtube.player.loadVideoById(youtube.videoId);
                }
            }

            function onYoutubeStateChange (event) {
                if (event.data == YT.PlayerState.PLAYING) {
                    youtube.state = 'playing';
                } else if (event.data == YT.PlayerState.PAUSED) {
                    youtube.state = 'paused';
                } else if (event.data == YT.PlayerState.ENDED) {
                    youtube.state = 'ended';
                    if (service.upcoming.length>1){
                        service.launchPlayer(1);
                    }

                }
                $rootScope.$apply();
            }

            this.bindPlayer = function (elementId) {
                $log.info('Binding to ' + elementId);
                youtube.playerId = elementId;
            };

            this.createPlayer = function () {
                $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
                return new YT.Player(youtube.playerId, {
                    height: youtube.playerHeight,
                    width: youtube.playerWidth,
                    playerVars: {
                        rel: 0,
                        showinfo: 1
                    },
                    events: {
                        'onReady': onYoutubeReady,
                        'onStateChange': onYoutubeStateChange
                    }
                });
            };

            this.loadPlayer = function () {
                if (youtube.ready && youtube.playerId) {
                    if (youtube.player) {
                        youtube.player.destroy();
                    }
                    youtube.player = service.createPlayer();
                }
            };

            this.launchPlayer = function (index) {
                var item = this.upcoming[index];
                youtube.player.loadVideoById(item.id);
                youtube.videoId = item.id;
                youtube.videoTitle = item.title;
                service.archiveVideo(this.upcoming[0]);
                service.upcoming[0] = service.upcoming[index];
                if (index > 0){
                    service.deleteUpcomingVideo(index);
                }
                return youtube;
            }

            this.search = function(query){
                return $http.get('http://gdata.youtube.com/feeds/api/videos', {
                    params: {
                        type: 'video',
                        v: '2',
                        alt: 'jsonc',
                        'max-results': '15',
                        q: query
                    }
                });
            }

            this.relate = function(videoId){
                var url = "http://gdata.youtube.com/feeds/api/videos/"+videoId+"/related";
                var params = {
                    v: 2,
                    alt: 'jsonc',
                    'max-results': 15
                }
                return $http.get(url, {
                    params: params
                });
            }

            this.suggest = function(query){
                var url = "http://suggestqueries.google.com/complete/search";
                var params = {
                    ds: "yt",
                    client: "youtube",
                    hjson: "t",
                    q: query,
                    callback:"JSON_CALLBACK"
                }
                return $http.jsonp(url, {
                    params: params
                });
            }

            this.getUpcoming = function(){
                return localStorageService.get('upcoming');
            }
            this.getHistory = function(){
                return localStorageService.get('history');
            }
            this.queueVideo = function(item){
                if (indexOf(service.upcoming, item)!==-1) return;
                this.upcoming.push(item);
                localStorageService.add('upcoming', this.upcoming);
                var itemInHistoryList = indexOf(service.history,item);
                $log.log('history '+itemInHistoryList);
                if (itemInHistoryList!==-1){
                    this.history.splice(itemInHistoryList,1);
                }
//                localStorageService.add('history', this.history);
                if (this.upcoming.length === 1 && youtube.state!=='playing'){
                    this.launchPlayer(0);
                }
                return this.upcoming;
            }
            this.archiveVideo = function (item) {
                this.history.unshift(item);
                localStorageService.add('history', this.history);
                return this.history;
            };
            var deleteVideoByIndex = function(listName, list){
                return function (index){
                    list.splice(index,1);
                    localStorageService.add(listName, list);
                }
            }

            this.deleteUpcomingVideo = deleteVideoByIndex('upcoming',this.upcoming);
            this.deleteHistoryVideo = deleteVideoByIndex('history', this.history);

        }]);
