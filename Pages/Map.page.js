var MapPage = function(){
    this.mapPageLogo=$(".title");
    this.mapPageMapImage = $('.map>img');
    this.mapPageMapNameElement = $('.subtitle');
    this.mapPageMeruLink=$("[id='room-124']");
    this.mapPageCyberTekBNBLogo=$(".intro-img");
    this.mapPagebyBugbusters7Logo=$(".content.has-text-centered");
    this.mapPageScheduleDropDown=element(by.xpath("//a[text()='schedule']"));
    this.mapPageScheduleGeneralOption=element(by.xpath("//a[text()='general']"));
    this.mapPageMyDropDown=$$("[class='navbar-link']").get(1);
    this.mapPageMySelfOption=element(by.xpath("//a[text()='self']"));
    this.mapPageMyTeamOption=element(by.xpath("//a[text()='team']"));
    this.mapPagebyBugbusters7Logo=$(".content.has-text-centered"); 
    this.mapLoby=$("#lobby-va-dark-side");
    this.mapStudyArea=$("#study_area-121");
    this.map4stayArea=$("#four_stay-121");
    this.mapTopMenu=$(".navbar-menu.is-transparent");
    this.mapMapText=$(".navbar-end>a:nth-child(1)");
    this.mapScheduleLink=element(by.linkText('schedule'));

    this.halfDome=$("a#room-122");
    this.drenali=$("a#room-123");
    this.meru=$("a#room-123");

    this.huntLink=element(by.linkText('hunt'));
    this.scheduleLinkMy=$("div.navbar-menu.is-transparent > div > div:nth-child(2) > div > a:nth-child(1)");
    this.scheduleLinkGeneral=element(by.linkText('general'));
    this.myLink=$('div.navbar-menu.is-transparent > div > div:nth-child(4) > a');
    this.myLinkSelf=element(by.linkText('self'));
    this.myLinkTeam=element(by.linkText('team'));
    this.myLinkSignout=element(by.linkText('sign out'));




    
  
}

module.exports = new MapPage();