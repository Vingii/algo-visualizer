let min = 4
let max = 20;
let size = 8;
let target = 4;
let variants = ["Linear search", "Binary search"];

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
    let vispanel = document.getElementById('vis-panel');
    vispanel.innerHTML = '';
    vispanel.innerHTML += '<p>Size: '+size+'</p>'+'<p>Target: '+target+'</p>';
    vispanel.innerHTML += '<p>Active: '+frame.active+'</p>'+'<p>Complete: '+frame.complete+'</p>';
    //TODO
}