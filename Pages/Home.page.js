require('../Utilities/CustomLocators.js');
let HomePage=function(){
    this.homePageLogo=$(".title");
    this.homePageEmailLoginBar=$("[placeholder='email']");
    this.homePagePasswordBar=$("[placeholder='password']");
    this.homePageSignInButton=$("button[type='submit']");
    this.homePageGitHubLink=$("[class='fa fa-github']");
    this.homePageQuestionLink=$("[class='fa fa-question-circle']");
    //resul
    // this.gitHubIcon=$(".fa.fa-github");
    this.questionCircle = $(".fa.fa-question-circle");
    this.password=$("input[name='password']");


    // Kadriye
    this.HomePageLogo=$(".title");
    this.email=element(by.name("email"));
    this.password=element(by.name("password"));
    this.signinButton=$(".button.is-dark");
    



}
module.exports=new HomePage();