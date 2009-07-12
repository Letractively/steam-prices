// ==UserScript==
// @name           Steam price comparison
// @namespace      http://code.google.com/p/steam-prices/
// @description    Displays prices from all regions in the Steam webshop
// @include        http://store.steampowered.com/app/*
// @include        https://store.steampowered.com/app/*
// @include        http://store.steampowered.com/sub/*
// @include        https://store.steampowered.com/sub/*
// ==/UserScript==

/* 
 * Configuration
 * If you want to modify the parameters of the script, 
 * please make your changes here.
 */

//If set to true, UK prices will be displayed (in addition to US and EU prices)
var showUkPrice = true;

/*
 * If set to true, the script will display prices from all three of Valve's
 * price regions, or "tiers". If false, the script will show only your 
 * country's prices. More details on the tiers can be found here:
 * http://steamunpowered.eu/page.php?id=139
 * For games where prices are equal in all regions, the script will display 
 * only one value no matter what this setting is configured to.
 */
var showTieredEuPrices = true;

//These parameters contain one country code from each of the three tiers.
var tier1cc = "se";
var tier2cc = "no";
var tier3cc = "lt";

//Change this parameter to add VAT to the US price displayed.
//E.g. if set to 19, the script will increase US prices by 19%.
var usVat = 0;

/* 
 * End of configuration area
 * Don't make changes below this line unless you know what you're doing.
 */
 
 

var urlGamePattern = new RegExp(/^https?:\/\/store.steampowered.com\/app\/\d+\/?$/i);
var urlPackagePattern = new RegExp(/^https?:\/\/store.steampowered.com\/sub\/\d+\/?$/i);
var usHttp;
var ukHttp;
var eu1Http;
var eu2Http;
var eu3Http;
var pricenodes = new Array();
var originalprices = new Array();
var ukscript;
var euscript;
var someNode;
var tier1text = "Albania, Andorra, Austria, Belgium, Denmark, Finland, France, Germany, Ireland, Liechtenstein, Luxembourg, Macedonia, Netherlands, Sweden, Switzerland";
var tier2text = "Bosnia and Herzegovina, Bulgaria, Croatia, Cyprus, Czech Republic, Greece, Hungary, Italy, Malta, Monaco, Montenegro, Norway, Poland, Portugal, Romania, San Marino, Serbia, Slovakia, Slovenia, Spain, Vatican City";
var tier3text = "Estonia, Latvia, Lithuania";

//Test the URL to see if we're on a game page
if (urlGamePattern.test(document.documentURI) || 
      urlPackagePattern.test(document.documentURI)) {
  someNode = document.getElementById("all");

  //For security reasons, JavaScript code isn't allowed to fetch data from
  //external websites. Instead, we insert a HTML <script> tag that fetches
  //external javascript files. These will help with currency conversion.
  if (showUkPrice) {
    ukscript = document.createElement("script");
    ukscript.setAttribute("type", "text/javascript");
    ukscript.setAttribute("src", 
        "http://javascriptexchangerate.appspot.com/?from=USD&to=GBP");
    document.body.insertBefore(ukscript, someNode);
  }
          
  euscript = document.createElement("script");
  euscript.setAttribute("type", "text/javascript");
  euscript.setAttribute("src", 
      "http://javascriptexchangerate.appspot.com/?from=USD&to=EUR");
  document.body.insertBefore(euscript, someNode);

  //Test to see if the game has a price
  divnodes = document.getElementsByTagName("div");
  for (i=0; i<divnodes.length; i++) {
    if (divnodes[i].getAttribute("class") == "game_area_purchase_price") {
      pricenodes.push(divnodes[i]);
      if (!showTieredEuPrices)
        originalprices.push(divnodes[i].innerHTML);
      divnodes[i].innerHTML += 
          "<br/><span style='color: rgb(136, 136, 136);'>Computing...</span>"
      divnodes[i].style.textAlign = "left";
    }
  }
  
  //If the current page contains a price, start downloading regional versions of this page
  if (pricenodes.length > 0) {
    usHttp = new XMLHttpRequest();
    usHttp.onreadystatechange=stateChanged;
    usHttp.open("GET",document.documentURI+"?cc=us",true);
    usHttp.send(null);
  
    if (showUkPrice) {
      ukHttp = new XMLHttpRequest();
      ukHttp.onreadystatechange=stateChanged;
      ukHttp.open("GET",document.documentURI+"?cc=uk",true);
      ukHttp.send(null);
    }
  
    if (showTieredEuPrices) {
      eu1Http = new XMLHttpRequest();
      eu1Http.onreadystatechange=stateChanged;
      eu1Http.open("GET",document.documentURI+"?cc="+tier1cc,true);
      eu1Http.send(null);
      eu2Http = new XMLHttpRequest();
      eu2Http.onreadystatechange=stateChanged;
      eu2Http.open("GET",document.documentURI+"?cc="+tier2cc,true);
      eu2Http.send(null);
      eu3Http = new XMLHttpRequest();
      eu3Http.onreadystatechange=stateChanged;
      eu3Http.open("GET",document.documentURI+"?cc="+tier3cc,true);
      eu3Http.send(null);
    }
  }
}

