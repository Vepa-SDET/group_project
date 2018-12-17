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
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/005f0051-0056-0054-00da-009000ac00bc.png",
        "timestamp": 1545014545504,
        "duration": 30
    },
    {
        "description": "should check Sign in text on the Home Page|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
<<<<<<< HEAD
        "instanceId": 3078,
=======
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images/00f8000e-00fe-009e-00d6-00ec008100eb.png",
        "timestamp": 1545014546024,
        "duration": 62
=======
<<<<<<< HEAD
        "screenShotFile": "images\\007400f5-0092-0021-0052-004400c20093.png",
        "timestamp": 1545013890416,
        "duration": 3609
=======
        "screenShotFile": "images/00b20070-0010-009a-00ad-009f00a90030.png",
        "timestamp": 1545010797132,
        "duration": 55
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
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
<<<<<<< HEAD
        "instanceId": 3078,
=======
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images/00e10050-0019-00b4-0032-00dd00cf0072.png",
        "timestamp": 1545014546510,
        "duration": 31
=======
<<<<<<< HEAD
        "screenShotFile": "images\\00b5009b-006d-00e8-0078-004a00f600fe.png",
        "timestamp": 1545013895199,
        "duration": 41
=======
        "screenShotFile": "images/0035001e-007b-00de-0003-00c2000f0057.png",
        "timestamp": 1545010798124,
        "duration": 28
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
    },
    {
        "description": "should verify password field|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00e5004e-00ee-00ac-00e3-005400dd0012.png",
        "timestamp": 1545014546967,
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
<<<<<<< HEAD
        "instanceId": 3078,
=======
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images/00630092-001f-00cf-00fe-00db001400e3.png",
        "timestamp": 1545014547423,
        "duration": 19
=======
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
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
    },
    {
        "description": "should verify Login functionality with invalid credentials|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=dfre5@yellowbook.com&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014548426,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014548643,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014548643,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014548643,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014548643,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014548643,
                "type": ""
            }
        ],
        "screenShotFile": "images/00ff00b6-001e-0027-0035-003000810005.png",
        "timestamp": 1545014547864,
        "duration": 4270
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
<<<<<<< HEAD
        "instanceId": 3078,
=======
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
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
        "screenShotFile": "images/007300f4-0082-0016-00d4-006c004f00be.png",
        "timestamp": 1545014552618,
        "duration": 28
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/0083001d-0023-00ce-00a1-00740018009f.png",
        "timestamp": 1545014553068,
        "duration": 73
    },
    {
        "description": "should Verify \"?\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
<<<<<<< HEAD
        "instanceId": 3078,
=======
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images/00490054-002d-00ed-0080-00ca00700066.png",
        "timestamp": 1545014553592,
        "duration": 64
=======
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
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/003500cc-00ec-0028-000b-0008003b00dc.png",
        "timestamp": 1545014554077,
        "duration": 46
    },
    {
        "description": "should verify \"Git Hub\" icon is forwarding to Git Hub website when clicked|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://github.githubassets.com/assets/frameworks-9ee26246cce2c45ef24accded28cdabe.js 0 Refused to load the script 'https://www.google-analytics.com/analytics.js?wpid=UA-3769691-2' because it violates the following Content Security Policy directive: \"script-src github.githubassets.com\".\n",
                "timestamp": 1545014556679,
                "type": ""
            }
        ],
        "screenShotFile": "images/00fd00f2-0010-005e-00d3-00430055002f.png",
        "timestamp": 1545014554547,
        "duration": 4217
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00b7000a-0075-003d-008a-002800700047.png",
        "timestamp": 1545014559191,
        "duration": 14
    },
    {
        "description": "should verify \"Question\" icon swithced to Mailto window when clicked|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
<<<<<<< HEAD
        "instanceId": 3078,
=======
        "instanceId": 26077,
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images/001b00b7-00cb-008a-0086-0074000d008f.png",
        "timestamp": 1545014559628,
=======
<<<<<<< HEAD
        "screenShotFile": "images\\00350019-0051-00b1-00b4-002700fd00ca.png",
        "timestamp": 1545013897915,
        "duration": 0
=======
        "screenShotFile": "images/00fa008f-0046-00a2-00f5-0062004a0022.png",
        "timestamp": 1545010816799,
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/003b0087-004c-0080-0054-007300bd00a5.png",
        "timestamp": 1545014559632,
        "duration": 16
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over |BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/0037001d-0019-00b1-0074-00760083005c.png",
        "timestamp": 1545014560073,
        "duration": 13
    },
    {
        "description": "Should verify email field accepts only correct email format|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "images/007900d5-003d-00b2-0090-009000ca00dd.png",
        "timestamp": 1545014560512,
        "duration": 3
    },
    {
        "description": "Should verify password field has \"password\" place holder|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=dfre5@yellowbook.comNed@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014564048,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014564048,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014564048,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014564048,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014564048,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3788:231)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014564048,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Teri@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014567175,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014567175,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014567175,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014567175,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014567175,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014567175,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Angie@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014570277,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014570277,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014570277,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014570277,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014570277,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3788:231)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014570277,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Bennett@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014573385,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014573385,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014573385,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014573385,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014573385,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014573385,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Mariann@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014576488,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014576488,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014576488,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014576488,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014576488,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Christophe@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014579597,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014579597,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014579597,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014579597,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014579597,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Daryle@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014582698,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014582698,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014582698,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014582698,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014582698,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Ruthann@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014585795,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014585795,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014585795,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014585795,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014585795,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/sign?email=Merrilee@gmail.co&password=enguc - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014588905,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014588905,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014588905,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545014588905,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545014588905,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3788:231)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545014588906,
                "type": ""
            }
        ],
        "screenShotFile": "images/006b00eb-0085-00bc-0066-00dc00b7001a.png",
        "timestamp": 1545014560942,
        "duration": 28043
    },
    {
        "description": " should be disabled \"sign in\" button when email & password fields empty|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00fb00cb-0058-009e-0078-00d600ca0052.png",
        "timestamp": 1545014589348,
        "duration": 89
    },
    {
        "description": "should login with \"James May\" info|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "images/00b100f5-005d-0055-00ae-005a00ca001a.png",
        "timestamp": 1545014591121,
        "duration": 3
    },
    {
        "description": "should verify dark-side map is displayed|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/001b007a-00f9-00b3-00e9-00bc004300a4.png",
        "timestamp": 1545014591459,
        "duration": 4262
    },
    {
        "description": "should verify \"VA\" and \"dark-side\" texts are displayed|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3078,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< HEAD
        "screenShotFile": "images/004600a8-005f-0076-00b1-006900dc0052.png",
        "timestamp": 1545014596055,
        "duration": 2057
=======
        "screenShotFile": "images/00da0003-0030-006b-0039-0049006700a1.png",
        "timestamp": 1545010828094,
        "duration": 2046
>>>>>>> cf73d6fff25b96ff223d330f87132eff9ebe85b7
>>>>>>> 1eaee9876b5aed1c76c3d1bd82170080ee38877b
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

