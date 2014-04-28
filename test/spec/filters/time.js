'use strict';

describe('Filter: time', function () {

  // load the filter's module
  beforeEach(module('jukeboxApp'));

  // initialize a new instance of the filter before each test
  var time;
  beforeEach(inject(function ($filter) {
    time = $filter('time');
  }));

  it('should return the input prefixed with "time filter:"', function () {
    var text = 'angularjs';
    expect(time(text)).toBe('time filter: ' + text);
  });

});
