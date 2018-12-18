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
<<<<<<< Updated upstream
<<<<<<< HEAD
        "description": "should login with \"James May\" info|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11340,
=======
        "description": "should Checked the my dropdown is displayed correctly |BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 18624,
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
=======
        "description": "should verify that CANNOT click the lobby|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< Updated upstream
<<<<<<< HEAD
        "screenShotFile": "images\\00f40081-0016-0032-0076-00bc008f00bb.png",
        "timestamp": 1545061419385,
        "duration": 2291
    },
    {
        "description": "should verify \"VA\" and \"dark-side\" texts are displayed|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11340,
=======
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
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
=======
        "screenShotFile": "images/00c4005b-000b-0010-003d-00e500de00c0.png",
        "timestamp": 1545100338827,
        "duration": 2329
    },
    {
        "description": "should verify that CANNOT click the study area|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "images/003900e8-00d9-009c-0008-00210042005f.png",
        "timestamp": 1545100342116,
        "duration": 69
    },
    {
        "description": "should verify that CANNOT click the 4stay area|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
<<<<<<< Updated upstream
<<<<<<< HEAD
        "screenShotFile": "images\\00780029-0046-00a0-0029-00ab00c60003.png",
        "timestamp": 1545061422634,
        "duration": 2068
    },
    {
        "description": "should verify if \"meru\" link directs to the correct page|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11340,
=======
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
=======
        "screenShotFile": "images/005600f2-00d9-000e-003d-006800410071.png",
        "timestamp": 1545100343099,
        "duration": 76
    },
    {
        "description": "should login with \"James May\" info|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/002f004d-007d-00aa-0062-00f7009900a1.png",
        "timestamp": 1545100344072,
        "duration": 0
    },
    {
        "description": "should verify dark-side map is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00ec00aa-006a-00e1-0095-003e00960082.png",
        "timestamp": 1545100344075,
        "duration": 1
    },
    {
        "description": "should verify \"VA\" and \"dark-side\" texts are displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/004c0040-00cc-00b1-0064-00df009e000c.png",
        "timestamp": 1545100344079,
        "duration": 0
    },
    {
        "description": "should verify if \"meru\" link directs to the correct page|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/000c00ed-009e-009a-00f9-0044007500e7.png",
        "timestamp": 1545100344084,
        "duration": 0
    },
    {
        "description": "should verify if the \"cybertek bnb\" logo is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/008300b1-002f-0060-0034-003000af0029.png",
        "timestamp": 1545100344087,
        "duration": 0
    },
    {
        "description": "should verify if the \"by Bug busters #7\" text is visible|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00a00040-00bf-00ee-00b6-00db0015007d.png",
        "timestamp": 1545100344091,
        "duration": 0
    },
    {
        "description": "should displayed the tap menu  |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
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
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
=======
        "screenShotFile": "images/0085005a-0089-005b-0066-001600bb0023.png",
        "timestamp": 1545100344095,
        "duration": 0
    },
    {
        "description": "should displayed map text on the tap menu |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
<<<<<<< HEAD
        "screenShotFile": "images\\0025003b-0007-0049-008f-004000bb007e.png",
        "timestamp": 1545061425602,
        "duration": 1218
    },
    {
        "description": "should verify dark-side map is displayed|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11340,
=======
        "screenShotFile": "images\\00ef00ab-008d-00cd-00f8-00c2003c006f.png",
        "timestamp": 1545095457232,
=======
        "screenShotFile": "images/00b40057-00cc-00f7-007b-0003006900ce.png",
        "timestamp": 1545100344099,
        "duration": 0
    },
    {
        "description": "should displayed schedule text on the tap menu |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00dd0025-006a-0061-007e-0036000800c0.png",
        "timestamp": 1545100344103,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should verify \"VA\" and \"dark-side\" texts are displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
        "screenShotFile": "images\\00670068-0066-00ff-0033-00bf00bb00a3.png",
        "timestamp": 1545095457242,
=======
        "screenShotFile": "images/00af0000-00d0-00b7-00ae-0017001d0055.png",
        "timestamp": 1545100344107,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should verify if \"meru\" link directs to the correct page|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
<<<<<<< HEAD
        "screenShotFile": "images\\0013007e-00ce-007b-00bc-00e900eb0039.png",
        "timestamp": 1545061427806,
        "duration": 2042
    },
    {
        "description": "should verify if the \"cybertek bnb\" logo is displayed|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11340,
=======
        "screenShotFile": "images\\00f300ba-001c-00d6-0015-008d0079005b.png",
        "timestamp": 1545095457252,
=======
        "screenShotFile": "images/004b00c4-00cf-00c1-002f-00fb00a300f2.png",
        "timestamp": 1545100344111,
        "duration": 0
    },
    {
        "description": "should verify email field|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/003f0035-006e-00e1-00e4-003a00ec0008.png",
        "timestamp": 1545100344115,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should verify if the \"cybertek bnb\" logo is displayed|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
        "screenShotFile": "images\\00910038-0090-0026-0050-00d6003600f3.png",
        "timestamp": 1545095457265,
=======
        "screenShotFile": "images/000200e4-00b4-004b-00de-005d008f001a.png",
        "timestamp": 1545100344119,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should verify if the \"by Bug busters #7\" text is visible|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
<<<<<<< HEAD
        "screenShotFile": "images\\00fe003e-006f-0012-00e5-003400410023.png",
        "timestamp": 1545061430773,
        "duration": 34
    },
    {
        "description": "should verify if the \"by Bug busters #7\" text is visible|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11340,
=======
        "screenShotFile": "images\\00a0002c-006d-00a7-00cc-0018004500a9.png",
        "timestamp": 1545095457274,
        "duration": 1
=======
        "screenShotFile": "images/00b00027-00f3-0061-0033-008400c70051.png",
        "timestamp": 1545100344123,
        "duration": 0
    },
    {
        "description": "should verify Login functionality with invalid credentials|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/009700f1-0043-0077-007f-001200f100ad.png",
        "timestamp": 1545100344129,
        "duration": 0
>>>>>>> Stashed changes
    },
    {
        "description": "should verify that CANNOT click the lobby|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
        "screenShotFile": "images\\00000080-0036-008e-0072-002500190080.png",
        "timestamp": 1545095457285,
=======
        "screenShotFile": "images/00c200ec-001e-000f-0000-001a009800da.png",
        "timestamp": 1545100344136,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should verify that CANNOT click the study area|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
        "screenShotFile": "images\\004c0074-00f9-0097-002b-00d900b10056.png",
        "timestamp": 1545095457295,
=======
        "screenShotFile": "images/009f00b8-007d-0016-0005-009c00080021.png",
        "timestamp": 1545100344140,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should verify that CANNOT click the 4stay area|BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
        "screenShotFile": "images\\00ed00d7-0019-002e-0096-003800c50011.png",
        "timestamp": 1545095457305,
=======
        "screenShotFile": "images/0053007a-007f-002b-00c7-000a000300c1.png",
        "timestamp": 1545100344148,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should displayed the tap menu  |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
<<<<<<< HEAD
        "screenShotFile": "images\\00a1001b-00d6-0046-003d-00ec00c70088.png",
        "timestamp": 1545061431725,
        "duration": 58
    },
    {
        "description": "should verify the 'schedule' dropdown's 'general' option link direct to the correct page|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11340,
=======
        "screenShotFile": "images\\00e000aa-00bf-0067-00f0-000400ff0022.png",
        "timestamp": 1545095457316,
=======
        "screenShotFile": "images/00c300b2-00b9-00c1-00f4-00700040002e.png",
        "timestamp": 1545100344152,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon is visible|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00fa007d-0001-0015-0011-0031000c0014.png",
        "timestamp": 1545100344159,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should displayed map text on the tap menu |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
        "screenShotFile": "images\\00ef0071-001a-003f-00ca-0047003f0002.png",
        "timestamp": 1545095457326,
=======
        "screenShotFile": "images/001c0039-0064-004e-0088-002400f1001d.png",
        "timestamp": 1545100344163,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should displayed schedule text on the tap menu |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
<<<<<<< HEAD
        "screenShotFile": "images\\00fa0089-0015-007d-0096-000a0078007e.png",
        "timestamp": 1545061432702,
        "duration": 1599
    },
    {
        "description": "should verify the 'my' dropdown's 'self' option link direct the correct page|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11340,
=======
        "screenShotFile": "images\\00b700fe-004d-00fb-0088-008f00d40098.png",
        "timestamp": 1545095457336,
=======
        "screenShotFile": "images/00df007a-00da-000e-006e-00f7001d00f5.png",
        "timestamp": 1545100344167,
        "duration": 0
    },
    {
        "description": "should verify \"Question\" icon swithced to Mailto window when clicked|BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Temporarily disabled with xit",
        "browserLogs": [],
        "screenShotFile": "images/0028004d-003d-0007-0095-00a8003a00ad.png",
        "timestamp": 1545100344171,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should Verify that the Half Dome room is enabled |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
<<<<<<< HEAD
        "screenShotFile": "images\\00b50041-006f-009d-0088-00e100f2009e.png",
        "timestamp": 1545061435246,
        "duration": 1888
    },
    {
        "description": "should verify the 'my' dropdown's 'team' option link direct the correct page|BookIT Map Page test scripts",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 11340,
=======
        "screenShotFile": "images\\00d8003f-0031-0072-00a3-0078008100f7.png",
        "timestamp": 1545095457346,
=======
        "screenShotFile": "images/003a00f4-00aa-0091-0060-002b002b004d.png",
        "timestamp": 1545100344175,
        "duration": 0
    },
    {
        "description": "should Verify \"Git Hub\" icon color changes if we hover over |BookIT Home Page test scripts",
        "passed": false,
        "pending": true,
        "os": "Mac OS X",
        "instanceId": 10460,
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "images/00ed0091-0008-0042-009f-00ce00dd008a.png",
        "timestamp": 1545100344179,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should Verify that the denali room is enabled |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
        "screenShotFile": "images\\005e007a-00a9-0058-00c2-00470082007d.png",
        "timestamp": 1545095457357,
=======
        "screenShotFile": "images/00cf0041-004e-0063-0081-003a006600b7.png",
        "timestamp": 1545100344184,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should Verify that the meru room is enabled |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
        "screenShotFile": "images\\005e00c8-00a0-00e8-0082-0052002100bf.png",
        "timestamp": 1545095457367,
=======
        "screenShotFile": "images/00f40097-0015-0033-000c-003700de00fd.png",
        "timestamp": 1545100344188,
>>>>>>> Stashed changes
        "duration": 0
    },
    {
        "description": "should Checked the hunt link direct to correct page |BookIT Map Page test scripts",
        "passed": false,
        "pending": true,
<<<<<<< Updated upstream
        "os": "Windows NT",
        "instanceId": 18624,
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
=======
        "os": "Mac OS X",
        "instanceId": 10460,
>>>>>>> Stashed changes
        "browser": {
            "name": "chrome",
            "version": "70.0.3538.110"
        },
        "message": "Pending",
        "browserLogs": [],
<<<<<<< Updated upstream
<<<<<<< HEAD
        "screenShotFile": "images\\00ac0050-0085-0054-0045-00b800ea000a.png",
        "timestamp": 1545061438100,
        "duration": 949
=======
        "screenShotFile": "images\\00070006-0015-0029-00e5-00a40072002d.png",
        "timestamp": 1545095457377,
=======
        "screenShotFile": "images/008f0091-00af-0087-0043-0050002200d8.png",
        "timestamp": 1545100344192,
>>>>>>> Stashed changes
        "duration": 0
>>>>>>> 406bd444ac87df8e6209f84c0c854148e9af12fd
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

