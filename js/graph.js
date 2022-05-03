let active = new Set();

const name_common = "Graphs";
const variants = ["Disjoint set union", "Kruskal", "Dijkstra",
    "Ford-Fulkerson", "Topological sort", "Floyd-Warshall", "Blossom"];
const task = ["Count the number of connected components.", "Find a minimum spanning tree.", "Find a shortest path between two vertices.",
    "Calculate a maximum flow.", "Decide if a graph is a forest.", "Calculate the minimal distance between every pair of vertices.", "Find a maximum matching."];
const descriptions = [
    "Consider each vertex a disjoint set, then perform a disjoint-set union for each edge.",
    "Repeatedly try adding the lowest-weight edge while not creating loops.",
    "DFS with a priority queue based on shorted path from source.",
    "Start with zero flow. Increase the flow along augmenting paths until none is found.",
    "Sort the vertices such that u<v implies that there is no path from v to u. Such order exists iff there is no directed cycle.",
    "Recursively compute the shortest paths u -> v using only vertices from 1 to w.",
    "Start with an empty matching. Repeatedly improve the matching along augmenting paths."
];
const specs = [
    { "Worst time": "O(|E|log(|V|))", "Constraints": "Undirected." },
    { "Worst time": "O(|V|+|E|)", "Constraints": "Undirected." },
    { "Worst time": "O(|E|+|V|log(|V|))", "Constraints": "Non-negative weights.", "Note": "Can be modified for negative weights and O(|V||E|) time. (See Bellman-Ford.)" },
    { "Worst time": "O(|V||E|<sup>2</sup>)", "Constraints": "Integral weights." },
    { "Worst time": "O(|V|+|E|)", "Constraints": "None." },
    { "Worst time": "O(|V|<sup>3</sup>)", "Constraints": "No negative cycles. (Detects them.)", "Note": "Can be modified to extract the shortest paths." },
    { "Worst time": "O(|V|<sup>2</sup>|E|)", "Constraints": "None." },
]

//controls

document.getElementById('vis-parameters').insertAdjacentHTML('beforeend', //fill parameters
    ''); //TODO

//simulation
class Graph {
    //TODO
}

class Frame {
    constructor() { //TODO
        this.values = [...values];
        this.active = new Set(active);
        this.sorted = new Set(sorted);
        if (additional) this.additional = [...additional];
    };
};

function create_frames(variant) { //TODO
    let frames = [];
    active = [];

    switch (variant) {
        case "0":
            break;
    }
    return frames;
};

function render_frame(variant, frame) {
    //TODO
};