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
        "description": "021 -> should login with \"James May\" info|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/00b10048-009f-00e4-0015-00340001006e.png",
        "timestamp": 1545282944767,
        "duration": 5044
    },
    {
        "description": "022-> should verify dark-side map is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00650013-00bb-002a-00d6-0019008c0031.png",
        "timestamp": 1545282950894,
        "duration": 0
    },
    {
        "description": "023 -> should verify \"VA\" and \"dark-side\" texts are displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00d1001f-004b-007c-005c-0085007800a8.png",
        "timestamp": 1545282950898,
        "duration": 0
    },
    {
        "description": "042-> should check if \"Git Hub\" icon is visible|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/009b00c5-00e4-002c-0020-00a400f100b0.png",
        "timestamp": 1545282950910,
        "duration": 0
    },
    {
        "description": "043-> should check if \"Git Hub\" icon color changes if we hover over|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/0023007e-00c7-00b6-0068-0075001b0053.png",
        "timestamp": 1545282950915,
        "duration": 0
    },
    {
        "description": "044-> should check if \"?\" icon is enabled|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00090011-0065-006e-009b-00170070006a.png",
        "timestamp": 1545282950925,
        "duration": 0
    },
    {
        "description": "039-> should verify if \"meru\" link directs to the correct page|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/006c0026-0036-00df-00c4-00d8003d00cf.png",
        "timestamp": 1545282950940,
        "duration": 0
    },
    {
        "description": "040-> should verify if the \"cybertek bnb\" logo is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/000b0054-005e-0027-005e-00dc003c0069.png",
        "timestamp": 1545282950944,
        "duration": 0
    },
    {
        "description": "041-> should verify if the \"by Bug busters #7\" text is visible|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00770032-006b-0031-0086-0013000a0027.png",
        "timestamp": 1545282950948,
        "duration": 0
    },
    {
        "description": "060-> should verify the 'schedule' dropdown's 'general' option link direct to the correct page|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00cb00d2-00a0-00a9-0082-007a00ef0062.png",
        "timestamp": 1545282950951,
        "duration": 0
    },
    {
        "description": "061-> should verify the 'my' dropdown's 'self' option link direct the correct page|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/000600d1-005d-0072-006d-00df00a60033.png",
        "timestamp": 1545282950956,
        "duration": 0
    },
    {
        "description": "062-> should verify the 'my' dropdown's 'team' option link direct the correct page|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/005f00e0-002d-0096-004f-009c00ab0003.png",
        "timestamp": 1545282950959,
        "duration": 0
    },
    {
        "description": "027-> should verify that CANNOT click the lobby|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00aa0033-0069-0095-00b9-004500780023.png",
        "timestamp": 1545282950963,
        "duration": 0
    },
    {
        "description": "028-> should verify that CANNOT click the study area|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/006f004d-0094-00df-005b-00410063000e.png",
        "timestamp": 1545282950966,
        "duration": 0
    },
    {
        "description": "028-> should verify that CANNOT click the study area|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/0063000b-005d-00a9-0054-00e8008c00e6.png",
        "timestamp": 1545282950970,
        "duration": 0
    },
    {
        "description": "029-> should verify that CANNOT click the 4stay area|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/007c0098-00e7-0034-0093-00cb00c700ac.png",
        "timestamp": 1545282950975,
        "duration": 0
    },
    {
        "description": "BT-030 - Should verify that CANNOT click the \"ocean view\" room|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00b4007e-006b-00bf-0047-001200310069.png",
        "timestamp": 1545282950978,
        "duration": 0
    },
    {
        "description": "BT-031 - Verify that CANNOT click the \"kuzzats cave room|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/000f003a-007d-000b-0054-00d3008900ba.png",
        "timestamp": 1545282950982,
        "duration": 0
    },
    {
        "description": "BT-032 - Verify that room \"klimanjaro\" is clickable|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00a40099-00e7-005a-003b-0002001800f4.png",
        "timestamp": 1545282950986,
        "duration": 0
    },
    {
        "description": "033-> should Verify that the Half Dome room is enabled |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00b20008-00cd-0075-00be-0000009a0054.png",
        "timestamp": 1545282950990,
        "duration": 0
    },
    {
        "description": "034-> should Verify that the denali room is enabled |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00ea0026-004c-007f-00d0-001e00580005.png",
        "timestamp": 1545282950994,
        "duration": 0
    },
    {
        "description": "035-> should Verify that the meru room is enabled |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00530010-00db-00ff-00ec-00c600a300b0.png",
        "timestamp": 1545282950998,
        "duration": 0
    },
    {
        "description": "054-> should Checked the hunt link direct to correct page |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00f000ea-0035-0062-0050-008e004a0041.png",
        "timestamp": 1545282951002,
        "duration": 0
    },
    {
        "description": "056-> should Checked the my dropdown is displayed correctly |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00a80033-0039-0079-007f-0069002a00a1.png",
        "timestamp": 1545282951006,
        "duration": 0
    },
    {
        "description": "055-> should Checked the schedule dropdown is displayed correctly |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00e8007d-00fe-00ac-00c0-00f5009900d3.png",
        "timestamp": 1545282951011,
        "duration": 0
    },
    {
        "description": "should be displayed tap menu|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/001b00ed-00df-00a9-0018-00cc00a2001d.png",
        "timestamp": 1545282951015,
        "duration": 0
    },
    {
        "description": "should be displayed 'map' text on the tap menu|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00ee00f6-00ac-00fc-00e0-006a00ce003e.png",
        "timestamp": 1545282951019,
        "duration": 0
    },
    {
        "description": "should be displayed \"schedule\" text on the tap menu|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/001a004d-0045-00da-005e-000200f100c0.png",
        "timestamp": 1545282951031,
        "duration": 0
    },
    {
        "description": "BT-051 - Verify that \"hunt\" text is displayed on the tap menu|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/004000f8-00cf-0031-0026-00f500060065.png",
        "timestamp": 1545282951035,
        "duration": 0
    },
    {
        "description": "BT-052 - Verify \"my\" text is displayed on the tap menu|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/005300ea-00af-00f7-0071-000100300064.png",
        "timestamp": 1545282951039,
        "duration": 0
    },
    {
        "description": "BT-053 - Verify  \"map\" link direct to correct page|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 3855,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/009b0094-00cb-002c-003b-001600fa004b.png",
        "timestamp": 1545282951044,
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

