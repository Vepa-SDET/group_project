require('../Utilities/CustomLocators.js');
let HomePage= require('../Pages/Home.page.js');
let Base = require('../Utilities/Base.js');
let Data = require('../TestData/data.json');

describe('BookIT Home Page test scripts', () => {
    let browserWindows="";
    beforeAll(() => {
        Base.navigateToHome();
    });

    it('should print out the Title', () => {
        expect(browser.getTitle()).toEqual("cybertek-bnb");
        browser.getTitle().then((t)=>{
            console.log(t);
        });
        
    });

    it('should check Sign in text on the Home Page', () => {
    expect(HomePage.homePageLogo.getText()).toEqual(Data.HomePageLogo.Text);        
    expect(HomePage.homePageLogo.getCssValue("color")).toEqual(Data.HomePageLogo.Color);
    
    });

    it('should verify Login functionality with invalid credentials', () => {
        HomePage.homePageEmailLoginBar.sendKeys(Data.invalidUser.email);
        HomePage.homePagePasswordBar.sendKeys(Data.invalidUser.password);
        HomePage.homePageSignInButton.click();
        expect(HomePage.homePageLogo.getText()).toEqual(Data.HomePageLogo.Text);

    });

    it('should verify "Git Hub" icon is forwarding to Git Hub website when clicked', () => {
        
        HomePage.homePageGitHubLink.click();
        let gitWindow="";
        browser.driver.getAllWindowHandles().then((h)=>{
            browserWindows=h;
            gitWindow=h[1];
        });
        
        browser.driver.switchTo().window(gitWindow).then(()=>{
            browser.waitForAngularEnabled(false);
            expect(browser.getTitle()).toEqual(Data.gitHubTitle.text);
        });
        
    });

    it('should Verify Question Circle "?" icon is enabled', () => {
        expect(HomePage.homePageQuestionLink.isEnabled()).toBe(true);
    });

    it('should Verify "Git Hub" icon color changes if we hover over', () => {
        HomePage.homePageGitHubLink.getCssValue("color").then(function(colorValue){
        console.log("first color value: "+colorValue);        
    
         browser.actions().mouseMove(HomePage.gitHubIcon).perform();

         HomePage.homePageGitHubLink.getCssValue("color").then(function(colorValue2){
        console.log("color value after hover over: "+colorValue2);

        expect(colorValue).not.toEqual(colorValue2);
         });
      });
    });

    it('should Verify "Git Hub" icon is visible', () => {
        expect(HomePage.gitHubIcon.isDisplayed()).toBe(true);
        expect(HomePage.gitHubIcon.isPresent()).toBe(true);
    });

    it('should verify "Question" icon swithced to Mailto window when clicked', () => {
        let questionWindow="";
        browser.close().then(()=>{
            browser.switchTo().window( browserWindows[0]);
        });    
        HomePage.homePageQuestionLink.click();
        browser.driver.getAllWindowHandles().then((h)=>{
            browserWindows=h;
            questionWindow=h[1];
        });
        
        browser.driver.switchTo().window(questionWindow).then(()=>{
            browser.waitForAngularEnabled(false);
            browser.getCurrentUrl().then((u)=>{
                console.log(u);
            });
            // expect(browser.getTitle()).toEqual(Data.gitHubTitle.text);
        });
        
    });

   //test1
});
