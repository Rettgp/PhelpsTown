"use strict"

function randomString(length, chars)
{
    var result = '';
    for (var i = length; i > 0; --i)
    {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
}


function CheckForVisitors( player, action )
{
    if ( player.Metadata != "-" )
    {
        for ( var data in player.Metadata )
        {
            if ( player.Metadata.hasOwnProperty( data ) )
            {
                if ( player.Metadata[data].Effect == action )
                {
                    return player.Name;
                }
            }
        }
    }

    return "";
}

function RemovePlayerVisits( player_name, players )
{
    for ( var i = 0; i < players.length; ++i )
    {
        if ( players[i].Metadata != "-" )
        {
            for ( var data in players[i].Metadata )
            {
                if ( players[i].Metadata.hasOwnProperty( data ) )
                {
                    if ( players[i].Metadata[data].Source == player_name )
                    {
                        players[i].Metadata[data] = "-";
                    }
                }
            }
        }
    }

    return players;
}

function ApplyMetadata( players, player_names, data )
{
    var key = randomString(
        10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

    for ( var i = 0; i < players.length; ++i )
    {
        var player = players[i];
        if ( player_names.indexOf( player.Name ) != -1 )
        {
            if ( player.Metadata == "-" )
            {
                player.Metadata = data;
            }
            else
            {
                player.Metadata[key] = data;
            }
        }
    }

    return players;
}

//==========================================================================================
function ResolveDistracts( players )
{
    var resolved_players = players;
    for ( var i = 0; i < players.length; ++i )
    {
        if ( players[i].$id == "Veteran" )
        {
            continue;
        }
        var visitor = CheckForVisitors( players[i], "distract" ); 
        if ( visitor != "" )
        {
            resolved_players[i].Results += " Distracted-";
            resolved_players = RemovePlayerVisits( players[i].Name, resolved_players );
        }
    }

    return resolved_players;
}

//==========================================================================================
function ResolveAlerts( players )
{
    var resolved_players = players;
    for ( var i = 0; i < players.length; ++i )
    {
        var player = players[i];
        if ( player.$id == "Veteran" && player.Metadata != "-" )
        {
            var players_to_kill = [];
            var on_alert = false;

            for ( var data in player.Metadata )
            {
                if ( player.Metadata.hasOwnProperty( data ) )
                {
                    var effect = player.Metadata[data].Effect;
                    if ( effect == "alert")
                    {
                        on_alert = true;
                        player.Metadata[data] = "-";
                    }
                }
            }

            if ( !on_alert )
            {
                return resolved_players;
            }

            for ( var data in player.Metadata )
            {
                if ( player.Metadata.hasOwnProperty( data ) )
                {
                    var visitor_name = player.Metadata[data].Source;
                    players_to_kill.push( visitor_name );
                    player.Metadata[data] = "-";
                }
            }
            player.Results += "Attempted to Kill intruder: " + players_to_kill;
            var entry = { Effect: "kill", Source: player.Name };
            resolved_players = ApplyMetadata( resolved_players, players_to_kill, entry ); 
        }
    }

    return resolved_players;
}

//==========================================================================================
function ResolveMetadata( players )
{       
    var resolved_players = ResolveDistracts( players ); 
    resolved_players = ResolveAlerts( resolved_players );

    console.log("Final resolution: " + JSON.stringify(resolved_players));
    return resolved_players;
}
