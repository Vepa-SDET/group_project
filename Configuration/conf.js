let SpecReporter = require('jasmine-spec-reporter').SpecReporter;
let HtmlReporter = require('protractor-beautiful-reporter');
exports.config = {
   
    directConnect : true,
  
   capabilities: {
    browserName: 'chrome'
  },
  chromeOptions: {
    args: [
        '--start-fullscreen'
    ]
},
  
//  specs: ['../Tests/MapPage.spec.js'], 

//specs: ['../Tests/HomePage.spec.js', '../Tests/MapPage.spec.js'],

  suites:{
    smoke: ['../Tests/HomePage.spec.js', '../Tests/MapPage.spec.js'],   //protractor conf.js --suites smoke
    //regression: ['../Tests/*.spec.js']
  },

onPrepare: function () {
    browser.manage().timeouts().implicitlyWait(10000);
    //browser.driver.manage().window().maximize();
    jasmine.getEnv().addReporter(new SpecReporter({
        displayFailuresSummary: true,
        displayFailuredSpec: true,
        displaySuiteNumber: true,
        displaySpecDuration: true,
        showstack: false
      }));
      // Add a screenshot reporter and store screenshots to `/tmp/screenshots`:
      jasmine.getEnv().addReporter(new HtmlReporter({
        baseDirectory: '../report/screenshots',
        preserveDirectory: false,
        screenshotsSubfolder: 'images',
         jsonsSubfolder: 'jsons',
         docName: 'BookIT-Report.html'
     }).getJasmine2Reporter());
  
},
    
    jasmineNodeOpts: {
        showColors: true, 
        defaultTimeoutInterval: 90000,    
        print: function() {}
        
}
};