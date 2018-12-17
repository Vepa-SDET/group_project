require('../Utilities/CustomLocators.js');
let HomePage= require('../Pages/Home.page.js');
let Base = require('../Utilities/Base.js');
let Data = require('../TestData/data.json');

let MapPage = require('../Pages/Map.page.js');
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
                expect(MapPage.mapPageLogo.getText()).toEqual(MapData.MapPageLogo);
            })
        })

    });

    it('should verify dark-side map is displayed', () => {
        expect(MapPage.mapPageMapImage.isDisplayed()).toBe(true);
    });

    it('should verify "VA" and "dark-side" texts are displayed', () => {
        expect(MapPage.mapPageLogo.getText()).toEqual(MapData.MapPageLogo);
        expect(MapPage.mapPageMapNameElement.getText()).toEqual(MapData.MapPageMapName);
    });
});