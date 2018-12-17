let Base=function(){
    this.homeUrl='https://cybertek-reservation-qa.herokuapp.com/sign-in';
    this.navigateToHome=()=>{
        browser.get(this.homeUrl);
    }
}

module.exports=new Base();