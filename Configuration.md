## Introduction ##
The script can be configured by editing the file in a plain text editor like Notepad.

## showUkPrice ##
| ![http://i219.photobucket.com/albums/cc285/jmoviedb/default.jpg](http://i219.photobucket.com/albums/cc285/jmoviedb/default.jpg) | ![http://i219.photobucket.com/albums/cc285/jmoviedb/no_uk.jpg](http://i219.photobucket.com/albums/cc285/jmoviedb/no_uk.jpg) |
|:--------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------|
| showUkPrice = _true_ (default)                                                                                                  | showUkPrice = _false_                                                                                                       |
If set to _true_, UK prices will be displayed. If _false_, they will not. If you have low bandwidth or a high latency internet connection, changing this setting to _false_ may increase performance, as less data will have to be fetched.

## showTieredEuPrices ##
| ![http://i219.photobucket.com/albums/cc285/jmoviedb/default.jpg](http://i219.photobucket.com/albums/cc285/jmoviedb/default.jpg) | ![http://i219.photobucket.com/albums/cc285/jmoviedb/no_tiers.jpg](http://i219.photobucket.com/albums/cc285/jmoviedb/no_tiers.jpg) |
|:--------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------|
| showTieredEuPrices = _true_ (default)                                                                                           | showTieredEuPrices = _false_                                                                                                      |
If set to _true_, the script will display prices from Valve's two price regions, or "tiers". If _false_, the script will show only your country's prices. More details on the tiers can be found at [steamunpowered.eu](http://steamunpowered.eu/european-tiers/). For games where prices are equal in both tiers, the script will display only one value no matter what this setting is configured to.

If you have low bandwidth or a high latency internet connection, changing this setting to _false_ may increase performance, as less data will have to be fetched. If you find that the script does not display the correct prices for your country or region, changing this setting to _false_ should fix that.

Note: If set to _false_, the script will assume that you are located in Europe, and that Steam displays prices in euro by default. If you live in a country where Steam does not use euro as a currency, you should keep this setting at _true_ (the default setting).

The settings tier1cc and tier2cc contain country codes for regions representative of each of the two price zones. These can be changed in case Valve decides to change the zones.

## usVat ##
When set to a value higher than zero, VAT will be added to the US price. E.g. if set to _19_, the script will increase US prices by 19%. _0_ is the default setting and means no VAT.