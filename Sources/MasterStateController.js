"use strict";

function SelectedMember()
{
    return $('#members input:radio:checked').parent().attr('id')
}

// CLIENT TIMER FUNCTIONS
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

App.controller('master_state_controller', ['$scope', '$rootScope', '$firebaseArray', '$firebaseObject',
    function ($scope, $rootScope, $firebaseArray, $firebaseObject)
    {
        $scope.game_master = false;
        $scope.game = $.jStorage.get("game_code");
        $scope.username = $.jStorage.get("username");
        $scope.class = $.jStorage.get("class");
        $scope.has_action = false;
        $scope.action = "null"
        $scope.offset = 0;
        $scope.timer_running = false;
        $scope.timeout = 0;
        $scope.ends_at = 0;

        $rootScope.$on("Connected", function (args) 
        {
            console.log("Refresh MasterController");
            $scope.game_master = false;
            $scope.game = $.jStorage.get("game_code");
            $scope.username = $.jStorage.get("username");
            $scope.class = $.jStorage.get("class");

            if ( !$scope.game )
            {
                return;
            }
            FirebaseStore.ReadValue($scope.game + "/GameMaster", $firebaseObject, function (game_master)
            {
                console.log("Games master: " + game_master);
                if ($scope.username == game_master)
                {
                    $scope.game_master = true;
                }
            });
        });

        $scope.CountDown = function()
        {
            SetTime(Math.max(0, $scope.ends_at - Date.now()));
        }

        FirebaseStore.ReadValue($scope.game + "/GameMaster", $firebaseObject, function (game_master)
        {
            if ($scope.username == game_master)
            {
                $scope.game_master = true;
            }
        });

        $scope.ResetPlayers = function()
        {
            FirebaseStore.ReadAsArray( $scope.game + "/Players", $firebaseArray, function (players)
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
            if ($scope.timer_running)
            {
                $("#nightButton").text("Start Night");
                FirebaseStore.StopTimer($scope.game);
            }
            else
            {
                $("#nightButton").text("Stop Night");
                FirebaseStore.StartTimer($scope.game, $scope.offset);
            }
        }
        $scope.Reveal = function (e)
        {
            FirebaseStore.ReadAsArray( $scope.game + "/Players", $firebaseArray, function (players)
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
            if ( $scope.timer_running != night )
            {
                if ( night )
                {
                    $("#nightButton").text("Stop Night");
                    if ( $scope.has_action )
                    {
                        $("#members input:radio").attr("disabled", false);
                    }
                    /*if ( $scope.class = "Veteran" )
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
                        var end_point = $scope.game + "/Players/" + selected_member + "/Metadata";
                        var entry = { Effect: $scope.action, Source: $scope.username };
                        FirebaseStore.Push( entry, end_point );
                    }
                }
            }
            $scope.timer_running = night;
        }

        FirebaseStore.RegisterWatcher($scope.game + "/Night", $firebaseObject, $scope.OnToggleNight);
        FirebaseStore.RegisterTimer($scope.game,
            function (snap_offset)
            {
                $scope.offset = snap_offset.val() || 0;
            },
            function (snap_running)
            {
                var b = !!snap_running.val();
                if (b)
                {
                    $scope.CountDown();
                    $scope.timeout = setInterval($scope.CountDown, 1000);
                }
                else
                {
                    $scope.timeout && clearTimeout($scope.timeout);
                    $scope.timeout = null;
                }
            },
            function (snap_end_time)
            {
                $scope.ends_at = snap_end_time.val() || 0;
                $scope.CountDown();
            }
        );

    }
]);
