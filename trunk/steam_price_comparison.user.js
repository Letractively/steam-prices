// ==UserScript==
// @name           Steam price comparison
// @namespace      http://code.google.com/p/steam-prices/
// @description    Displays prices from all regions in the Steam webshop
// @include        http://store.steampowered.com/app/*
// @include        https://store.steampowered.com/app/*
// @include        http://store.steampowered.com/sub/*
// @include        https://store.steampowered.com/sub/*
// ==/UserScript==

var urlGamePattern = new RegExp(/^https?:\/\/store.steampowered.com\/app\/\d+\/?$/i);
var urlPackagePattern = new RegExp(/^https?:\/\/store.steampowered.com\/sub\/\d+\/?$/i);
var usHttp;
var ukHttp;
var euHttp;
var pricenodes = new Array();

//Test the URL to see if we're on a game page
if(urlGamePattern.test(document.documentURI) || urlPackagePattern.test(document.documentURI)) {
  //alert(document.documentURI);

  //Test to see if the game has a price
  divnodes = document.getElementsByTagName("div");
  for (i=0; i<divnodes.length; i++) {
    if (divnodes[i].getAttribute("class") == "game_area_purchase_price") {
      pricenodes.push(divnodes[i]);
    }
  }
  
  //If the current page contains a price, start downloading regional versions of this page
  if (pricenodes.length > 0) {
    usHttp = new XMLHttpRequest();
    usHttp.onreadystatechange=stateChanged;
    usHttp.open("GET",document.documentURI+"?cc=us",true);
    usHttp.send(null);
  
    ukHttp = new XMLHttpRequest();
    ukHttp.onreadystatechange=stateChanged;
    ukHttp.open("GET",document.documentURI+"?cc=uk",true);
    ukHttp.send(null);
  
    euHttp = new XMLHttpRequest();
    euHttp.onreadystatechange=stateChanged;
    euHttp.open("GET",document.documentURI+"?cc=no",true);
    euHttp.send(null);
  }
}

//Extracts prices from the downloaded HTML and displays them
function stateChanged() {
  if (usHttp.readyState==4 && ukHttp.readyState==4 && euHttp.readyState==4) {
    var uspricepattern = new RegExp(/<div class="game_area_purchase_price">(.+?)<\/div>/gi);
    var ukpricepattern = new RegExp(/<div class="game_area_purchase_price">(.+?)<\/div>/gi);
    var eupricepattern = new RegExp(/<div class="game_area_purchase_price">(.+?)<\/div>/gi);
    var price = new Array(3);
    
    for (i=0; i<pricenodes.length; i++) {
      try {price[0] = uspricepattern.exec(usHttp.responseText)[1];}
      catch(err) {price[0] = "N/A";}
      try {price[1] = ukpricepattern.exec(ukHttp.responseText)[1];}
      catch(err) {price[1] = "N/A";}
      try {price[2] = eupricepattern.exec(euHttp.responseText)[1];}
      catch(err) {price[2] = "N/A";}
            
      pricenodes[i].innerHTML = 
          "US: "     + price[0] + 
          "<br>UK: " + price[1] + 
          "<br>EU: " + price[2];
    }
  }
}
