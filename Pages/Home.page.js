require('../Utilities/CustomLocators.js');
let HomePage=function(){
    this.homePageLogo=$(".title");
    this.homePageEmailLoginBar=$("[placeholder='email']");
    this.homePagePasswordBar=$("[placeholder='password']");
    this.homePageSignInButton=$("button[type='submit']");
    this.homePageGitHubLink=$("[class='fa fa-github']");
    this.homePageQuestionLink=$("[class='fa fa-question-circle']");

<<<<<<< HEAD
=======

   
    

>>>>>>> 5c904872f8ee5edee462a6803d04169bfd8f60a2
    // Kadriye
    this.HomePageLogo=$(".title");
    this.email=element(by.name("email"));
    this.password=element(by.name("password"));
    this.signinButton=$(".button.is-dark");

<<<<<<< HEAD

    //resul
    this.password=$("input[name='password']");
=======
    
    //
    this.email=element(by.name("email"));
    this.passwordPlaceHolder=element(by.name("password"));
    this.signButton=element(by.css(".control>button"));
>>>>>>> 5c904872f8ee5edee462a6803d04169bfd8f60a2

}
module.exports=new HomePage();