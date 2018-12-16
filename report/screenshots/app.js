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
        "description": "should print out the Title|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
<<<<<<< HEAD
        "instanceId": 11824,
=======
        "instanceId": 1268,
>>>>>>> 6ce0133b88541fe772cb98ec1de1ace6e635e0bc
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images\\005b007e-00c8-00a0-00f3-001b000100dd.png",
        "timestamp": 1544943828078,
        "duration": 70
    },
    {
        "description": "should check Sign in text on the Home Page|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\00f700ea-0009-0094-0087-001c0062007e.png",
        "timestamp": 1544943829203,
        "duration": 172
    },
    {
        "description": "should verify Login functionality with invalid credentials|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
=======
        "screenShotFile": "images\\00e4000a-0081-00c0-0054-00c900d60023.png",
        "timestamp": 1544943703796,
        "duration": 55
    },
    {
        "description": "should check Sign in text on the Home Page|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 1268,
>>>>>>> 6ce0133b88541fe772cb98ec1de1ace6e635e0bc
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
<<<<<<< HEAD
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=dfre5@yellowbook.com&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943833125,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943833937,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943833937,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943833937,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943833937,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00770098-00fc-00c3-006c-002a00450037.png",
        "timestamp": 1544943830477,
        "duration": 6878
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\00a4008a-0026-0045-00f9-00ce00ae0017.png",
        "timestamp": 1544943838335,
        "duration": 49
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
=======
        "browserLogs": [],
        "screenShotFile": "images\\00f300bf-00ea-00ef-0064-009800bd0081.png",
        "timestamp": 1544943704506,
        "duration": 110
    },
    {
        "description": "should verify Login functionality with invalid credentials|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 1268,
>>>>>>> 6ce0133b88541fe772cb98ec1de1ace6e635e0bc
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
<<<<<<< HEAD
        "message": [
            "Failed: Cannot read property 'x' of undefined"
        ],
        "trace": [
            "TypeError: Cannot read property 'x' of undefined\n    at ActionSequence.mouseMove (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\actions.js:148:25)\n    at C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:47:28\n    at elementArrayFinder_.then (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:804:32)\n    at ManagedPromise.invokeCallback_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at asyncRun (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:189:7)\nFrom: Task: Run it(\"should Verify \"Git Hub\" icon color changes if we hover over\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at shutdownTask_.MicroTask (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:43:5)\n    at addSpecsToSuite (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:9:1)\n    at Module._compile (module.js:653:30)\n    at Object.Module._extensions..js (module.js:664:10)\n    at Module.load (module.js:566:32)\n    at tryModuleLoad (module.js:506:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "images\\00740007-00f6-0049-00a3-00dc007900cd.png",
        "timestamp": 1544943839265,
        "duration": 49
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
=======
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=dfre5@yellowbook.com&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943706131,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943706363,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943706363,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943706363,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943706363,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943706363,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00060086-000d-0070-00f1-003b00f500ee.png",
        "timestamp": 1544943705152,
        "duration": 4627
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 1268,
>>>>>>> 6ce0133b88541fe772cb98ec1de1ace6e635e0bc
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
<<<<<<< HEAD
        "message": [
            "Failed: Cannot read property 'isDisplayed' of undefined"
        ],
        "trace": [
            "TypeError: Cannot read property 'isDisplayed' of undefined\n    at UserContext.it (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:58:36)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at asyncRun (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at <anonymous>\nFrom: Task: Run it(\"should Verify \"Git Hub\" icon is visible\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at shutdownTask_.MicroTask (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:57:5)\n    at addSpecsToSuite (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:9:1)\n    at Module._compile (module.js:653:30)\n    at Object.Module._extensions..js (module.js:664:10)\n    at Module.load (module.js:566:32)\n    at tryModuleLoad (module.js:506:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "images\\0020008c-00f1-00fe-00de-000300990056.png",
        "timestamp": 1544943840551,
        "duration": 8
    },
    {
        "description": "should verify \"Git Hub\" icon is forwarding to Git Hub website when clicked|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\00fe00f8-00ea-00f3-0073-008800e50044.png",
        "timestamp": 1544943841473,
        "duration": 4355
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\00f70045-001c-00f2-00d1-00aa002c0058.png",
        "timestamp": 1544943846902,
        "duration": 19
    },
    {
        "description": "should verify \"Question\" icon swithced to Mailto window when clicked|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 11824,
=======
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\00e300e3-00aa-0084-0099-003c008400a0.png",
        "timestamp": 1544943710323,
        "duration": 54
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 1268,
>>>>>>> 6ce0133b88541fe772cb98ec1de1ace6e635e0bc
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
<<<<<<< HEAD
        "message": "Temporarily disabled with xit",
        "browserLogs": [],
        "screenShotFile": "images\\00d30023-0028-0019-0025-000900c300e9.png",
        "timestamp": 1544943847780,
        "duration": 0
=======
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\003100c8-0064-00f8-008a-007700fd007d.png",
        "timestamp": 1544943710934,
        "duration": 141
>>>>>>> 6ce0133b88541fe772cb98ec1de1ace6e635e0bc
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
<<<<<<< HEAD
        "os": "Windows NT",
        "instanceId": 11824,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\001c004f-0036-0025-0001-00e400600049.png",
        "timestamp": 1544943847791,
        "duration": 26
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over |BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\008b00c1-0063-0080-0084-004600d80066.png",
        "timestamp": 1544943848909,
        "duration": 16
    },
    {
        "description": "should verify  \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": [
            "Failed: Cannot read property 'x' of undefined"
        ],
        "trace": [
            "TypeError: Cannot read property 'x' of undefined\n    at ActionSequence.mouseMove (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\actions.js:148:25)\n    at UserContext.it (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:116:23)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at asyncRun (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\nFrom: Task: Run it(\"should verify  \"?\" icon is enabled\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at shutdownTask_.MicroTask (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:115:5)\n    at addSpecsToSuite (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:9:1)\n    at Module._compile (module.js:653:30)\n    at Object.Module._extensions..js (module.js:664:10)\n    at Module.load (module.js:566:32)\n    at tryModuleLoad (module.js:506:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "images\\00b10074-00d9-00b7-0063-004a000600af.png",
        "timestamp": 1544943849769,
        "duration": 2
    },
    {
        "description": "Should verify email field accepts only correct email format|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "images\\00f30054-00fa-0092-00cb-00c6003100a1.png",
        "timestamp": 1544943850657,
        "duration": 4
    },
    {
        "description": "Should verify password field has \"password\" place holder|BookIT Home Page test scripts",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
=======
        "os": "Windows NT",
        "instanceId": 1268,
>>>>>>> 6ce0133b88541fe772cb98ec1de1ace6e635e0bc
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
<<<<<<< HEAD
        "message": [
            "Failed: Cannot read property 'getAttribute' of undefined"
        ],
        "trace": [
            "TypeError: Cannot read property 'getAttribute' of undefined\n    at UserContext.it (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:151:49)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at asyncRun (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at <anonymous>\nFrom: Task: Run it(\"Should verify password field has \"password\" place holder\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at shutdownTask_.MicroTask (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:150:9)\n    at addSpecsToSuite (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:9:1)\n    at Module._compile (module.js:653:30)\n    at Object.Module._extensions..js (module.js:664:10)\n    at Module.load (module.js:566:32)\n    at tryModuleLoad (module.js:506:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "images\\00930035-0014-009f-009f-00a400e90056.png",
        "timestamp": 1544943851829,
        "duration": 2
    },
    {
        "description": " should be disabled \"sign in\" button when email & password fields empty|BookIT Home Page test scripts",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11824,
=======
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\009900ea-00cb-0054-00c3-0024000d00fe.png",
        "timestamp": 1544943711670,
        "duration": 76
    },
    {
        "description": "should verify \"Git Hub\" icon is forwarding to Git Hub website when clicked|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 1268,
>>>>>>> 6ce0133b88541fe772cb98ec1de1ace6e635e0bc
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
<<<<<<< HEAD
        "message": [
            "Failed: Cannot read property 'isDisplayed' of undefined"
        ],
        "trace": [
            "TypeError: Cannot read property 'isDisplayed' of undefined\n    at UserContext.it (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:156:43)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at asyncRun (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at <anonymous>\nFrom: Task: Run it(\" should be disabled \"sign in\" button when email & password fields empty\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at shutdownTask_.MicroTask (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:155:9)\n    at addSpecsToSuite (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\XPS9360\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (C:\\Users\\XPS9360\\Desktop\\bookit\\Tests\\HomePage.spec.js:9:1)\n    at Module._compile (module.js:653:30)\n    at Object.Module._extensions..js (module.js:664:10)\n    at Module.load (module.js:566:32)\n    at tryModuleLoad (module.js:506:12)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=dfre5@yellowbook.comNed@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943856390,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943856390,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943856390,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943856390,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943856390,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Teri@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943859761,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943859761,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943859761,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943859761,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3788:231)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943859762,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Angie@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943862976,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943862976,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943862976,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943862976,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943862976,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3788:231)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943862976,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Bennett@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943866187,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943866187,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943866187,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943866187,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943866187,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Mariann@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943869396,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943869396,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943869396,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943869396,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943869397,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Christophe@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943872547,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943872547,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943872547,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943872547,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943872547,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Daryle@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943875714,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943875714,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943875714,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943875714,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943875714,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Ruthann@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943878877,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943878877,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943878877,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943878877,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943878878,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Merrilee@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943882032,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943882032,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1544943882032,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1544943882032,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1544943882032,
                "type": ""
            }
        ],
        "screenShotFile": "images\\0045009f-00b6-00bc-008c-00e8008e00f1.png",
        "timestamp": 1544943853011,
        "duration": 29050
=======
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\00620035-001c-00be-00c4-00f1005a0052.png",
        "timestamp": 1544943712270,
        "duration": 3912
>>>>>>> 6ce0133b88541fe772cb98ec1de1ace6e635e0bc
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

