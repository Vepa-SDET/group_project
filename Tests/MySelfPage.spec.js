require('../Utilities/CustomLocators.js');
let HomePage= require('../Pages/Home.page.js');
let HuntPage= require('../Pages/Hunt.page.js');
let Base = require('../Utilities/Base.js');
let Data = require('../TestData/data.json');
let MySelfPage=require('../Pages/mySelf.page.js');

let MapPage = require('../Pages/Map.page.js');
let RoomsPage = require('../Pages/Rooms.page.js');
let MapData = require('../TestData/MapPage.json');

//DB Connection
var pgp            = require('pg-promise')(/*options*/);
var dbConnection   = require("../TestData/dbConnection.js");
var queries        = require("../TestData/dbQueries.js");


describe('BookIT my self link Page test scripts', () => {
    let browserWindows="";
    var db=pgp(dbConnection);
    var array=[]
    beforeAll(() => {
        Base.navigateToHome();
        // Base.loginMethod();
        Base.loginWithDBquery();
        browser.actions().mouseMove(MapPage.myLink).perform();
        MapPage.myLinkSelf.click();
    });


        fit('should verify Role icon in "self" page is displayed', () => {
        expect(MySelfPage.MySelfPageRole.get(1).isDisplayed()).toBe(true);
        expect(MySelfPage.MySelfPageRole.get(1).getText()).toEqual("role");
    });

    fit('should verify Team icon in "self" page is displayed', () => {
        expect(MySelfPage.MySelfPageTeam.get(2).isDisplayed()).toBe(true);
        expect(MySelfPage.MySelfPageRole.get(2).getText()).toEqual("team");

    });

    fit('should verify Batch icon in "self" page is displayed', () => {
        expect(MySelfPage.MySelfPageBatch.get(3).isDisplayed()).toBe(true);
        expect(MySelfPage.MySelfPageRole.get(3).getText()).toEqual("batch");

    });





});

