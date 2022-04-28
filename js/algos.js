var names = ["Searching"];
var descs = ["Algorithms for finding an element of an ordered list given its value."];
var links = ["search"];

function makeCards() {
	for (var i = 0; i < names.length; i++) {
		document.getElementById('card-deck').innerHTML += '<div class="col mt-3"><div class="card text-white bg-primary h-100"><div class="card-body"><h4 class="card-title">'
			+ names[i] + '</h4><p class="card-text">' + descs[i] + '</p><a href="' + links[i] + '.php" class="stretched-link"></a></div></div></div>';
	};
};

function fillNav() {
	for (var i = 0; i < names.length; i++) {
		document.getElementById('navbar-algo').innerHTML += '<a href="/' + links[i] + '.html" class="dropdown-item">' + names[i] + '</a>';
	};
};