const min = 4;
const max = 30;
let size = 8;
let active = new Set();
let bars = [];
let init_values = [];    
let detailed = false;
const vis_panel = document.getElementById('vis-panel');
const bar_template = "<div class=\"shadow w-100 mx-auto bg-info text-center rounded\" style=\"height:~h~%\;min-height:25px\">~val~</div>";

const name_common = "Sorting"
const desc_common = "Given an unordered list, sort it by the value, ascending."
const variants = ["Select sort", "Insert sort", "Heap sort", "Merge sort", "Quick sort", "Radix sort"];
const descriptions = [
    "Keeps ordered and unordered part. In each step, finds the least element of the unordered part.",
    "Keeps ordered and unordered part. In each step, finds a spot for the first element of the unordered part.",
    "Constructs a heap from the list and repeatedly extracts the least element.",
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
]

//controls

document.getElementById('vis-parameters').insertAdjacentHTML('beforeend', //fill parameters
    '<label for="sizeRange" class="form-label mt-1">Size</label><input type="range" class="form-range" min="4" max="' + max + '" step="1" value="' + size + '" id="sizeRange">' +
    '<div class="form-check form-switch"><input class="form-check-input" type="checkbox" value="" id="detailedCheck" disabled><label class="form-check-label" for="detailedCheck">Detailed</label></div>');

$('#vis-parameters').on('change', '#variants', function detailed(e) { //quick sort detailed
    if ($('#variants').val() == 4) {
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
    constructor(values, active, sorted, complete) {
        this.values = [...values];
        this.active = new Set(active);
        this.sorted = new Set(sorted);
    };
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
    let values = random_perm(size);
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
            break;
        case "3": //merge
            break;
        case "4": //quick
            function quick(from, to) {
                function partition(from, to) {
                    let val = values[to];
                    let pos = from;
                    q_active.add(to);
                    for (i = from; i < to; i++) {
                        q_active.add(i);
                        if (detailed) frames.push(new Frame(values, q_active, q_sorted));
                        if (values[i] <= val) {
                            if (pos != i) {
                                [values[pos], values[i]] = [values[i], values[pos]];
                                if (detailed) frames.push(new Frame(values, q_active, q_sorted));
                            };
                            q_active.delete(pos);
                            pos += 1;
                            q_active.add(pos);
                        };
                        if (pos != i) {
                            q_active.delete(i);
                        };
                    };
                    if (detailed) frames.push(new Frame(values, q_active, q_sorted));
                    if (pos != to) {
                        [values[pos], values[to]] = [values[to], values[pos]];
                        if (detailed) frames.push(new Frame(values, q_active, q_sorted));
                    }
                    q_active.delete(to);
                    q_active.delete(pos);
                    return pos;
                };

                if (from > to || from < 0 || to > size - 1) {
                    return;
                };
                if (from == to) {
                    q_active.add(from);
                    if (detailed) frames.push(new Frame(values, q_active, q_sorted));
                    q_active.delete(from);
                    q_sorted.add(from);
                    frames.push(new Frame(values, q_active, q_sorted));
                    return;
                };
                let mid = partition(from, to);
                q_sorted.add(mid);
                frames.push(new Frame(values, q_active, q_sorted));
                quick(from, mid - 1);
                quick(mid + 1, to);
            };
            let q_sorted = new Set();
            let q_active = new Set();
            quick(0, size - 1);
            break;
        case "5": //radix
            break;
    }
    return frames;
};

function render_frame(variant, frame) {
    switch (variant) {
        case "3": //merge
            break;
        case "5": //radix
            break;
        default: //select, insert, heap, quick (~inplace)
            vis_panel.innerHTML = '';
            if (frame) {
                for (var i = 0; i < size; i++) {
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, frame.values[i] + 1).replace(/~h~/g, (frame.values[i] + 1) / size * 95));
                };
                bars = vis_panel.children;
                active.forEach(function (bar) { bars[bar].classList.remove('bg-warning'); bars[bar].classList.add('bg-info'); });
                frame.sorted.forEach(function (bar) { bars[bar].classList.remove('bg-info', 'bg-warning'); bars[bar].classList.add('bg-success'); });
                frame.active.forEach(function (bar) { bars[bar].classList.remove('bg-info', 'bg-success'); bars[bar].classList.add('bg-warning'); });
                active = new Set(frame.active);
            }
            else {
                for (var i = 0; i < size; i++) {
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, init_values[i] + 1).replace(/~h~/g, (init_values[i] + 1) / size * 95));
                };
                bars = vis_panel.children;
            };
            break;
    }
};