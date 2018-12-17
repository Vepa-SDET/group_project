let HomePage= require('../Pages/Home.page.js');
let Data = require('../TestData/data.json');

let Base=function(){
    this.homeUrl='https://cybertek-reservation-qa.herokuapp.com/sign-in';
    this.navigateToHome=()=>{
        browser.get(this.homeUrl);
    }
    this.loginMethod=()=>{
        HomePage.homePageEmailLoginBar.sendKeys(Data.validUser.email);
        HomePage.homePagePasswordBar.sendKeys(Data.validUser.password);
        HomePage.homePageSignInButton.click();
    }
}

module.exports=new Base();