const min = 4;
const max = 30;
let size = 8;
let active = new Set();
let init_values = [];
let detailed = false;
const bar_template = "<div class=\"shadow w-100 mx-auto bg-info text-center rounded\" style=\"height:~h~%\;min-height:25px\">~val~</div>";

const name_common = "Sorting";
const variants = ["Select sort", "Insert sort", "Heap sort", "Merge sort", "Quick sort", "Radix sort"];
const task = Array(variants.length).fill("Given an unordered list, sort it by the value of its elements, ascending.");
const descriptions = [
    "Keeps ordered and unordered part. In each step, finds the least element of the unordered part.",
    "Keeps ordered and unordered part. In each step, finds a spot for the first element of the unordered part.",
    "Constructs a heap from the list and repeatedly extracts the greatest element.",
    "Keeps ordered parts of progressively increasing length. In each step, merges 2 ordered parts of length k into an ordered list of length 2k.",
    "Recursively in each step, chooses a random element and divides the remaining list into a list of smaller and a list of bigger values.",
    "Counts the appearences of each value, then creates this many elements of this value."
];
const specs = [
    { "Average time": "O(n<sup>2</sup>)", "Worst time": "O(n<sup>2</sup>)", "Space": "O(1)", "Stable": "No", "Online": "No" },
    { "Average time": "O(n<sup>2</sup>)", "Worst time": "O(n<sup>2</sup>)", "Space": "O(1)", "Stable": "Yes", "Online": "Yes" },
    { "Average time": "O(nlog(n))", "Worst time": "O(nlog(n))", "Space": "O(1)", "Stable": "No", "Online": "No" },
    { "Average time": "O(nlog(n))", "Worst time": "O(nlog(n))", "Space": "O(n)", "Stable": "Yes", "Online": "No" },
    { "Average time": "O(nlog(n))", "Worst time": "O(n<sup>2</sup>)", "Space": "O(log(n))", "Stable": "No", "Online": "No" },
    { "Average time": "O(n+m)", "Worst time": "O(n+m)", "Space": "O(n+m)", "Stable": "Yes", "Online": "No", "Note": "m denotes maximal value in the list." }
];

//controls

document.getElementById('vis-parameters').insertAdjacentHTML('beforeend', //fill parameters
    '<label for="sizeRange" class="form-label mt-1">Size</label><input type="range" class="form-range" min="4" max="' + max + '" step="1" value="' + size + '" id="sizeRange">' +
    '<div class="form-check form-switch"><input class="form-check-input" type="checkbox" value="" id="detailedCheck" disabled><label class="form-check-label" for="detailedCheck">Detailed</label></div>');

$('#vis-parameters').on('change', '#variants', function detailed(e) { //detailed
    if (['2', '3', '4'].includes($('#variants').val())) {
        $('#detailedCheck').prop('disabled', false);
    }
    else {
        $('#detailedCheck').prop('disabled', true);
    };
});

$('#detailedCheck').on('change', change_detailed);

function change_detailed(e) {
    detailed = $('#detailedCheck').prop('checked');
    load_simu();
}

$('#vis-parameters').on('input', '#sizeRange', change_size); //size slider

function change_size(e) {
    size = parseInt($(this).val());
    load_simu();
};

//simulation
class Frame {
    constructor(values, active, sorted, additional) {
        this.values = [...values];
        this.active = new Set(active);
        this.sorted = new Set(sorted);
        if (additional) this.additional = [...additional];
    }
};

