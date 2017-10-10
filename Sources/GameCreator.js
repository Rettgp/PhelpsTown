function randomString(length, chars)
{
    var result = '';
    for (var i = length; i > 0; --i)
    {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
}

App.controller('game_controller', ['$scope', '$firebaseArray', '$firebaseObject',
    function ($scope, $firebaseArray, $firebaseObject)
    {
        $scope.name = $.jStorage.get("username");
        $scope.game_code;
        $scope.min_players = 5;
        $scope.num_players = 0;

        $scope.Connect = function ()
        {
            FirebaseStore.ReadValue($scope.game_code + "/GameMaster", $firebaseObject, function
                    (game_master)
            {
                if ($scope.name == game_master)
                {
                    MainView.router.loadPage('GamePage.html');
                }
                else
                {
                    var players_url = $scope.game_code + "/Players";
                    $scope.FindClass(players_url, $scope.name, $firebaseArray);
                }
            });
        }

        $scope.ExistingGamePrompt = function (e)
        {
            fw7.prompt('Enter the game code', 'Connect To Game',
                function (value)
                {
                    $scope.name = $("#username").val();
                    $scope.game_code = value;
                    $scope.Connect();
                },
                function (value)
                {
                    // Cancel chosen
                }
            );
        }

        $scope.CreateGame = function (e)
        {
            fw7.prompt('Enter the number of players excluding you. (Max of 15)', 'Create Game',
                function (value)
                {
                    if ( value < $scope.min_players || isNaN(value) )
                    {
                        fw7.alert("A minimum of 5 players is required", "Create a game");
                        return;
                    }
                    $scope.num_players = value;
                    $scope.game_code = randomString(5,
                        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                    var game_master = randomString(10,
                        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                    var entry = {};

                    var username;
                    entry = {
                        MafiaChat: {
                            "-AAAAAAA": {
                                from: "PhelpsTown",
                                body: "Welcome to Phelps Town"
                            }
                        }, Night: false, Timer: 0,
                        GameMaster: game_master
                    }
                    FirebaseStore.Write(entry, $scope.game_code);
                    $scope.name = game_master
                    $.jStorage.set("username", game_master);
                    $.jStorage.set("class", "Game Master");
                    $.jStorage.set("game_code", $scope.game_code);
                    $.jStorage.deleteKey("faction");

                    $scope.GenerateClasses($scope.game_code);
                    MainView.router.loadPage('GamePage.html');
                },
                function (value)
                {
                    // Cancel chosen
                }
            );
        };

        $scope.GenerateClasses = function (game_code)
        {
            var godfather_entry = { "Godfather": { Name: "-", Metadata: "-", Results: "-" } };
            var mafioso_entry = { "Mafioso": { Name: "-", Metadata: "-", Results: "-" } };
            var sheriff_entry = { "Sheriff": { Name: "-", Metadata: "-", Results: "-" } };
            var mayor_entry = { "Mayor": { Name: "-", Metadata: "-", Results: "-" } };
            FirebaseStore.Write(godfather_entry, game_code + "/Players");
            FirebaseStore.Write(mafioso_entry, game_code + "/Players");
            FirebaseStore.Write(sheriff_entry, game_code + "/Players");
            FirebaseStore.Write(mayor_entry, game_code + "/Players");
            var total_classes = Object.keys(ClassProperties);
            console.log(total_classes);

            // Remove the preassigned classes
            total_classes.splice(total_classes.indexOf("Godfather"), 1);
            total_classes.splice(total_classes.indexOf("Mafioso"), 1);
            total_classes.splice(total_classes.indexOf("Sheriff"), 1);
            total_classes.splice(total_classes.indexOf("Mayor"), 1);

            $scope.num_players -= 4;

            // \todo Balance out the number of Town and Mafia classes??
            while ( $scope.num_players > 0 && total_classes.length > 0 )
            {
                console.log(total_classes);
                var index = Math.floor(Math.random() * total_classes.length);
                console.log(total_classes[index]);

                var entry = {};
                entry[total_classes[index]] = { Name: "-", Metadata: "-", Results: "-" };
                FirebaseStore.Write(entry, game_code + "/Players");
                total_classes.splice(index, 1);
                $scope.num_players--;
            }
        }

        $scope.FindClass = function(url, username, context)
        {
            FirebaseStore.ReadAsArray(url, context, function (members)
            {
                for (var i = 0; i < members.length; ++i)
                {
                    console.log(members[i].Name);
                    if (members[i].Name == username && ($.jStorage.get("username") == username))
                    {
                        $.jStorage.set("username", username);
                        $.jStorage.set("class", members[i].$id);
                        $.jStorage.set("faction", "TODO");
                        MainView.router.loadPage('GamePage.html');
                        return;
                    }
                }

                var found = false;
                var arr = members;
                while (!found)
                {
                    if (arr.length == 0)
                    {
                        fw7.alert("No open spots in this game", "PhelpsTown");
                        return false;
                    }
                    var randomnumber =
                        Math.round(Math.random() * (arr.length - 1));
                    if (arr[randomnumber].Name == "-")
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

                MainView.router.loadPage('GamePage.html');
            });
        }
    }
]);
