// Add second empty state explaining that you're waiting on data for Task History.
// Add a reset button - reset when you save settings
// Transform/animate timer clock moving up a bit to make room for Pause info.
// Pretty up the buttons using Materialize CSS
// Pretty up the Task History Section
// Pretty up the PDF pages
// Add pomodoro icon to completed pomodoro areas
// Maybe export as CSV
// Responsivize it
// Add an About page
// Today, Date


var t,
TimerWidget,
s,
SettingsWidget,
h,
HistoryWidget;


var t,
TimerWidget = {
    settings: {
        timerSection: $('#timer'),
        changeSettingsButton: $('#change-settings'),
        startPomodoroButton: $('#start-pomodoro'),
        startShortBreakButton: $('#start-short-break'),
        startLongBreakButton: $('#start-long-break'),
        progressNotification: $('#progress-notification'),
        pausePlay: $('#pause-play'),
        runningTimer: '',
        timerBegin: 0,
        timerCountdown: 25 * 60,
        timerCountdownStart: 25 * 60,
        timerStart: moment(),
        pomoCount: 0,
        statement: $('#statement'),
        timerEnd: moment(),
        timerType: '',
        runningPauseTimer: '',
        pauseCounter: 0,
        pauseStartMoment: moment(),
        pauseTime: $('#pause-time'),
        count: 0,
        pauseCurrentMoment: moment(),
        pauseText: $('#pause-text'),
        canvas: 0,
        ctx: 0,
        //dimensions
        W: 0,
        H: 0,
        //Variables
        degrees: 0,
        new_degrees: 0,
        difference: 0,
        color: "#EE424E", //green looks better to me
        bgcolor: "#18191B",
        textColor: "#979797",
        text: "",
        animation_loop: '',
        redraw_loop: '', //Draw a new chart every 2 seconds
        degreeCalculation: 360 / 1500,
        playpause: true
    },

    init: function() {
        t = this.settings;
        this.bindUIActions();
        TimerWidget.displayTimerFoyer(t.timerCountdown);

        // Animate Timer

        t.canvas = $("#timer-animation")[0];
        t.ctx = t.canvas.getContext("2d");
        //dimensions
        t.W = t.canvas.width;
        t.H = t.canvas.height;
        
        //Lets add some animation for fun
        TimerWidget.draw();

    },

    bindUIActions: function() {
        t.changeSettingsButton.on('click', function () {
            SettingsWidget.enterSettings();
        });

        t.pausePlay.click(function() {
          $(this).toggleClass("paused");
        });

        t.pausePlay.on('click', function() {
            TimerWidget.setPlayPause();
        });

        t.startPomodoroButton.on('click', function() {
            h.currentTask = h.taskInput.val();
            h.taskInput.addClass('hide');
            $(this).addClass('hide');
            t.progressNotification.removeClass('hide');

            if (h.currentTask !== '') {
                h.taskWritten.text(h.currentTask);
            } else {
                h.taskWritten.text('Working Hard!');
            }
            
            h.taskWritten.removeClass('hide');
            TimerWidget.cancelTimer();
            t.timerSection.removeClass('hide');
            t.timerType = 'pomo';
            t.timerCountdownStart = s.timerSetting;
            t.degrees = 0;
            TimerWidget.startTimer(s.timerSetting, t.timerType);
        });

        t.startShortBreakButton.on('click', function() {
            TimerWidget.cancelTimer();
            t.timerType = 'short-break';
            t.timerCountdownStart = s.shortBreakSetting;
            t.degrees = 0;
            TimerWidget.startTimer(s.shortBreakSetting, t.timerType);
        });

        t.startLongBreakButton.on('click', function() {
            TimerWidget.cancelTimer();
            t.timerType = 'long-break';t.timerCountdownStart = s.longBreakSetting;
            t.degrees = 0;
            TimerWidget.startTimer(s.longBreakSetting, t.timerType); 
        });
    },

    setPlayPause: function() {
        t.playpause = !t.playpause;
        if (t.playpause) {
            TimerWidget.cancelPauseTimer();
            TimerWidget.startTimer(t.timerCountdown, t.timerType);
        } else {
            TimerWidget.pauseTimer();
        }
    },

    pauseTimer: function() {
        t.timerEnd = moment();
        clearInterval(t.runningTimer);
        HistoryWidget.storeLocally({
            description: h.currentTask,
            timeTaken: HistoryWidget.displayTimeTaken(t.timerBegin - t.timerCountdown),
            timeStarted: t.timerStart.format('h:mm:ss a'),
            timeEnded: t.timerEnd.format('h:mm:ss a'),
            id: t.timerEnd.format('x'),
            date: t.timerEnd.format('MMMM Do YYYY')
        });
        h.historyData.removeClass('hide');
        t.pauseText.removeClass('hide');
        t.pauseCounter = 0;
        t.pauseStartMoment = moment();
        var minute = Math.floor(t.pauseCounter / 60);
        var second = t.pauseCounter % 60;
        $('#pause-minute-display').text(TimerWidget.formatTime(minute));
        $('#pause-second-display').text(TimerWidget.formatTime(second));
        t.runningPauseTimer = setInterval(TimerWidget.intervalTimerUp, 1000);
    },

    cancelTimer: function(type) {
        t.timerEnd = moment();
        clearInterval(t.runningTimer);
        t.timerCountdown = 0;
        if (type === 'pomo') {
            t.pomoCount += 1;
            h.taskArea.removeClass('hide');
        }
        t.statement.removeClass('hide');
        t.statement.text(TimerWidget.chooseStatement(type));

    },

    startTimer: function(setting, type) {
        t.timerBegin = setting;
        t.timerStart = moment();
        t.timerCountdown = setting;
        t.degreeCalculation = 360 / t.timerCountdownStart;
        t.statement.addClass('hide');
        TimerWidget.displayTimer(t.timerCountdown);
        t.runningTimer = setInterval(TimerWidget.intervalTimer, 1000, type);
        h.historyEmptyState.addClass('hide');
    },

    chooseStatement: function(type) {
        if (type === 'pomo') {
            if (t.pomoCount % 4 === 0) {
                return "Take a long break!";
            } else {
                return "Take a short break!";
            }
        } else {
            return "Back to work with you!";
        }
    },

    intervalTimerUp: function() {
        t.pauseCurrentMoment = moment();
        t.count = t.pauseCurrentMoment.diff(t.pauseStartMoment, 'second');
        var minute = Math.floor(t.count / 60);
        var second = t.count % 60;
        $('#pause-minute-display').text(TimerWidget.formatTime(minute));
        $('#pause-second-display').text(TimerWidget.formatTime(second));

    },

    displayTimerFoyer: function(countdown) {
        var minute = Math.floor(countdown / 60);
        var second = countdown % 60;
        $('#start-time').text(TimerWidget.formatTime(minute) + ':' + TimerWidget.formatTime(second));
    },

    cancelPauseTimer: function() {
        clearInterval(t.runningPauseTimer);
        t.degrees = t.new_degrees;
        HistoryWidget.storeLocally({
          description: 'Interrupted!',
          timeTaken: HistoryWidget.displayTimeTaken(t.count),
          timeStarted: t.pauseStartMoment.format('h:mm:ss a'),
          timeEnded: t.pauseCurrentMoment.format('h:mm:ss a'),
          id: t.pauseCurrentMoment.format('x'),
          date: t.timerEnd.format('MMMM Do YYYY')
        });
        t.pauseText.addClass('hide');
    },

    intervalTimer: function(type) {
        if (t.timerCountdown > 1) {
            t.timerCountdown = t.timerBegin - Math.round((moment() - t.timerStart) / 1000);
        } else {
            TimerWidget.cancelTimer(type);
            h.historyData.removeClass('hide');
            if (type === 'short-break' || type === 'long-break') {
                HistoryWidget.storeLocally({
                    description: 'Break Time',
                    timeTaken: HistoryWidget.displayTimeTaken(t.timerBegin - t.timerCountdown),
                    timeStarted: t.timerStart.format('h:mm:ss a'),
                    timeEnded: t.timerEnd.format('h:mm:ss a'),
                    id: t.timerEnd.format('x'),
                    date: t.timerEnd.format('MMMM Do YYYY')
                });
            } else {
                HistoryWidget.storeLocally({
                  description: h.currentTask,
                  timeTaken: HistoryWidget.displayTimeTaken(t.timerBegin - t.timerCountdown),
                  timeStarted: t.timerStart.format('h:mm:ss a'),
                  timeEnded: t.timerEnd.format('h:mm:ss a'),
                  id: t.timerEnd.format('x'),
                  date: t.timerEnd.format('MMMM Do YYYY')
                });
            }
        }
        TimerWidget.displayTimer(t.timerCountdown);
    },

    displayTimer: function(countdown) {
        var minute = Math.floor(countdown / 60);
        var second = countdown % 60;
        $('#time').removeClass('hide');
        $('#background-image').removeClass('tomato');
        $('#minute-display').text(TimerWidget.formatTime(minute));
        $('#second-display').text(TimerWidget.formatTime(second));
        $('#start-time').addClass('hide');
        t.text = '' + TimerWidget.formatTime(minute) + ':' + TimerWidget.formatTime(second);
        
        TimerWidget.draw();
    },

    formatTime: function(time) {
        if (time < 10) {
            return '0' + time;
        } else {
            return time;
        }
    },

    // Animating Timer

    initAnimation: function() {
        //Clear the canvas everytime a chart is drawn
        t.ctx.closePath();
        t.ctx.clearRect(0, 0, t.W, t.H);
        
        //Background 360 degree arc
        t.ctx.beginPath();
        t.ctx.strokeStyle = t.bgcolor;
        t.ctx.lineWidth = 15;
        t.ctx.arc(t.W/2, t.H/2, 100, 0, Math.PI*2, false); //you can see the arc now
        t.ctx.stroke();
        t.ctx.closePath();
        
        //gauge will be a simple arc
        //Angle in radians = angle in degrees * PI / 180
        var radians = t.degrees * Math.PI / 180;
        t.ctx.beginPath();
        t.ctx.strokeStyle = t.color;
        t.ctx.lineWidth = 15;
        //The arc starts from the rightmost end. If we deduct 90 degrees from the angles
        //the arc will start from the topmost end
        t.ctx.arc(t.W/2, t.H/2, 100, 0 - 90*Math.PI/180, radians - 90*Math.PI/180, false); 
        //you can see the arc now
        t.ctx.stroke();
        
        //Lets add the text
        t.ctx.fillStyle = t.textColor;
        t.ctx.font = "300 50px lato";
        //Lets center the text
        //deducting half of text width from position x
        var text_width = t.ctx.measureText(t.text).width;
        //adding manual value to position y since the height of the text cannot
        //be measured easily. There are hacks but we will keep it manual for now.
        t.ctx.fillText(t.text, t.W/2 - text_width/2, t.H/2);
    },

    draw: function() {
        //Cancel any movement animation if a new chart is requested
        if(typeof t.animation_loop !== undefined) {clearInterval(t.animation_loop);}
        
        //random degree from 0 to 360
        t.new_degrees = Math.round((t.timerCountdownStart-t.timerCountdown)*t.degreeCalculation);
        t.difference = t.degrees - t.new_degrees;
        //This will animate the gauge to new positions
        //The animation will take 1 second
        //time for each frame is 1sec / difference in degrees
        t.animation_loop = setInterval(TimerWidget.animate_to, 1000/t.difference);
    },

    animate_to: function() {
        //clear animation loop if degrees reaches to new_degrees
        if (t.degrees === t.new_degrees) {
            clearInterval(t.animation_loop);
        } else if (t.degrees < t.new_degrees) {
            t.degrees++;
        } else {
            t.degrees--;
        }
            
        TimerWidget.initAnimation();
    }

};

