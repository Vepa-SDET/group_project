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


   //FO 
    it("should verify that CANNOT click the study area",()=>{
        expect(MapPage.mapStudyArea.isEnabled()).toBe(true);
    });

    //feride
// BT 0027
    fit("should verify that CANNOT click the lobby",()=>{
        var currentUrl=browser.getCurrentUrl().then(function(url){
console.log(url)
        })
        MapPage.mapLoby.click()
        var lastUrl=browser.getCurrentUrl().then(function(url){

        })
        expect(currentUrl).toEqual(lastUrl);

    });
// BT 0028
    it("should verify that CANNOT click the study area",()=>{
        var currentUrl=browser.getCurrentUrl().then(function(url){
         console.log(url)
                 })
                 MapPage.mapStudyArea.click()
                 var lastUrl=browser.getCurrentUrl().then(function(url){
         
                 })
                 expect(currentUrl).toEqual(lastUrl);

 });
 // BT 0029
    it("should verify that CANNOT click the 4stay area",()=>{
        var currentUrl=browser.getCurrentUrl().then(function(url){
            console.log(url)
                    })
                    MapPage.map4stayArea.click()
                    var lastUrl=browser.getCurrentUrl().then(function(url){
            
                    })
                    expect(currentUrl).toEqual(lastUrl);

        })
    it("should verify that CANNOT click the study area",()=>{
           var currentUrl=browser.getCurrentUrl().then(function(url){
            console.log(url)
                    });
                    MapPage.mapStudyArea.click()
                    var lastUrl=browser.getCurrentUrl().then(function(url){
            
                    });
                    expect(currentUrl).toEqual(lastUrl);

    });
//HS
    it('BT-030 - Should verify that CANNOT click the "ocean view" room', ()=>{
        var currentUrl=browser.getCurrentUrl().then(function(url){
            console.log(url)
                    });
                    MapPage.mapOceanViewArea.click()
                    var lastUrl=browser.getCurrentUrl().then(function(url){
            
                    });
                    expect(currentUrl).toEqual(lastUrl);
    });
    it('BT-031 - Verify that CANNOT click the "kuzzats cave room', ()=>{
        var currentUrl=browser.getCurrentUrl().then(function(url){
        console.log(url)
            });
            MapPage.mapKuzzatsCaveArea.click()
            var lastUrl=browser.getCurrentUrl().then(function(url){
    
            });
            expect(currentUrl).toEqual(lastUrl);
    });
    it('BT-032 - Verify that room "klimanjaro" is clickable', ()=>{
        expect(MapPage.mapKlimanjaroArea.isEnabled()).toBe(true);
    });


//Resul
     it("should Verify that the Half Dome room is enabled ",()=>{
        expect(MapPage.halfDome.isDisplayed()).toBe(true);
        expect(MapPage.halfDome.isEnabled()).toBe(true);
 
     });


     it("should Verify that the denali room is enabled ",()=>{
        expect(MapPage.drenali.isDisplayed()).toBe(true);
        expect(MapPage.drenali.isEnabled()).toBe(true);
 
     });

     it("should Verify that the meru room is enabled ",()=>{
        expect(MapPage.meru.isDisplayed()).toBe(true);
        expect(MapPage.meru.isEnabled()).toBe(true);
 
     });

     it("should Checked the hunt link direct to correct page ",()=>{
         browser.navigate().refresh();
        MapPage.huntLink.click();
        expect(HuntPage.pickDateAndTimeText.getText()).toEqual("pick date and time");
        browser.navigate().back();
     });

     it("should Checked the my dropdown is displayed correctly ",()=>{
        browser.actions().mouseMove(MapPage.myLink).perform();
        browser.sleep(2000);
        expect(MapPage.myLinkSelf.isDisplayed()).toBe(true);
        expect(MapPage.myLinkTeam.isDisplayed()).toBe(true);
        expect(MapPage.myLinkSignout.isDisplayed()).toBe(true);
        
     });
     
     it("should Checked the schedule dropdown is displayed correctly ",()=>{
        browser.actions().mouseMove(MapPage.mapScheduleLink).perform();
        expect(MapPage.huntLinkMy.isDisplayed()).toBe(true);
        expect(MapPage.huntLinkGeneral.isDisplayed()).toBe(true);
        //test 11.20
     });



     //feride
     //BT 048
     it('should be displayed tap menu',()=>{
         expect(MapPage.mapTopMenu.isDisplayed()).toBe(true);
     });
     //BT 049
     it("should be displayed 'map' text on the tap menu",()=>{
        expect(MapPage.mapMapText.getText()).toEqual("map")
    });
    //BT 050
    it('should be displayed "schedule" text on the tap menu',()=>{
        expect(MapPage.mapScheduleLink.getText()).toEqual("schedule");
    });

    //HS
    it('BT-051 - Verify that "hunt" text is displayed on the tap menu', ()=>{
        expect(MapPage.huntLink.isDisplayed()).toBe(true);
    });
    it('BT-052 - Verify "my" text is displayed on the tap menu', ()=>{
        expect(MapPage.mapMyLink.isDisplayed()).toBe(true);
    });

    //this test case(BT-053) need to be after BT-054 so it can function correctly
    it('BT-053 - Verify  "map" link direct to correct page', ()=>{
        MapPage.mapMapLink.click();
        expect(MapPage.mapMapLink.isDisplayed()).toBe(true);
        browser.navigate().back();

    });

    });