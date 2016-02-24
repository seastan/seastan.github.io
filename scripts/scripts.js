"use strict";
angular.module("yapp", ["ui.router", "ngAnimate",'ngStorage','firebase'])



.config(["$stateProvider", "$urlRouterProvider", function(r, t) {
    t.when("/deck", "/deck/builder"),
	t.otherwise("/deck/builder"),
	r.state("base", {
        "abstract": !0,
        url: "",
        templateUrl: "views/base.html"
    }).state("login", {
        url: "/login",
        parent: "base",
        templateUrl: "views/login.html",
        controller: "LoginCtrl"
    }).state("signup", {
        url: "/signup",
        parent: "base",
        templateUrl: "views/signup.html",
        controller: "SignupCtrl"
    }).state("dashboard", {
        url: "/deck",
        parent: "base",
        templateUrl: "views/dashboard.html",
        controller: "DashboardCtrl"
    }).state("builder", {
        url: "/builder",
        parent: "dashboard",
        templateUrl: "views/dashboard/builder.html"
    }).state("mydecks", {
        url: "/mydecks",
        parent: "dashboard",
        templateUrl: "views/dashboard/mydecks.html"
    }).state("mylogs", {
        url: "/mylogs",
        parent: "dashboard",
        templateUrl: "views/dashboard/mylogs.html"
    }).state("sets", {
        url: "/sets",
        parent: "dashboard",
        templateUrl: "views/dashboard/sets.html"
    }).state("community", {
        url: "/community",
        parent: "dashboard",
        templateUrl: "views/dashboard/community.html"
    }).state("deckview", {
        url: "/id:deckID",
	parent: "dashboard",
        templateUrl: "views/dashboard/deckview.html",
	controller: 'deckViewCtrl'
    }).state("userview", {
        url: "/user:username",
	parent: "dashboard",
        templateUrl: "views/dashboard/userview.html",
	controller: 'userViewCtrl'
    }).state("help", {
        url: "/help",
	parent: "dashboard",
        templateUrl: "views/dashboard/help.html",
    })
}])
.controller("LoginCtrl", ["$scope", "$location",'$rootScope', '$firebaseAuth', '$firebaseArray',  function($scope, $location, $rootScope, $firebaseAuth, $firebaseArray) {
    // var ref = new Firebase('https://seastan-lotrdb.firebaseio.com/');
    // $rootScope.auth = $firebaseAuth(ref);
    $scope.message='';

    // Log in
     $scope.submit = function() {
	console.log("Attempting to sign in as "+$scope.liEmail);
	$rootScope.ref.authWithPassword({
	    email    : $scope.liEmail,
	    password : $scope.liPassword
	}, function(error, authData) {
	    if (error) {
		console.log("Login Failed!", error);
		$scope.message = 'Login failed';
	    } else {
		console.log("Authenticated successfully with payload:", authData);
	 	$scope.message = '';
		$scope.$apply(function() {
		    $location.path("/deck");
		});
	    }
	    $scope.$digest();
	});
    }
    // Guest
    $scope.logInGuest = function() {
	console.log('Welcome guest');
	return $location.path("/deck"), !1
    }

}])
.controller("SignupCtrl", ["$scope", "$location",'$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject',  function($scope, $location, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject) {
    $scope.message='';

    // Sign up
    $scope.submit = function() {
	console.log("Attempting to sign in as "+$scope.suEmail);
	if (!$scope.suName) {
	    $scope.message='Invalid username.'
	    return;
	}
	if ($scope.suName.toLowerCase()=='guest') {
            $scope.message='Invalid username.'
            return;
        }
	if (!$scope.suEmail) {
	    $scope.message='Invalid email.'
	    return;
	}
	if (!$scope.suPassword) {
	    $scope.message='Invalid password.'
	    return;
	}
	var userObject = $firebaseObject($rootScope.ref.child('users'));
	userObject.$loaded().then(function(){
	    var userNameTaken=false;
	    angular.forEach(userObject, function(value, key){
		var userID = key;
		var userName = value.username;
		if (userName) {
	    	    if (userName.toLowerCase() == $scope.suName.toLowerCase()) {
	    		userNameTaken=true;
	    	    }
		}
	    });
	    if (userNameTaken) {
	    	console.log("Username is taken");
	    	$scope.message='Username is taken.';
		return;
	    }
	    $rootScope.ref.createUser({
		email    : $scope.suEmail,
		password : $scope.suPassword
	    }, function(error, userData) {
		if (error) {
		    console.log("Error creating user:", error);
		    $scope.message = 'Error creating user.';
		} else {
		    console.log("Successfully created user account with uid:", userData.uid);
		    userObject[userData.uid]={
			"username":$scope.suName,
			"email":$scope.suEmail
		    };
		    userObject.$save().then(function() {
			$scope.logIn();
		    });
		}
		$scope.$digest();
	    });
	});
    }
    // Log in
    $scope.logIn = function() {
	$rootScope.ref.authWithPassword({
	    email    : $scope.suEmail,
	    password : $scope.suPassword
	}, function(error, authData) {
	    if (error) {
		console.log("Login Failed!", error);
		$scope.message = 'Login failed';
	    } else {
		console.log("Authenticated successfully with payload:", authData);
	 	$scope.message = '';
		$scope.$apply(function() {
		    $location.path("/deck");
		});
	    }
	    $scope.$digest();
	});
    }

    // Guest
    $scope.logInGuest = function() {
	console.log('Welcome guest');
	return $location.path("/deck"), !1
    }

}])

.controller("DashboardCtrl", ["$scope","$rootScope","$state","$location","$firebase","$firebaseArray","$firebaseObject","$firebaseAuth",function($scope,$rootScope,$state,$location,$firebase,$firebaseArray,$firebaseObject,$firebaseAuth) {
    $scope.$state = $state;

    // Log out
    $scope.logOut = function() {
	console.log("Logging out");
	$rootScope.auth.$unauth();
	$scope.displayName = 'Guest';
	return $location.path("/login");
    }
    $scope.logIn = function() {
	console.log("Logging in");
	return $location.path("/login");
    }

    
}])

.controller("authCtrl", ["$scope","$rootScope","$state","$location","$firebase","$firebaseArray","$firebaseObject","$firebaseAuth",function($scope,$rootScope,$state,$location,$firebase,$firebaseArray,$firebaseObject,$firebaseAuth) {
    $rootScope.displayName = 'Guest';
    $rootScope.ref = new Firebase('https://seastan-lotrdb.firebaseio.com/');    
    //$rootScope.users = $firebaseObject($rootScope.ref.child('users'));
    //$rootScope.userdecks = $firebaseObject($rootScope.ref.child('decks'));
    //$rootScope.userlogs  = $firebaseObject($rootScope.ref.child('logs'));
    $rootScope.user = {};
    
    $rootScope.auth = $firebaseAuth($rootScope.ref);    
    $rootScope.auth.$onAuth(function(authData) {
	$rootScope.authData = authData;
    	if (authData) {
//    	    console.log("Logged in as: "+authData.uid);
	    var user = $firebaseObject($rootScope.ref.child('users').child(authData.uid));
	    user.$loaded().then(function() {
		if (!user) {
		    console.log("Could not find user!");
		    return;
		}
		
		$rootScope.displayName = user.username;
		$rootScope.user = user;
		//			$rootScope.userdecks = user.decks;
		//			$rootScope.userlogs = user.logs;
		
	    });
	}
    	else
	    $rootScope.displayName = 'Guest';
	    $rootScope.user = {};
//    	    console.log("Logged out.");
    });
}])


// Directives
.directive('traits', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/traitchoice.html'
    };
})
.directive('questchoice', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/questchoice.html'
    };
})
.directive('header', function() {
    return {
	restrict: 'E',
	templateUrl: 'views/deck.html',
	controller: 'init'
    };
})
.directive('cards', function() {
    return {
	restrict: 'E',
	templateUrl: 'views/dashboard/builder.html',
	controller: 'cardControl',
	controllerAs: 'cards'
    };
})
.directive('imageonload',function() {
    return {
	restrict: 'A',
	link: function(scope, element, attrs) {
            element.bind('load', function() {
		scope.$apply(function(){
		    scope.preview.image.loaded=true;
		});
            });
	}
    };
})


//Services
.service('previewService',[function(){
    var tab='img';
    return tab;
}])
// Filters
.filter('cardfilter', function(){
    return function (input, scope) {
	var output=[];
	for (var i in input){
            if ((scope.filtersettings.pack.indexOf(input[i].exp)>=0)
		&& (scope.filtersettings.type[input[i].type])
		&& (scope.filtersettings.spheres[input[i].sphere]))
            {output.push(input[i]);}
	}
	return output;
    };
})
// Factories
.factory('generateDeckID',function() {
	var generateDeckID = function() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for( var i=0; i < 10; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	};
	return generateDeckID;
})

.factory('getDeckString',['getCardID','getQuantityOfCardInLocalObject', function(getCardID,getQuantityOfCardInLocalObject) {
	var getDeckString = function(deck) {
		var decklist = []; // List of cardID+quantity
		var types = ["1hero","2ally","3attachment","4event","5quest"]
	    for (var t in types){
			var type = types[t];
			for (var c in deck[type]){
				var card = deck[type][c];
				decklist.push(getCardID(card)+getQuantityOfCardInLocalObject(card,deck));
			}
	    }
	    decklist.sort();
	    return decklist.join("");
	}
	return getDeckString;
}])
.factory('getLocalObjectFromString',['getCardFromCardID','cardObject', function(getCardFromCardID,getCardObject) {
    var getLocalObject = function(deckString) {
	var localObject = {
            "1hero": [],
            "2ally": [],
            "3attachment": [],
            "4event": [],
            "5quest": []
	}
	for (var i=0; i<=(deckString.length-4); i=i+4) {
	    var cardID = deckString.substr(i,3);
	    var card = getCardFromCardID(cardID);
	    card.quantity = +deckString.substr(i+3,1);
	    localObject[card.type].push(card);
	}

	localObject.countAllies = function(){
      	    var allies=0;
      	    for (var a in localObject['2ally']) {
      		allies+=localObject['2ally'][a].quantity;
      	    };
      	    return allies;
	};
	localObject.countAttachments = function(){
      	    var attachments=0;
      	    for (var a in localObject['3attachment']) {
      		attachments+=localObject['3attachment'][a].quantity;
      	    };
      	    return attachments;
	};
	localObject.countEvents = function(){
      	    var events=0;
      	    for (var e in localObject['4event']) {
      		events+=localObject['4event'][e].quantity;
      	    };
      	    return events;
	};
	localObject.countQuests = function(){
      	    var quests=0;
      	    for (var q in localObject['5quest']) {
      		quests+=localObject['5quest'][q].quantity;
      	    };
      	    return quests;
	};
	localObject.countHeroes = function(){
      	    var heroes=0;
      	    for (var h in localObject['1hero']) {
      		heroes+=localObject['1hero'][h].quantity;
      	    };
      	    return heroes;
	};
	localObject.countTotal = function() {
	    return localObject.countAllies()+localObject.countAttachments()+localObject.countEvents()+localObject.countQuests();
	};
	localObject.startingThreat = function(){
	    var threat = 0;
	    var mirlonde = 0;
	    var loreheroes = 0;
	    for(var h in localObject['1hero']){
		threat += localObject['1hero'][h].cost;
		if(localObject['1hero'][h].name_norm=="Mirlonde")
		    mirlonde = 1;
		if(localObject['1hero'][h].sphere=="4lore")
		    loreheroes++;
	    }
	    if(mirlonde) threat-=loreheroes;
	    return threat;
	};
	return localObject;
    }
    return getLocalObject;
}])
.factory('getCardFromCardID',['cardObject','getCardID', function(cardObject,getCardID) {
	var card = function(cardID) {
		cardID = cardID.substr(0,3); // In case quatity was also passed as the 4th character in cardID
        for (var c in cardObject) {
            if (getCardID(cardObject[c]) == cardID) {
                var foundCard = cardObject.slice(+c, +c + 1)[0]; //create a copy of the card, not changing the cardObject
				return foundCard;
            }
            
        }
		return {};
	}
	return card;
}])
.factory('getHeroesFromDeckString',['getCardFromCardID', function(getCardFromCardID) {
	var heroes = function(deckString) {
	    var herolist = [];
	    if (!deckString) return herolist;
	    for (var i=0; i<=(deckString.length-4); i=i+4) {
		var cardID = deckString.substr(i,3);
		var card = getCardFromCardID(cardID);
		if (card.type == '1hero') herolist.push(card);
	    }
	    return herolist;
	}
    return heroes;
}])
.factory('getCardID',['getSetID', function(getSetID) {
	var getCardID = function(card) {
	    return getSetID(card.exp)+('0'+card.no.toString(16)).substr(-2);
	}
	return getCardID; 
}])
.factory('getQuantityOfCardInLocalObject',function() {
	var quantity = function(card,localDeck) {
		for (var c in localDeck[card.type]){
			if (localDeck[card.type][c].cycle==card.cycle && localDeck[card.type][c].no==card.no){
				return localDeck[card.type][c].quantity;
			}
		}
	}
	return quantity;
})

