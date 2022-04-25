var names = ["Selection", "Sorting", "Graphs", "Trees", "Geometry"]
var descs = ["Algorithms for finding an element of an ordered list given its value.", "Algorithms for sorting a list by a value.", "Graph traversal algorithms.", "Tree traversal algorithms.", "Computational and simplicial geometry."]
var links = ["selection", "sorting", "graphs", "trees", "geometry"]

function makeCards() {
	for (var i = 0; i < names.length; i++) {
		document.getElementById('card-deck').innerHTML += '<div class="col mt-3"><div class="card text-white bg-secondary h-100"><div class="card-body"><h4 class="card-title">'
			+ names[i] + '</h4><p class="card-text">' + descs[i] + '</p><a href="' + links[i] + '.html" class="stretched-link"></a></div></div></div>';
	}
};

function fillNav() {
	for (var i = 0; i < names.length; i++) {
		document.getElementById('navbar-algo').innerHTML += '<a href="/' + links[i] + '.html" class="dropdown-item">' + names[i] + '</a>';
	}
}