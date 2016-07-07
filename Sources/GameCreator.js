var myApp = angular.module("PhelpsTown", ["firebase"]);
var m_data_store = new DataStore("");
var username;
var m_game_code;
var m_num_players = 8;
var m_class_properties = new Object();

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
	var json_string = xml2json( parseXml( xmlText ), "" );
	m_class_properties = JSON.parse( json_string ).properties;
  }
};

xhr.open("GET", "class.properties");
xhr.send();

function randomString(length, chars)
{
    var result = '';
    for (var i = length; i > 0; --i)
    {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
}

myApp.controller('game_controller', ['$scope', '$firebaseArray', '$firebaseObject',
    function ($scope, $firebaseArray, $firebaseObject)
    {
        $scope.name = $.jStorage.get("username");

        $scope.Connect = function (e)
        {
            if (e.keyCode === 13 && $scope.game_code)
            {
                m_game_code = $scope.game_code;
                m_data_store.ReadValue(
					m_game_code + "/GameMaster", $firebaseObject, function (game_master)
                {
                    if ($scope.name == game_master)
                    {
                        $.jStorage.set("username", game_master);
                        $.jStorage.set("class", "Game Master");
                        $.jStorage.deleteKey("faction");
                        window.location.href =
                            "http://localhost:5000/Game.html?game_code=" + m_game_code;
                       // window.location.href =
                       //     "https://phelpstown.firebaseapp.com/Game.html?game_code=" +
                       //     m_game_code;
                    }
                });
                var players_url = m_game_code + "/Players";

                FindClass(players_url, $scope.name, $firebaseArray);
            }
        }

        $scope.ConnectFromClick = function (e)
        {
            m_game_code = $scope.game_code;
            m_data_store.ReadValue(m_game_code + "/GameMaster", $firebaseObject, function
                    (game_master)
            {
                if ($scope.name == game_master)
                {
                    $.jStorage.set("username", game_master);
                    $.jStorage.set("class", "Game Master");
                    $.jStorage.deleteKey("faction");
                    window.location.href =
                        "http://localhost:5000/Game.html?game_code=" + m_game_code;
                   // window.location.href =
                   //     "https://phelpstown.firebaseapp.com/Game.html?game_code=" +
                   //     m_game_code;
                }
            });
            var players_url = m_game_code + "/Players";

            FindClass(players_url, $scope.name, $firebaseArray);
        }

        $scope.CreateGame = function (e)
        {
            m_game_code = randomString(5,
                    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
            var game_master = randomString(10,
                    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
            var entry = {};

            var username;
            entry = {  MafiaChat: { "-AAAAAAA": { from: "PhelpsTown",
                body: "Welcome to Phelps Town" } }, Night: false, Timer: 0,
                GameMaster: game_master }
            m_data_store.Write(entry, m_game_code);
            $.jStorage.set("username", game_master);
            $.jStorage.set("class", "Game Master");
            $.jStorage.deleteKey("faction");
            
            GenerateClasses( m_game_code );
            window.location.href =
                "http://localhost:5000/Game.html?game_code=" + m_game_code;
           // window.location.href =
           //     "https://phelpstown.firebaseapp.com/Game.html?game_code=" +
           //     m_game_code;
        };
    }
]);

function GenerateClasses( game_code )
{
    var godfather_entry = { "Godfather" : 
		{ Name: "-", Status: "Alive", Metadata: "-", Results: "-" } };
    var mafioso_entry = { "Mafioso" : 
		{ Name: "-", Status: "Alive", Metadata: "-", Results: "-" } };
    var sheriff_entry = { "Sheriff" : 
		{ Name: "-", Status: "Alive", Metadata: "-", Results: "-" } };
    var mayor_entry = { "Mayor" : 
		{ Name: "-", Status: "Alive", Metadata: "-", Results: "-" } };
    m_data_store.Write( godfather_entry, game_code + "/Players" );
    m_data_store.Write( mafioso_entry, game_code + "/Players" );
    m_data_store.Write( sheriff_entry, game_code + "/Players" );
    m_data_store.Write( mayor_entry, game_code + "/Players" );
    var total_classes = Object.keys( m_class_properties ); 

    // Remove the preassigned classes
    total_classes.splice( total_classes.indexOf( "Godfather" ), 1 );
    total_classes.splice( total_classes.indexOf( "Mafioso" ), 1 );
    total_classes.splice( total_classes.indexOf( "Sheriff" ), 1 );
    total_classes.splice( total_classes.indexOf( "Mayor" ), 1 );

    m_num_players -= 4;

    // \todo Balance out the number of Town and Mafia classes
    for ( var i = 0; i < m_num_players; ++i ) 
    {
        var index = Math.floor( Math.random() * total_classes.length );

        var entry = {};
        entry[total_classes[index]] = 
			{ Name: "-", Status: "Alive", Metadata: "-", Results: "-" };
        m_data_store.Write( entry, game_code + "/Players" );
        total_classes.splice( index, 1 );
    }
}

function FindClass(url, username, context)
{
    m_data_store.ReadAsArray(url, context, function (members)
    {
        for (var i = 0; i < members.length; ++i)
        {
            console.log(members[i].Name);
            if ( members[i].Name == username && ($.jStorage.get("username") == username) )
            {
                $.jStorage.set("username", username);
                $.jStorage.set("class", members[i].$id);
                $.jStorage.set("faction", "TODO");

                window.location.href =
                    "http://localhost:5000/Game.html?game_code=" + m_game_code;
               // window.location.href =
               //     "https://phelpstown.firebaseapp.com/Game.html?game_code=" +
               //     m_game_code;
            }
        }

        var found = false;
        var arr = members;
        while (!found)
        {
            if (arr.length == 0)
            {
                alert("No open spots in this game");
                return false;
            }
            var randomnumber =
                Math.round(Math.random() * (arr.length - 1));
            if (arr[randomnumber].Name == "-" )
            {
                members[randomnumber].Name = username;
                members.$save(randomnumber);
                found = true;
                $.jStorage.set("username", username);
                $.jStorage.set("class", members[randomnumber].$id);
                $.jStorage.set("faction", "TODO");
                break;
            }
            arr.splice(randomnumber, 1);
        }
        window.location.href =
            "http://localhost:5000/Game.html?game_code=" + m_game_code;
       // window.location.href =
       //     "https://phelpstown.firebaseapp.com/Game.html?game_code=" +
       //     m_game_code;
    });
}

