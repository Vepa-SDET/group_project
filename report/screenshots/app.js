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
        "description": "should Verify Question Circle \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\00c6001c-0075-009f-00c9-0051008b0034.png",
        "timestamp": 1544943205204,
        "duration": 75
    },
    {
        "description": "should print out the Title|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00b1005a-00ad-0003-004c-00cb00c6006b.png",
        "timestamp": 1544943206325,
        "duration": 0
    },
    {
        "description": "should check Sign in text on the Home Page|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00f300ff-0057-005b-0038-000200df009f.png",
        "timestamp": 1544943206343,
        "duration": 1
    },
    {
        "description": "should verify Login functionality with invalid credentials|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\002a0007-00fc-0030-00a4-002a00e90065.png",
        "timestamp": 1544943206470,
        "duration": 0
    },
    {
        "description": "should verify \"Git Hub\" icon is forwarding to Git Hub website when clicked|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00bc0040-0084-009f-0039-006f003a0081.png",
        "timestamp": 1544943206488,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\008d00e1-00ef-00f6-00ca-00b3000500b4.png",
        "timestamp": 1544943206506,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00fb00a7-000f-0093-005e-00d5007c0057.png",
        "timestamp": 1544943206526,
        "duration": 0
    },
    {
        "description": "should verify \"Question\" icon swithced to Mailto window when clicked|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00bc0050-009f-00a9-0072-00b500a90048.png",
        "timestamp": 1544943206547,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00890080-006c-00b2-00de-004b00590014.png",
        "timestamp": 1544943206569,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over |BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\004d0010-0065-00ee-00e5-005d00160039.png",
        "timestamp": 1544943206604,
        "duration": 0
    },
    {
        "description": "should verify  \"?\" icon is enabled|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\003b0039-00f0-0068-0073-009300100062.png",
        "timestamp": 1544943206622,
        "duration": 0
    },
    {
        "description": "Should verify email field accepts only correct email format|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00f9009e-007e-005a-0070-00a60083000d.png",
        "timestamp": 1544943206638,
        "duration": 0
    },
    {
        "description": "Should verify password field has \"password\" place holder|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\002d0014-0027-006d-009d-0040003d000e.png",
        "timestamp": 1544943206658,
        "duration": 0
    },
    {
        "description": " should be disabled \"sign in\" button when email & password fields empty|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 20720,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00a30063-0079-00e5-008f-007200c30013.png",
        "timestamp": 1544943206689,
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