function create_frames(variant) {
    function random_perm(size) {
        let values = Array.from(Array(size).keys());
        for (var i = 0; i < size; i++) {
            var j = i + Math.floor(Math.random() * (size - i));
            [values[i], values[j]] = [values[j], values[i]];
        };
        return values;
    };

    let frames = [];
    let values = [];
    values = random_perm(size);
    if (variant == 5) {
        values = values.map(x => Math.floor(x / 2));
    };
    let s_sorted = new Set();
    let s_active = new Set();
    active = [];
    init_values = [...values];
    switch (variant) {
        case "0": //select
            for (var i = 0; i < size - 1; i++) {
                const sorted = new Set(Array(i).keys());
                let min = i;
                frames.push(new Frame(values, [min], sorted));
                for (var j = i + 1; j < size; j++) {
                    frames.push(new Frame(values, [min, j], sorted));
                    if (values[min] > values[j]) {
                        min = j;
                        frames.push(new Frame(values, [min], sorted));
                    };
                };
                frames.push(new Frame(values, [min, i], sorted));
                [values[min], values[i]] = [values[i], values[min]];
                frames.push(new Frame(values, [min, i], sorted));
            };
            frames.push(new Frame(values, [size - 1], Array.from(Array(size - 1).keys())));
            frames.push(new Frame(values, [], values));
            break;
        case "1": //insert
            for (var i = 0; i < size; i++) {
                const sorted = new Set(Array(i + 1).keys());
                let pos = i;
                let val = values[i];
                frames.push(new Frame(values, [pos], sorted));
                while (pos > 0 && values[pos] < values[pos - 1]) {
                    frames.push(new Frame(values, [pos, pos - 1], sorted));
                    [values[pos], values[pos - 1]] = [values[pos - 1], values[pos]];
                    frames.push(new Frame(values, [pos, pos - 1], sorted));
                    pos -= 1;
                };
                if (pos > 0) {
                    frames.push(new Frame(values, [pos, pos - 1], sorted));
                }
            };
            frames.push(new Frame(values, [], values));
            break;
        case "2": //heap
            function heapify() {
                for (var i = size - 1; i >= 0; i--) {
                    sift(i, size - 1);
                };
            };

            function sift(from, to) {
                var root = from;
                while (2 * root <= to) {
                    var left = 2 * root;
                    var selected = root;
                    if (values[selected] < values[left]) {
                        selected = left;
                    };
                    if (left + 1 <= to && values[selected] < values[left + 1]) {
                        selected = left + 1;
                    };
                    if (selected != root) {
                        if (detailed) frames.push(new Frame(values, [root, selected], s_sorted));
                        [values[root], values[selected]] = [values[selected], values[root]];
                        if (detailed) frames.push(new Frame(values, [root, selected], s_sorted));
                        root = selected;
                    }
                    else {
                        return;
                    };
                };
            };

            heapify();
            for (var i = size - 1; i > 0; i--) {
                if (detailed) frames.push(new Frame(values, [0, i], s_sorted));
                [values[i], values[0]] = [values[0], values[i]];
                s_sorted.add(i);
                frames.push(new Frame(values, [], s_sorted));
                sift(0, i - 1);
            }
            frames.push(new Frame(values, [], values));
            break;
        case "3": //merge
            function merge(from, range) {
                let additional = [];
                var i = from;
                var j = from + range;
                s_active = new Set(Array.from({ length: Math.min(2 * range, size - from) }, (_, j) => j + i));
                frames.push(new Frame(values, s_active, []));
                while (j < from + 2 * range && j < size) {
                    if (i < from + range && values[i] < values[j]) {
                        additional.push(values[i]);
                        if (detailed) frames.push(new Frame(values, [i, j], [], additional));
                        i += 1;
                    }
                    else {
                        additional.push(values[j]);
                        if (detailed) {
                            if (i < from + range) {
                                frames.push(new Frame(values, [i, j], [], additional));
                            }
                            else {
                                frames.push(new Frame(values, [j], [], additional));
                            }
                        };
                        j += 1;
                    };
                };
                while (i < from + range && i < size) {
                    additional.push(values[i]);
                    if (detailed) frames.push(new Frame(values, [i], [], additional));
                    i += 1;
                };
                m = 0;
                frames.push(new Frame(values, s_active, [], additional));
                for (var k = from; k < size && k < from + 2 * range; k++) {
                    values[k] = additional[m];
                    m += 1;
                };
                frames.push(new Frame(values, s_active, []));
            };

            for (var w = 1; w < size; w = w * 2) {
                for (var i = 0; i < size; i += w * 2) {
                    merge(i, w);
                };
            };
            frames.push(new Frame(values, [], values));
            break;
        case "4": //quick
            function quick(from, to) {
                function partition(from, to) {
                    let val = values[to];
                    let pos = from;
                    s_active.add(to);
                    for (i = from; i < to; i++) {
                        s_active.add(i);
                        if (detailed) frames.push(new Frame(values, s_active, s_sorted));
                        if (values[i] <= val) {
                            if (pos != i) {
                                [values[pos], values[i]] = [values[i], values[pos]];
                                if (detailed) frames.push(new Frame(values, s_active, s_sorted));
                            };
                            s_active.delete(pos);
                            pos += 1;
                            s_active.add(pos);
                        };
                        if (pos != i) {
                            s_active.delete(i);
                        };
                    };
                    if (detailed) frames.push(new Frame(values, s_active, s_sorted));
                    if (pos != to) {
                        [values[pos], values[to]] = [values[to], values[pos]];
                        if (detailed) frames.push(new Frame(values, s_active, s_sorted));
                    }
                    s_active.delete(to);
                    s_active.delete(pos);
                    return pos;
                };

                if (from > to || from < 0 || to > size - 1) {
                    return;
                };
                if (from == to) {
                    s_active.add(from);
                    if (detailed) frames.push(new Frame(values, s_active, s_sorted));
                    s_active.delete(from);
                    s_sorted.add(from);
                    frames.push(new Frame(values, s_active, s_sorted));
                    return;
                };
                let mid = partition(from, to);
                s_sorted.add(mid);
                frames.push(new Frame(values, s_active, s_sorted));
                quick(from, mid - 1);
                quick(mid + 1, to);
            };

            quick(0, size - 1);
            break;
        case "5": //radix
            let additional = new Array(Math.ceil(size / 2)).fill(0);
            for (let i = 0; i < size; i++) {
                frames.push(new Frame(values, [i], [], additional));
                additional[values[i]] += 1;
                frames.push(new Frame(values, [i], [], additional));
            }
            let pos = 0;
            for (let i = 0; i < size; i++) {
                frames.push(new Frame(values, [i], [], additional));
                while (additional[pos] == 0) {
                    pos += 1;
                }
                additional[pos] -= 1;
                values[i] = pos;
                frames.push(new Frame(values, [i], [], additional));
            }
            frames.push(new Frame(values, [], Array(size).keys(), additional));
            break;
    }
    return frames;
};

