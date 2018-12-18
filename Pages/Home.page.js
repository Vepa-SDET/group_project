require('../Utilities/CustomLocators.js');
let HomePage=function(){
    this.homePageLogo=$(".title");
    this.homePageEmailLoginBar=$("[placeholder='email']");
    this.homePagePasswordBar=$("[placeholder='password']");
    this.homePageSignInButton=$("button[type='submit']");
    this.homePageGitHubLink=$("[class='fa fa-github']");
    this.homePageQuestionLink=$("[class='fa fa-question-circle']");

    this.HomePageuserName=$('[name="email"]');
    this.HomePagepassword=$('[name="password"]');
    this.HomePagesignInButton=element(by.css('.button.is-dark'));
    this.HomePagecontentText=element(by.css('.content.has-text-centered'));

    //resul
    // this.gitHubIcon=$(".fa.fa-github");
    this.questionCircle = $(".fa.fa-question-circle");
    this.password=$("input[name='password']");




}
module.exports=new HomePage();