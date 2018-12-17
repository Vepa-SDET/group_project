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
        "description": "should displayed the tap menu  |BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00ec00e2-00cd-005b-00b6-009e0049009a.png",
        "timestamp": 1545067443370,
        "duration": 2069
    },
    {
        "description": "should displayed map text on the tap menu |BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/002a0007-0088-0068-0083-008e002700d7.png",
        "timestamp": 1545067446398,
        "duration": 61
    },
    {
        "description": "should displayed schedule text on the tap menu |BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/003e00fb-00bf-0001-00f6-003800cc005f.png",
        "timestamp": 1545067447362,
        "duration": 55
    },
    {
        "description": "should login with \"James May\" info|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/0098003e-0061-00d0-00bf-00150041003c.png",
        "timestamp": 1545067448315,
        "duration": 0
    },
    {
        "description": "should verify dark-side map is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/007100c5-00a8-00f7-0063-006600910052.png",
        "timestamp": 1545067448319,
        "duration": 0
    },
    {
        "description": "should verify \"VA\" and \"dark-side\" texts are displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00a40011-0025-007b-0041-00590069002d.png",
        "timestamp": 1545067448323,
        "duration": 0
    },
    {
        "description": "should verify if \"meru\" link directs to the correct page|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/004b0039-0070-0093-00ac-00e700c60072.png",
        "timestamp": 1545067448326,
        "duration": 0
    },
    {
        "description": "should verify if the \"cybertek bnb\" logo is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/009e00bb-0031-0037-0013-00ae0067000d.png",
        "timestamp": 1545067448330,
        "duration": 0
    },
    {
        "description": "should verify if the \"by Bug busters #7\" text is visible|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/0081006f-009d-00ee-0071-0004007f0009.png",
        "timestamp": 1545067448334,
        "duration": 0
    },
    {
        "description": "should verify that CANNOT click the lobby|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/003e0059-00a8-00dd-006b-00b700f9003b.png",
        "timestamp": 1545067448338,
        "duration": 0
    },
    {
        "description": "should verify that CANNOT click the study area|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/003d0047-0088-006f-0018-002b00080081.png",
        "timestamp": 1545067448341,
        "duration": 0
    },
    {
        "description": "should verify that CANNOT click the 4stay area|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/009300ab-00b8-0096-00a3-001100d300e5.png",
        "timestamp": 1545067448345,
        "duration": 0
    },
    {
        "description": "should print out the Title|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00bf0068-00ca-0046-003f-00da00b60099.png",
        "timestamp": 1545067448349,
        "duration": 0
    },
    {
        "description": "should check Sign in text on the Home Page|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/000f0088-00ae-00b8-00bc-005e00fa00ce.png",
        "timestamp": 1545067448353,
        "duration": 0
    },
    {
        "description": "should verify email field|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00dd00cd-0064-007e-005f-0074002e009f.png",
        "timestamp": 1545067448357,
        "duration": 0
    },
    {
        "description": "should verify password field|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/002d00ec-00b7-004e-006e-007a00f000c6.png",
        "timestamp": 1545067448361,
        "duration": 0
    },
    {
        "description": "should verify email field has \"email\" place holder|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/000e00f7-001c-00e9-0069-000e00300053.png",
        "timestamp": 1545067448365,
        "duration": 0
    },
    {
        "description": "should verify Login functionality with invalid credentials|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/008a006f-0046-0064-0057-0089003c0099.png",
        "timestamp": 1545067448369,
        "duration": 0
    },
    {
        "description": "Sign In - should be clickable|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00d200f7-0011-00d1-00f2-000f00560020.png",
        "timestamp": 1545067448376,
        "duration": 0
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00f9007d-00b0-00f2-00b2-008a00f300de.png",
        "timestamp": 1545067448383,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00ce0076-008f-0063-005b-002400ed000d.png",
        "timestamp": 1545067448393,
        "duration": 0
    },
    {
        "description": "should Verify \"?\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00840002-00e9-008c-00aa-000f00d6002d.png",
        "timestamp": 1545067448397,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/0013000b-001b-0054-009e-00fa00b0005a.png",
        "timestamp": 1545067448402,
        "duration": 0
    },
    {
        "description": "should verify \"Git Hub\" icon is forwarding to Git Hub website when clicked|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/0020009b-0029-0069-00de-00c10071007f.png",
        "timestamp": 1545067448407,
        "duration": 0
    },
    {
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00ed001c-0011-00de-00bb-008800230018.png",
        "timestamp": 1545067448411,
        "duration": 0
    },
    {
        "description": "should verify \"Question\" icon swithced to Mailto window when clicked|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Temporarily disabled with xit",
        "browserLogs": [],
        "screenShotFile": "images/00d6009c-004b-006f-0048-00e4006f00f2.png",
        "timestamp": 1545067448416,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00f100ce-003b-00a7-006f-00b9001600bd.png",
        "timestamp": 1545067448419,
        "duration": 1
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over |BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00070059-00a0-0023-0024-003d002700ad.png",
        "timestamp": 1545067448424,
        "duration": 0
    },
    {
        "description": "Should verify email field accepts only correct email format|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/002000da-0087-00f1-001d-00590088006b.png",
        "timestamp": 1545067448429,
        "duration": 0
    },
    {
        "description": "Should verify password field has \"password\" place holder|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00cd00cc-00a0-0095-0075-00da0045008a.png",
        "timestamp": 1545067448434,
        "duration": 0
    },
    {
        "description": " should be disabled \"sign in\" button when email & password fields empty|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 7999,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00620094-0090-00cf-0066-00cc00760066.png",
        "timestamp": 1545067448440,
        "duration": 0
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