var s,
SettingsWidget = {

    settings: {
        timeInput: $('#time-input'),
        shortBreakInput: $('#short-break'),
        longBreakInput: $('#long-break'),
        saveButton: $('#save-settings'),
        cancelButton: $('#cancel-settings'),
        settingsSection: $('#settings'),
        timerSetting: 1500,
        shortBreakSetting: 300,
        longBreakSetting: 1200
    },

    init: function() {
        s = this.settings;
        this.bindUIActions();

    },

    bindUIActions: function() {
        s.saveButton.on('click', function () {
            SettingsWidget.saveSettings();
        });

        s.cancelButton.on('click', function() {
            SettingsWidget.exitSettings();
        });
    },

    saveSettings: function() {
        TimerWidget.cancelTimer();
        s.timerSetting = s.timeInput.val() * 60;
        s.shortBreakSetting = s.shortBreakInput.val() * 60;
        s.longBreakSetting = s.longBreakInput.val() * 60;
        SettingsWidget.exitSettings();


        TimerWidget.displayTimerFoyer(s.timerSetting);
        $('#start-time').removeClass('hide');
        h.taskInput.removeClass('hide');
        t.startPomodoroButton.removeClass('hide');
        t.progressNotification.addClass('hide');
        h.taskWritten.addClass('hide');
        $('#background-image').addClass('tomato');
        $('#time').addClass('hide');

        
        t.pausePlay.removeClass("paused");
        t.playpause = true;
        TimerWidget.cancelPauseTimer();

    },

    enterSettings: function() {
        s.settingsSection.removeClass('hide');
    },

    exitSettings: function() {
        s.settingsSection.addClass('hide');
        t.timerSection.removeClass('hide');
    }
};

