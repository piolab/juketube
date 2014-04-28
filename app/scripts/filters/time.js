'use strict';

angular.module('jukeboxApp')
  .filter('time', function () {
    return function (input) {
        var s ="";
        s = input%60;
        input = Math.round(input / 60);
        do{
            if (s>=10){
                s = input%60+':'+s;
            }
            else {
                s = input%60 +':0'+s;
            }
            input = Math.round(input / 60);
        }while (input > 0);
        return s;
    };
  });
