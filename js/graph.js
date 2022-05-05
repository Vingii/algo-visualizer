let active = new Set();
let source = 0;
let sink = 0;
let weight = 1;

const name_common = "Graphs";
const variants = ["Disjoint set union", "Kruskal", "Dijkstra",
    "Ford-Fulkerson", "Topological sort"];
const task = ["Find the connected components.", "Find a minimum spanning tree (forest).", "Find a shortest path between two vertices.",
    "Calculate a maximum flow.", "Decide if a graph is a forest."];
const descriptions = [
    "Consider each vertex a disjoint set, then perform a disjoint-set union for each edge.",
    "Repeatedly try adding the lowest-weight edge while not creating loops.",
    "DFS with a priority queue based on shorted path from source.",
    "Start with zero flow. Increase the flow along augmenting paths until none is found.",
    "Sort the vertices such that u<v implies that there is no path from v to u. Such order exists iff there is no directed cycle."
];
const specs = [
    { "Worst time": "O(|E|log(|V|))", "Constraints": "Undirected." },
    { "Worst time": "O(|V|+|E|)", "Constraints": "Undirected." },
    { "Worst time": "O(|E|+|V|log(|V|))", "Constraints": "Non-negative weights.", "Note": "Can be modified for negative weights and O(|V||E|) time. (See Bellman-Ford.)" },
    { "Worst time": "O(|V||E|<sup>2</sup>)", "Constraints": "Integral weights." },
    { "Worst time": "O(|V|+|E|)", "Constraints": "None." }
]

//controls

//radio

document.getElementById('vis-parameters').insertAdjacentHTML('beforeend',
    '<label class="form-label mt-1">Graph edit mode</label><br>\
<div class="form-check-inline">\
 <input class="form-check-input" type="radio" name="modeRadio" id="modeRadio0" value="0" checked>\
 <label class="form-check-label" for="modeRadio0">\
 Vertex\
 </label>\
</div>\
<div class="form-check-inline">\
 <input class="form-check-input" type="radio" name="modeRadio" id="modeRadio1" value="1">\
 <label class="form-check-label" for="modeRadio1">\
 Edge\
 </label>\
 <div class="form-check-inline">\
  <input class="form-check-input" type="radio" name="modeRadio" id="modeRadio2" value="2" disabled>\
  <label class="form-check-label" for="modeRadio02">\
  Edge Active\
  </label>\
</div>');

$('#vis-parameters').on('input', '[name="modeRadio"]:checked', function (e) {
    canvas_visible.set_mode(parseInt($(e.target).val()));
});

//weight input

document.getElementById('vis-parameters').insertAdjacentHTML('beforeend',
    '<div class="input-group mt-1">\
    <label class="input-group-text">Weight</label>\
    <button class="btn btn-danger" type="button" id="button-weight-down" onclick="weight_down()">-</button>\
    <input type="text" class="form-control" value="1" id="weight-input" disabled>\
    <button class="btn btn-success" type="button" id="button-weight-up" onclick="weight_up()">+</button>\
</div>');

function weight_up() {
    let old = parseInt(document.getElementById('weight-input').getAttribute("value"));
    document.getElementById('weight-input').setAttribute("value", old + 1);
    weight += 1;
};

