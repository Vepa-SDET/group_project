var MapPage = function(){
    this.mapPageLogo=$(".title");
    this.mapPageMapImage = $('.map>img');
    this.mapPageMapNameElement = $('.subtitle');
    this.mapPageMeruLink=$("[id='room-124']");
    this.mapPageCyberTekBNBLogo=$(".intro-img");
    this.mapPagebyBugbusters7Logo=$(".content.has-text-centered"); 
    this.mapLoby=$("#lobby-va-dark-side");
    this.mapStudyArea=$("#study_area-121");
    this.map4stayArea=$("#four_stay-121")
}

module.exports = new MapPage();