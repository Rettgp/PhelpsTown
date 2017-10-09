"use strict";
	
var m_game = $.jStorage.get("game_code");
var m_username = $.jStorage.get("username");
var m_class = $.jStorage.get("class");
var m_faction = $.jStorage.get("faction");
var m_isMafia = true ? m_faction == "mafia" : false;
var m_isTown = true ? m_faction == "town" : false;
var m_offset = 0;
var m_timer_running = false;
var m_timeout = 0;
var m_ends_at = 0;
var m_has_action = false;
var m_action = "null"

function Notify( message )
{
    $.notify( 
        { message: message }, 
        { 
            type: "info", 
            placement: { from: "bottom", align: "center" },
            allow_dismiss: true,
            animate: {
                enter: 'animated fadeInDown', exit: 'animated fadeOutUp'
            }
        }
    );
}

function parseURLParams(url)
{
    var queryStart = url.indexOf("?") + 1,
            queryEnd = url.indexOf("#") + 1 || url.length + 1,
            query = url.slice(queryStart, queryEnd - 1),
            pairs = query.replace(/\+/g, " ").split("&"),
            parms = {}, i, n, v, nv;

    if (query === url || query === "")
    {
        return;
    }

    for (i = 0; i < pairs.length; i++)
    {
        nv = pairs[i].split("=");
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n))
        {
            parms[n] = [];
        }

        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

// CLIENT TIMER FUNCTIONS
function CountDown()
{
    SetTime(Math.max(0, m_ends_at - Now()));
}

function SetTime(remaining)
{
    var date = new Date(remaining);
    var m = date.getMinutes();
    var s = date.getSeconds();
    $('.night-timer').text(lpad(m) + ':' + lpad(s));
}

function lpad(n)
{
    if (n < 10)
    {
        return '0' + n;
    }
    else
    {
        return n;
    }
}

function SelectedMember()
{
    return $('#members input:radio:checked').parent().attr('id')
}

function SetupClass()
{
    if ( m_class == "Game Master" || m_class == null )
    {
        return;
    }
    if ( ClassProperties[m_class]["action"] == "null" )
    {
        $("#members input:radio").attr("disabled", true);
        m_has_action = false;
    }
    else
    {
        m_has_action = true;
    }
    m_action = ClassProperties[m_class]["action"];
}

function ShuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

App.controller('class_controller', ['$scope', '$firebaseArray', '$firebaseObject',
    function ($scope, $firebaseArray, $firebaseObject)
    {   
        xhr.onreadystatechange = function ()
        {
            if (xhr.readyState == 4 && xhr.status == 200) 
            {
                for ( var class_type in ClassProperties )
                {
                    if ( ClassProperties.hasOwnProperty( class_type ) &&
                            (class_type == m_class) )
                    {
                        $scope.class = class_type;
                        $scope.description =
                                ClassProperties[class_type]["description"];
                        var attr_obj = ClassProperties[class_type]["attributes"];
                        if ( Array.isArray( attr_obj["attr"] ) )
                        {
                            $scope.attributes = attr_obj["attr"];
                        }
                        else
                        {
                            $scope.attributes = attr_obj;
                        }
                        SetupClass();
                        return;
                    }
                }
            }
        };

        xhr.open("GET", "class.properties");
        xhr.send();
    }
]);

App.controller('member_controller', ['$scope', '$firebaseArray', '$firebaseObject',
    function ($scope, $firebaseArray, $firebaseObject)
    {
        // Notify of a new player joining or potential metadata changes
        $scope.OnPlayersUpdated = function ( update_child )
        {
            $scope.members[$scope.members.indexOf(update_child.key)] = update_child;
        }
        // Notify of changes to current player
        $scope.OnPlayerUpdated = function ( player_node )
        {
            if ( player_node.key == "Results" )
            {
                Notify( player_node.val() );
            }
        }

        FirebaseStore.ReadAsArray(m_game + "/Players", $firebaseArray, function (players)
        {
            players = ShuffleArray( players );
            $scope.members = players;           
            $("#members input:radio").attr("disabled", true);
            $("#members input:radio").attr("checked", false);

            // Start listening for changes only after we have initialized to prevent
            // collisions and ngrepeat dupes
            FirebaseStore.ListenForChanges( m_game + "/Players", $scope.OnPlayersUpdated );
            FirebaseStore.ListenForChanges( m_game + "/Players/" + m_class, $scope.OnPlayerUpdated );
        });

        $scope.isMafia = m_isMafia;
        $scope.isTown = m_isTown;
	}
]);