function weight_down() {
    if (weight > 1) {
        let old = parseInt(document.getElementById('weight-input').getAttribute("value"));
        document.getElementById('weight-input').setAttribute("value", old - 1);
        weight -= 1;
    }
    else {
        $("#weight-input").effect("highlight", { color: "red" }, 500);
    }
};

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
            this.adj[i].splice(u, 1);
        }
        this.adj.splice(u, 1);
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
    constructor(v_active, v_complete, e_active, e_complete, v_values, v_failed, e_failed, flow) {
        this.v_active = new Set(v_active);
        this.v_complete = new Set(v_complete);
        this.e_active = [...e_active];
        this.e_complete = [...e_complete];
        if (v_values) this.v_values = [...v_values];
        if (v_failed) {
            this.v_failed = new Set(v_failed)
        }
        else {
            this.v_failed = new Set();
        };
        if (e_failed) {
            this.e_failed = [...e_failed];
        }
        else {
            this.e_failed = [];
        };
        if (flow) this.flow = flow;
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

    if (['0', '1'].includes(variant)) {
        show_oriented(false);
    }
    else {
        show_oriented(true);
    }

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
                for (var i = 0; i < go.size; i++) {
                    if (values[i] < values[active] && values[i] >= 0 && values[i] < Infinity) {
                        active = i;
                        val_empty = false;
                    }
                }
                frames.push(new Frame([active], v_complete, [], [], values));
                let nei = go.neighbours(active);
                for (var i = 0; i < nei.length; i++) {
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
                    let active = v_queue.shift(); //should be a proper queue
                    let nei = go.neighbours(active);
                    let nei_inv = go.neighbours_inverse(active);
                    for (var i = 0; i < nei.length; i++) {
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
                            e_active.push([prev, v]);
                            flow.table[prev][v] += improvement;
                            flow.table[v][prev] -= improvement;
                        }
                        else {
                            e_active.push([v, prev]);
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
        case "4": { // Topsort
            let values = new Array(go.size);
            let e_unused = go.edges();
            let e_used = [];
            let sources = [];
            let v_complete = new Set();
            for (var i = 0; i < go.size; i++) {
                if (go.neighbours_inverse(i).length = 0) {
                    sources.push(i);
                };
            };
            let cur = 0;
            while (sources.length > 0) {
                let active = sources.shift(); //should be a proper queue
                let nei = go.neighbours(active);
                frames.push(new Frame([active], v_complete, [], e_used, values));
                values[active] = cur;
                cur += 1;
                frames.push(new Frame([active], v_complete, [], e_used, values));
                for (var i = 0; i < nei.length; i++) {
                    e_used.push([active, nei[i]]);
                    frames.push(new Frame([active], v_complete, [], e_used, values));
                    var j = 0;
                    while (e_unused[j][0] != active || e_unused[j][1] != nei[i]) {
                        j += 1;
                    }
                    e_unused.splice(j, 1);

                    var became_source = true;
                    for (var j = 0; j < e_unused; j++) {
                        if (e_unused[j][1] == nei[i]) {
                            became_source = false;
                            break;
                        }
                    }
                    if (became_source) {
                        sources.push(nei[i]);
                    }
                };
                v_complete.add(active);
            }
            if (e_unused.length > 0) {
                frames.push(new Frame([], [], [], [], values, v_complete, e_used));
            }
            else {
                frames.push(new Frame([], v_complete, [], e_used, values));
            };
            break;
        };
    };
    return frames;
};

let g = new Graph(false);
let go = new Graph(true);

//visualization
class Vertex {
    constructor(path, x, y) {
        this.path = path;
        this.x = x;
        this.y = y;
    }
}

class Edge {
    constructor(path, from, to, weight) {
        this.path = path;
        this.from = from;
        this.to = to;
        this.weight = weight;
    }
}
class Canvas {
    constructor(element, graph) {
        this.element = element;
        this.graph = graph;
        this.ctx = this.element.getContext('2d');
        this.vertices = []; //must be compatible with this.graph.vertices
        this.edges = [];
        this.mode = 0; //0-vertex, 1-edge adding/removing, 2-mid edge addding
        this.active = -1; //first clicked vertex in edge mode
        this.vertex_radius = 20;
        //click listener
        this.element.addEventListener('click', function (event) {
            event = event || window.event;
            switch (this.mode) {
                case 0: {
                    var clicked_vertex = false;
                    for (var i = 0; i < this.vertices.length; i++) {
                        if (this.ctx.isPointInPath(this.vertices[i].path, event.offsetX, event.offsetY)) {
                            this.remove_vertex(i);
                            clicked_vertex = true;
                            break;
                        }
                    }
                    if (!clicked_vertex) this.create_vertex(event.offsetX, event.offsetY);
                    break;
                };
                case 1: {
                    for (var i = 0; i < this.vertices.length; i++) {
                        if (this.ctx.isPointInPath(this.vertices[i].path, event.offsetX, event.offsetY)) {
                            this.set_mode(2, i);
                            break;
                        };
                    };
                    break;
                };
                case 2: {
                    for (var i = 0; i < this.vertices.length; i++) {
                        if (this.ctx.isPointInPath(this.vertices[i].path, event.offsetX, event.offsetY) && this.active != i) {
                            this.create_remove_edge(this.active, i, weight);
                            this.set_mode(1);
                            break;
                        };
                    };
                    break;
                };
            };
        }.bind(this));
        //hover listener
        this.element.addEventListener('mousemove', function (event) {
            event = event || window.event;
            for (var i = 0; i < this.vertices.length; i++) {
                if (this.ctx.isPointInPath(this.vertices[i].path, event.offsetX, event.offsetY)) {
                    this.element.style.cursor = 'pointer';
                    return;
                }
            }
            this.element.style.cursor = 'default';
        }.bind(this));
    }
    has_edge(arr, edge) {
        let edge_from = 0;
        let edge_to = 0;
        for (var i = 0; i < this.vertices.length; i++) {
            if (edge.from == this.vertices[i]) {
                edge_from = i;
            }
            if (edge.to == this.vertices[i]) {
                edge_from = i;
            }
        }
        for (var i = 0; i < arr.length; i++) {
            if ((arr[i][0] == edge_from && arr[i][1] == edge_to) || (arr[i][1] == edge_from && arr[i][0] == edge_to)) {
                return true;
            };
        };
        return false;
    };
    redraw(frame) {
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
        this.ctx.lineWidth = 8;
        this.ctx.font = '36px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        for (var i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            this.ctx.strokeStyle = "darkgray";
            if (frame) {
                if (this.has_edge(frame.e_active, edge)) {
                    this.ctx.strokeStyle = "orange";
                }
                else if (this.has_edge(frame.e_complete, edge)) {
                    this.ctx.strokeStyle = "green";
                }
                else if (this.has_edge(frame.e_failed, edge)) {
                    this.ctx.strokeStyle = "red";
                }
                else {
                    this.ctx.strokeStyle = "darkgray";
                };
            };
            this.ctx.stroke(edge.path);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(edge.weight, (edge.from.x + edge.to.x) / 2, (edge.from.y + edge.to.y) / 2);
        };
        if (frame && frame.flow) {
            this.ctx.fillStyle = "darkred";
            for (i = 0; i < frame.flow.table.length; i++) {
                for (j = 0; j < frame.flow.table.length; j++) {
                    if (this.graph.get_weight(i, j) != 0) {
                        this.ctx.fillText(frame.flow.table[i, j], (0.5 * edge.from.x + 1.5 * edge.to.x) / 2, (0.5 * edge.from.y + 1.5 * edge.to.y) / 2);
                    }
                };
            };
        };
        this.ctx.lineWidth = 5;
        for (var i = 0; i < this.vertices.length; i++) {
            this.ctx.strokeStyle = "black";
            this.ctx.fillStyle = 'darkgray';
            if (frame) {
                if (frame.v_active.has(i)) {
                    this.ctx.strokeStyle = "orange";
                    this.ctx.fillStyle = 'gold';
                }
                else if (frame.v_complete.has(i)) {
                    this.ctx.strokeStyle = "green";
                    this.ctx.fillStyle = 'lightgreen';
                }
                else if (frame.v_failed.has(i)) {
                    this.ctx.strokeStyle = "red";
                    this.ctx.fillStyle = 'lightcoral';
                }
                else {
                    this.ctx.strokeStyle = "black";
                    this.ctx.fillStyle = 'darkgray';
                };
            };
            this.ctx.stroke(this.vertices[i].path);
            this.ctx.fill(this.vertices[i].path);
            if (frame && frame.v_values) {
                this.ctx.fillStyle = "black";
                this.ctx.fillText(frame.v_values[i], this.vertices[i].x, this.vertices[i].y);
            };
        };
    };
    create_vertex(x, y) {
        let safe = true;
        for (var i = 0; i < this.vertices.length; i++) {
            if ((this.vertices[i].x - x) ** 2 + (this.vertices[i].y - y) ** 2 < 4 * (this.vertex_radius + 5) ** 2) {
                safe = false;
            }
        }
        if (safe) {
            let vertex = new Path2D();
            vertex.arc(x, y, this.vertex_radius, 0, 2 * Math.PI);
            this.vertices.push(new Vertex(vertex, x, y));
            this.graph.add_vertex();
            this.redraw();
            load_simu();
        }
    }
    create_remove_edge(u, v, weight) {
        if (this.graph.get_weight(u, v) != 0) { //remove
            if (this.graph.oriented) {
                for (var i = 0; i < this.edges.length; i++) {
                    if (this.edges[i].from == this.vertices[u] && this.edges[i].to == this.vertices[v]) {
                        this.edges.splice(i, 1);
                    };
                };
            }
            else {
                for (var i = 0; i < this.edges.length; i++) {
                    if ((this.edges[i].from == this.vertices[u] && this.edges[i].to == this.vertices[v]) || (this.edges[i].from == this.vertices[v] && this.edges[i].to == this.vertices[u])) {
                        this.edges.splice(i, 1);
                    };
                };
            };
            this.graph.remove_edge(u, v);
        }
        else if (weight != 0) { //add
            let edge = new Path2D();
            if (this.graph.oriented) {
                if (this.graph.get_weight(v, u) != 0) return;
                let dx = this.vertices[v].x - this.vertices[u].x;
                let dy = this.vertices[v].y - this.vertices[u].y;
                let angle = Math.atan2(dy, dx);
                edge.moveTo(this.vertices[u].x, this.vertices[u].y);
                edge.lineTo(this.vertices[v].x, this.vertices[v].y);
                edge.moveTo((this.vertices[u].x + this.vertices[v].x) / 2, (this.vertices[u].y + this.vertices[v].y) / 2);
                edge.lineTo((this.vertices[u].x + this.vertices[v].x) / 2 - 30 * Math.cos(angle - Math.PI / 6), (this.vertices[u].y + this.vertices[v].y) / 2 - 30 * Math.sin(angle - Math.PI / 6));
                edge.moveTo((this.vertices[u].x + this.vertices[v].x) / 2, (this.vertices[u].y + this.vertices[v].y) / 2);
                edge.lineTo((this.vertices[u].x + this.vertices[v].x) / 2 - 30 * Math.cos(angle + Math.PI / 6), (this.vertices[u].y + this.vertices[v].y) / 2 - 30 * Math.sin(angle + Math.PI / 6));
            }
            else {
                edge.moveTo(this.vertices[u].x, this.vertices[u].y);
                edge.lineTo(this.vertices[v].x, this.vertices[v].y);
            };
            this.edges.push(new Edge(edge, this.vertices[u], this.vertices[v], weight));
            this.graph.add_edge(u, v, weight);
        };
        this.redraw();
        load_simu();
    }
    remove_vertex(u) {
        var new_edges = [];
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].from != this.vertices[u] && this.edges[i].to != this.vertices[u]) {
                new_edges.push(this.edges[i]);
            }
        };
        this.edges = new_edges;
        this.vertices.splice(u, 1);
        this.graph.remove_vertex(u);
        this.redraw();
        load_simu();
    }
    set_mode(new_mode, active) {
        if (new_mode != this.mode) {
            if (typeof active != "undefined" && active != -1) {
                this.active = active;
            }
            else {
                this.active = -1;
            }
            this.mode = new_mode;
            this.set_description();
        }
        set_radio();
    }
    set_description() {
        let text = '';
        switch (this.mode) {
            case 0:
                text = 'Click to add/remove a vertex.';
                break;
            case 1:
                text = 'Click to add/remove an edge.';
                break;
            case 2:
                text = 'Select a second vertex.';
                break;
        };
        document.getElementById('vis-top').innerText = text;
    }
};

