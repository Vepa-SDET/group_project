var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
<<<<<<< HEAD
        "description": "should verify if \"meru\" link directs to the correct page|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 16492,
=======
        "description": "should print out the Title|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/005b00a1-00c3-00be-0083-00c900c50034.png",
        "timestamp": 1545010796063,
        "duration": 28
    },
    {
        "description": "should check Sign in text on the Home Page|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images\\007400f5-0092-0021-0052-004400c20093.png",
        "timestamp": 1545013890416,
        "duration": 3609
=======
        "screenShotFile": "images/00b20070-0010-009a-00ad-009f00a90030.png",
        "timestamp": 1545010797132,
        "duration": 55
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
    },
    {
        "description": "should verify if the \"cybertek bnb\" logo is displayed|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
<<<<<<< HEAD
        "os": "Windows NT",
        "instanceId": 16492,
=======
        "os": "Mac OS X",
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images\\00b5009b-006d-00e8-0078-004a00f600fe.png",
        "timestamp": 1545013895199,
        "duration": 41
=======
        "screenShotFile": "images/0035001e-007b-00de-0003-00c2000f0057.png",
        "timestamp": 1545010798124,
        "duration": 28
    },
    {
        "description": "should verify password field|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00fd0043-0046-0066-00b7-007b00860051.png",
        "timestamp": 1545010799080,
        "duration": 30
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
    },
    {
        "description": "should verify if the \"by Bug busters #7\" text is visible|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
<<<<<<< HEAD
        "os": "Windows NT",
        "instanceId": 16492,
=======
        "os": "Mac OS X",
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images\\008f00a9-00c5-0051-0021-003900b70066.png",
        "timestamp": 1545013896699,
        "duration": 128
    },
    {
        "description": "should login with \"James May\" info|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 16492,
=======
        "screenShotFile": "images/00d600fe-00e4-00b6-00f0-00b1001e0022.png",
        "timestamp": 1545010800064,
        "duration": 32
    },
    {
        "description": "should verify Login functionality with invalid credentials|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=dfre5@yellowbook.com&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545010801859,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545010802164,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545010802164,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545010802164,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545010802164,
                "type": ""
            }
        ],
        "screenShotFile": "images/00d000ec-00e8-0086-00cf-002b00fe0057.png",
        "timestamp": 1545010801084,
        "duration": 4468
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
<<<<<<< HEAD
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00b10020-006a-0003-00a9-00cd00620088.png",
        "timestamp": 1545013897893,
        "duration": 0
    },
    {
        "description": "should verify dark-side map is displayed|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 16492,
=======
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00ff00db-0007-003b-00f9-004d004400dd.png",
        "timestamp": 1545010806614,
        "duration": 32
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/003000f4-0057-005e-0024-0012003f0055.png",
        "timestamp": 1545010807645,
        "duration": 92
    },
    {
        "description": "should Verify \"?\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images\\0064004d-00e8-003f-00d5-009200ce0084.png",
        "timestamp": 1545013897903,
        "duration": 0
    },
    {
        "description": "should verify \"VA\" and \"dark-side\" texts are displayed|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 16492,
=======
        "screenShotFile": "images/00ad00d2-00ef-0069-0002-00f600a300f7.png",
        "timestamp": 1545010808701,
        "duration": 70
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/004f00e0-0028-0007-003a-0023009300be.png",
        "timestamp": 1545010809734,
        "duration": 44
    },
    {
        "description": "should verify \"Git Hub\" icon is forwarding to Git Hub website when clicked|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00dc0004-0009-00b8-0063-004900ca0028.png",
        "timestamp": 1545010810738,
        "duration": 4174
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00bc00da-00de-002b-0029-00ae00b5007d.png",
        "timestamp": 1545010815841,
        "duration": 20
    },
    {
        "description": "should verify \"Question\" icon swithced to Mailto window when clicked|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images\\00350019-0051-00b1-00b4-002700fd00ca.png",
        "timestamp": 1545013897915,
        "duration": 0
=======
        "screenShotFile": "images/00fa008f-0046-00a2-00f5-0062004a0022.png",
        "timestamp": 1545010816799,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over ",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00190093-00ce-00db-0063-00b3002d002a.png",
        "timestamp": 1545010816806,
        "duration": 16
    },
    {
        "description": "Should verify email field accepts only correct email format",
        "passed": false,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": [
            "Failed: db is not defined"
        ],
        "trace": [
            "ReferenceError: db is not defined\n    at UserContext.it (/Users/esrakartal/Desktop/GroupBookit/Tests/HomePage.spec.js:145:9)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\n    at TaskQueue.execute_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at process._tickCallback (internal/process/next_tick.js:68:7)\nFrom: Task: Run it(\"Should verify email field accepts only correct email format\") in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at shutdownTask_.MicroTask (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Object.<anonymous> (/Users/esrakartal/Desktop/GroupBookit/Tests/HomePage.spec.js:144:5)\n    at Module._compile (internal/modules/cjs/loader.js:689:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)\n    at Module.load (internal/modules/cjs/loader.js:599:32)\n    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)\n    at Function.Module._load (internal/modules/cjs/loader.js:530:3)\n    at Module.require (internal/modules/cjs/loader.js:637:17)\n    at require (internal/modules/cjs/helpers.js:20:18)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine/lib/jasmine.js:93:5"
        ],
        "browserLogs": [],
        "screenShotFile": "images/00e000ea-00ba-0099-000f-008200c80063.png",
        "timestamp": 1545010817754,
        "duration": 40
    },
    {
        "description": "Should verify password field has \"password\" place holder",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00e8002f-00e6-0095-0054-001b00f300b1.png",
        "timestamp": 1545010818724,
        "duration": 41
    },
    {
        "description": " should be disabled \"sign in\" button when email & password fields empty",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/005400cd-007e-00af-0058-00ba0025005d.png",
        "timestamp": 1545010819697,
        "duration": 73
    },
    {
        "description": "should login with \"James May\" info|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "images/00520049-00c2-00d3-0033-001400be001f.png",
        "timestamp": 1545010821941,
        "duration": 3
    },
    {
        "description": "should verify dark-side map is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": [
            "Expected 'sign in' to equal 'VA'."
        ],
        "trace": [
            "Error: Failed expectation\n    at db.one.then.catch.then (/Users/esrakartal/Desktop/GroupBookit/Tests/MapPage.spec.js:37:55)\n    at process._tickCallback (internal/process/next_tick.js:68:7)"
        ],
        "browserLogs": [],
        "screenShotFile": "images/00ff0023-0075-00ac-0090-008900f4004d.png",
        "timestamp": 1545010822890,
        "duration": 4267
    },
    {
        "description": "should verify \"VA\" and \"dark-side\" texts are displayed|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 26077,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00da0003-0030-006b-0039-0049006700a1.png",
        "timestamp": 1545010828094,
        "duration": 2046
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else
                    {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

