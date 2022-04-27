let min = 4
let max = 30;
let size = 8;
let target = 4;
let variants = ["Linear search", "Binary search"];
let vispanel = document.getElementById('vis-panel');
let active = [];
let bars = [];
const bar_template = "<div class=\"shadow w-100 mx-auto mt-auto bg-info text-center rounded\" style=\"height:~h~%\;min-height:25px\">~val~</div>";

//controls
for (var i = 0; i < variants.length; i++) { //fill variants
    document.getElementById('variants').innerHTML += '<option value="' + i + '">' + variants[i] + '</option>';
};

document.getElementById('vis-parameters').innerHTML +=//fill parameters
    '<label for="sizeRange" class="form-label mt-1">Size</label><input type="range" class="form-range" min="4" max="'+max+'" step="1" value="' + size + '" id="sizeRange">' +
    '<label for="targetRange" class="form-label mt-1">Target</label><input type="range" class="form-range" min="1" max=' + size + ' step="1" value="' + target + '" id="targetRange">'


$('#sizeRange').on('change', change_size); //size slider

function change_size(e) {
    size = parseInt($(this).val());
    $('#targetRange').attr('max', size);
    target = parseInt($('#targetRange').val());
    load_simu()
}

$('#targetRange').on('change', change_target); //target slider

function change_target(e) {
    target = parseInt($(this).val());
    load_simu()
}

//simulation
class Frame {
    constructor(active,complete) {
        this.active = active;
        this.complete = complete;
    }
}

function create_frames(variant) {
    let frames = [];
    let curr = 0;
    switch (variant) {
        case "0":
            while (curr < target) {
                curr += 1;
                frames.push(new Frame([curr], false))
            }
            frames.push(new Frame([curr], true))
            break;
        case "1":
            low = 1;
            high = size;
            curr = Math.ceil((high+low) / 2);
            frames.push(new Frame([curr,low,high], false));
            while (curr != target) {
                if (curr>target){
                    high=curr-1
                }
                else{
                    low=curr+1
                }
                curr = Math.ceil((high+low) / 2);
                frames.push(new Frame([curr,low,high], false))
            }
            frames.push(new Frame([curr,low,high], true))
            break;
    }
    return frames;
}

function render_frame(frame) {
    tindex=target-1
    if (frame){
        active.forEach(function(bar){bars[bar-1].classList.remove('bg-danger','bg-warning');bars[bar-1].classList.add('bg-info');});
        bars[tindex].classList.remove('bg-info');
        bars[tindex].classList.add('bg-danger');
        frame.active.forEach(function(bar){bars[bar-1].classList.remove('bg-danger','bg-info');bars[bar-1].classList.add('bg-warning');});
        if (frame.complete){
            bars[tindex].classList.remove('bg-danger','bg-warning');
            bars[tindex].classList.add('bg-success');
        };
        active=frame.active;
    }
    else{
        vispanel.innerHTML = '';
        for (var i = 0; i < size; i++){
            vispanel.insertAdjacentHTML("beforeend", bar_template.replace(/~val~/g, i+1).replace(/~h~/g,(i+1)/size*100))
        };
        bars = vispanel.children;
        bars[tindex].classList.remove('bg-info');
        bars[tindex].classList.add('bg-danger');
    }
}