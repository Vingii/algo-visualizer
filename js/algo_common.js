//variables

var running = false;
var frames = [];
var currframe = -1;
var timer = 0;
var interval = 1000;

//controls

//speed slider
$('#speedRange').slider().on('change', change_speed);

function change_speed(e) {
    interval = 3000 / $(this).val()
}

//buttons
function click_run() {
    if (running) {
        stop_simu()
    }
    else {
        start_simu()
    }
};

function click_step() {
    if (!running) {
        step()
    }
};

function click_restart() {
    load_simu()
};

$('#variants').on('change', function change_variant(e) { load_simu() }); //size slider

//simulation

function load_simu() {
    stop_simu();
    currframe = -1;
    frames = [];
    frames = create_frames($('#variants').val());
    render_frame()
};

function start_simu() {
    running = true;
    $('#runButton').removeClass('btn-primary btn-success').addClass('btn-warning');
    if (!timer) {
        timer = setTimeout(step_routine, interval)
    }
};

function stop_simu() {
    running = false;
    $('#runButton').removeClass('btn-warning btn-success').addClass('btn-primary');
    if (timer) {
        clearTimeout(timer);
        timer = 0
    }
}

function step_routine(){
    step();
    timer = setTimeout(step_routine, interval)
}

function step() {
    if (currframe < frames.length - 1) {
        currframe += 1;
        render_frame(frames[currframe])
    }
    else {
        stop_simu()
        $('#runButton').removeClass('btn-warning btn-primary').addClass('btn-success');
    }
}

load_simu()