var App = angular.module("PhelpsTown", ["firebase"]);
// Initialize app
var fw7 = new Framework7();

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var MainView = fw7.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

var ClassProperties = new Object();
var xhr;
if (window.XMLHttpRequest)
{
    xhr = new XMLHttpRequest();
}
else if (window.ActiveXObject)
{
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
}
xhr.onreadystatechange = function ()
{
    if (xhr.readyState == 4 && xhr.status == 200) 
    {
        var xmlText = xhr.responseText;
        var json_string = xml2json(parseXml(xmlText), "");
        ClassProperties = JSON.parse(json_string).properties;
    }
};

xhr.open("GET", "class.properties");
xhr.send();