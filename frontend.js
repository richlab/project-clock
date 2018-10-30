var dbFile = 'projects.json';
var fs = require('fs');
var home = require("os").homedir();
var dbPath = home + '/' + dbFile;

if (! fs.existsSync(dbPath)){
    try { fs.createWriteStream(dbPath) }
    catch(e) { alert('Failed to create db-file !'); }
}

var Datastore = require('nedb');

var db = new Datastore({ filename: dbPath, autoload: true });

var timer;

$(function() {

    //load projects
    db.find({ }, function (err, docs) {

        $.each(docs, function (i,v){
            $('#projects').append(
                '<div class="row">' +
                    '<div class="cell" id="n_' + v._id + '">' + v.name + '<i class="fa fa-trash p-del"></i></div>' +
                    '<div class="cell" id="t_' + v._id + '">' + v.time + '</div>' +
                    '<div class="cell"><input type="checkbox" class="timer" id="'+ v._id +'">' + '</div>' +
                '</div>'
            );
        });
    });

    //start/stop timer
    $('#projects').on('change', '.timer', function(){

        if(this.checked){
            runClock(this.id);
        }
        else{
            stopClock();
        }
    });

    //add new
    $('#add_p').click(function (){

        if ($('#p_name').val() !== ''){
            db.insert({ name: $('#p_name').val(), time: '00:00:00'});
            window.location.reload();
        }
    });

    //delete project
    $('#projects').on('click', '.p-del', function(){

        if (confirm('Sure to delete ' + $(this).parent().text() + '?!')){
            db.remove({_id: $(this).parents('.row').find('.timer').attr('id')});
            window.location.reload();
        }
    });

});


/*
functions
 */

function runClock(p_id){

    db.findOne({ _id: p_id}, function (err, proj) {

        var time_arr = proj.time.split(':');
        startTimer(parseInt(time_arr[0]), parseInt(time_arr[1]), parseInt(time_arr[2]), p_id);

    });
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

    var timeString = addZero(h) + ":" + addZero(m) + ":" + addZero(s);

    $('#t_' + p_id).html(timeString);

    db.update({ _id: p_id}, {$set: {time:timeString}});

    timer = setTimeout(startTimer, 1000, h, m, s, p_id);
}

function addZero(i) {

    if (i < 10) {i = "0" + i};
    return i;
}


function stopClock(){

    clearTimeout(timer);
}