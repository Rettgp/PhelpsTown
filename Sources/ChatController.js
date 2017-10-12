"use strict";

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