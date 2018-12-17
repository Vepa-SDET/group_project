require('../Utilities/CustomLocators.js');
let HomePage= require('../Pages/Home.page.js');
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

describe('BookIT Map Page test scripts', () => {
    let browserWindows="";
    var db=pgp(dbConnection);
    var array=[]
    beforeAll(() => {
        Base.navigateToHome();
        // Base.loginMethod();
        Base.loginWithDBquery();
    });

    it('should login with "James May" info', () => {
        expect(MapPage.mapPageLogo.getText()).toEqual(MapData.MapPageLogo);
       
    });

  
    it('should verify "VA" and "dark-side" texts are displayed', () => {
        browser.sleep(2000);
        expect(MapPage.mapPageLogo.getText()).toEqual(MapData.MapPageLogo);
        expect(MapPage.mapPageMapNameElement.getText()).toEqual(MapData.MapPageMapName);
    });

    //Vepa 

    it('should verify if "meru" link directs to the correct page', () => {
        MapPage.mapPageMeruLink.click();
        expect(RoomsPage.roomsPageScheduleTable.isDisplayed()).toBe(true);
        browser.navigate().back();
    });

    it('should verify dark-side map is displayed', () => {
        browser.sleep(2000);
        expect(MapPage.mapPageMapImage.isDisplayed()).toBe(true);
    });
    
    it('should verify if the "cybertek bnb" logo is displayed', () => {
        expect(MapPage.mapPageCyberTekBNBLogo.isDisplayed()).toBe(true);
 
    });
    
    it('should verify if the "by Bug busters #7" text is visible', () => {
        expect(MapPage.mapPagebyBugbusters7Logo.isDisplayed()).toBe(true);
    });

    it("should verify the 'schedule' dropdown's 'general' option link direct to the correct page", () => {
        browser.actions().mouseMove(MapPage.mapPageScheduleDropDown).perform().then(()=>{
        MapPage.mapPageScheduleGeneralOption.click();
        expect(RoomsPage.roomsPageScheduleHeader.isDisplayed()).toBe(true);
    });
        browser.navigate().back();
    });

    it("should verify the 'my' dropdown's 'self' option link direct the correct page", () => {
        browser.actions().mouseMove(MapPage.mapPageMyDropDown).perform();
        MapPage.mapPageMySelfOption.click();
        expect(MySelfPage.mySelfPageMeHeader.isDisplayed()).toBe(true);
        browser.navigate().back();
    });

    it("should verify the 'my' dropdown's 'team' option link direct the correct page", () => {
        browser.actions().mouseMove(MapPage.mapPageMyDropDown).perform();
        MapPage.mapPageMyTeamOption.click();
        expect(MySelfPage.mySelfPageTeamHeader.isDisplayed()).toBe(true);
        browser.navigate().back();
    });


});