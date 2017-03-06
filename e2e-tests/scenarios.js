'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('my app', function() {


  it('should automatically redirect to /dashboard when location hash/fragment is empty', function() {
    browser.get('index.html');
    expect(browser.getLocationAbsUrl()).toMatch("/dashboard");
  });


  describe('dashboard', function() {

    beforeEach(function() {
      browser.get('index.html#!/dashboard');
    });


    it('should render dashboard when user navigates to /dashboard', function() {
      expect(element.all(by.css('.karma')).getText()).
        toMatch(/karma_dashboard/);
    });

  });


  describe('stock', function() {

    beforeEach(function() {
      browser.get('index.html#!/stock');
    });


    it('should render stock when user navigates to /stock', function() {
      expect(element.all(by.css('.karma')).first().getText()).
        toMatch(/karma_stock/);
    });

  });
});
