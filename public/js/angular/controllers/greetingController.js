angular.module('Checklist').controller('greetingController',
    function($scope, _, testService) {
        $scope.sendName = function() {
            if($scope.verifiedBy) {
                testService.iam($scope.verifiedBy).then(
                    function(data) {
                        window.location.replace("/");
                    },
                    function(data) {
                        console.error("error saving test");
                    }
                );
            }
        }

         var names = [ 
            'Stone Cold Steve Austin', 
            'The Undertaker', 
            'The Heartbreak Kid Shawn Michaels',
            'Macho Man Randy Savage', 
            'Bret "The Hitman" Hart',
            'Owen Hart',
            'Yokozuna',
            'Kurt Angle',
            'Paul Heyman',
            'Rob Van Dam',
            'William Regal',
            'Rey Mysterio Jr.',
            'Ted DiBiase "The Million Dollar Man"',
            'Mankind',
            'Catcus Jack',
            'The Road Dogg',
            'Billy Gunn',
            '"The American Dream" Dusty Rhodes',
            'Eddie Guerrero',
            'Razor Ramon',
            'Matt Hardy',
            'Jeff Hardy',
            'Road Warrior Hawk',
            'Road Warrior Animal',
            'Jay Leathal',
            'Adam Cole',
            'Brian Cage',
            'Terry Funk',
            'Big Van Vader',
            'Mr. Perfect',
            'Daniel Bryan', 
            'Cesaro', 
            'Seth Rollins', 
            'Dean Ambrose', 
            'Rusev', 
            'The New Day', 
            'Bo Dallas',
            'Brock Lesnar',
            'Chris Jericho',
            'Dolph Ziggler',
            'Goldust',
            'John Cena',
            'Mark Henry',
            'Edge',
            'Christian',
            'Neville',
            'Triple H',
            'Ric Flair',
            'Arn Anderson',
            'Tully Blanchard',
            'Ole Anderson',
            'Ricky "The Dragon" Steamboat',
            'Kevin Owens', 
            'Sami Zayn', 
            'AJ Styles', 
            'Finn Balor', 
            'Dwayne "The Rock" Johnson',
            'Ricochet',
            'Pentagon Jr.',
            'Rambo', 
            'Kenny Omega', 
            'The Young Bucks', 
            'Shinsuke Nakamura', 
            'Kazuchika Okada', 
            'Hiroshi Tanahashi', 
            'Tomohiro Ishii', 
            'Asuka', 
            'Sasha Banks',
            'Bayley',
            'Charlotte Flair',
            'Beckey Lynch',
            'Alexa Bliss',
        ]
         $scope.placeholder = _.sample(names);
});