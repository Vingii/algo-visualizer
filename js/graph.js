let active = new Set();
let source = 0;
let sink = 0;

const name_common = "Graphs";
const variants = ["Disjoint set union", "Kruskal", "Dijkstra",
    "Ford-Fulkerson", "Topological sort", "Floyd-Warshall", "Blossom"];
const task = ["Count the number of connected components.", "Find a minimum spanning tree (forest).", "Find a shortest path between two vertices.",
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
    constructor(oriented) {
        this.size = 0;
        this.adj = []; //adjacency matrix
        this.oriented = oriented;
    }
    add_vertex() {
        this.adj.push(Array(this.size).fill(0));
        this.size += 1;
        for (var i = 0; i < this.size; i++) {
            this.adj[i].push(0);
        }
    }
    add_edge(u, v, weight) {
        this.adj[u][v] = weight;
        if (!this.oriented) this.adj[v][u] = weight;
    }
    remove_vertex(u) {
        for (var i = 0; i < this.size; i++) {
            this.adj[i].splice(u);
        }
        this.adj.splice(u);
        this.size -= 1;
    }
    remove_edge(u, v) {
        this.adj[u][v] = 0;
        if (!this.oriented) this.adj[v][u] = 0;
    }
    get_weight(u, v) {
        return this.adj[u][v];
    }
    neighbours(u) {
        let nei = [];
        for (var i = 0; i < this.size; i++) {
            if (this.adj[u][i] != 0) {
                nei.push(i);
            }
        }
        return nei;
    }
    neighbours_ordered(u) {
        return this.neighbours(u).sort(function (a, b) {
            this.adj[u, a] - this.adj[u, b];
        });
    }
    neighbours_inverse(u) {
        let nei = [];
        for (var i = 0; i < this.size; i++) {
            if (this.adj[i][u] != 0) {
                nei.push(i);
            }
        }
        return nei;
    }
    edges() {
        let edg = [];
        if (this.oriented) {
            for (var i = 0; i < this.size; i++) {
                for (var j = 0; i < this.size; i++) {
                    if (this.adj[i][j] != 0) {
                        edg.push([i, j]);
                    }
                }
            }
        }
        else {
            for (var i = 0; i < this.size; i++) {
                for (var j = i + 1; i < this.size; i++) {
                    if (this.adj[i][j] != 0) {
                        edg.push([i, j]);
                    }
                }
            }
        }
        return edg;
    }
    edges_ordered() {
        return this.edges().sort(function (a, b) {
            this.adj[a[0], a[1]] - this.adj[b[0], b[1]];
        });
    }
}

class Frame {
    constructor(v_active, v_complete, e_active, e_complete, v_values, v_failed, e_failed, additional) {
        this.v_active = new Set(v_active);
        this.v_complete = new Set(v_complete);
        this.e_active = [...e_active];
        this.e_complete = [...e_complete];
        if (v_values) this.v_values = [...v_values];
        if (v_failed) this.v_failed = new Set(v_failed);
        if (e_failed) this.e_failed = [...e_failed];
        if (additional) this.additional = additional;
    }
};

class Flow {
    constructor(total, table) {
        this.total = total;
        this.table = [];
        for (var i = 0; i < table.length; i++)
            this.table[i] = table[i].slice();
    };
}

