//variables

var running = false;
var frames = [];
var currframe = -1;
var timer = 0;
var interval = 1000;
var variant = 0;
var render_frame = null;
var create_frames = null;
var task = null;
var descriptions = [];
var specs = [];
const vis_top = document.getElementById('vis-top');
const vis_panel = document.getElementById('vis-panel');
const vis_bot = document.getElementById('vis-bot');

//controls

//speed slider

//buttons
function click_run() {
    if (running) {
        stop_simu();
    }
    else {
        start_simu();
    }
}

function click_step() {
    if (!running) {
        step();
    }
}

function click_restart() {
    load_simu();
}

//simulation

function show_top(show) {
    if (show) {
        vis_top.removeAttribute("hidden");
    }
    else {
        vis_top.setAttribute("hidden", "");
    }
}

function show_mid(show) {
    if (show) {
        vis_panel.removeAttribute("hidden");
    }
    else {
        vis_panel.setAttribute("hidden", "");
    }
}

function show_bot(show) {
    if (show) {
        vis_bot.removeAttribute("hidden");
    }
    else {
        vis_bot.setAttribute("hidden", "");
    }
}

function load_simu() {
    stop_simu();
    change_desc();
    currframe = -1;
    frames = [];
    frames = create_frames($('#variants').val());
    render_frame(variant);
}

function start_simu() {
    running = true;
    $('#runButton').removeClass('btn-primary btn-success').addClass('btn-warning');
    if (!timer) {
        timer = setTimeout(step_routine, interval);
    }
}

function stop_simu() {
    running = false;
    $('#runButton').removeClass('btn-warning btn-success').addClass('btn-primary');
    if (timer) {
        clearTimeout(timer);
        timer = 0;
    }
}

function step_routine() {
    timer = setTimeout(step_routine, interval);
    step();
}

function step() {
    if (currframe < frames.length - 1) {
        currframe += 1;
        render_frame(variant, frames[currframe]);
    }
    else {
        stop_simu();
        $('#runButton').removeClass('btn-warning btn-primary').addClass('btn-success');
    }
}


//description

function change_desc() {
    $('#task').empty();
    document.getElementById('task').insertAdjacentHTML('beforeend', "<b>Task: </b>" + task[variant]);
    $('#desc').empty();
    document.getElementById('desc').insertAdjacentHTML('beforeend', "<b>Algorithm:</b> " + descriptions[variant]);
    $('#specs').empty();
    for (const [key, value] of Object.entries(specs[variant])) {
        document.getElementById('specs').insertAdjacentHTML('beforeend', "<b>" + key + ":</b> " + value + "<br>");
    }
}

function init(variants, name_common, create, render, task_in, descriptions_in, specs_in) {
    create_frames = create
    render_frame = render
    task = task_in
    descriptions = descriptions_in
    specs = specs_in
    $('#speedRange').slider().on('change', change_speed);
    function change_speed() {
        interval = 3000 / $(this).val();
    }

    for (var i = 0; i < variants.length; i++) {
        document.getElementById('variants').insertAdjacentHTML('beforeend', '<option value="' + i + '">' + variants[i] + '</option>');
    }
    variant = $('#variants').val();
    $('#variants').on('change', function change_variant() {
        variant = $('#variants').val();
        load_simu();
    });

    load_simu();

    $('#name-common').empty();
    document.getElementById('name-common').insertAdjacentHTML('beforeend', "<b>" + name_common + "</b>");
}

export { show_bot, show_mid, show_top, click_restart, click_step, click_run, init, load_simu }