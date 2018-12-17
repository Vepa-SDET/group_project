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
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00650009-00d0-00db-0042-006000800073.png",
        "timestamp": 1545007742210,
        "duration": 30
    },
    {
        "description": "should check Sign in text on the Home Page|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/007d0072-009b-009b-0038-00be00df0083.png",
        "timestamp": 1545007743328,
        "duration": 53
    },
    {
        "description": "should verify email field|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00d20055-0095-0089-00b6-00b8000e0089.png",
        "timestamp": 1545007744317,
        "duration": 29
    },
    {
        "description": "should verify password field|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00670065-0012-0057-0032-004300ae001e.png",
        "timestamp": 1545007745309,
        "duration": 31
    },
    {
        "description": "should verify email field has \"email\" place holder|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/002400bc-0091-00a9-003c-00ae006900ef.png",
        "timestamp": 1545007746479,
        "duration": 19
    },
    {
        "description": "should verify Login functionality with invalid credentials|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
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
                "timestamp": 1545007748158,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545007748508,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/users/me - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545007748508,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/sign-in - Access to XMLHttpRequest at 'https://cybertek-reservation-api-qa.herokuapp.com/api/users/me' from origin 'https://cybertek-reservation-qa.herokuapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
                "timestamp": 1545007748508,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-api-qa.herokuapp.com/api/campuses/my - Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)",
                "timestamp": 1545007748516,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js 55974:18 \"ERROR\" TypeError: __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__.a.throw is not a function\n    at CatchSubscriber.selector (https://cybertek-reservation-qa.herokuapp.com/main.bundle.js:3810:228)\n    at CatchSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/operators/catchError.js.CatchSubscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:149485:31)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at MapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)\n    at FilterSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at MergeMapSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/OuterSubscriber.js.OuterSubscriber.notifyError (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145944:26)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/InnerSubscriber.js.InnerSubscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:145670:21)\n    at InnerSubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber.error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146409:18)\n    at FinallySubscriber.webpackJsonp../node_modules/rxjs/_esm5/internal/Subscriber.js.Subscriber._error (https://cybertek-reservation-qa.herokuapp.com/vendor.bundle.js:146429:26)",
                "timestamp": 1545007748517,
                "type": ""
            }
        ],
        "screenShotFile": "images/000500fe-0055-0058-0068-003f00980056.png",
        "timestamp": 1545007747440,
        "duration": 4682
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00c300da-001d-003a-00ca-001d00e50070.png",
        "timestamp": 1545007753118,
        "duration": 24
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00f900b2-000a-0094-00c3-002200a500ff.png",
        "timestamp": 1545007754070,
        "duration": 121
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00da003e-003b-00d6-002e-006e000f00b8.png",
        "timestamp": 1545007755144,
        "duration": 41
    },
    {
        "description": "should verify \"Git Hub\" icon is forwarding to Git Hub website when clicked|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00a60016-008a-007a-0043-009a004b008e.png",
        "timestamp": 1545007756120,
        "duration": 2392
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 24959,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00d200ce-00f9-0027-00b4-006d003900ae.png",
        "timestamp": 1545007759479,
        "duration": 13
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

