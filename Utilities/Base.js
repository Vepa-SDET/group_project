let HomePage= require('../Pages/Home.page.js');
let Data = require('../TestData/data.json');
//DB Connection
var pgp            = require('pg-promise')(/*options*/);
var dbConnection   = require("../TestData/dbConnection.js");
var queries        = require("../TestData/dbQueries.js");
var db=pgp(dbConnection);
let Base=function(){
    this.homeUrl='https://cybertek-reservation-qa.herokuapp.com/sign-in';
    this.navigateToHome=()=>{
        browser.waitForAngularEnabled(false);
        browser.get(this.homeUrl);
    }
    this.loginMethod=()=>{
        HomePage.homePageEmailLoginBar.sendKeys(Data.validUser.email);
        HomePage.homePagePasswordBar.sendKeys(Data.validUser.password);
        HomePage.homePageSignInButton.click();
    }
    this.loginWithDBquery=()=>{
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
                
            });
        });
    }

}

module.exports=new Base();