.factory('getSetID',function(){
	var getSetID = function(set) { 
	    if (set=='core') return 'A';
	    else if (set=='thfg'||set=='catc'||set=='ajtr'||set=='thoem'||set=='tdm'||set=='rtm') return 'B';
	    else if (set=='kd') return 'C';
	    else if (set=='trg'||set=='rtr'||set=='twitw'||set=='tld'||set=='fos'||set=='saf') return 'D';
	    else if (set=='hon') return 'E';
	    else if (set=='tsf'||set=='tdf'||set=='eaad'||set=='aoo'||set=='tbog'||set=='tmv') return 'F';
	    else if (set=='voi') return 'G';
	    else if (set=='tdt'||set=='ttt'||set=='tit'||set=='nie'||set=='cs'||set=='tac') return 'H';
	    else if (set=='tlr') return 'I';
	    else if (set=='twoe'||set=='efmg'||set=='ate'||set=='ttor'||set=='tbocd'||set=='tdr') return 'J';
	    else if (set=='tgh') return 'K';
	    else if (set=='fots'||set=='ttitd'||set=='totd'||set=='tdr') return 'K';

	    else if (set=='thohauh') return 'a';	    
	    else if (set=='thotd') return 'b';
	    else if (set=='tbr') return 'c';
	    else if (set=='rd') return 'd';    
	    else if (set=='tos') return 'e';    
	    else if (set=='tlos') return 'f';    
	    else if (set=='tfotw') return 'g';
    
	    else {
			console.log(set+' notfound.');
			return '_';
			}
	}
	return getSetID;
})
.factory('translate',function(){
    var translate={};
    translate[""]="";
    translate.core="Core Set";
    translate.kd=unescape("Khazad-D%FBm");
    translate.hon=unescape("Heirs of N%FAmenor");
    translate.voi="The Voice of Isengard";
    translate.tlr="The Lost Realm";
    translate.thohauh="Over Hill and Under Hill";
    translate.thfg="The Hunt for Gollum";
    translate.trg="The Redhorn Gate";
    translate.tsf="The Steward's Fear";
    translate.tdt="The Dunland Trap";
    translate.twoe="The Wastes of Eriador";
    translate.thotd="On the Doorstep";
    translate.catc="Conflict at the Carrock";
    translate.rtr="Road to Rivendell";
    translate.tdf=unescape("The Dr%FAadan Forest");
    translate.ttt="The Three Trials";
    translate.efmg="Escape from Mount Gram";
    translate.tbr="The Black Riders";
    translate.ajtr="A Journey to Rhosgobel";
    translate.twitw="The Watcher in the Water";
    translate.eaad=unescape("Encounter at Amon D%EEn");
    translate.tit="Trouble in Tharbad";
    translate.rd="The Road Darkens";
    translate.thoem="The Hills of Emyn Muil";
    translate.tld="The Long Dark";
    translate.aoo="Assault on Osgiliath";
    translate.nie="The Nin-in-Eilph";
    translate.tdm="The Dead Marshes";
    translate.fos="Foundations of Stone";
    translate.tbog="The Blood of Gondor";
    translate.cs="Celebrimbor's Secret";
    translate.rtm="Return to Mirkwood";
    translate.saf="Shadow and Flame";
    translate.tmv="The Morgul Vale";
    translate.tac="The Antlered Crown";
    translate.tos="The Treason of Saruman";
    translate.tlos="The Land of Shadow";
    translate.ate="Across the Ettenmoors";
    translate.ttor="The Treachery of Rhudaur";
    translate.tbocd=unescape("The Battle of Carn D%FBm");
    translate.tdr="The Dread Realm";
	translate.tgh="The Grey Havens";
    return translate;
})
.factory('filtersettings',["$localStorage",function ($localStorage) {
    var filtersettings={};
    filtersettings.onecore = $localStorage.onecore;
    filtersettings.twocore = $localStorage.twocore;
    filtersettings.pack= $localStorage.pack || ["core"];
    filtersettings.type={'1hero': true, '2ally': false, '3attachment': false, '4event': false, '5quest': false};
    filtersettings.spheres={'1leadership': true, '4lore': true, '3spirit': true, '2tactics': true, '5neutral': true, '6baggins':false, '7fellowship':false};
    return filtersettings;
}])
.factory('getData', function($http) {
    var promise;
    var getData = {
	async: function(file) {
            if ( !promise ) {
		// $http returns a promise, which has a then function, which also returns a promise
		promise = $http.get(file).then(function (response) {
		    // The then function here is an opportunity to modify the response
		    //console.log(response);
		    // The return value gets picked up by the then in the controller.
		    return response.data;
		});
            }
            // Return the promise to the controller
            return promise;
	}
    };
    return getData;
})
.factory('cardObject',["getData",function(getData){
    var cardObject = [];
    return cardObject;
}])
.factory('filtersettings',["$localStorage",function ($localStorage) {
    var filtersettings={};
    filtersettings.onecore = $localStorage.onecore;
    filtersettings.twocore = $localStorage.twocore;
    filtersettings.pack= $localStorage.pack || ["core"];
    filtersettings.type={'1hero': true, '2ally': false, '3attachment': false, '4event': false, '5quest': false};
    filtersettings.spheres={'1leadership': true, '4lore': true, '3spirit': true, '2tactics': true, '5neutral': true, '6baggins':false, '7fellowship':false};
    return filtersettings;
}])
.factory('image',function(){
    var image={};
    image.card={};
    image.url="";
    image.name="";
    image.exp="";
    image.text="";
    image.traits="";
    image.flavor="";
    image.loaded=false;
    var cardmarkup = function(text,cardname){
	var rx = new RegExp(cardname, "g");
	text=text.replace(rx,"CARDNAME");
	text=text.replace(/(Orc|Noldor|Archer|Armor|Artifact|Beorning|Boon|Bree|Burglar|Condition|Craftsman|Creature|Dale|Dwarf|D\u00fanedain|Eagle|Ent|Esgaroth|Gondor|Healer|Hobbit|Isengard|Istari|Item|Minstrel|Mount|Noble|Noldor|Outlands|Pipe|Ranger|Ring-bearer(\'s)?|Rohan|Scout|Signal|Silvan|Skill|Song|Spell|Tale|Title|Trait|Trap|Warrior|Weapon|Woodman) /g,
			  "<b><i>$1</i></b> ");
	
	
	text=text.replace(/Valour Response:/g,"<b>Valour Response:</b>");
	text=text.replace(/Response:([^<])/g,"<b>Response:</b>$1");
	text=text.replace(/Forced:/g,"<b>Forced:</b>");
	text=text.replace(/When Revealed:/g,"<b>When Revealed:</b>");
	text=text.replace(/Planning Action:/g,"<b>Planning Action:</b>");
	text=text.replace(/Quest Action:/g,"<b>Quest Action:</b>");
	text=text.replace(/Travel Action:/g,"<b>Travel Action:</b>");
	text=text.replace(/Combat Action:/g,"<b>Combat Action:</b>");
	text=text.replace(/Refresh Action:/g,"<b>Refresh Action:</b>");
	text=text.replace(/Valour Action:/g,"<b>Valour Action:</b>");
	text=text.replace(/Action:([^<])/g,"<b>Action:</b>$1");
	text=text.replace(/([^>])Valour/g,"$1<b>Valour</b>");
	
	text=text.replace(/Attack/g,"<img src='images/strength.gif'/>");
	text=text.replace(/Willpower/g,"<img src='images/willpower.gif'/>");
	text=text.replace(/Defense/g,"<img src='images/defense.gif'/>");
	text=text.replace(/Threat/g,"<img src='images/threat.png'/>");
	
	text=text.replace(/Leadership/g,"<img src='images/spheres/1leadership.png'/>");
	text=text.replace(/Tactics/g,"<img src='images/spheres/2tactics.png'/>");
	text=text.replace(/Spirit/g,"<img src='images/spheres/3spirit.png'/>");
	text=text.replace(/Lore/g,"<img src='images/spheres/4lore.png'/>");
	text=text.replace(/Neutral/g,"<img src='images/spheres/5neutral.png'/>");
	text=text.replace(/Baggins/g,"<img src='images/spheres/6baggins.png'/>");
	text=text.replace(/Fellowship/g,"<img src='images/spheres/7fellowship.png'/>");
	
	text=text.replace(/CARDNAME/g,cardname);
	
	return text;
    }
    
    image.update = function(card){
	if(image.url!=card.img){
            image.loaded = false;
	    image.card = card;
            image.url = card.img;
            image.name = card.name;
            image.exp = card.exp;
            image.text = card.keywords + "\n" + card.text;
            image.traits = card.traits;
            image.flavor = (card.flavor||"").replace(/\`/g,'"');
            image.textc = cardmarkup(card.textc,card.name);
            image.cost = card.cost;
            image.willpower = card.willpower;
            image.strength = card.strength;
            image.defense = card.defense;
            image.hitpoints = card.hitpoints;
            image.unique = card.unique;
            image.sphere = "images/spheres/"+card.sphere+".png";
            image.type = card.type.substr(1,1).toUpperCase() + card.type.substr(2);
	}
    }
    image.getUrl = function(){
	return image.url;
    }
    return image;
})
.factory('suggested', ['filtersettings','cardObject',function(filtersettings,cardObject){
    var suggested={};
    suggested.hidden=0;
    suggested.deck={};
    suggested.deck['1hero']=[];
    suggested.deck['2ally']=[];
    suggested.deck['3attachment']=[];
    suggested.deck['4event']=[];
    suggested.deck['5quest']=[];
    suggested.filtersettings = filtersettings;
    suggested.allcards = cardObject;
    suggested['sphere']=[];
    suggested['1hero']=[];
    suggested['2ally']=[];
    suggested['3attachment']=[];
    suggested['4event']=[];
    suggested['5quest']=[];
    suggested['traits']=['Dwarf','Rohan','Silvan','Noldor','Gondor','Ent','Eagle','Dunedain','Hobbit','Istari','Outlands','Ranger','Scout','Outlands','Ranged','Sentinel','Weapon'];
    suggested.targetsInDeck=[];
    suggested.targetOptionsForDeck=[];
    suggested.traitSpecificTargetsInDeck=[];
    suggested.traitSpecificTargetOptionsForDeck=[];
    suggested.blacklist=[];
    suggested.staples=[
	{name_norm: "A Test of Will", exp: "core"},
	{name_norm: "Hasty Stroke", exp: "core"},
	{name_norm: "Steward of Gondor", exp: "core"},
	{name_norm: "Unexpected Courage", exp: "core"},
	{name_norm: "Daeron's Runes", exp: "fos"},
	{name_norm: "Deep Knowledge", exp: "voi"},
	{name_norm: "Feint", exp: "core"},
	{name_norm: "Foe-hammer", exp: "thohauh"}
    ];

    // This is the main function, it gets called whenever the cards in the deck change and updates the suggestions
    suggested.deckChange = function(deck) {
	suggested.deck=deck;
	// Clear the suggestions
	suggested['1hero']=[];
	suggested['2ally']=[];
	suggested['3attachment']=[];
	suggested['4event']=[];
	suggested['5quest']=[];
	// Set the spheres that the deck has access to
	suggested.setSpheres();
	// Set the list of target options in the deck
	suggested.setTargetsInDeck();
	suggested.setTraitSpecificTargetsInDeck();
	suggested.setTargetOptionsForDeck();
	suggested.setTraitSpecificTargetOptionsForDeck();
	// Loop over all the cards and see if they should be suggested
	var suggestions=[]; // List of cards to suggest
	for(var c in suggested.allcards) {
	    var cardc = suggested.allcards[c];
	    var traitSpecificTargetsInCard = suggested.getTraitSpecificTargetsInCard(cardc);
	    var traitSpecificTargetOptionsForCard = suggested.getTraitSpecificTargetOptionsForCard(cardc);
	    // Suggest card if it's a staple
	    for(var s in suggested.staples) {
		if (cardc.name_norm==suggested.staples[s].name_norm && cardc.exp==suggested.staples[s].exp) {
		    suggestions.push(cardc);
		}
	    }
	    // Suggest cards that have a hero's name in the text
	    for(var h in deck['1hero']) {
	      	var heroname = deck['1hero'][h].name;
	      	if(suggested.isWordInString(heroname+'.',cardc.text) || suggested.isWordInString(heroname+' ',cardc.text) || suggested.isWordInString(heroname+',',cardc.text)) {
	      	    suggestions.push(cardc);
	      	}
	    }
	    // Suggest Trap cards for Damrod
	    if (suggested.isInDeck('Damrod','tlos') && suggested.isWordInString('Trap',cardc.traits)) {
	      	suggestions.push(cardc);
	    }
	    
	    // Suggest heal/hit point cards for Gloin, Treebeard, Gimil
	    if ( (suggested.isInDeck('Gloin','core') || suggested.isInDeck('Gimli','core') || suggested.isInDeck('Treebeard','tos')) && (suggested.isWordInString('heal',cardc.text) || suggested.isWordInString('hit point',cardc.text)) )
	      	suggestions.push(cardc);

	    // Suggest healing cards for Elrond
	    if (suggested.isInDeck('Elrond','saf') && suggested.isWordInString('heal',cardc.text))
	      	suggestions.push(cardc);
	    // Suggest high cost cards for Vilya
	    if (suggested.isInDeck('Vilya','saf') && cardc.cost>=4 && cardc.type!='1hero')
		suggested.add(cardc); // Bypass basic checks

	    // Suggest spirit heroes for Caldara
	    if (suggested.isInDeck('Caldara','tbog') && cardc.sphere=='3spirit' && cardc.type=='1hero')
	      	suggestions.push(cardc);
	    // Suggest tactics heroes for Thoeden
	    if (suggested.isInDeck('Theoden','tmv') && cardc.sphere=='2tactics' && cardc.type=='1hero')
	      	suggestions.push(cardc);

	    // Suggest victory display for Rossiel
	    if (suggested.isInDeck('Rossiel','efmg') && suggested.isWordInString('victory',cardc.text))
	      	suggestions.push(cardc);


	    // Suggest doomed for Grima
	    if (suggested.isInDeck('Grima','voi') || suggested.isInDeck('Grima hero','voi') && (suggested.isWordInString('oomed',cardc.text)||suggested.isWordInString('oomed',cardc.keywords)))
	      	suggestions.push(cardc);
	    // Suggest threat reudction for Boromir, Dunhere, or Hobbit Gandalf
	    if ((suggested.isInDeck('Boromir','tdm') || suggested.isInDeck('Gandalf','thohauh') || suggested.isInDeck('Dunhere','core')) && (/([L|l]ower|[R|r]educe)/.test(cardc.text)) && (/[T|t]hreat/.test(cardc.text)) && !(/[E|e]ncounter/.test(cardc.text)))
		suggestions.push(cardc);
	    
	    // Suggest location cards for Idraen
	    if (suggested.isInDeck('Idraen','ttt') && suggested.isWordInString('explored',cardc.text))
	      	suggestions.push(cardc);
	    if (suggested.isInDeck('Idraen','ttt') && suggested.isWordInString('progress',cardc.text) && suggested.isWordInString('location',cardc.text))
	      	suggestions.push(cardc);
	    
	    // Sugest discard pile cards for Arwen or Erestor
	    if ((suggested.isInDeck('Arwen Undomiel','tdr')||suggested.isInDeck('Erestor','ttor')) && suggested.isWordInString('discard pile',cardc.text) && !suggested.isWordInString('encounter',cardc.text))
	      	suggestions.push(cardc);

	    // Sugest encounter cards for Denethor
	    if (suggested.isInDeck('Denethor','core') && suggested.isWordInString('top',cardc.text) && suggested.isWordInString('encounter deck',cardc.text))
	      	suggestions.push(cardc);

	    // Sugest Tactics Events for Hama
	    if (suggested.isInDeck('Hama','tld') && (cardc.sphere=='2tactics') && (cardc.type=='4event'))
	      	suggestions.push(cardc);
	    
	    // Suggest weapon/armour for Beregond
	    if (suggested.isInDeck('Beregond','hon') && suggested.isWordInString('Weapon',cardc.traits))
	      	suggestions.push(cardc);	    
	    if (suggested.isInDeck('Beregond','hon') && suggested.isWordInString('Armor',cardc.traits))
	      	suggestions.push(cardc);	    
	    
	    // Suggest engage cards
	    if (suggested.isWordInDeck('engage ') && (suggested.isWordInCard('engage ',cardc) || suggested.isWordInCard('into play engaged',cardc)))
	      	suggestions.push(cardc);
	    // Suggest engagement cost cards
	    if (suggested.isWordInDeck('engagement cost') && suggested.isWordInCard('engagement cost ',cardc))
	      	suggestions.push(cardc);

	    // Suggest Dwarf Swarm cards
	    if (suggested.isWordInDeck('Dwarf characters') && suggested.isWordInString('Dwarf characters',cardc.text))
	      	suggestions.push(cardc);

	    // Suggest mono sphere cards
	    if (suggested.monoSphere() && (/[E|e]ach hero you control/.test(cardc.text)) && suggested.isWordInString('icon',cardc.text))
		suggestions.push(cardc);
	    if (suggested.monoSphere() && suggested.isWordInString('from 3 different',cardc.text))
		suggestions.push(cardc);

	    // Suggest all allies of a trait if all the heroes have that trait
	    var monoTrait = suggested.monoTrait();
	    for (var t in monoTrait)
		if (suggested.isWordInString(monoTrait[t],cardc.traits))
		    suggestions.push(cardc);
	    
	    // Suggest secrecy
	    if (suggested.isSecrecy() && (/[S|s]ecrecy/.test(cardc.textc)))
		suggestions.push(cardc);	  

	    
	    // Suggest Weapons for Warriors
	    if (suggested.isTraitInHeroTraits('Warrior') && suggested.isWordInCard('eapon',cardc) && (cardc.type=='3attachment'||cardc.type=='4event'))
	       	suggestions.push(cardc);

	    // Troubleshooting
	    // if (cardc.name_norm=="Ithilien Lookout"){
	    // 	   alert(suggested.startingThreat()+' '+suggested.isSecrecy());
	    // alert(suggested.targetListToString(suggested.targetOptionsForDeck));
	    // alert(suggested.targetListToString(traitSpecificTargetsInCard));
	    //	       }

	    // Suggest cards with similar traits. Example: If Eomund is in deck, suggest all characters with Rohan trait
	    if (suggested.matchInTargetLists(suggested.traitSpecificTargetsInDeck,traitSpecificTargetOptionsForCard))
	      	suggestions.push(cardc);
	    if (suggested.matchInTargetLists(suggested.traitSpecificTargetOptionsForDeck,traitSpecificTargetsInCard))
	      	suggestions.push(cardc);

	}

	// Loop over list of suggested cards
	for(var c in suggestions) {
	    
	    var cardc = suggestions[c];
	    // Only suggest cards that are not already in suggested
	    if(suggested.isCardInList(cardc,suggested[cardc.type])) continue;
	    suggested.check(cardc);
	}	  
    };

    // Check to make sure the card makes sense to suggest
    suggested.check = function(card) {
	// Check if there is a hero with access to the necessary sphere to play the card
	var propersphere=suggested.sphereAccess(card);
	// Check if there is a proper target in the deck that can use the card
	var propertarget=suggested.deckHasTargetOption(card);
	// Cards that have been hand-picked to never be suggested
	var vetolisted=suggested.isCardInVetoList(card.name_norm,card.exp);
	// No not suggest more heroes if there are 3 heroes in the deck
	var threeheroes=(suggested.countDeckHeroes()>=3);
	
	var debug = '';
	if (vetolisted) return;
	if (!propersphere && card.type!='1hero') return; // Hero suggestions are exempt from requiring a sphere match
	if (card.sphere=='6baggins'||card.sphere=='7fellowship') return; // Never suggest cards of these spheres
	if (!propertarget) return;
	if (threeheroes && card.type=='1hero') return;
	suggested.add(card);
    };

    // Final set of check before adding the card. Should not be bypassed.
    suggested.add = function(card) {
	// Check is card is in blacklist
	var blacklisted=suggested.isCardInList(card,suggested.blacklist);
	// Check if there is an ally or hero with the same name already in the deck
	var sameName=suggested.sameName(card);
	// Check if card is in an available pack
	var properexp=0;
	for(var k in filtersettings.pack)
	    if(filtersettings.pack[k]==card.exp) properexp=1;

	if (blacklisted) return;
	if (sameName) return;
	if (!properexp) return;

	suggested[card.type].push(card);
	
    };
    // Define the vetolist here
    suggested.isCardInVetoList = function(name,exp) {
	if (name=='Pippin' && exp=='eaad') return 1;
	else if (name=='The End Comes' && exp=='rtr') return 1;
	return 0;
    };

    // Sets the list of spheres that the deck has access to
    suggested.setSpheres = function() {
	var deck = suggested.deck;
	suggested['sphere']=[];
	for(var c in deck['1hero']) {
	    suggested['sphere'].push(deck['1hero'][c].sphere);
	}
	if(deck['1hero'].length>0) suggested['sphere'].push('5neutral');
	if(suggested.isInDeck('Oin','thotd'))
	    suggested['sphere'].push('2tactics');
	if(suggested.isInDeck('Amarthiul','tbocd'))
	    suggested['sphere'].push('2tactics');
	
    };

    // Returns true if deck has access to given sphere
    suggested.sphereAccess = function(card) {
	var sphere = card.sphere;
	for (var s in suggested['sphere'])
	    if(suggested['sphere'][s]==sphere)
		return 1;
	// Special cases
	if (suggested.isInDeck('Elrond','saf') && card.type=='2ally')
	    return 1;
	if (suggested.isInDeck('Hirluin the Fair','tsf') && card.type=='2ally' && suggested.isWordInString('Outlands',card.traits))
	    return 1;
	return 0;
    };
    
    
    
    // Returns 1 if the deck has an eligible target for the card
    suggested.deckHasTargetOption = function(card) {
	var targetsincard = suggested.getTargetsInCard(card);
	// Just have to macth one of the targets in the card with a targetoption for the deck
	if (targetsincard.length==0) return 1;
	for (var t in targetsincard)
	    if (suggested.isTargetInList(targetsincard[t],suggested.targetOptionsForDeck))
	   	return 1;
	return 0;
    };
    
    // Returns list of target options for the card. If Core Gloin was the card, the returned list would look like:
    // [{trait:'None',type:'hero'},
    //  {trait:'None',type:'character'},
    //  {trait:'Leadership',type:'hero'},
    //  {trait:'Leadership',type:'character'},
    //  {trait:'Dwarf',type:'hero'},
    //  {trait:'Dwarf',type:'character'},
    //  {trait:'Noble',type:'hero'},
    //  {trait:'Noble',type:'character'}]
    suggested.getTargetOptionsForCard = function(card) {
	// Special case
	if (card.name_norm=='Beorn' && card.exp=='thohauh') return []; // Beorn cannot be a target option for any player card
	// 
	var targets = [];
	var regextrait = /([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+)/g;
	var typen = suggested.normalize(card.type);
	targets.push({trait:'None',type:typen});
	targets.push({trait:'None',type:'character'});
	targets.push({trait:suggested.normalize(card.sphere),type:typen});
	targets.push({trait:suggested.normalize(card.sphere),type:'character'});
	var match = regextrait.exec(card.traits);
	while (match != null) {
	    targets.push({trait:match[0],type:typen});
	    targets.push({trait:match[0],type:'character'});
	    match = regextrait.exec(card.traits);
	}
	if (suggested.isWordInString('Ranged',card.keywords)) {
	    targets.push({trait:'Ranged',type:typen});
	    targets.push({trait:'Ranged',type:'character'});
	}
	if (suggested.isWordInString('Sentinel',card.keywords)) {
	    targets.push({trait:'Sentinel',type:typen});
	    targets.push({trait:'Sentinel',type:'character'});
	}
	return targets;
    };

    suggested.getTraitSpecificTargetOptionsForCard = function(card) {
	return suggested.traitSpecificFilter(suggested.getTargetOptionsForCard(card));
    };
    
    // Returns a list of targets that are in the card and specific to the given trait
    suggested.getTraitSpecificTargetsInCard = function(card) {
	return suggested.traitSpecificFilter(suggested.getTargetsInCard(card));
    };

    // Filter out all targets that are not one of the globally named traits
    suggested.traitSpecificFilter = function(list) {
	var targets = [];
	for (var t in list)
	    if (suggested.isWordInList(list[t].trait,suggested.traits))
		targets.push(list[t]);
	return targets;
    };

    // Sets list of targets in the deck
    suggested.setTargetsInDeck = function() {
	var deck = suggested.deck;
	var targets = [];
	// Loop over cards
	var types = ['1hero','2ally','3attachment','4event','5quest'];
	for (var t in types)
	    for (var c in deck[types[t]]) {
		var newtargets = suggested.getTargetsInCard(deck[types[t]][c]);
		targets=targets.concat(newtargets);
	    }
	suggested.targetsInDeck = targets;
    };

    // Sets list of targets in the deck that specify one of the globally named traits
    suggested.setTraitSpecificTargetsInDeck = function() {
	var deck = suggested.deck;
	suggested.traitSpecificTargetsInDeck = suggested.traitSpecificFilter(suggested.targetsInDeck);
    };
    
    // Sets list of targets options for the deck.
    suggested.setTargetOptionsForDeck = function() {
	var deck = suggested.deck;
	var targets = [];
	var regextrait = /([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+)/g;
	// Loop over cards
	var types = ['1hero','2ally','3attachment'];
	for (var t in types)
	    for (var c in deck[types[t]]) {
		var newtargets = suggested.getTargetOptionsForCard(deck[types[t]][c]);
		targets=targets.concat(newtargets);
		
	    }
	suggested.targetOptionsForDeck = targets;
    };

    // Sets list of targets options for the deck that have one of the globally named traits
    suggested.setTraitSpecificTargetOptionsForDeck = function() {
	var deck = suggested.deck;
	suggested.traitSpecificTargetOptionsForDeck = suggested.traitSpecificFilter(suggested.targetOptionsForDeck);
    };

    // Convert list of targets to a printable string
    suggested.targetListToString = function(list) {
	var string = '';
	for (var t in list) {
	    var target = list[t];
	    string=string+target.trait+' '+target.type+' / ';
	}
	return string;	      
    };
    
    // Checks if a target is in a list of targets
    suggested.isTargetInList = function(target,list) {
	for (var t in list)
	    if (target.trait==list[t].trait && target.type==list[t].type)
		return 1;
	return 0;
    };
    
    // Returns 1 if there is a target in listA that matches a target in listB
    suggested.matchInTargetLists = function(listA,listB) {
	for (var t in listA)
	    if (suggested.isTargetInList(listA[t],listB))
		return 1;
	return 0;
    };
    
    // Converts '2tactics' to 'Tactics', etc.
    suggested.normalize = function(word) {
	if (word=='1leadership') return 'Leadership';
	if (word=='2tactics') return 'Tactics';
	if (word=='3spirit') return 'Spirit';
	if (word=='4lore') return 'Lore';
	if (word=='5neutral') return 'Neutral';
	if (word=='6baggins') return 'Baggins';
	if (word=='7fellowship') return 'Fellowship';
	if (word=='1hero') return 'hero';
	if (word=='2ally') return 'ally';
	if (word=='3attachment') return 'attachment';
	if (word=='4event') return 'event';
	if (word=='5quest') return 'quest';
	return '';
    };

    // Returns list of targets targetted by the card text
    suggested.getTargetsInCard = function(card) {
	var targets = []; // List of targets named by the card. 
	// A returned list for Quick Ears would look like [{trait:'Dunedain',type:'hero'},{trait:'Ranger',type:'hero'}]
	// A returned list for Unexpected Courage would look like [{trait:'None',type:'hero'}]
	// A returned list for Spear of the Citadel would look like [{trait:'Tactics',type:'character'}]
	// A returned list for Valiant Sacrifice would be [{trait:none,type:'ally'}]

	// Special cases
	if (card.name_norm=='Radagast' && card.exp=='ajtr') {
	    targets.push({trait:'Creature',type:'hero'});
	    targets.push({trait:'Creature',type:'ally'});
	    targets.push({trait:'Creature',type:'character'});
	    return targets;
	}
	if (card.name_norm=='Nori' && card.exp=='thohauh') {
	    targets.push({trait:'Dwarf',type:'ally'});
	    return targets;
	}
	if (card.name_norm=='Boromir' && card.exp=='hon') {
	    targets.push({trait:'Gondor',type:'ally'});
	    return targets;
	}
	if (card.name_norm=='Hirluin the Fair' && card.exp=='tsf') {
	    targets.push({trait:'Outlands',type:'ally'});
	    return targets;
	}

	// Match certain attachments
	var atraitattachment = /(?:(?:a|an|1) )([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+) (?:or )?([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+)? ?(?:attachment|card attached)/.exec(card.text);
	if (atraitattachment) {
	    if (atraitattachment[1])
		targets.push({trait:atraitattachment[1],type:'attachment'});
	    if (atraitattachment[2])
		targets.push({trait:atraitattachment[2],type:'attachment'});
	    return targets;
	}

	// Match targets like 'a hero'
	var acharacter = /(?: (?:a|an|1)) (hero|character|ally)(?! (?:you control )?with)/.exec(card.text);
	if (acharacter) targets.push({trait:'None',type:acharacter[1]});
	
	// Match targets like 'a Ranger hero'
	var atraithero = /(?:(?:a|an|1|Each|each) )([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+) (?:or )?([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+)? ?(?:hero)/.exec(card.text);
	if (atraithero) {
	    if (atraithero[1])
		targets.push({trait:atraithero[1],type:'hero'});
	    if (atraithero[2])
		targets.push({trait:atraithero[2],type:'hero'});
	}
	var atraitally = /(?:(?:a|an|1|first) )([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+) (?:or )?([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+)? ?(?:ally)/.exec(card.text);
	if (atraitally) {
	    if (atraitally[1])
		targets.push({trait:atraitally[1],type:'ally'});
	    if (atraitally[2])
		targets.push({trait:atraitally[2],type:'ally'});
	}
	var atraitcharacter = /(?:(?:a|an|1|defending|of|unique|each|Each) )([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+) (?:or )?([A-Z][\u00BF-\u1FFF\u2C00-\uD7FF\w]+)? ?(?:character|deals|cards|you control)/.exec(card.text);
	if (atraitcharacter) {
	    if (atraitcharacter[1]) {
		targets.push({trait:atraitcharacter[1],type:'character'});
	    }
	    if (atraitcharacter[2]) {
		targets.push({trait:atraitcharacter[2],type:'character'});
	    }
	}
	// Match cards like 'with ranged' or 'sentinel character'
	var withranged = /(hero|character).+with (the |printed )?([R|r]anged)/.exec(card.text);
	if (withranged) {
	    targets.push({trait:'Ranged',type:withranged[1]});  
	}
	var withsentinel = /(hero|character).+with (the |printed )?([S|s]entinel)/.exec(card.text);
	if (withsentinel) {
	    targets.push({trait:'Sentinel',type:withsentinel[1]});	      
	}
	var rangedcharacter = /[R|r]ranged character/.exec(card.text);
	if (rangedcharacter) {
	    targets.push({trait:'Ranged',type:'character'});    
	}
	var sentinelcharacter = /[S|s]entinel character/.exec(card.text);
	if (sentinelcharacter) {
	    targets.push({trait:'Sentinel',type:'character'});	      
	}

	return targets;
    };

    // Force a card to be suggested, bypassing most checks. Done by name/exp.
    suggested.forceAdd = function(name_norm,exp) {
	for(var c in suggested.allcards) {
	    var cardc = suggested.allcards[c];
	    if (cardc.name_norm==name_norm && cardc.exp==exp && !suggested.sameName(cardc))
		suggested.add(card);
	}
    };

    // Force a card to be suggested, bypassing most checks. Done by card.
    suggested.forceAddCard = function(card) {
	suggested.add(card);
    };

    // Returns true if there is a in the deck by the same name as the given card
    suggested.sameName = function(card){
	var deck = suggested.deck;
	for (var c in deck[card.type]){
	    if (deck[card.type][c].name_norm==card.name_norm){
		return 1;
	    }
	}	
	// We also do not want to suggest, for example, Galadriel ally if Galadriel Hero was added to the deck
	for (var c in deck['1hero']){
	    if (deck['1hero'][c].name_norm==card.name_norm){
		return 1;
	    }
	}
	for (var c in deck['2ally']){
	    if (deck['2ally'][c].name_norm==card.name_norm){
		return 1;
	    }
	}
	return 0;
    };
    // Returns 1 if word is in list
    suggested.isWordInList = function(word,list) {
	for (var w in list)
	    if(list[w]==word)
		return 1;
	return 0;
    };
    // Returns 1 if card is in list
    suggested.isCardInList = function(card,list) {
	for (var c in list) {
	    if(list[c].cycle==card.cycle && list[c].no==card.no) {
		return 1;
	    }
	}
	return 0;
    };
    // Returns 1 if word is in string
    suggested.isWordInString = function(word,string) {
	//	  return (string.search(word)>=0);
	return (string.indexOf(word)>-1);
	// var hits = string.match(word);
	// if (hits) return 1;
	// else return 0;
    };
    // Returns 1 if regexp is in string
    suggested.isRegExpInString = function(regexp,string) {
	//	  return (string.search(word)>=0);
	return regexp.exec(string);
	// var hits = string.match(word);
	// if (hits) return 1;
	// else return 0;
    };
    // Takes in a name and expansion, and returns 1 if the card is in the deck (or heroes)
    suggested.isInDeck = function(name_norm,exp) {
	var deck = suggested.deck;
	var types = ['1hero','2ally','3attachment','4event','5quest'];
	for(var t in types)
	    for (var c in deck[types[t]]) {
		if (deck[types[t]][c].name_norm==name_norm && deck[types[t]][c].exp==exp) return 1;
	    }
	return 0;	
    };
    // Takes in a word and returns 1 if the word is found in the text/traits of the card
    suggested.isWordInCard = function(word,card) {
	if (suggested.isWordInString(word,card.text)) return 1;
	if (suggested.isWordInString(word,card.traits)) return 1;
	return 0;	
    };
    // Takes in a word and returns 1 if the word is found in the text/traits of a card in the deck
    suggested.isWordInDeck = function(word) {
	var deck = suggested.deck;
	var types = ['1hero','2ally','3attachment','4event','5quest'];
	for(var t in types)
	    for (var c in deck[types[t]])
		if (suggested.isWordInCard(word,deck[types[t]][c])) return 1;
	return 0;	
    };
    // Takes in a word and returns 1 if the word is found in the text of a card in the deck
    suggested.isWordInDeckText = function(word) {
	var deck = suggested.deck;
	var types = ['1hero','2ally','3attachment','4event','5quest'];
	for(var t in types)
	    for (var c in deck[types[t]])
		if (suggested.isWordInString(word,deck[types[t]][c].text)) return 1;
	return 0;	
    };
    // Takes in a trait and returns 1 if the trait is found in the text of a card in the deck
    suggested.isTraitInDeckText = function(trait) {
	var deck = suggested.deck;
	var types = ['1hero','2ally','3attachment','4event','5quest'];
	for(var t in types)
	    for (var c in deck[types[t]]) {
		// We do not want to include all Gondor cards just because Steward grants the 'Gondor trait' 
		if (suggested.isWordInString('trait',deck[types[t]][c].text)) continue;
		if (suggested.isWordInString(trait,deck[types[t]][c].text)) return 1;
	    }
	return 0;	
    };
    // Takes in a trait and returns 1 if the trait is found in the traits of a hero in the deck. We also consider keywords like Ranged to be traits.
    suggested.isTraitInHeroTraits = function(trait) {
	var deck = suggested.deck;
	for(var h in deck['1hero'])
	    if (suggested.isWordInString(trait,deck['1hero'][h].traits) || suggested.isWordInString(trait,deck['1hero'][h].keywords)) return 1;
	return 0;	
    };
    // Takes in a trait and returns 1 if the trait is found in the traits of an ally in the deck. We also consider keywords like Ranged to be traits.
    suggested.isTraitInAllyTraits = function(trait) {
	var deck = suggested.deck;
	for(var h in deck['2ally'])
	    if (suggested.isWordInString(trait,deck['2ally'][h].traits) || suggested.isWordInString(trait,deck['2ally'][h].keywords)) return 1;
	return 0;	
    };
    // Takes in a trait and returns 1 if the trait is found in the traits of a character in the deck
    suggested.isTraitInDeckTraits = function(trait) {
	var deck = suggested.deck;
	return (suggested.isTraitInHeroTraits(trait)||suggested.isTraitInAllyTraits(trait));
    };

    // Detect monosphere
    suggested.monoSphere = function() {
	var deck = suggested.deck;
	if (deck['1hero'].length<3) return '';
	var sphere = deck['1hero'][0].sphere;
	for (var h in deck['1hero'])
	    if (deck['1hero'][h].sphere!=sphere) return '';
	return sphere;
    };

    // Detect monotrait
    suggested.monoTrait = function() {
	var deck = suggested.deck;
	if (deck['1hero'].length<3) return '';
	var traitlist = [];
	for (var t in suggested['traits']) {
	    var isTraitInAllHeroes = 1;
	    for (var h in deck['1hero'])
		if (!suggested.isWordInString(suggested['traits'][t],deck['1hero'][h].traits))
		    isTraitInAllHeroes = 0;
	    if (isTraitInAllHeroes) traitlist.push(suggested['traits'][t]);
	}
	return traitlist;
    };

    // Detect secrecy
    suggested.isSecrecy = function() {
	var deck = suggested.deck;
	if (deck['1hero'].length<3) return 0;
	return (suggested.startingThreat()<=20);
    };


    suggested.change = function(card,quantity){
        for (var c in suggested[card.type]){
            if (suggested[card.type][c].cycle==card.cycle && suggested[card.type][c].no==card.no){
		suggested[card.type].splice(c, 1);
            }
	}
    };
    suggested.quantity = function(card){
	for(var c in suggested[card.type]){
            if(suggested[card.type][c].cycle==card.cycle && suggested[card.type][c].no==card.no){
		return suggested[card.type][c].quantity;
            };
	};
	return 0;
    };
    suggested.startingThreat = function(){
	var deck = suggested.deck;
	var threat = 0;
	var mirlonde = 0;
	var loreheroes = 0;
	for(var h in deck['1hero']){
            threat += deck['1hero'][h].cost;
	    if(deck['1hero'][h].name_norm=="Mirlonde")
		mirlonde = 1;
	    if(deck['1hero'][h].sphere=="4lore")
		loreheroes++;
	};
	if(mirlonde) threat-=loreheroes;
	return threat;
    };
    // Count cards in Deck
    suggested.countDeckAllies = function(){
	var deck = suggested.deck;
	var allies=0;
	for (var a in deck['2ally']) {
            allies += deck['2ally'][a].quantity;
	};
	return allies;
    };
    suggested.countDeckAttachments = function(){
	var deck = suggested.deck;
	var attachments=0;
	for (var a in deck['3attachment']) {
            attachments += deck['3attachment'][a].quantity;
	};
	return attachments;
    };
    suggested.countDeckEvents = function(){
	var deck = suggested.deck;
	var events=0;
	for (var e in deck['4event']) {
            events += deck['4event'][e].quantity;
	};
	return events;
    };
    suggested.countDeckQuests = function(){
	var deck = suggested.deck;
	var quests=0;
	for (var q in deck['5quest']) {
            quests += deck['5quest'][q].quantity;
	};
	return quests;
    };
    suggested.countDeckHeroes = function(){
	var deck = suggested.deck;
	var heroes=0;
	for (var h in deck['1hero']) {
            heroes += deck['1hero'][h].quantity;
	};
	return heroes;
    };
    // Count cards in suggested
    suggested.countAllies = function(){
      	var allies=0;
      	for (var a in suggested['2ally']) {
      	    allies++;
      	};
      	return allies;
    };
    suggested.countAttachments = function(){
      	var attachments=0;
      	for (var a in suggested['3attachment']) {
      	    attachments++;
      	};
      	return attachments;
    };
    suggested.countEvents = function(){
      	var events=0;
      	for (var e in suggested['4event']) {
      	    events++;
      	};
      	return events;
    };
    suggested.countQuests = function(){
      	var quests=0;
      	for (var q in suggested['5quest']) {
      	    quests++;
      	};
      	return quests;
    };
    suggested.countHeroes = function(){
      	var heroes=0;
      	for (var h in suggested['1hero']) {
      	    heroes++;
      	};
      	return heroes;
    };
    suggested.countTotal = function() {
	return suggested.countAllies()+suggested.countAttachments()+suggested.countEvents()+suggested.countQuests();
    };
    
    suggested.empty = function() {
	return (suggested.countAllies()+suggested.countAttachments()+suggested.countEvents()+suggested.countQuests()+suggested.countHeroes())==0;
    };
    // Remove from suggested
    suggested.remove = function(card) {	
        for (var c in suggested[card.type]){
            if (suggested[card.type][c].cycle==card.cycle && suggested[card.type][c].no==card.no){
		suggested[card.type].splice(c, 1);
            }
	}  
	suggested.blacklist.push(card);
    }
    // Clear the blacklisted cards
    suggested.clearBlacklist = function() {	
	suggested.blacklist=[];
	suggested.deckChange(suggested.deck);
    }
    // Show/hide suggested
    suggested.hide = function() {
	suggested.hidden = 1;
    }
    suggested.show = function() {
	suggested.hidden = 0;
    }    
    return suggested;
}])

.factory('searchDecks', ['$rootScope','$firebaseObject',function($rootScope,$firebaseObject) {
    // var searchObject = {
    // 	"deckid" : "1sa9FG",
    // 	"userid" : "1234",
    // 	"username" : "seas",
    // 	"deckname" : "money",
    // 	"card" : "A01",
    // 	"beatquest" : "a01",
    // 	"usessets" : "A"
    // }
    var results = function(searchObject) {
	var matchedDecks = [];
	var allDecks = $firebaseObject($rootScope.ref.child('decks'));
	allDecks.$loaded().then(function() {
	    angular.forEach(allDecks, function(value, key){
		var match = true;
		if ((match == true) && (searchObject.userid) && (searchObject.userid.length>0)) {
		    if (searchObject.userid != value.userid) match = false;
		}
		if ((match == true) && (searchObject.username) && (searchObject.username.length>0)) {
		    var string = value.username.toLowercase();
		    var sub = searchObject.username.toLowerCase();
		    if (string.indexOf(sub) < -1) match = false;
		}
		if ((match == true) && (searchObject.deckname) && (searchObject.deckname.length>0)) {
		    var string = value.deckname.toLowercase();
		    var sub = searchObject.deckname.toLowerCase();
		    if (string.indexOf(sub) < -1) match = false;
		}
		if (match == true) matchedDecks.push(value);
	    });
	});
	return matchedDecks;
    }
    return results;
}])


.factory('deck', ['filtersettings','suggested','cardObject','getDeckString', function(filtersettings,suggested,cardObject,getDeckString){
    var deck={};
    deck.filtersettings = filtersettings;
    deck.suggested = suggested;
    deck.allcards = cardObject;
    deck.parentID = "";
//    deck.editing = false;
    deck['1hero']=[];
    deck['2ally']=[];
    deck['3attachment']=[];
    deck['4event']=[];
    deck['5quest']=[];
    deck.change = function(card,quantity){
	if (quantity>0){
	    if (deck.quantity(card)==0) {
		card.quantity=quantity;
		deck[card.type].push(card);
            } else {
		for (var c in deck[card.type]){
		    if (deck[card.type][c].cycle==card.cycle && deck[card.type][c].no==card.no){
			deck[card.type][c].quantity = quantity;
		    }
		}
            }
	} else {
            for (var c in deck[card.type]){
		if (deck[card.type][c].cycle==card.cycle && deck[card.type][c].no==card.no){
		    deck[card.type].splice(c, 1);
		}
            }
	}
	// Get list of suggestions for deck
	suggested.deckChange(this);
    };
    deck.refreshSuggested = function() {
	suggested.deckChange(this);
    };
    deck.quantity = function(card){
	for (var c in deck[card.type]){
            if (deck[card.type][c].cycle==card.cycle && deck[card.type][c].no==card.no){
		return deck[card.type][c].quantity;
            }
	}
	return 0;
    };
    deck.startingThreat = function(){
	var threat = 0;
	var mirlonde = 0;
	var loreheroes = 0;
	for(var h in deck['1hero']){
            threat += deck['1hero'][h].cost;
	    if(deck['1hero'][h].name_norm=="Mirlonde")
		mirlonde = 1;
	    if(deck['1hero'][h].sphere=="4lore")
		loreheroes++;
	}
	if(mirlonde) threat-=loreheroes;
	return threat;
    };
    
    deck.countAllies = function(){
	var allies=0;
	for (var a in deck['2ally']) {
            allies += deck['2ally'][a].quantity;
	}
	return allies;
    };
    deck.countAttachments = function(){
	var attachments=0;
	for (var a in deck['3attachment']) {
            attachments += deck['3attachment'][a].quantity;
	}
	return attachments;
    };
    deck.countEvents = function(){
	var events=0;
	for (var e in deck['4event']) {
            events += deck['4event'][e].quantity;
	}
	return events;
    };
    deck.countQuests = function(){
	var quests=0;
	for (var q in deck['5quest']) {
            quests += deck['5quest'][q].quantity;
	}
	return quests;
    };
    deck.countHeroes = function(){
	var heroes=0;
	for (var h in deck['1hero']) {
            heroes += deck['1hero'][h].quantity;
	}
	return heroes;
    };
    
    deck.countTotal = function() {
	return deck.countAllies()+deck.countAttachments()+deck.countEvents()+deck.countQuests();
    };
    
    deck.empty = function() {
	return (deck.countAllies()+deck.countAttachments()+deck.countEvents()+deck.countQuests()+deck.countHeroes())==0;
    };
    deck.clear = function() {
        deck["1hero"] = [];
        deck["2ally"] = [];
        deck["3attachment"] = [];
        deck["4event"] = [];
        deck["5quest"] = [];
        deck.deckname = "";
	deck.editing = false;
	deck.parentID = "";
	//	deck.version = 1;
	suggested.clearBlacklist();
	suggested.deckChange(deck);
	console.log("Deck cleared");
    };
    return deck;
}])

.factory('loadDeckIntoBuilder', ['deck','cardObject','$location','getCardFromCardID',function(deck,cardObject,$location,getCardFromCardID){
	var loadDeckIntoBuilder = function(deckObject) {
	    deck.clear();
	    deck.deckname = deckObject.deckname;
	    deck.parentID = deckObject.deckid;
	    var deckString = deckObject.deckstring;
	    for (var i=0; i<=(deckString.length-4); i=i+4) {
		var cardID = deckString.substr(i,3);
		var card = getCardFromCardID(cardID);
		card.quantity = +deckString.substr(i+3,1);
		deck[card.type].push(card);
	    }
//	    console.log(deck);
			return $location.path("/deck/builder");

	}
	return loadDeckIntoBuilder;
	
}])
//
// Controllers
//

.controller('init',['getData','$location','deck','cardObject','$scope',function(getData,$location,deck,cardObject,$scope){
    getData.async('cards.json').then(function(data) {
	cardObject.length=0;
	for (var d in data) {
	    cardObject.push(data[d]);
	}
    });

    setTimeout( function() {
	// Modify this to include user in the url
	var deckStringIndex = $location.url().indexOf('/deckstring=');
	if (deckStringIndex>-1){
	    var deckString = $location.url().substr(deckStringIndex+2);
	    deck.load(deckString);
	}
	$scope.$apply();
    },1000);
}])

//Logic for the card selection
.controller('cardControl',["$http","$scope","filtersettings","deck","suggested","image","cardObject",function($http,$scope,filtersettings,deck,suggested,image,cardObject){
    $scope.allcards=[];
    $scope.deck=deck;
    $scope.suggested=suggested;
    this.image = image;
    this.filtersettings=filtersettings;
    this.order=['sphere','name_norm'];
    $scope.allcards = cardObject;
    this.allcards = $scope.allcards;
    this.resetSearch = function(){
	filtersettings.search.name_norm="";
	filtersettings.search.traits="";
	filtersettings.search.textc="";
    };
    this.toggleType = function(t,$event){
	if($event.shiftKey){
            for (var type in this.filtersettings.type) {
		this.filtersettings.type[type] = false;
            }
	}
	this.filtersettings.type[t] = !(this.filtersettings.type[t]);
    };
    this.toggleSphere = function(s,$event){
	if($event.shiftKey){
            for (var sphere in this.filtersettings.spheres) {
		this.filtersettings.spheres[sphere] = false;
            }
	}
	this.filtersettings.spheres[s] = !(this.filtersettings.spheres[s]);
    };
    this.orderby = function(o){
	this.order = o;
    };
    this.changepreview = function(card){
	this.image.update(card);
    };
}])

.controller('setsCtrl',["filtersettings","$localStorage",function(filtersettings,$localStorage){
    this.filtersettings=filtersettings;
    this.full=["core", "kd", "hon", "voi", "tlr", "thohauh", "thfg", "trg", "tsf", "tdt", "twoe", "thotd", "catc", "rtr", "tdf", "ttt", "efmg", "tbr", "ajtr", "twitw", "eaad", "tit", "rd", "thoem", "tld", "aoo", "nie", "tdm", "fos", "tbog", "cs", "rtm", "saf", "tmv", "tac", "tos", "tlos", "ate", "ttor", "tbocd", "tdr","tgh"]; //all expansions so far
    this.toggle=function(exp){
	var ind = this.filtersettings.pack.indexOf(exp);
	if (ind<0) { //index will be -1 if not found
            this.filtersettings.pack.push(exp);
	} else {
            this.filtersettings.pack.splice(ind,1);
	}
	$localStorage.pack = this.filtersettings.pack;
    };
    this.toggleonecore = function(){
	console.log("One core.")
	if(this.filtersettings.onecore){
            this.filtersettings.onecore=false;
	} else {
            this.filtersettings.onecore=true;
	}
	if(this.filtersettings.twocore){
            this.filtersettings.twocore=false;
	}
	$localStorage.onecore = this.filtersettings.onecore;
    };
    this.toggletwocore = function(){
	console.log("Two core.")
	if(this.filtersettings.twocore){
            this.filtersettings.twocore=false;
	} else {
            this.filtersettings.twocore=true;
	}
	if(this.filtersettings.onecore){
            this.filtersettings.onecore=false;
	}
	$localStorage.twocore = this.filtersettings.twocore;
    }
    this.selectNone=function(){
	this.filtersettings.pack=[];
	$localStorage.pack = this.filtersettings.pack;
    };
    this.selectAll=function(){
	this.filtersettings.pack=this.full.slice(0); //make a clone
	$localStorage.pack = this.filtersettings.pack;
    };
}])
.controller('deckCtrl', ['$scope', '$rootScope', 'deck', 'image', 'getDeckString', 'generateDeckID','$firebaseObject','$firebaseArray','$location', function($scope, $rootScope, deck, image, getDeckString, generateDeckID,$firebaseObject,$firebaseArray,$location) {
    $scope.deck = deck;
    $scope.changepreview = function(card) {
        image.update(card);
    };

    $scope.saveDeck = function() {
	console.log("Saving deck");
        if (!$rootScope.authData) {
            return $location.path("/login");
        }
        if (deck.empty()) {
            return alert('Deck is empty!');
        };
        if (deck.deckname == "") {
            return alert('Please enter a name!');
        };
	// Save deck to database
	var deckString = getDeckString(deck);
        var deckid = generateDeckID();
	var onComplete = function(message) {
	    console.log(message);
	}
	var newDeck = {
	    "deckid" : deckid,
	    "username" : $rootScope.displayName,
	    "userid" : $rootScope.authData.uid,
	    "deckname" : deck.deckname,
	    "dateUTC" : new Date().valueOf().toString(),
	    "deckstring" : deckString,
	    "parentid" : deck.parentID ? deck.parentID : ""
	}
	$rootScope.ref.child('decks').child(deckid).set(newDeck,onComplete("Written to public."));
	$rootScope.ref.child('users').child($rootScope.authData.uid).child('decks').child(deckid).set(newDeck,onComplete("Written to private."));
	$rootScope.ref.child('decks').child(deck.parentID).child('daughterids').child(deckid).set(deckid);
	return $location.path("/deck/mydecks");
//         var newDeck = $firebaseObject($rootScope.ref.child('decks').child(deckid));//('users').child($rootScope.authData.uid).child('decks').child(deckid));
//         newDeck.$loaded().then(function() {
// 	    newDeck.deckid = deckid;
// 	    newDeck.username = $rootScope.displayName;
// 	    newDeck.userid  = $rootScope.authData.uid;
// 	    newDeck.deckname = deck.deckname;
//             newDeck.dateUTC = new Date().valueOf().toString();
//             newDeck.deckstring = deckString;
//             newDeck.$save().then(function(ref) {
// 		console.log("Deck saved.");
// 		return $location.path("/deck/mydecks");
// 	    }, function(error) {
// 		console.log("Error saving deck:", error);
//             });
// 	});

// 	// Add deckid to user decks
// 	var newUserDeck = $firebaseObject($rootScope.ref.child('users').child($rootScope.authData.uid).child('decks').child(deckid));
// 	newUserDeck.$loaded().then(function() {
// 	    newUserDeck.deckid = deckid;
// 	    newUserDeck.username = $rootScope.displayName;
// 	    newUserDeck.userid  = $rootScope.authData.uid;
// 	    newUserDeck.deckname = deck.deckname;
//             newUserDeck.dateUTC = new Date().valueOf().toString();
//             newUserDeck.deckstring = deckString;
// 	    newUserDeck.parentid = deck.parentID;// ? deck.parentID : deckid;
// //	    newUserDeck.version = deck.version ? deck.version : 1;
//             newUserDeck.$save().then(function(ref) {
// 		console.log("Deck saved.");
// 		return $location.path("/deck/mydecks");
// 	    }, function(error) {
// 		console.log("Error saving deck:", error);
//             });
// 	});
    }
}])
.controller('suggestedCtrl',['$scope','suggested','image','deck',function($scope,suggested,image,deck){
    $scope.suggested=suggested;
//    deck.refreshSuggested();
    $scope.changepreview = function(card){
    	image.update(card);
    }    
}])


  
.controller('previewCtrl',['$scope','$sce','image','translate','previewService',function($scope,$sce,image,translate,previewService) {
    $scope.trust = $sce.trustAsHtml;
    this.image=image;
    this.getImg = function() {
	return this.image.getUrl();
    };
    this.name = function() {
	return image.name;
    }
    this.exp = function() {
	return " (" + translate[image.exp] +")";
    }
    this.alt = function() {
	return image.text;
    }
    this.setTab = function(newValue){
	previewService.tab = newValue;
    };
    this.isSet = function(tabName){
	return previewService.tab === tabName;
    };
    this.setTab('img');
}])

.factory('getLogsByDeckID', ['$firebaseObject', function($firebaseObject) {
    var logs = function(deckID,scopeLogs) {
	scopeLogs = [];
	var allLogs = $firebaseObject($rootScope.ref.child('logs'));
	allLogs.$loaded().then(function () {
	    angular.forEach(allLogs, function(value, key){
		var logID = key;
		var logObject = value;
		for (var d in logObject.deckids) {
		    if (logObject.deckids[d] == $scope.deckID)
			scopeLogs.push(logObject);
		}
	    });
	});	
    }
    return logs;
}])

// Controller for the deck info page
.controller('deckViewCtrl', ['$scope','$rootScope','$stateParams','$location','$firebaseObject','getLocalObjectFromString','image','getQuantityOfCardInLocalObject','loadDeckIntoBuilder','exportDeck','hasAccess',
function($scope,$rootScope,$stateParams,$location,$firebaseObject,getLocalObjectFromString,image,getQuantityOfCardInLocalObject,loadDeckIntoBuilder,exportDeck,hasAccess) {
    $scope.deckLoaded = false;
    $scope.deck={};
    $scope.hasAccess = hasAccess;

    var url = $location.url();
    var index = url.indexOf('id:');
    if (index>-1) {
        $scope.deckID = url.substr(index+3);	
    } else {
	//404
    };
    var deckObject = $firebaseObject($rootScope.ref.child('decks').child($scope.deckID));
    deckObject.$loaded().then(function() {
	$scope.deckObject = deckObject;
	$scope.deckLoaded = true;
	$scope.deck = getLocalObjectFromString(deckObject.deckstring);
    });
    $scope.changepreview = function(card){
    	image.update(card);
    }    
    $scope.cardQuantity = function(card){
	return getQuantityOfCardInLocalObject(card,$scope.deck);
    }
    $scope.loadDeck = function() {
	return loadDeckIntoBuilder(deckObject);
    }
    $scope.exportOctgn = function() {
	return exportDeck.exportOctgn(deckObject);
    }
    $scope.exportText = function() {
	return exportDeck.exportText(deckObject);
    }

    // Load logs
    $scope.deckLogsArray = [];
    $scope.loadDeckLogs = function() {
	var deckLogs = [];
	var allLogs = $firebaseObject($rootScope.ref.child('logs'));
	allLogs.$loaded().then(function () {
	    angular.forEach(allLogs, function(value, key){
		var logID = key;
		var logObject = value;
		for (var d in logObject.deckids) {
		    if (logObject.deckids[d] == $scope.deckID)
		    deckLogs.push(logObject);
		}
	    });
	    $scope.deckLogsArray = deckLogs;
	});
    }		      
    $scope.loadDeckLogs();

    // Load Mods      
    $scope.deckModsArray = [];
    $scope.loadDeckMods = function() {
        var deckMods = [];
//        var allDecks = $firebaseObject($rootScope.ref.child('decks'));
	var deckModIDs = $firebaseObject($rootScope.ref.child('decks').child($scope.deckID).child('daughterids'))
        deckModIDs.$loaded().then(function () {
            angular.forEach(deckModIDs, function(value, key){
                var modID = value;
		var modDeck = $firebaseObject($rootScope.ref.child('decks').child(modID));
		modDeck.$loaded().then(function() {
		    deckMods.push(modDeck.$value());
		})
                // if (deckObject.parentid == $scope.deckID)
                //     deckMods.push(deckObject);
	    });
            $scope.deckModsArray = deckMods;
        });
    }
    $scope.loadDeckMods();

}])


.factory('getUserIDFromUsername',[function() {
    var userIDFromUsername = function(username,allUsers) {
        var returnID = null;
	angular.forEach(allUsers, function(value, key){
            var userID = key;
	    var userObject = value;
	    if (userObject.username == username) {
		console.log(key);
		returnID = key;
	    }
        });
	return returnID;
    }
    return userIDFromUsername;
}])

.controller('userViewCtrl', ['$scope','$rootScope','$firebaseObject','$firebaseArray','image','getUserIDFromUsername','$location','getHeroesFromDeckString',
function($scope,$rootScope,$firebaseObject,$firebaseArray,image,getUserIDFromUsername,$location,getHeroesFromDeckString) {
    $scope.userLoaded = false;

    var url = $location.url();
    var index = url.indexOf('user:');
    if (index>-1) {
        $scope.username = url.substr(index+5);	
    } else {
	//404
    };
    $scope.changepreview = function(card){
    	image.update(card);
    }
    $scope.getHeroes = function(deckString) {
	var heroes = getHeroesFromDeckString(deckString);
	return heroes;
    }

    $scope.loadUserDecks = function() {
//	var userID = getUserIDFromUsername($scope.username);
	console.log($scope.username);
	var allUsers = $firebaseObject($rootScope.ref.child('users'));
	allUsers.$loaded().then(function() {
	    var userID = getUserIDFromUsername($scope.username,allUsers);
	    if (userID) {
		$scope.userDecksArray = $firebaseArray($rootScope.ref.child('users').child(userID).child('decks'));    
		$scope.userDecksArray.$loaded().then(function() {
		    $scope.userLoaded = true;
		})
	    } else {
		// 404
	    }
	})
    }
    $scope.loadUserDecks();

}])


.factory('exportDeck', ['translate','getCardFromCardID',function(translate,getCardFromCardID) {
    
    this.download = function(filename,text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);

        pom.style.display = 'none';
        document.body.appendChild(pom);

        pom.click();

        document.body.removeChild(pom);
    }

    this.exportOctgn = function(deckObject) {
	if (!deckObject) return alert("No deck selected.");

        var octgndeck = {
            "1hero": [],
            "2ally": [],
            "3attachment": [],
            "4event": [],
            "5quest": []
        };
        var warned = false;
	
	octgndeck.deckname = deckObject.deckname;
	var deckString = deckObject.deckstring;
	for (var i=0; i<=(deckString.length-4); i=i+4) {
	    var cardID = deckString.substr(i,3);
	    var card = getCardFromCardID(cardID);
	    if (card.octgn == "") {
                if (!warned) {
                    window.alert("Warning: Omitting cards that are not yet available in OCTGN.");
                    warned = true;
                }
                continue;
            }
	    card.quantity = +deckString.substr(i+3,1);
	    octgndeck[card.type].push(card);
	}
	

        var text = "";
        text += '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n';
        text += '<deck game="a21af4e8-be4b-4cda-a6b6-534f9717391f">\n';

        text += '  <section name="Hero" shared="False">\n';
        for (var h in octgndeck["1hero"]) {
            text += '    <card qty="';
            text += octgndeck["1hero"][h].quantity;
            text += '" id="';
            text += octgndeck["1hero"][h].octgn;
            text += '">';
            text += octgndeck["1hero"][h].name_norm;
            text += '</card>\n';
        }
        text += '  </section>\n';

        text += '  <section name="Ally" shared="False">\n';
        for (var h in octgndeck["2ally"]) {
            text += '    <card qty="';
            text += octgndeck["2ally"][h].quantity;
            text += '" id="';
            text += octgndeck["2ally"][h].octgn;
            text += '">';
            text += octgndeck["2ally"][h].name_norm;
            text += '</card>\n';
        }
        text += '  </section>\n';

        text += '  <section name="Event" shared="False">\n';
        for (var h in octgndeck["4event"]) {
            text += '    <card qty="';
            text += octgndeck["4event"][h].quantity;
            text += '" id="';
            text += octgndeck["4event"][h].octgn;
            text += '">';
            text += octgndeck["4event"][h].name_norm;
            text += '</card>\n';
        }
        text += '  </section>\n';

        text += '  <section name="Attachment" shared="False">\n';
        for (var h in octgndeck["3attachment"]) {
            text += '    <card qty="';
            text += octgndeck["3attachment"][h].quantity;
            text += '" id="';
            text += octgndeck["3attachment"][h].octgn;
            text += '">';
            text += octgndeck["3attachment"][h].name_norm;
            text += '</card>\n';
        }
        text += '  </section>\n';

        text += '  <section name="Side Quest" shared="False">\n';
        for (var h in octgndeck["5quest"]) {
            text += '    <card qty="';
            text += octgndeck["5quest"][h].quantity;
            text += '" id="';
            text += octgndeck["5quest"][h].octgn;
            text += '">';
            text += octgndeck["5quest"][h].name_norm;
            text += '</card>\n';
        }
        text += '  </section>\n';



        text += '  <section name="Quest" shared="True" />\n'
        text += '  <section name="Encounter" shared="True" />\n'
        text += '  <section name="Special" shared="True" />\n'
        text += '  <section name="Setup" shared="True" />\n'


        text += '  <notes><![CDATA[]]></notes>';
        text += '</deck>';

        this.download(octgndeck.deckname + ".o8d", text);
    }


    this.plaintext = function(deckObject) {
        var deck = {};
        deck["1hero"] = [];
        deck["2ally"] = [];
        deck["3attachment"] = [];
        deck["4event"] = [];
        deck["5quest"] = [];

	deck.deckname = deckObject.deckname;
	var deckString = deckObject.deckstring;
	for (var i=0; i<=(deckString.length-4); i=i+4) {
	    var cardID = deckString.substr(i,3);
	    var card = getCardFromCardID(cardID);
	    card.quantity = +deckString.substr(i+3,1);
	    deck[card.type].push(card);
	}

        var text = "";
        text += deck.deckname;
        text += "\r\n\r\nTotal Cards: ";
        var total = 0;
        var types = ["2ally", "3attachment", "4event", "5quest"]
        for (var t in types) {
            var type = types[t];
            for (var i in deck[type]) {
                total += deck[type][i].quantity;
            }
        }
        text += total;
        text += "\r\n\r\n";
        if (deck["1hero"].length) {
            text += "Heroes (starting threat: ";
            var threat = 0;
            for (var i in deck["1hero"]) {
                threat += deck["1hero"][i].cost;
            }
            text += threat;
            text += ")\r\n"
            for (var i in deck["1hero"]) {
                var h = deck["1hero"].sort(function(a, b) {
                    return a.name > b.name ? 1 : -1
                })[i];
                text += "     ";
                text += h.name;
                text += " (";
                text += translate[h.exp];
                text += ")\r\n";
            }
        }
        for (var t in types) {
            var type = types[t];
            if (deck[type].length) {
                switch (type) {
                case "2ally":
                    text += "Allies";
                    break;
                case "3attachment":
                    text += "Attachments";
                    break;
                case "4event":
                    text += "Events";
                    break;
                case "5quest":
                    text += "Quests";
                    break;
                }
                text += " (";
                var number = 0;
                for (var i in deck[type]) {
                    number += deck[type][i].quantity;
                }
                text += number;
                text += ")\r\n"
                var t = deck[type].sort(function(a, b) {
                    return (a.sphere == b.sphere) ? ((a.name > b.name) ? 1 : -1) : ((a.sphere > b.sphere) ? 1 : -1)
                });
                for (var i in deck[type]) {
                    text += "  ";
                    text += t[i].quantity;
                    text += "x ";
                    text += t[i].name;
                    text += " (";
                    text += translate[t[i].exp];
                    text += ")\r\n";
                }
            }
        }

        return text;
    }


    this.markdown = function(deckObject) {
        var deck = {};
        deck["1hero"] = [];
        deck["2ally"] = [];
        deck["3attachment"] = [];
        deck["4event"] = [];
        deck["5quest"] = [];

	deck.deckname = deckObject.deckname;
	var deckString = deckObject.deckstring;
	for (var i=0; i<=(deckString.length-4); i=i+4) {
	    var cardID = deckString.substr(i,3);
	    var card = getCardFromCardID(cardID);
	    card.quantity = +deckString.substr(i+3,1);
	    deck[card.type].push(card);
	}

        var text = "#[";
        text += deck.deckname;
        text += "](http://seastan.github.io/";
        text += '#/deck/id:';
	text += deckObject.deckid;
        text += ")  \r\nTotal Cards: ";
        var total = 0;
        var types = ["2ally", "3attachment", "4event", "5quest"]
        for (var t in types) {
            var type = types[t];
            for (var i in deck[type]) {
                total += deck[type][i].quantity;
            }
        }
        text += total;
        text += "  \r\n\r\n";
        if (deck["1hero"].length) {
            text += "**Heroes** (starting threat: ";
            var threat = 0;
            for (var i in deck["1hero"]) {
                threat += deck["1hero"][i].cost;
            }
            text += threat;
            text += ")  \r\n"
            for (var i in deck["1hero"]) {
                var h = deck["1hero"].sort(function(a, b) {
                    return a.name > b.name ? 1 : -1
                })[i];
                text += "    [";
                text += h.name;
                text += "](http://hallofbeorn.com/Cards/Details/";
                text += h.name_norm.replace(/ /g, '-');
                text += '-';
                text += h.exp;
                text += ") (*";
                text += translate[h.exp];
                text += "*)  \r\n";
            }
        }
        for (var t in types) {
            var type = types[t];
            if (deck[type].length) {
                switch (type) {
                case "2ally":
                    text += "**Allies**";
                    break;
                case "3attachment":
                    text += "**Attachments**";
                    break;
                case "4event":
                    text += "**Events**";
                    break;
                case "5quest":
                    text += "**Quests**";
                    break;
                }
                text += " (";
                var number = 0;
                for (var i in deck[type]) {
                    number += deck[type][i].quantity;
                }
                text += number;
                text += ")  \r\n"
                var t = deck[type].sort(function(a, b) {
                    return (a.sphere == b.sphere) ? ((a.name > b.name) ? 1 : -1) : ((a.sphere > b.sphere) ? 1 : -1)
                });
                for (var i in deck[type]) {
                    text += " ";
                    text += t[i].quantity;
                    text += "x [";
                    text += t[i].name;
                    text += "](http://hallofbeorn.com/Cards/Details/";
                    text += t[i].name_norm.replace(/ /g, '-');
                    text += '-';
                    text += t[i].exp;
                    text += ") (*";
                    text += translate[t[i].exp];
                    text += "*)  \r\n";
                }
            }
        }

        text += "***\r\nDeck built with [Love of Tales](http://seastan.github.io/)";
        return text;
    }


    this.bbcode = function(deckObject) {
        var deck = {};
        deck["1hero"] = [];
        deck["2ally"] = [];
        deck["3attachment"] = [];
        deck["4event"] = [];
        deck["5quest"] = [];

	deck.deckname = deckObject.deckname;
	var deckString = deckObject.deckstring;
	for (var i=0; i<=(deckString.length-4); i=i+4) {
	    var cardID = deckString.substr(i,3);
	    var card = getCardFromCardID(cardID);
	    card.quantity = +deckString.substr(i+3,1);
	    deck[card.type].push(card);
	}
	
        var text = "[size=18][url=http://seastan.github.io/#/deck/id:";
        text += deckObject.deckid;
        text += "]";
        text += deck.deckname;
        text += "[/url]";
        text += "[/size]\r\nTotal Cards: ";
        var total = 0;
        var types = ["2ally", "3attachment", "4event", "5quest"]
        for (var t in types) {
            var type = types[t];
            for (var i in deck[type]) {
                total += deck[type][i].quantity;
            }
        }
        text += total;
        text += "  \r\n\r\n";
        if (deck["1hero"].length) {
            text += "[b]Heroes[/b] (starting threat: ";
            var threat = 0;
            for (var i in deck["1hero"]) {
                threat += deck["1hero"][i].cost;
            }
            text += threat;
            text += ")  \r\n"
            for (var i in deck["1hero"]) {
                var h = deck["1hero"].sort(function(a, b) {
                    return a.name > b.name ? 1 : -1
                })[i];
                text += "    ";
                text += "[url=http://hallofbeorn.com/Cards/Details/";
                text += h.name_norm.replace(/ /g, '-').replace(/\'/g, '%27');
                text += '-';
                text += h.exp;
                text += "]";
                text += h.name;
                text += "[/url] ([i]";
                text += translate[h.exp];
                text += "[/i])  \r\n";
            }
        }
        for (var t in types) {
            var type = types[t];
            if (deck[type].length) {
                switch (type) {
                case "2ally":
                    text += "[b]Allies[/b]";
                    break;
                case "3attachment":
                    text += "[b]Attachments[/b]";
                    break;
                case "4event":
                    text += "[b]Events[/b]";
                    break;
                case "5quest":
                    text += "[b]Quests[/b]";
                    break;
                }
                text += " (";
                var number = 0;
                for (var i in deck[type]) {
                    number += deck[type][i].quantity;
                }
                text += number;
                text += ")  \r\n"
                var t = deck[type].sort(function(a, b) {
                    return (a.sphere == b.sphere) ? ((a.name > b.name) ? 1 : -1) : ((a.sphere > b.sphere) ? 1 : -1)
                });
                for (var i in deck[type]) {
                    text += " ";
                    text += t[i].quantity;
                    text += "x ";
                    text += "[url=http://hallofbeorn.com/Cards/Details/";
                    text += t[i].name_norm.replace(/ /g, '-').replace(/'/g, '%27');
                    text += '-';
                    text += t[i].exp;
                    text += "]";
                    text += t[i].name;
                    text += "[/url] ([i]";
                    text += translate[t[i].exp];
                    text += "[/i])  \r\n";
                }
            }
        }

        text += "\r\n[size=7]Deck built with [url=http://seastan.github.io/]Love of Tales[/url][/size]";
        return text;
    }
    this.exportText = function(deckObject) {
	if (!deckObject) return alert("Please select a deck.");

        var text = "++++++++++++\r\n+For Reddit+\r\n++++++++++++ \r\n\r\n";
        text += this.markdown(deckObject);

        text += "\r\n\r\n\r\n\r\n\r\n+++++++++++++++++++ \r\n+For Boardgamegeek+\r\n+++++++++++++++++++  \r\n\r\n";
        text += this.bbcode(deckObject);

        text += "\r\n\r\n\r\n\r\n\r\n+++++++++++ \r\n+Plaintext+\r\n+++++++++++  \r\n\r\n";
        text += this.plaintext(deckObject);



        text += "\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\nDo not remove the part below, you will be unable to upload the deck if you do!\r\n";
        text += "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\r\n";
        text += deckObject.deckstring;
        text += "\r\n++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++";


        this.download(deckObject.deckname + ".txt", text);
    };


    return this;
}])

.factory('formDataMyDecks',function() {
    var formDataMyDecks = {};
    return formDataMyDecks;
})

.controller('myDecksCtrl', ['deck', 'getDeckString', '$localStorage', 'translate', '$scope', '$rootScope', 'cardObject', '$location', '$firebaseObject','$firebaseArray','getHeroesFromDeckString','loadDeckIntoBuilder','getCardFromCardID','getCardID','searchDecks','image','exportDeck','formDataMyDecks',
function(deck, getDeckString, $localStorage, translate, $scope, $rootScope, cardObject, $location,$firebaseObject,$firebaseArray,getHeroesFromDeckString,loadDeckIntoBuilder,getCardFromCardID,getCardID,searchDecks,image,exportDeck,formDataMyDecks) {
    $scope.formDataMyDecks = formDataMyDecks;
    $scope.loadMyDecks = function() {
	console.log("Loading decks");
	$scope.myDecksArray = $firebaseArray($rootScope.ref.child('users').child($rootScope.authData.uid).child('decks'));    
    }

    if (!$rootScope.authData) {
        return $location.path("/login");
    } else {
	$scope.loadMyDecks();
    };

    this.selectedDeck = null;
    this.setSelected = function(selectedDeck) {
	this.selectedDeck = selectedDeck;
    }
    this.getSelected = function() {
	return this.selectedDeck;
    }
    this.changepreview = function(card){
    	image.update(card);
    }
    this.loadInfoPage = function(deckObject) {
	return $location.path("/deck/id:"+deckObject.deckid);
    };
    this.getHeroes = function(deckString) {
	var heroes = getHeroesFromDeckString(deckString);
	return heroes;
    }
    this.deleteDeck = function(deckObject) {
	if (!deckObject) return alert("Please select a deck.");
	console.log(deckObject);
	if (confirm('Are you sure you want to delete: '+deckObject.deckname)) {
		this.myDecksArray.$remove(deckObject);
	};
    }
    this.loadDeck = function(deckObject) {
	if (!deckObject) return alert("Please select a deck.");
	loadDeckIntoBuilder(deckObject);
    }
    this.archiveDeck = function(deckObject) {
	if (!deckObject) return alert("Please select a deck.");
	var onComplete = function() {
	    $scope.loadMyDecks();
	}
	$rootScope.ref.child('users').child($rootScope.authData.uid).child('decks').child(deckObject.deckid).child('archived').set(true,onComplete);
    }
    this.publishDeck = function(deckObject) {
	if (!deckObject) return alert("Please select a deck.");
	var onComplete = function() {
	    $scope.loadMyDecks();
	}
	$rootScope.ref.child('users').child($rootScope.authData.uid).child('decks').child(deckObject.deckid).child('published').set(true,onComplete);
    }
    this.unArchiveDeck = function(deckObject) {
	if (!deckObject) return alert("Please select a deck.");
	var onComplete = function() {
	    $scope.loadMyDecks();
	}
	$rootScope.ref.child('users').child($rootScope.authData.uid).child('decks').child(deckObject.deckid).child('archived').set(false,onComplete);
    }
    this.unPublishDeck = function(deckObject) {
	if (!deckObject) return alert("Please select a deck.");
	var onComplete = function() {
	    $scope.loadMyDecks();
	}
	$rootScope.ref.child('users').child($rootScope.authData.uid).child('decks').child(deckObject.deckid).child('published').set(false,onComplete);
    }
    this.editDeck = function(deckObject) {
	if (!deckObject) return alert("Please select a deck.");
	if (deckObject.published) return alert("Cannot edit a published deck!");
	loadDeckIntoBuilder(deckObject);
	deck.editing=true;
    }
    // this.publish = function(deckObject) {
    // 	var myDeck = $firebaseObject($rootScope.ref.child('users').child($rootScope.authData.uid).child('decks').child(deckObject.deckid));
    // 	var onComplete = function() {
    // 	    console.log("Reloading decks.");
    // 	    $scope.loadMyDecks();
    // 	}
    // 	var copyObject = function(obj) {
    // 	    var newObj = {};
    // 	    for (var key in obj) {
    // 		if (key.indexOf('$') < 0 && obj.hasOwnProperty(key)) {
    // 		    newObj[key] = obj[key];
    // 		};
    // 	    }
    // 	    return newObj;
    // 	}
    // 	myDeck.$loaded().then(function() {
    // 	    // Update personal deck to public
    // 	    myDeck.published = true;
    // 	    myDeck.$save().then(function() {
    // 		// Make deck public!
    // 		$rootScope.ref.child('decks').child(deckObject.deckid).set(copyObject(myDeck),onComplete);
    // 		// newDeck.$loaded().then(function() {
    // 		//     newDeck = myDeck;
    // 		//     newDeck.$save().then(function(ref) {
    // 		// 	console.log("Deck saved.");
    // 		// 	return $location.path("/deck/mydecks");
    // 		//     }, function(error) {
    // 		// 	console.log("Error saving deck:", error);
    // 		//     });
    // 		// });
    // 	    })
    // 	})
    // }
    
    this.download = function(filename,text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);

        pom.style.display = 'none';
        document.body.appendChild(pom);

        pom.click();

        document.body.removeChild(pom);
    }

    String.prototype.chunk = function(n) {
        var ret = [];
        for (var i = 0, len = this.length; i < len; i += n) {
            ret.push(this.substr(i, n))
        }
        return ret
    };

    this.exportText = function(deckObject) {
	exportDeck.exportText(deckObject);
    };
    this.exportOctgn = function(deckObject) {
	exportDeck.exportOctgn(deckObject);
    };

    this.uploadDeck = function(event) {
        var file = event.target.files[0];
        if (file.name.indexOf(".o8d") >= 0) {
            return this.uploadOctgn(file);
        }
        var deckname = file.name.replace('.txt', '');
        var deck = this.currentdeck;
        if (file) {
            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result.replace(/(\r\n|\n|\r)/gm, ""); //strip newlines
                var encoded = contents.match(/\+{80}([A-Za-z0-9+\-\r\n]+)\+{80}/gm)[0];
                encoded = encoded.replace(/\+{80}/, "");
                var decoded = JSON.parse(LZString.decompressFromEncodedURIComponent(encoded));
                deck.load(decoded, cardObject);
                $scope.$apply();
            };
            r.readAsText(file);
        };
    };

    this.uploadOctgn = function(file) {

        var deckName = file.name.replace('.o8d', '');
        if (file) {
		// deck.clear();
		// deck.deckname = deckname;
		var deckString = '';
		var r = new FileReader();
            r.onload = function(e) {
                var regexp = /<card\s+qty="(\d)"\s+id="([0-9a-f\-]+)">/gi,
                match;

                while (match = regexp.exec(e.target.result)) {
                    for (var i in cardObject) {
                        if (cardObject[i].octgn == match[2]) {
			    var cardID = getCardID(cardObject[i]);
			    deckString = deckString+cardID+match[1];

                        }
                    }
                }
		var deckObject = {};
		deckObject.deckname = deckName;
		deckObject.deckstring = deckString;
		$scope.$apply(function() {
		    loadDeckIntoBuilder(deckObject);
		});
		
            };
            r.readAsText(file);
        };

    }

    this.localOctgn = function(_deck) {
        this.octgn($localStorage.decks[_deck.deckname].deck, _deck.deckname);
    }



}])

.factory('getDeckObjectFromDeckID',['$rootScope','$firebaseObject',function($rootScope,$firebaseObject) {
	var deckObject = function(deckID) {
		$firebaseObject($rootScope.ref.child('decks').child(deckID));
	}
	return deckObject;
}])

.factory('formDataMyLogs', function() {
	var formDataMyLogs = {};
	return formDataMyLogs;
})

.controller('myLogsCtrl', ['$rootScope','$scope','$firebaseObject','$firebaseArray','generateDeckID','getDeckObjectFromDeckID','getHeroesFromDeckString','$location','formDataMyLogs',
function($rootScope,$scope,$firebaseObject,$firebaseArray,generateDeckID,getDeckObjectFromDeckID,getHeroesFromDeckString,$location,formDataMyLogs) {
    $scope.myLogsArray = [];
    $scope.formDataMyLogs = formDataMyLogs;
    // $scope.selectOutcome = 'Success';
    // $scope.selectQuest = 'Passage Through Mirkwood';
    $scope.selectedQuest = $scope.formDataMyLogs.quest;
    $scope.loadMyLogs = function() {
	var myLogs = [];
	var allLogs = $firebaseObject($rootScope.ref.child('logs'));
	allLogs.$loaded().then(function () {
	    angular.forEach(allLogs, function(value, key){
		var logID = key;
		var logObject = value;
		if (logObject.userid == $rootScope.authData.uid)
		    myLogs.push(logObject);
	    });
	    $scope.myLogsArray = myLogs;
	});
	// var myLogIDs = $firebaseObject($rootScope.ref.child('users').child($rootScope.authData.uid).child('logids'));
	// myLogIDs.$loaded().then(function () {
	//     angular.forEach(allLogs, function(value, key){
	// 	var logID = key;
	// 	var logObject = value;
	// 	if (logObject.userid == $rootScope.authData.uid)
	// 	    myLogs.push(logObject);
	//     });
	//     $scope.myLogsArray = myLogs;
	// });

    }
    $scope.deleteLog = function(log) {
	if (confirm('Are you sure?')) {
	    $rootScope.ref.child('logs').child(log.logid).remove(function(error){
		if (error) {
		    console.log("Error:", error);
		} else {
		    console.log("Removed successfully!");
		    $rootScope.ref.child('users').child($rootScope.authData.uid).child('logids').child(log.logid).remove();
		    for (var l in log.deckids) $rootScope.ref.child('decks').child(log.deckids[l]).child('logids').child(log.logid).remove();
		    $scope.loadMyLogs();
		}
	    })
	    
	}
    }
    $scope.setSelectedQuest = function() {
	$scope.formDataMyLogs.quest = $scope.selectedQuest;
    }
    if (!$rootScope.authData) {
        return $location.path("/login");
    } else {
	$scope.loadMyLogs();

	// load logs
	//this.myDecksArray = $firebaseArray($rootScope.ref.child('users').child($rootScope.authData.uid).child('decks'));    
    };

    // Submit
    $scope.submit = function() {
	console.log("Submitting Log.");
	var logID = generateDeckID();
	var newLog = $firebaseObject($rootScope.ref.child('logs').child(logID));
	var deckIDs = [$scope.formDataMyLogs.deckid1,$scope.formDataMyLogs.deckid2,$scope.formDataMyLogs.deckid3,$scope.formDataMyLogs.deckid4];
	newLog.$loaded().then(function() {
	    newLog.logid = logID;
	    newLog.userid = $rootScope.authData.uid;
	    newLog.username = $rootScope.displayName;
	    newLog.date = $scope.formDataMyLogs.date;
	    newLog.quest = $scope.formDataMyLogs.quest;
	    newLog.outcome = $scope.formDataMyLogs.outcome;
	    newLog.score = $scope.formDataMyLogs.score;
	    newLog.deckids = [];
	    for (var d in deckIDs) 
		if (deckIDs[d]) newLog.deckids.push(deckIDs[d]);
	    if (!$scope.formDataMyLogs.notes)  $scope.formDataMyLogs.notes="";
	    newLog.notes   = $scope.formDataMyLogs.notes; 

	    var onComplete = function() {
//		$scope.loadMyLogs();
	    }
	    newLog.$save().then(function() {
		console.log('Log saved');
		if ($scope.formDataMyLogs.deckid1)
		$scope.loadMyLogs();
		$rootScope.ref.child('users').child($rootScope.authData.uid).child('logids').child(logID).set(logID,onComplete);
		for (var d in deckIDs) 
		    if (deckIDs[d])
			$rootScope.ref.child('decks').child(deckIDs[d]).child('logids').child(logID).set(logID);
	    })
	});
    }
    // On Deck ID change, validate the deck
    $scope.validateDeckID1 = function() {
	if (!$scope.formDataMyLogs.deckid1) {
	    $scope.validDeckID1 = false;
	    return false;
	}
	var setValidity1 = function(isValid) {
	    $scope.validDeckID1 = isValid;
	}
	$scope.deckObject1 = $firebaseObject($rootScope.ref.child('decks').child($scope.formDataMyLogs.deckid1));
	$scope.deckObject1.$loaded().then(function(isValid) {
	    if ($scope.deckObject1.deckid) setValidity1(true);
	    else setValidity1(false);
	});
    };
    $scope.validateDeckID2 = function() {
	if (!$scope.formDataMyLogs.deckid2) {
	    $scope.validDeckID2 = false;
	    return false;
	}
	var setValidity2 = function(isValid) {
	    $scope.validDeckID2 = isValid;
	}
	$scope.deckObject2 = $firebaseObject($rootScope.ref.child('decks').child($scope.formDataMyLogs.deckid2));
	$scope.deckObject2.$loaded().then(function(isValid) {
	    if ($scope.deckObject2.deckid) setValidity2(true);
	    else setValidity2(false);
	});
    };
    $scope.validateDeckID3 = function() {
	if (!$scope.formDataMyLogs.deckid3) {
	    $scope.validDeckID3 = false;
	    return false;
	}
	var setValidity3 = function(isValid) {
	    $scope.validDeckID3 = isValid;
	}
	$scope.deckObject3 = $firebaseObject($rootScope.ref.child('decks').child($scope.formDataMyLogs.deckid3));
	$scope.deckObject3.$loaded().then(function(isValid) {
	    if ($scope.deckObject3.deckid) setValidity3(true);
	    else setValidity3(false);
	});
    };
    $scope.validateDeckID4 = function() {
	if (!$scope.formDataMyLogs.deckid4) {
	    $scope.validDeckID4 = false;
	    return false;
	}
	var setValidity4 = function(isValid) {
	    $scope.validDeckID4 = isValid;
	}
	$scope.deckObject4 = $firebaseObject($rootScope.ref.child('decks').child($scope.formDataMyLogs.deckid4));
	$scope.deckObject4.$loaded().then(function(isValid) {
	    if ($scope.deckObject4.deckid) setValidity4(true);
	    else setValidity4(false);
	});
    };
    // My Logs
    $scope.getDeckObjects = function(log) {
	console.log(log.logid);
	var deckObjectList = [];
	for (var i in log.deckids) {
	    deckObjectList.push(getDeckObjectFromDeckID(log.deckids[i]));
	}
	return deckObjectList;
    }
}])

.factory('formDataDeckSearch', function() {
	var formDataDeckSearch = {};
	return formDataDeckSearch;
})

.factory('isCardInDeckObject',['getCardID', function(getCardID) {
    var isCardInDeckObject = function(card,deckObject) {
	var cardID = getCardID(card);
	var deckString = deckObject.deckstring;
	for (var i=0; i<=(deckString.length-4); i=i+4) {
	    if (deckString.substr(i,3)==cardID) {
//		console.log(cardID+" "+deckObject.deckstring);
		return true;
	    }
	}
	return false;
    }
    return isCardInDeckObject;
}])


.factory('getLogsByDeckID', function() {
    var getLogs = function(allLogs,deckID) {
	var deckLogs = [];
	angular.forEach(allLogs, function(value, key){
	    var log = value;
	    var deckIDs = log.deckids;
	    var deckInLog = false;
	    for (var d in deckIDs)
		if (deckIDs[d] == deckID)
		    deckInLog=true;
	    if (deckInLog) deckLogs.push(log);
	});
	return deckLogs;
    }
    return getLogs;
})

// Determines if the user has access to the card (including quatity in the case of core set cards)
.factory('hasAccess',['filtersettings',function(filtersettings) {
    var hasAccess = function(card) {
	if (filtersettings.pack.indexOf(card.exp)<0)
	    return false;
	if (filtersettings.onecore && (card.quantity>card.corequantity))
	    return false;
	if (filtersettings.twocore && (card.quantity>2*card.corequantity))
	    return false;
	return true;
    }
    return hasAccess;
}])

// Controller for the community tab
.controller('communityCtrl', ['$rootScope','$scope','$firebaseObject','getDeckObjectFromDeckID','formDataDeckSearch','isCardInDeckObject','image','getLogsByDeckID','getHeroesFromDeckString','filtersettings','getLocalObjectFromString','hasAccess',
function($rootScope,$scope,$firebaseObject,getDeckObjectFromDeckID,formDataDeckSearch,isCardInDeckObject,image,getLogsByDeckID,getHeroesFromDeckString,filtersettings,getLocalObjectFromString,hasAccess) {
    $scope.formDataDeckSearch = formDataDeckSearch;
    $scope.selectedQuest = $scope.formDataDeckSearch.quest;
    $scope.image = image;
    $scope.isWordInString = function(word,string) {
        return (string.indexOf(word)>-1);
    };
    $scope.setSelectedQuest = function() {
	console.log($scope.selectedQuest)
	$scope.formDataDeckSearch.quest = $scope.selectedQuest;
    }
    $scope.searching = false;
    // Submit
    $scope.submit = function() {
	console.log("Searching decks.");
	$scope.searching = true;
	$scope.formDataDeckSearch.searchResultsArray = [];
	var allDecks = $firebaseObject($rootScope.ref.child('decks'));
	var allLogs = $firebaseObject($rootScope.ref.child('logs'));

	var filterDecks = function(_allDecks,_allLogs) {
	    angular.forEach(_allDecks, function(value, key){
		var deckID = key;
		var deckObject = value;
		var localObject = getLocalObjectFromString(deckObject.deckstring);
		var match=true;
		if ((match==true) && $scope.formDataDeckSearch.deckName) {
		    match=false;
	    	    if ($scope.isWordInString(formDataDeckSearch.deckName.toLowerCase(),deckObject.deckname.toLowerCase()))
			match=true;
		}
		if ((match==true) && $scope.formDataDeckSearch.userName) {
		    match=false;
	    	    if ($scope.isWordInString(formDataDeckSearch.userName.toLowerCase(),deckObject.username.toLowerCase()))
			match=true;
		}
		if ((match==true) && $scope.formDataDeckSearch.quest) {
		    match=false;
		    var deckLogsList = getLogsByDeckID(_allLogs,deckID);
		    for (var l in deckLogsList)
			if (formDataDeckSearch.quest == deckLogsList[l].quest && deckLogsList[l].outcome == 'Success')
			    match=true;
		}
		if ((match==true) && (localObject.countTotal()<50) && !$scope.formDataDeckSearch.lessThanFifty) {
		    match=false;
		}
		if ((match==true) && $scope.formDataDeckSearch.cardMatch) {
		    match=false;
		    if (isCardInDeckObject(image.card,deckObject))
			match=true;
		}
		if ((match==true) && $scope.formDataDeckSearch.setMatch) {
		    var types = ["1hero","2ally","3attachment","4event","5quest"]
		    for (var t in types){
			var type = types[t];
			for (var c in localObject[type]){
			    var card = localObject[type][c];
			    if (!hasAccess(card)) match=false;
			}
		    }
		}
		if (match) $scope.formDataDeckSearch.searchResultsArray.push(deckObject);
	    })
	}
	allDecks.$loaded().then(function() {
	    allLogs.$loaded().then(function() {
		console.log("Decks loaded.");
		filterDecks(allDecks,allLogs);
		console.log("Decks searched.");
		$scope.searching = false;
	    });
	});
    }
    // Search results
    $scope.getHeroes = function(deckString) {
	return getHeroesFromDeckString(deckString);
    }
    $scope.changepreview = function(card) {
	$scope.image.update(card);
    };


}])


;