//Extracts prices from the downloaded HTML and displays them
function stateChanged() {
  //Check to see of all scripts have completed
  if (usHttp.readyState != 4) return;
  if (showUkPrice && ukHttp.readyState != 4) return;
  if (showTieredEuPrices && (eu1Http.readyState != 4 || 
      eu2Http.readyState != 4 || eu3Http.readyState != 4)) return;

  //All requests completed, good to go
  
  //The pattern variables can't be reused for some reason, so just duplucate
  var pricepattern0 = new RegExp(/<div class="game_area_purchase_price">(.+?)<\/div>/gi);
  var pricepattern1 = new RegExp(/<div class="game_area_purchase_price">(.+?)<\/div>/gi);
  var pricepattern2 = new RegExp(/<div class="game_area_purchase_price">(.+?)<\/div>/gi);
  var pricepattern3 = new RegExp(/<div class="game_area_purchase_price">(.+?)<\/div>/gi);
  var pricepattern4 = new RegExp(/<div class="game_area_purchase_price">(.+?)<\/div>/gi);
  var pricepattern5 = new RegExp(/<div class="game_area_purchase_price">(.+?)<\/div>/gi);
  var priceHtml = new Array(5);
  var mypriceHtml;
  var usvaluepattern = new RegExp(/&#36;([\d\.]+)$/i);
  var ukvaluepattern = new RegExp(/&#163;([\d\.]+)$/i);
  var euvaluepattern = new RegExp(/([\d,-]+)&#8364;$/i);
  var price = new Array(3);
  var myprice;
    
  var calcscript = "function getDifference(currency, usdPrice, localPrice) {\n" +
      "  var usdConverted; var lessmore; var diff;\n" +
      "  if (currency == 'GBP') {usdConverted = USDtoGBP(usdPrice);}\n" +
      "  else if (currency == 'EUR') {usdConverted = USDtoEUR(usdPrice);}\n" +
      "  diff = Math.abs((localPrice/usdConverted)*100-100);\n" +
      "  if (localPrice >= usdConverted) {lessmore = 'higher';}\n" +
      "  else {lessmore = 'lower';}\n" +
      "  return ' (' + Math.round(diff) + '% ' + lessmore + ')';}\n";
  
  var calculatescript = document.createElement("script");
  calculatescript.setAttribute("type", "text/javascript");
  calculatescript.innerHTML = calcscript;
  document.body.insertBefore(calculatescript, someNode);
    
  for (i=0; i<pricenodes.length; i++) {
    if (!showTieredEuPrices) {
      try {
        var myvaluepattern = new RegExp(/([\d,-]+).$/i);
        mypriceHtml = originalprices[i];
        myprice = parseFloat(myvaluepattern.exec(originalprices[i])[1].replace(",", ".").replace("--", "00"));
      }
      catch(err) {
        mypriceHtml = "N/A";
        myprice = null;
      }
    }

    //Search for the price information in the downloaded HTML documents
    try {
      priceHtml[0] = pricepattern1.exec(usHttp.responseText)[1];
      price[0] = parseFloat(usvaluepattern.exec(priceHtml[0])[1]);
      if (usVat > 0) {
        price[0] = price[0] * (1 + (usVat / 100));
        priceHtml[0] = "$" + price[0].toFixed(2);
      }
    }
    catch(err) {
      priceHtml[0] = "N/A";
      price[0] = null;
    }
    pricenodes[i].innerHTML = "US: " + priceHtml[0];
    if (usVat > 0)
      pricenodes[i].innerHTML += " (inc. VAT)"; 
    
    if (showUkPrice) {
      try {
        priceHtml[1] = pricepattern2.exec(ukHttp.responseText)[1];
        price[1] = parseFloat(ukvaluepattern.exec(priceHtml[1])[1]);
      }
      catch(err) {
        priceHtml[1] = "N/A";
        price[1] = null;
      }
      pricenodes[i].innerHTML += "<br>UK: " + priceHtml[1] 
          + " <span id='gbp" + i + "'></span>"
      
      createGetDifferenceScript("gbp" + i, "GBP", price[0], price[1]);
    }
    if (showTieredEuPrices) {
      try {priceHtml[2] = pricepattern3.exec(eu1Http.responseText)[1];}
      catch(err) {priceHtml[2] = "N/A";}
      try {priceHtml[3] = pricepattern4.exec(eu2Http.responseText)[1];}
      catch(err) {priceHtml[3] = "N/A";}
      try {priceHtml[4] = pricepattern5.exec(eu3Http.responseText)[1];}
      catch(err) {priceHtml[4] = "N/A";}
      
      var t;
      for (t = 2; t < 5; t++) {
        try {price[t] = parseFloat(euvaluepattern.exec(
            priceHtml[t])[1].replace(",", ".").replace("--", "00"));}
        catch(err) {price[t] = null;}
      }
      
      if ((price[2] == price[3]) && (price[3] == price[4])) {
        pricenodes[i].innerHTML += "<br>EU: " + priceHtml[2] 
            + " <span id='eur1_" + i + "'></span>";
      } else {
        pricenodes[i].innerHTML += "<br><span title='" + tier1text
            + "'>EU tier 1: " + priceHtml[2] 
            + " <span id='eur1_" + i + "'></span></span>";
        pricenodes[i].innerHTML += "<br><span title='" + tier2text
            + "'>EU tier 2: " + priceHtml[3] 
            + " <span id='eur2_" + i + "'></span></span>";
        pricenodes[i].innerHTML += "<br><span title='" + tier3text
            + "'>EU tier 3: " + priceHtml[4] 
            + " <span id='eur3_" + i + "'></span></span>";
      }
      createGetDifferenceScript("eur1_" + i, "EUR", price[0], price[2]);
      createGetDifferenceScript("eur2_" + i, "EUR", price[0], price[3]);
      createGetDifferenceScript("eur3_" + i, "EUR", price[0], price[4]);
    } else {
      pricenodes[i].innerHTML += "<br>You: " + mypriceHtml 
            + " <span id='myprice" + i + "'></span>";
      createGetDifferenceScript("myprice" + i, "EUR", price[0], myprice);
    }
  }
  
  //Remove cookie that may store the wrong currency for this region
  document.cookie = "fakeCC=; expires=Fri, 27 Jul 2001 02:47:11 UTC; path=/";
}

function createGetDifferenceScript(elementid, currencystring, price1, price2) {
  if (price1 && price2) {
    var getdiff = document.createElement("script");
    getdiff.setAttribute("type", "text/javascript");
    getdiff.innerHTML = "document.getElementById('" + elementid +
        "').innerHTML = getDifference('" + currencystring + "', " + price1 + 
        ", " + price2 + ");";
    document.body.insertBefore(getdiff, someNode);
  }
}