document.getElementById('vis-panel').innerHTML = '<canvas id="vis-canvas"></canvas>';
document.getElementById('vis-bot').innerHTML = '<canvas id="vis-canvas-oriented"></canvas>';
document.getElementById('vis-top').removeAttribute("hidden");
document.getElementById('vis-top').style = "";
const canvas = new Canvas(document.getElementById('vis-canvas'), g);
const canvas_oriented = new Canvas(document.getElementById('vis-canvas-oriented'), go);
var canvas_visible = canvas;

$(window).resize(function () {
    fix_size();
});

function fix_size() {
    canvas.element.width = document.getElementById('vis-panel').offsetWidth;
    canvas.element.height = document.getElementById('vis-panel').offsetHeight;
    canvas_oriented.element.width = document.getElementById('vis-bot').offsetWidth;
    canvas_oriented.element.height = document.getElementById('vis-bot').offsetHeight;
    canvas.redraw();
    canvas_oriented.redraw();
};

function show_oriented(oriented) {
    if (oriented) {
        show_mid(false);
        show_bot(true);
        canvas_oriented.element.removeAttribute("hidden");
        canvas.element.setAttribute("hidden", "");
        canvas_oriented.set_description();
        canvas_visible = canvas_oriented;
        fix_size();
    }
    else {
        show_mid(true);
        show_bot(false);
        canvas.element.removeAttribute("hidden");
        canvas_oriented.element.setAttribute("hidden", "");
        canvas.set_description();
        canvas_visible = canvas;
        fix_size();
    }
    set_radio();
};

function set_radio() {
    document.getElementsByName("modeRadio").forEach(function (e) {
        if (parseInt(e.getAttribute("value")) == canvas_visible.mode) {
            e.checked = true;
        }
        else {
            e.checked = false;
        };
    });
};

function render_frame(variant, frame) {
    canvas_visible.redraw(frame);
};