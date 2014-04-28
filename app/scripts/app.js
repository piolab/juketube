'use strict';

var app = angular.module('jukeboxApp', ['ui.bootstrap','LocalStorageModule']);
app.run(function () {
    var tag = document.createElement('script');
    tag.src = "http://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});
app.config( function ($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

