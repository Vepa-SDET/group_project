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
        "description": "should Checked the my dropdown is displayed correctly |BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\005b0096-003c-001c-0013-0099000600b2.png",
        "timestamp": 1545095450828,
        "duration": 5014
    },
    {
        "description": "should Checked the schedule dropdown is displayed correctly |BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images\\00ae001d-00e9-0037-001b-007400a0003d.png",
        "timestamp": 1545095456465,
        "duration": 204
    },
    {
        "description": "should login with \"James May\" info|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00db0015-000e-0068-004b-002e008900f7.png",
        "timestamp": 1545095457220,
        "duration": 0
    },
    {
        "description": "should verify dark-side map is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00ef00ab-008d-00cd-00f8-00c2003c006f.png",
        "timestamp": 1545095457232,
        "duration": 0
    },
    {
        "description": "should verify \"VA\" and \"dark-side\" texts are displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00670068-0066-00ff-0033-00bf00bb00a3.png",
        "timestamp": 1545095457242,
        "duration": 0
    },
    {
        "description": "should verify if \"meru\" link directs to the correct page|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00f300ba-001c-00d6-0015-008d0079005b.png",
        "timestamp": 1545095457252,
        "duration": 0
    },
    {
        "description": "should verify if the \"cybertek bnb\" logo is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00910038-0090-0026-0050-00d6003600f3.png",
        "timestamp": 1545095457265,
        "duration": 0
    },
    {
        "description": "should verify if the \"by Bug busters #7\" text is visible|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00a0002c-006d-00a7-00cc-0018004500a9.png",
        "timestamp": 1545095457274,
        "duration": 1
    },
    {
        "description": "should verify that CANNOT click the lobby|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00000080-0036-008e-0072-002500190080.png",
        "timestamp": 1545095457285,
        "duration": 0
    },
    {
        "description": "should verify that CANNOT click the study area|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\004c0074-00f9-0097-002b-00d900b10056.png",
        "timestamp": 1545095457295,
        "duration": 0
    },
    {
        "description": "should verify that CANNOT click the 4stay area|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00ed00d7-0019-002e-0096-003800c50011.png",
        "timestamp": 1545095457305,
        "duration": 0
    },
    {
        "description": "should displayed the tap menu  |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00e000aa-00bf-0067-00f0-000400ff0022.png",
        "timestamp": 1545095457316,
        "duration": 0
    },
    {
        "description": "should displayed map text on the tap menu |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00ef0071-001a-003f-00ca-0047003f0002.png",
        "timestamp": 1545095457326,
        "duration": 0
    },
    {
        "description": "should displayed schedule text on the tap menu |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00b700fe-004d-00fb-0088-008f00d40098.png",
        "timestamp": 1545095457336,
        "duration": 0
    },
    {
        "description": "should Verify that the Half Dome room is enabled |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00d8003f-0031-0072-00a3-0078008100f7.png",
        "timestamp": 1545095457346,
        "duration": 0
    },
    {
        "description": "should Verify that the denali room is enabled |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\005e007a-00a9-0058-00c2-00470082007d.png",
        "timestamp": 1545095457357,
        "duration": 0
    },
    {
        "description": "should Verify that the meru room is enabled |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\005e00c8-00a0-00e8-0082-0052002100bf.png",
        "timestamp": 1545095457367,
        "duration": 0
    },
    {
        "description": "should Checked the hunt link direct to correct page |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Windows NT",
        "instanceId": 18624,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images\\00070006-0015-0029-00e5-00a40072002d.png",
        "timestamp": 1545095457377,
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