App.controller('chat_controller', ['$scope', '$firebaseArray', '$firebaseObject',
    function ($scope, $firebaseArray, $firebaseObject)
    {		
        FirebaseStore.ReadAsArray(m_game + "/MafiaChat", $firebaseArray, function (messages)
        {
            $scope.messages = messages;
            $(".panel-body").scrollTop(document.getElementById("chat-body").scrollHeight);
        });

        $scope.addMessage = function (e)
        {
            if (e.keyCode === 13 && $scope.msg)
            {
                var name = m_username || 'anonymous';
                $scope.messages.$add({
                    from: name,
                    body: $scope.msg
                });

                $scope.msg = "";
                $(".panel-body").scrollTop(document.getElementById("chat-body").scrollHeight);
            }
        }

        $scope.addMessageFromClick = function (e)
        {
            var name = m_username || 'anonymous';
            $scope.messages.$add({
                from: name,
                body: $scope.msg
            });

            $scope.msg = "";
            $(".panel-body").scrollTop(document.getElementById("chat-body").scrollHeight);
        }
    }
]);
App.controller('master_state_controller', ['$scope', '$firebaseArray', '$firebaseObject',
    function ($scope, $firebaseArray, $firebaseObject)
    {
        $scope.game_master = false;

        FirebaseStore.ReadValue(m_game + "/GameMaster", $firebaseObject, function (game_master)
        {
            if (m_username == game_master)
            {
                $scope.game_master = true;
            }
        });

        $scope.ResetPlayers = function()
        {
            FirebaseStore.ReadAsArray( m_game + "/Players", $firebaseArray, function (players)
            {
                for ( var i = 0; i < players.length; ++i )
                {
                    players[i].Results = "So it Begins...";
                    players.$save( i );
                }
            });
        }

        $scope.ToggleNight = function (e)
        {
            if (m_timer_running)
            {
                $("#nightButton").text("Start Night");
                FirebaseStore.StopTimer(m_game);
            }
            else
            {
                $("#nightButton").text("Stop Night");
                FirebaseStore.StartTimer(m_game);
            }
        }
        $scope.Reveal = function (e)
        {
            FirebaseStore.ReadAsArray( m_game + "/Players", $firebaseArray, function (players)
            {
                players = ResolveMetadata( players );
                for ( var i = 0; i < players.length; ++i )
                {
                    players.$save( i );
                }
            });
        }
        $scope.OnToggleNight = function ( night )
        {
            if ( m_timer_running != night )
            {
                if ( night )
                {
                    $("#nightButton").text("Stop Night");
                    if ( m_has_action )
                    {
                        $("#members input:radio").attr("disabled", false);
                    }
                    /*if ( m_class = "Veteran" )
                    {
                        $("#members input:radio").attr("disabled", true);
                        $("#Veteran input:radio").attr("disabled", false);
                    }*/
                    console.log("Night has started");
                    $scope.ResetPlayers();
                }
                else
                {
                    var selected_member = SelectedMember();
                    $("#nightButton").text("Start Night");
                    console.log("Night has ended");
                    console.log("You chose: " + selected_member);
                    $("#members input:radio").attr("disabled", true);
                    $("#members input:radio").attr("checked", false);

                    if ( !$scope.game_master && selected_member != null )
                    {
                        var end_point = m_game + "/Players/" + selected_member + "/Metadata";
                        var entry = { Effect: m_action, Source: m_username };
                        FirebaseStore.Push( entry, end_point );
                    }
                }
            }
            m_timer_running = night;
        }

        FirebaseStore.RegisterWatcher(m_game + "/Night", $firebaseObject, $scope.OnToggleNight);
    }
]);

//CLIENT TIMER FUNCTIONS
FirebaseStore.RegisterTimer(m_game,
	function (snap_offset)
	{
		m_offset = snap_offset.val() || 0;
	},
	function (snap_running)
	{
		var b = !!snap_running.val();
		if (b)
		{
			CountDown();
			m_timeout = setInterval(CountDown, 1000);
		}
		else
		{
			m_timeout && clearTimeout(m_timeout);
			m_timeout = null;
		}
	},
	function (snap_end_time)
	{
		m_ends_at = snap_end_time.val() || 0;
		CountDown();
	}
);
