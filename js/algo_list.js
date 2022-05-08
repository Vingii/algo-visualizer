/* exported makeCards, fillNav */

var names = ["Searching", "Sorting", "Graphs"];
var descs = ["Algorithms for finding an element of an ordered list given its value.",
	"Algorithms for sorting a list by the value of its elements.",
	"Graph traversal algorithms."];
var links = ["search", "sort", "graph"];

function makeCards() {
	for (var i = 0; i < names.length; i++) {
		document.getElementById('card-deck').insertAdjacentHTML('beforeend', '<div class="col mt-3"><div class="card text-white bg-primary h-100"><div class="card-body"><h4 class="card-title">'
			+ names[i] + '</h4><p class="card-text">' + descs[i] + '</p><a href="./algo.html?algo=' + links[i] + '" class="stretched-link"></a></div></div></div>');
	}
}

function fillNav() {
	for (var i = 0; i < names.length; i++) {
		document.getElementById('navbar-algo').insertAdjacentHTML('beforeend', '<a href="./algo.html?algo=' + links[i] + '" class="dropdown-item">' + names[i] + '</a>');
	}
}