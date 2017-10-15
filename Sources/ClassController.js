"use strict";
	
App.controller('class_controller', ['$scope', '$rootScope', '$firebaseArray', '$firebaseObject',
    function ($scope, $rootScope, $firebaseArray, $firebaseObject)
    {   
        $scope.game = $.jStorage.get("game_code");
        $scope.username = $.jStorage.get("username");
        $scope.class = $.jStorage.get("class");
        $scope.faction = $.jStorage.get("faction");
        $scope.isMafia = true ? $scope.faction == "mafia" : false;
        $scope.isTown = true ? $scope.faction == "town" : false;
        $scope.has_action = false;
        $scope.action = "null"

        $rootScope.$on("Connected", function (args) 
        {
            console.log("Refresh ClassController");
            $scope.game = $.jStorage.get("game_code");
            $scope.username = $.jStorage.get("username");
            $scope.class = $.jStorage.get("class");
            $scope.faction = $.jStorage.get("faction");
            $scope.isMafia = true ? $scope.faction == "mafia" : false;
            $scope.isTown = true ? $scope.faction == "town" : false;
            $scope.SetupClass();
        });

        $scope.SetupClass = function()
        {
            for ( var class_type in ClassProperties )
            {
                if ( ClassProperties.hasOwnProperty( class_type ) &&
                        (class_type == $scope.class) )
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

                    if ( $scope.class == "Game Master" || $scope.class == null )
                    {
                        return;
                    }
                    if ( ClassProperties[$scope.class]["action"] == "null" )
                    {
                        $("#members input:radio").attr("disabled", true);
                        $scope.has_action = false;
                    }
                    else
                    {
                        $scope.has_action = true;
                    }
                    $scope.action = ClassProperties[$scope.class]["action"];

                    return;
                }
            }
        }

        $scope.SetupClass();
    }
]);


