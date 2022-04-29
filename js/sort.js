const min = 4;
const max = 30;
let size = 8;
let active = [];
let bars = [];
let values = [];
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
    '<label for="sizeRange" class="form-label mt-1">Size</label><input type="range" class="form-range" min="4" max="' + max + '" step="1" value="' + size + '" id="sizeRange">');

$('#vis-parameters').on('input', '#sizeRange', change_size); //size slider

function change_size(e) {
    size = parseInt($(this).val());
    load_simu();
};

//simulation
class Frame {
    constructor(values, active, sorted, complete) {
        this.values = values;
        this.active = active;
        this.sorted = sorted;
        this.complete = complete;
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
    values = random_perm(size);
    frames.push(new Frame(values, [], [], false));
    switch (variant) {
        case "0": //select
            break;
        case "1": //insert
            break;
        case "2": //heap
            break;
        case "3": //merge
            break;
        case "4": //quick
            break;
        case "5": //radix
            break;
    }
    return frames;
}

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
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, frame.values[i] + 1).replace(/~h~/g, (values[i] + 1) / size * 95));
                };
                bars = vis_panel.children;
                active.forEach(function (bar) { bars[bar - 1].classList.remove('bg-warning'); bars[bar - 1].classList.add('bg-info'); });
                frame.active.forEach(function (bar) { bars[bar - 1].classList.remove('bg-info'); bars[bar - 1].classList.add('bg-warning'); });
                frame.sorted.forEach(function (bar) { bars[bar - 1].classList.remove('bg-info', 'bg-warning'); bars[bar - 1].classList.add('bg-success'); });
                active = frame.active;
            }
            else {
                for (var i = 0; i < size; i++) {
                    vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, values[i] + 1).replace(/~h~/g, (values[i] + 1) / size * 95));
                };
                bars = vis_panel.children;
            };
            break;
    }
};