//visualization

function render_frame(variant, frame) {
    switch (variant) {
        case "3": //merge
            if (detailed) show_bot(true);
            vis_panel.innerHTML = '';
            vis_bot.innerHTML = '';
            if (frame) {
                for (var i = 0; i < size; i++) {
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, frame.values[i] + 1).replace(/~h~/g, (frame.values[i] + 1) / size * 95));
                };
                if (frame.additional) {
                    for (var i = 0; i < frame.additional.length; i++) {
                        vis_bot.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, frame.additional[i] + 1).replace(/~h~/g, (frame.additional[i] + 1) / size * 95));
                    };
                };
                let bars = vis_panel.children;
                active.forEach(function (bar) { bars[bar].classList.remove('bg-warning'); bars[bar].classList.add('bg-info'); });
                frame.sorted.forEach(function (bar) { bars[bar].classList.remove('bg-info', 'bg-warning'); bars[bar].classList.add('bg-success'); });
                frame.active.forEach(function (bar) { bars[bar].classList.remove('bg-info', 'bg-success'); bars[bar].classList.add('bg-warning'); });
                active = new Set(frame.active);
            }
            else {
                for (var i = 0; i < size; i++) {
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, init_values[i] + 1).replace(/~h~/g, (init_values[i] + 1) / size * 95));
                };
            };
            break;
        case "5": //radix
            show_bot(true);
            vis_panel.innerHTML = '';
            vis_bot.innerHTML = '';
            if (frame) {
                for (var i = 0; i < size; i++) {
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, frame.values[i] + 1).replace(/~h~/g, (2 * frame.values[i] + 1) / size * 95));
                };
                if (frame.additional) {
                    for (var i = 0; i < frame.additional.length; i++) {
                        vis_bot.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, i + 1).replace(/~h~/g, frame.additional[i] / 2 * 95));
                    };
                };
                let bars = vis_panel.children;
                active.forEach(function (bar) { bars[bar].classList.remove('bg-warning'); bars[bar].classList.add('bg-info'); });
                frame.sorted.forEach(function (bar) { bars[bar].classList.remove('bg-info', 'bg-warning'); bars[bar].classList.add('bg-success'); });
                frame.active.forEach(function (bar) { bars[bar].classList.remove('bg-info', 'bg-success'); bars[bar].classList.add('bg-warning'); });
                active = new Set(frame.active);
            }
            else {
                for (var i = 0; i < size; i++) {
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, init_values[i] + 1).replace(/~h~/g, (2 * init_values[i] + 1) / size * 95));
                };
                for (var i = 0; i < size / 2; i++) {
                    vis_bot.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, i + 1).replace(/~h~/g, 0));
                };
            };
            break;
        default: //select, insert, heap, quick (~inplace)
            show_bot(false);
            vis_panel.innerHTML = '';
            if (frame) {
                for (var i = 0; i < size; i++) {
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, frame.values[i] + 1).replace(/~h~/g, (frame.values[i] + 1) / size * 95));
                };
                let bars = vis_panel.children;
                active.forEach(function (bar) { bars[bar].classList.remove('bg-warning'); bars[bar].classList.add('bg-info'); });
                frame.sorted.forEach(function (bar) { bars[bar].classList.remove('bg-info', 'bg-warning'); bars[bar].classList.add('bg-success'); });
                frame.active.forEach(function (bar) { bars[bar].classList.remove('bg-info', 'bg-success'); bars[bar].classList.add('bg-warning'); });
                active = new Set(frame.active);
            }
            else {
                for (var i = 0; i < size; i++) {
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, init_values[i] + 1).replace(/~h~/g, (init_values[i] + 1) / size * 95));
                };
            };
            break;
    }
};