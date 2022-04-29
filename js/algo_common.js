//variables

var running = false;
var frames = [];
var currframe = -1;
var timer = 0;
var interval = 1000;
var variant = 0;

//controls

//speed slider
$('#speedRange').slider().on('change', change_speed);

function change_speed(e) {
    interval = 3000 / $(this).val();
};

//buttons
function click_run() {
    if (running) {
        stop_simu();
    }
    else {
        start_simu();
    };
};

function click_step() {
    if (!running) {
        step();
    };
};

function click_restart() {
    load_simu();
};

//variants
for (var i = 0; i < variants.length; i++) {
    document.getElementById('variants').insertAdjacentHTML('beforeend', '<option value="' + i + '">' + variants[i] + '</option>');
};
variant = $('#variants').val();

$('#variants').on('change', function change_variant(e) {
    variant = $('#variants').val();
    load_simu();
});

//simulation

function load_simu() {
    stop_simu();
    change_desc();
    currframe = -1;
    frames = [];
    frames = create_frames($('#variants').val());
    render_frame(variant);
};

function start_simu() {
    running = true;
    $('#runButton').removeClass('btn-primary btn-success').addClass('btn-warning');
    if (!timer) {
        timer = setTimeout(step_routine, interval);
    }
};

function stop_simu() {
    running = false;
    $('#runButton').removeClass('btn-warning btn-success').addClass('btn-primary');
    if (timer) {
        clearTimeout(timer);
        timer = 0;
    }
}

function step_routine() {
    step();
    timer = setTimeout(step_routine, interval);
}

function step() {
    if (currframe < frames.length - 1) {
        currframe += 1;
        render_frame(variant, frames[currframe]);
    }
    else {
        stop_simu();
        $('#runButton').removeClass('btn-warning btn-primary').addClass('btn-success');
    };
};

load_simu();

//description

function change_desc() {
    $('#desc').empty();
    document.getElementById('desc').insertAdjacentHTML('beforeend', "<b>Algorithm:</b> " + descriptions[variant]);
    $('#specs').empty();
    for (const [key, value] of Object.entries(specs[variant])) {
        document.getElementById('specs').insertAdjacentHTML('beforeend', "<b>" + key + ":</b> " + value + "<br>");
    }
};

$('#name-common').empty();
document.getElementById('name-common').insertAdjacentHTML('beforeend', "<b>" + name_common + "</b>");
document.getElementById('desc-common').insertAdjacentHTML('beforeend', "<b>Task: </b>" + desc_common);