const min = 4;
const max = 30;
let size = 8;
let target = 4;
let active = new Set();
let bars = [];
const vis_panel = document.getElementById('vis-panel');
const bar_template = "<div class=\"shadow w-100 mx-auto bg-info text-center rounded\" style=\"height:~h~%\;min-height:25px\">~val~</div>";

const name_common = "Searching"
const desc_common = "Given an ordered list, find an element of a given value."
const variants = ["Linear search", "Binary search"];
const descriptions = ["Checks every element in order against the target.", "Checks the middle element against the target. Halves the search space in each step."];
const specs = [{ "Average time": "O(n)", "Worst time": "O(n)", "Space": "O(1)" }, { "Average time": "O(log(n))", "Worst time": "O(log(n))", "Space": "O(1)" }]

//controls

document.getElementById('vis-parameters').insertAdjacentHTML('beforeend', //fill parameters
    '<label for="sizeRange" class="form-label mt-1">Size</label><input type="range" class="form-range" min="4" max="' + max + '" step="1" value="' + size + '" id="sizeRange">' +
    '<label for="targetRange" class="form-label mt-1">Target</label><input type="range" class="form-range" min="1" max=' + size + ' step="1" value="' + target + '" id="targetRange">');

$('#vis-parameters').on('input', '#sizeRange', change_size); //size slider

function change_size(e) {
    size = parseInt($(this).val());
    $('#targetRange').attr('max', size);
    target = parseInt($('#targetRange').val());
    load_simu();
};

$('#vis-parameters').on('input', '#targetRange', change_target); //target slider

function change_target(e) {
    target = parseInt($(this).val());
    load_simu();
};

//simulation
class Frame {
    constructor(active, complete) {
        this.active = new Set(active);
        this.complete = complete;
    };
};

function create_frames(variant) {
    let frames = [];
    let curr = 0;
    switch (variant) {
        case "0":
            while (curr < target) {
                curr += 1;
                frames.push(new Frame([curr], false));
            }
            frames.push(new Frame([curr], true));
            break;
        case "1":
            low = 1;
            high = size;
            curr = Math.ceil((high + low) / 2);
            frames.push(new Frame([curr, low, high], false));
            while (curr != target) {
                if (curr > target) {
                    high = curr - 1;
                }
                else {
                    low = curr + 1;
                };
                curr = Math.ceil((high + low) / 2);
                frames.push(new Frame([curr, low, high], false));
            }
            frames.push(new Frame([curr, low, high], true));
            break;
    }
    return frames;
}

function render_frame(variant, frame) {
    tindex = target - 1;
    if (frame) {
        active.forEach(function (bar) { bars[bar - 1].classList.remove('bg-danger', 'bg-warning'); bars[bar - 1].classList.add('bg-info'); });
        bars[tindex].classList.remove('bg-info');
        bars[tindex].classList.add('bg-danger');
        if (frame.complete) {
            bars[tindex].classList.remove('bg-danger', 'bg-warning');
            bars[tindex].classList.add('bg-success');
        }
        else {
            frame.active.forEach(function (bar) { bars[bar - 1].classList.remove('bg-danger', 'bg-info'); bars[bar - 1].classList.add('bg-warning'); });
        };
        active = new Set(frame.active);
    }
    else {
        vis_panel.innerHTML = '';
        for (var i = 0; i < size; i++) {
            vis_panel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, i + 1).replace(/~h~/g, (i + 1) / size * 95));
        };
        bars = vis_panel.children;
        bars[tindex].classList.remove('bg-info');
        bars[tindex].classList.add('bg-danger');
    };
};