var h,
HistoryWidget = {

    settings: {
        taskArea: $('#task-area'),
        taskInput: $('#task-input'),
        taskWritten: $('#task-written'),
        historyData: $('#history-data'),
        historyDataTable: $('#history-data-table'),
        historyEmptyState: $('#history-empty'),
        taskInputButton: $('#task-input-button'),
        data: JSON.parse(localStorage.getItem("taskData")) || {},
        clearHistory: $('#clear-history'),
        saveButton: $('#save-button'),
        taskSaveArea: $('#task-save-area'),
        cancelButton: $('#cancel-button'),
        currentTaskEdit: '',
        editTaskButton: $('#edit-task'),
        oldTaskInfo: '',
        exportButton: $('#export-table'),
        row: JSON.parse(localStorage.getItem("rowData")) || [],
        currentTask: '',
        dateArray: []
    },

    init: function() {
        h = this.settings;
        this.bindUIActions();
        $.each(h.data, function (index, params) {
            HistoryWidget.addTask(params);
        });
        if (!$.isEmptyObject(h.data)) {
            h.historyData.removeClass('hide');
            h.historyEmptyState.addClass('hide');
        } else {
            h.historyEmptyState.removeClass('hide');
        }

    },

    bindUIActions: function() {

        h.taskInput.keyup(function(e) {
            if (e.which === 13) {
                t.startPomodoroButton.click();
            }
        });

        h.clearHistory.on('click', function() {
            HistoryWidget.clearHistory();
        });

        h.historyDataTable.on('click', '.edit-task', function() {
            HistoryWidget.editTask(this.id);
        });

        h.historyDataTable.on('focus', '.history__task-description', function() {
            HistoryWidget.showSave($(this).attr('id'));
        });

        h.cancelButton.on('mousedown', function() {
            h.cancelButton.data('mousedown', true);
        });

        h.cancelButton.on('mouseup', function() {
            h.cancelButton.data('mousedown', false);
        });

        h.historyDataTable.on('blur', '.history__task-description', function() {
            if (h.cancelButton.data('mousedown') !== true) {
                HistoryWidget.saveTask(h.currentTaskEdit);
            }
        });

        h.historyDataTable.on('keydown', '.history__task-description', function(e) {
            if (e.which === 13) {
                $(this).blur();
                HistoryWidget.saveTask(h.currentTaskEdit);
            }

            return e.which !== 13;
        });

        h.saveButton.on('click', function() {
            HistoryWidget.saveTask(h.currentTaskEdit);
        });

        h.cancelButton.on('click', function() {
            HistoryWidget.cancelSave();
        });

        h.historyDataTable.on('click', '.edit-task', function() {
            HistoryWidget.editTask(this);
        });

        h.exportButton.on('click', function() {
            HistoryWidget.exportTable();
        });
    },

    displayTimeTaken: function(timeTaken) {
        var minute = Math.floor(timeTaken / 60);
        var second = timeTaken % 60;
        return TimerWidget.formatTime(minute) + ':' + TimerWidget.formatTime(second);
    },

    editTask: function(id) {
        var taskId = $(id).attr('id');
        $('#task-' + taskId).focus();
    },

    cancelSave: function() {
        $('#' + h.currentTaskEdit).text(h.oldTaskInfo);
        HistoryWidget.hideSave();
    },

    showSave: function(id) {
        h.oldTaskInfo = $('#' + id).text();
        h.currentTaskEdit = id;
        h.taskSaveArea.removeClass('hide');
    },

    saveTask: function(id) {
        // stores new content in localstorage
        var item = $('#' + id).parent().parent().attr('id');
        h.data[item].description = $('#' + h.currentTaskEdit).text();
        localStorage.setItem("taskData", JSON.stringify(h.data));
        
        for (var i=0; i< h.row.length; i++) {
            if (h.row[i].id === item) {
                h.row[i].task = $('#' + h.currentTaskEdit).text();
                localStorage.setItem("rowData", JSON.stringify(h.row));
            }
        }
        HistoryWidget.hideSave();
    },

    hideSave: function() {
        h.taskSaveArea.addClass('hide');
    },

    clearHistory: function() {

        
        localStorage.clear();
        h.data = {};
        h.row = [];
        h.dateArray = [];
        $('#history-data-body').empty();
        $('#history-data').addClass('hide');
        $('#history-empty').removeClass('hide');
    },

    storeLocally: function(params) {
        // Saving element in local storage
        h.data[params.id] = params;
        localStorage.setItem("taskData", JSON.stringify(h.data));

        h.row.push(
            {"task": params.description, "time started": params.timeStarted, "time ended": params.timeEnded, "id": params.id, "time spent": params.timeTaken}
        );
        localStorage.setItem("rowData", JSON.stringify(h.row));

        HistoryWidget.addTask(params);
    },

    exportTable: function() {
                
        var columns = [
            {title: "Task", dataKey: "task"},
            {title: "Start Time", dataKey: "time started"},
            {title: "Stop Time", dataKey: "time ended"},
            {title: "Duration", dataKey: "time spent"}
            ];


        // Only pt supported (not mm or in)
        var doc = new jsPDF('p', 'pt');
        doc.autoTable(columns, h.row);
        doc.save('table.pdf');
    },

    addTask: function(params) {
        var defaults = {
          // CSS selectors and attributes that would be used by the JavaScript functions
          taskItem: "history__task-item",
          taskDescription: "history__task-description",
          taskTime: "history__task-time",
          taskStart: "history__task-start",
          taskEnd: "history__task-end",
          id: params.id,
          date: params.date
        };

        h.historyEmptyState.addClass('hide');

        var dateString = defaults.date;
        dateString = dateString.replace(/\s+/g, '-').toLowerCase();

        // If date doesn't exist in array of dates, push it to array and add it here
        if ($.inArray(defaults.date, h.dateArray) <= -1) {
            h.dateArray.push(defaults.date);

            $("<div>", {
                "class" : dateString
            }).prependTo($('#history-data-body'));

            $("<p>", {
                "class" : 'date-header',
                "text": defaults.date
            }).appendTo($('.' + dateString));

            $("<div>", {
                "class": defaults.dateString + '-body'
            }).appendTo($('.' + dateString));

        }

        var wrapper = $("<div>", {
            "class" : defaults.taskItem,
            "id": defaults.id
        }).prependTo($('.' + defaults.dateString + '-body'));

        $("<div>", {
            "class" : defaults.taskTime,
            "text": params.timeTaken,
            "data-label": "Duration"
          }).appendTo(wrapper);

        $("<div>", {
            "class": 'description-container',
            "id": defaults.id + '-container',
            "data-label": "Task"
        }).appendTo(wrapper);

        $("<div>", {
            "class" : defaults.taskDescription,
            "text": params.description,
            "id": 'task-edit-' + params.id,
            "contenteditable": 'true'
        }).appendTo($("#" + defaults.id + "-container"));

        $("<button>", {
            "class" : 'edit-task',
            "id" : 'edit-' + params.id,
            "text" : 'Edit'
        }).insertAfter($('#task-edit-' + params.id));

        $("<div>", {
            "class" : defaults.taskStart,
            "text": params.timeStarted,
            "data-label": "Start"
          }).appendTo(wrapper);

        $("<div>", {
            "class" : defaults.taskEnd,
            "text": params.timeEnded,
            "data-label": "Stop"
        }).appendTo(wrapper);



        
    }
};

// 

$(document).ready(function() {

    SettingsWidget.init();
    TimerWidget.init();
    HistoryWidget.init();

    

});