function create_frames(variant) {
    let frames = [];

    switch (variant) {
        case "0": { // Disjoint set union
            let values = new Array(g.size);
            let edges = g.edges();
            let e_complete = [];

            for (var i = 0; i < g.size; i++) {
                values[i] = i;
            };
            frames.push(new Frame([], [], [], [], values));
            for (var i = 0; i < edges.length; i++) {
                var sm = Math.min(values[edges[i][0]], values[edges[i][1]]);
                var lg = Math.max(values[edges[i][0]], values[edges[i][1]]);
                frames.push(new Frame([], [], [edges[i]], e_complete, values));
                for (var j = 0; j < edges.length; j++) {
                    if (values[j] == lg) {
                        values[j] = sm;
                    }
                }
                frames.push(new Frame([], [], [edges[i]], e_complete, values));
                e_complete.push(edges[i]);
            }
            frames.push(new Frame([], [], [], e_complete, values));
            break;
        };
        case "1": { // Kruskal
            let values = new Array(g.size);
            let edges = g.edges_ordered();
            let e_complete = [];
            let e_failed = [];

            for (var i = 0; i < g.size; i++) {
                values[i] = i;
            };
            frames.push(new Frame([], [], [], [], values));
            for (var i = 0; i < edges.length; i++) {
                var sm = Math.min(values[edges[i][0]], values[edges[i][1]]);
                var lg = Math.max(values[edges[i][0]], values[edges[i][1]]);
                frames.push(new Frame([], [], [edges[i]], e_complete, values, [], e_failed));
                if (lg == sm) {
                    e_failed.push(edges[i]);
                }
                else {
                    e_complete.push(edges[i]);
                    for (var j = 0; j < edges.length; j++) {
                        if (values[j] == lg) {
                            values[j] = sm;
                        }
                    }
                };
                frames.push(new Frame([], [], [edges[i]], e_complete, values, [], e_failed));
            }
            frames.push(new Frame([], [], [], e_complete, values, [], e_failed));
            break;
        };
        case "2": { // Dijkstra
            let values = new Array(go.size).fill(Infinity);
            let previous = new Array(go.size);
            let v_complete = new Set();
            let active = source;
            let val_empty = false;
            values[source] = 0;

            while (!val_empty && values[sink] != -1) { //should use proper priority queue
                val_empty = true;
                active = 0;
                for (i = 0; i < go.size; i++) {
                    if (values[i] < values[active] && values[i] >= 0 && values[i] < Infinity) {
                        active = i;
                        val_empty = false;
                    }
                }
                frames.push(new Frame([active], v_complete, [], [], values));
                let nei = go.neighbours(active);
                for (i = 0; i < nei.length; i++) {
                    let v = nei[i];
                    frames.push(new Frame([active], v_complete, [[active, v]], [], values));
                    let val_new = values[active] + go.get_weight(active, v);
                    if (val_new < values[v]) {
                        values[v] = val_new;
                        previous[v] = active;
                        frames.push(new Frame([active], v_complete, [[active, v]], [], values));
                    };
                };
                values[active] = -1;
                v_complete.add(active);
                frames.push(new Frame([], v_complete, [], [], values));
            };

            if (values[sink] != -1) {
                frames.push(new Frame([], [], [], [], values, v_complete));
            }
            else {
                v_complete = new Set();
                active = sink;
                while (active != source) {
                    v_complete.add(active);
                    active = previous[active];
                }
                v_complete.add(active);
                frames.push(new Frame([], v_complete, [], [], values));
            };
            break;
        };
        case "3": { // Ford-Fulkerson
            let flow = new Flow(0, Array.from(Array(go.size), () => new Array(go.size).fill(0)));
            let found_augment = true;
            while (found_augment) {
                frames.push(new Frame([], [], [], [], [], [], [], structuredClone(flow)));
                //find augmenting path
                let v_queue = [source];
                let previous = new Array(go.size);
                let previous_dir = new Array(go.size);
                while (v_queue.length > 0) {
                    let active = v_queue.shift()
                    let nei = go.neighbours(active);
                    let nei_inv = go.neighbours_inverse(active);
                    for (i = 0; i < nei.length; i++) {
                        let v = nei[i];
                        if (typeof previous[v] == 'undefined' && v != source && go.get_weight(active, v) > flow.table[active][v]) {
                            previous[v] = active;
                            previous_dir[v] = true;
                            v_queue.push(v);
                            if (v == sink) break;
                        };
                    };
                    for (i = 0; i < nei_inv.length; i++) {
                        let v = nei[i];
                        if (typeof previous[v] == 'undefined' && v != source && 0 < flow.table[v][active]) {
                            previous[v] = active;
                            previous_dir[v] = false;
                            v_queue.push(v);
                            if (v == sink) break;
                        };
                    };
                };
                //calculate flow
                let e_active = [];
                let v_active = new Set();
                if (typeof previous[sink] == 'undefined') {
                    found_augment = false;
                }
                else {
                    found_augment = true;
                    let improvement = Infinity;
                    let v = sink;
                    while (v != source) {
                        let prev = previous[v];
                        if (previous_dir[prev]) {
                            improvement = Math.min(improvement, go.get_weight(prev, v) - flow.table[prev][v]);
                        }
                        else {
                            improvement = Math.min(improvement, flow[v][prev]);
                        };
                    }
                    v = sink;
                    while (v != source) {
                        let prev = previous[v];
                        v_active.add(v);
                        if (previous_dir[prev]) {
                            e_active.push([prev,v]);
                            flow.table[prev][v] += improvement;
                            flow.table[v][prev] -= improvement;
                        }
                        else {
                            e_active.push([v,prev]);
                            flow.table[prev][v] -= improvement;
                            flow.table[v][prev] += improvement;
                        };
                    }
                    v_active.add(source);
                    frames.push(new Frame(v_active, [], e_active, [], [], [], [], structuredClone(flow)));
                    flow.total += improvement;
                    frames.push(new Frame(v_active, [], e_active, [], [], [], [], structuredClone(flow)));
                };
            };
            frames.push(new Frame([], [], [], [], [], [], [], structuredClone(flow)));
            break;
        };
        case "4": // Topsort
            //TODO
            break;
        case "5": //Floyd-Wardshall
            //TODO
            break;
        case "6": // Blossom
            //TODO
            break;
    }
    return frames;
};

function render_frame(variant, frame) {
    //TODO
};

let g = new Graph(false);
let go = new Graph(true);