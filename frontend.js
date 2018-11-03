const dbFile = 'projects.json';
const fs = require('fs');
const home = require("os").homedir();
const dbPath = home + '/' + dbFile;

if (! fs.existsSync(dbPath)){
    try { fs.createWriteStream(dbPath) }
    catch(e) { alert('Failed to create db-file !'); }
}

const Datastore = require('nedb');
const db = new Datastore({ filename: dbPath, autoload: true });

const electron = require('electron');
const appPath = electron.remote.app.getAppPath();
const dock = electron.remote.app.dock;
let counter = 0;
let blinking;


$(function() {

    //load projects
    loadProjects();

    //start/stop timer
    $('#projects').on('change', '.timer', function(){

        if(this.checked){
            runClock(this.id);
        }
        else{
            stopClock(this.id);
        }
    });

    //add new
    $('#add_p').click(function (){

        if ($('#p_name').val() !== ''){
            db.insert({ name: $('#p_name').val(), time: '00:00:00'});
            loadProjects();
            $('#p_name').val('');
        }
    });

    //submit on enter
    $('#p_name').keydown(function(e){

        if(e.keyCode === 13){
            $('#add_p').click();
        }
    });

    //delete project
    $('#projects').on('click', '.p-del', function(){

        if (confirm('Sure to delete ' + $(this).parent().text() + '?!')){

            let p_id = $(this).parents('.row').find('.timer').attr('id');

            stopClock(p_id);
            db.remove({_id: p_id});
            loadProjects();
        }
    });

});


/*
functions
 */

function loadProjects(){

    $('.project').remove();

    db.find({ }, function (err, docs) {

        $.each(docs, function (i,v){

            let running = '';
            let checked = '';
            if (window.$['timer' + v._id] !== undefined){
                checked = ' checked';
                running = ' running';
            }

            $('#projects').append(
                '<div class="row project">' +
                '<div class="cell" id="n_' + v._id + '">' + v.name + '<i class="fa fa-trash p-del"></i></div>' +
                '<div class="cell time ' + running + '" id="t_' + v._id + '">' + v.time + '</div>' +
                '<div class="cell"><input type="checkbox" class="timer" id="'+ v._id +'"' + checked + '>' + '</div>' +
                '</div>'
            );
        });
    });
}


function runClock(p_id){

    db.findOne({ _id: p_id}, function (err, proj) {

        let time_arr = proj.time.split(':');
        startTimer(parseInt(time_arr[0]), parseInt(time_arr[1]), parseInt(time_arr[2]), p_id);

    });

    $('#' + p_id).parents('.row').find('.time').addClass('running');

    if (! counter){
        counter = 1;
        blinking = setInterval(clockBlink, 1000);
    }
}


function stopClock(p_id){

    clearTimeout(window.$['timer' + p_id]);
    window.$['timer' + p_id] = undefined;

    $('#' + p_id).parents('.row').find('.time').removeClass('running');
    $('#' + p_id).parents('.row').find('.timer').prop('checked', false);

    if (! $('#projects').find('input[type="checkbox"]').is(':checked')){

        clearInterval(blinking);
        counter = 0;
        dock.setIcon(appPath + '/project-clock.png');
    }

}


function startTimer(h,m,s, p_id) {

    s++;

    if (s > 59){
        m++;
        s = 0;
    }
    if (m > 59){
        h++;
        m = 0;
    }

    let timeString = addZero(h) + ":" + addZero(m) + ":" + addZero(s);

    $('#t_' + p_id).html(timeString);

    db.update({ _id: p_id}, {$set: {time:timeString}});

    window.$['timer' + p_id] = setTimeout(startTimer, 1000, h, m, s, p_id);
}


function addZero(i) {

    if (i < 10) {i = "0" + i};
    return i;
}


function clockBlink(){

    if (counter % 2 == 0){
        dock.setIcon(appPath + '/project-clock-running.png');
    }
    else{
        dock.setIcon(appPath + '/project-clock.png');
    }

    counter++;
}
