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
}

module.exports = new MapPage();