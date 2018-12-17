require('../Utilities/CustomLocators.js');
let HomePage= require('../Pages/Home.page.js');
let Base = require('../Utilities/Base.js');
let Data = require('../TestData/data.json');


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
        Base.loginMethod();
    });

    it('should login with "James May" info', () => {
        db.one(queries.jamesMayEmail).then(emailObject=>{
            HomePage.homePageEmailLoginBar.sendKeys(emailObject.email);
        }).catch(error=>{
            console.log(error)
        }).then(()=>{
            db.one(queries.jamesMayPassword).then(passwordObject=>{
                HomePage.homePagePasswordBar.sendKeys(passwordObject.password);

                
            }).catch(error=>{
                console.log(error);
            }).then(()=>{
                HomePage.homePageSignInButton.click();
                browser.sleep(2000);
                expect(MapPage.mapPageLogo.getText()).toEqual(MapData.MapPageLogo);
            })
        })

    });

    it('should verify dark-side map is displayed', () => {
        browser.sleep(2000);
        expect(MapPage.mapPageMapImage.isDisplayed()).toBe(true);
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

    it('should verify if the "cybertek bnb" logo is displayed', () => {
        expect(MapPage.mapPageCyberTekBNBLogo.isDisplayed()).toBe(true);
 
    });
    
    it('should verify if the "by Bug busters #7" text is visible', () => {
        expect(MapPage.mapPagebyBugbusters7Logo.isDisplayed()).toBe(true);
    });

    //Feride
    it("should verify that CANNOT click the lobby",()=>{
        expect(MapPage.mapLoby.isEnabled()).toBe(true);

    })
    it("should verify that CANNOT click the study area",()=>{
        expect(MapPage.mapStudyArea.isEnabled()).toBe(true);

    })
    it("should verify that CANNOT click the 4stay area",()=>{
        expect(MapPage.map4stayArea.isEnabled()).toBe(true);

    })
    fit("should displayed the tap menu  ",()=>{
        expect(MapPage.mapTopMenu.isDisplayed()).toBe(true);

    })
    fit("should displayed map text on the tap menu ",()=>{
       expect(MapPage.mapMapText.getText().isDisplayed()).toBe(true);
    

    })
    fit("should displayed schedule text on the tap menu ",()=>{
        expect(MapPage.mapScheduleText.getText().isDisplayed()).toBe(true);
     
 
     })


});