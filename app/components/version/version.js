'use strict';

angular.module('CST.version', [
  'CST.version.interpolate-filter',
  'CST.version.version-directive'
])

.value('version', '0.1');
