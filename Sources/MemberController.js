"use strict";

function ShuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

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