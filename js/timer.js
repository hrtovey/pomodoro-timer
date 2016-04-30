// Pretty up the PDF pages
// Maybe export as CSV
// Responsivize it
// Add an About page
// Enable Desktop Alerts
// Sound and Volume Control on Settings

// Issues:
// - Fix Printed text (need more accurate duration data)


// Final Pieces:
// - Tidy up your JS and CSS - any duplicate code should go into functions...see how small you can make the JS
// Minimize, gzip and all that. Make this TINY and make it load quickly
// Back up google fonts so they don't load forever?



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
        timer: $('#time'),
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
        timerType: 'pomo',
        runningPauseTimer: '',
        pauseCounter: 0,
        pauseStartMoment: moment(),
        pauseTime: $('#pause-time'),
        count: 0,
        pauseCurrentMoment: moment(),
        pauseArea: $('#pause-area'),
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
        playpause: true,
        resetButton: $('#reset'),
        pauseMinuteDisplay: $('#pause-minute-display'),
        pauseSecondDisplay: $('#pause-second-display'),
        backgroundImage: $('#background-image'),
        startTime: $('#start-time')
    },

    init: function() {
        t = this.settings;
        this.bindUIActions();
        TimerWidget.displayTimerFoyer(s.timerSetting);
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

        t.resetButton.on('click', function() {
            TimerWidget.reset();
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
            t.progressNotification.addClass('pomodoro-progress');
            t.progressNotification.removeClass('hide short-break-progress long-break-setting');

            if (h.currentTask === '') {
                h.currentTask = 'Working Hard';
            }

            h.taskWritten.text(h.currentTask);
            
            h.taskWritten.removeClass('hide');
            TimerWidget.cancelTimer();
            t.timerType = 'pomo';
            t.timerCountdownStart = s.timerSetting;
            t.degrees = 0;
            TimerWidget.startTimer(s.timerSetting, t.timerType);
        });

        t.startShortBreakButton.on('click', function() {
            h.currentTask = "Break Time"; // duplicate code
            h.taskInput.addClass('hide');
            $(this).addClass('hide');
            t.progressNotification.addClass('short-break-progress');
            t.progressNotification.removeClass('hide pomodoro-progress long-break-setting');

            h.taskWritten.removeClass('hide');
            TimerWidget.cancelTimer();
            t.timerType = 'short-break';
            t.timerCountdownStart = s.shortBreakSetting;
            t.degrees = 0;
            TimerWidget.startTimer(s.shortBreakSetting, t.timerType);
        });

        t.startLongBreakButton.on('click', function() {
            h.currentTask = "Long Break";
            h.taskInput.addClass('hide');
            $(this).addClass('hide');
            t.progressNotification.addClass('long-break-progress');
            t.progressNotification.removeClass('hide short-break-progress pomodoro-progress');

            h.taskWritten.removeClass('hide');
            TimerWidget.cancelTimer();
            t.timerType = 'long-break';
            t.timerCountdownStart = s.longBreakSetting;
            t.degrees = 0;
            TimerWidget.startTimer(s.longBreakSetting, t.timerType); 
        });
    },

    reset: function() {
        TimerWidget.cancelTimer();
        TimerWidget.cancelPauseTimer();
        switch(t.timerType) {
            case 'pomo':
                TimerWidget.showPomodoro();
                break;
            case 'short-break':
                TimerWidget.showShortBreak();
                break;
            case 'long-break':
                TimerWidget.showLongBreak();
                break;
            default:
                TimerWidget.showPomodoro();

        }
    },

    setPlayPause: function() {
        t.playpause = !t.playpause;
        if (t.playpause) {
            TimerWidget.cancelPauseTimer();
            HistoryWidget.storeLocally({
                description: 'Interrupted!',
                timeTaken: HistoryWidget.displayTimeTaken(t.count),
                timeStarted: t.pauseStartMoment.format('h:mm a'),
                timeEnded: t.pauseCurrentMoment.format('h:mm a'),
                id: t.pauseCurrentMoment.format('x'),
                date: t.timerEnd.format('MMMM Do YYYY'),
                type: 'interrupted',
                timeLabel: h.timeLabel
            });
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
            timeStarted: t.timerStart.format('h:mm a'),
            timeEnded: t.timerEnd.format('h:mm a'),
            id: t.timerEnd.format('x'),
            date: t.timerEnd.format('MMMM Do YYYY'),
            type: t.timerType,
            timeLabel: h.timeLabel
        });
        t.pauseText.removeClass('hide');
        t.pauseCounter = 0;
        t.pauseStartMoment = moment();
        var minute = Math.floor(t.pauseCounter / 60);
        var second = t.pauseCounter % 60;
        t.pauseMinuteDisplay.text(TimerWidget.formatTime(minute));
        t.pauseSecondDisplay.text(TimerWidget.formatTime(second));
        t.runningPauseTimer = setInterval(TimerWidget.intervalTimerUp, 1000);
    },

    cancelTimer: function() {
        t.timerEnd = moment();
        clearInterval(t.runningTimer);
        t.timerCountdown = 0;
    },

    pomoFlow: function(type) {
        if (type === 'pomo') {
            t.pomoCount += 1;
            if (t.pomoCount % 4 === 0) {
                TimerWidget.showLongBreak();
            } else {
                TimerWidget.showShortBreak();
            }
        }

        if (type !== 'pomo') {
            TimerWidget.showPomodoro();
        }

        
    },

    showPomodoro: function() {
        TimerWidget.displayTimerFoyer(s.timerSetting);
        t.startTime.removeClass('hide');
        h.taskInput.removeClass('hide');
        t.startPomodoroButton.removeClass('hide');
        t.progressNotification.addClass('hide');
        h.taskWritten.addClass('hide');
        t.backgroundImage.removeClass('background__short-break background__long-break fade-out2');
        t.backgroundImage.addClass('background__pomodoro fade-in2');
        t.timer.removeClass('fade-in2');
        t.timer.addClass('fade-out2');
        t.timerType = "pomo";
    },

    showLongBreak: function() {
        TimerWidget.displayTimerFoyer(s.longBreakSetting);
        t.startTime.removeClass('hide');
        t.startLongBreakButton.removeClass('hide');
        t.progressNotification.addClass('hide');
        h.taskWritten.text("Nice work! Time to take a longer break.");
        t.backgroundImage.removeClass('background__short-break background__pomodoro fade-out2');
        t.backgroundImage.addClass('background__long-break fade-in2');
        t.timer.removeClass('fade-in2');
        t.timer.addClass('fade-out2');
        t.timerType = "long-break";

        TimerWidget.cancelPauseTimer();
    },

    showShortBreak: function() {
        TimerWidget.displayTimerFoyer(s.shortBreakSetting);
        t.startTime.removeClass('hide');
        t.startShortBreakButton.removeClass('hide');
        t.progressNotification.addClass('hide');
        h.taskWritten.text("Take a short break. You've earned it!");
        t.backgroundImage.removeClass('background__long-break background__pomodoro fade-out2');
        t.backgroundImage.addClass('background__short-break fade-in2');
        t.timer.removeClass('fade-in2');
        t.timer.addClass('fade-out2');
        t.timerType = "short-break";

        TimerWidget.cancelPauseTimer();
    },

    startTimer: function(setting, type) {
        t.timerBegin = setting;
        t.timerStart = moment();
        t.timerCountdown = setting;
        t.degreeCalculation = 360 / t.timerCountdownStart;
        t.statement.addClass('hide');
        TimerWidget.displayTimer(t.timerCountdown);
        TimerWidget.hideTimerFoyer();
        t.runningTimer = setInterval(TimerWidget.intervalTimer, 1000, type);
        h.historyEmptyState.addClass('hide');
        h.historyData.removeClass('hide');
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
        t.pauseMinuteDisplay.text(TimerWidget.formatTime(minute));
        t.pauseSecondDisplay.text(TimerWidget.formatTime(second));

    },

    displayTimerFoyer: function(countdown) {
        t.pauseArea.addClass('hide');
        var minute = Math.floor(countdown / 60);
        var second = countdown % 60;
        t.startTime.text(TimerWidget.formatTime(minute) + ':' + TimerWidget.formatTime(second));
        
    },

    cancelPauseTimer: function() {
        t.pausePlay.removeClass("paused");
        t.playpause = true;
        clearInterval(t.runningPauseTimer);
        t.degrees = t.new_degrees;
        t.pauseText.addClass('hide');
    },

    intervalTimer: function(type) {

        if (t.timerCountdown <= 1) {
            TimerWidget.cancelTimer();
        }

        if (t.timerCountdown > 0) {
            t.timerCountdown = t.timerBegin - Math.round((moment() - t.timerStart) / 1000);
        } else if (t.timerCountdown <= 0) {
            TimerWidget.pomoFlow(type);
            if (type === 'short-break' || type === 'long-break') {
                HistoryWidget.storeLocally({
                    description: 'Break Time',
                    timeTaken: HistoryWidget.displayTimeTaken(t.timerBegin - t.timerCountdown),
                    timeStarted: t.timerStart.format('h:mm a'),
                    timeEnded: t.timerEnd.format('h:mm a'),
                    id: t.timerEnd.format('x'),
                    date: t.timerEnd.format('MMMM Do YYYY'),
                    type: type,
                    timeLabel: h.timeLabel
                });
            } else {
                HistoryWidget.storeLocally({
                  description: h.currentTask,
                  timeTaken: HistoryWidget.displayTimeTaken(t.timerBegin - t.timerCountdown),
                  timeStarted: t.timerStart.format('h:mm a'),
                  timeEnded: t.timerEnd.format('h:mm a'),
                  id: t.timerEnd.format('x'),
                  date: t.timerEnd.format('MMMM Do YYYY'),
                  type: type,
                  timeLabel: h.timeLabel
                });
            }
            
        }

        

        TimerWidget.displayTimer(t.timerCountdown);

        
    },

    hideTimerFoyer: function() {
        t.timer.removeClass('fade-out2 fade-out').addClass('fade-in2');
        t.backgroundImage.removeClass('fade-in2').addClass('fade-out2');
    },

    displayTimer: function(countdown) {
        t.pauseArea.removeClass('hide');
        var minute = Math.floor(countdown / 60);
        var second = countdown % 60;

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
        t.ctx.fillText(t.text, t.W/2 - text_width/2, t.H/2 + 15);
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
        longBreakSetting: 1200,
        localSettings: JSON.parse(localStorage.getItem("settingsData")) || {}
    },

    init: function() {
        s = this.settings;
        this.bindUIActions();

        if (s.localSettings !== {}) {
            s.timerSetting = s.localSettings.timerSetting * 60;
            s.shortBreakSetting = s.localSettings.shortBreakSetting * 60;
            s.longBreakSetting = s.localSettings.longBreakSetting * 60;
            s.timeInput.attr('value', s.localSettings.timerSetting);
            s.shortBreakInput.attr('value', s.localSettings.shortBreakSetting);
            s.longBreakInput.attr('value', s.localSettings.longBreakSetting);
        }



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
        s.timerSetting = s.timeInput.val() * 60;
        s.shortBreakSetting = s.shortBreakInput.val() * 60;
        s.longBreakSetting = s.longBreakInput.val() * 60;
        s.localSettings = {
            "timerSetting": s.timeInput.val(),
            "shortBreakSetting": s.shortBreakInput.val(),
            "longBreakSetting": s.longBreakInput.val()
        };

        localStorage.setItem("settingsData", JSON.stringify(s.localSettings));
        TimerWidget.reset();
        SettingsWidget.exitSettings();

    },

    enterSettings: function() {
        s.settingsSection.removeClass('hide');
        $('.settings-modal').focus();
    },

    exitSettings: function() {
        s.settingsSection.addClass('hide');
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
        dateArray: [],
        timeLabel: 'min',
        taskSaveShowing: false,
        saveCanceled: false
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
            HistoryWidget.editTask(this);
        });

        h.historyDataTable.on('focus', '.history__task-description', function() {
            HistoryWidget.showSave($(this).attr('id'));
        });

        h.historyDataTable.on('keydown', '.history__task-description', function(e) {
            if (e.which === 13) {
                $(this).blur();
                HistoryWidget.saveTask(h.currentTaskEdit);
            }

            return e.which !== 13;
        });

        h.historyDataTable.on('click', '#save-button', function() {
            HistoryWidget.saveTask(h.currentTaskEdit);
        });

        h.historyDataTable.on('click', '#cancel-button', function() {
            HistoryWidget.cancelSave();
        });

        h.exportButton.on('click', function() {
            HistoryWidget.exportTable();
        });
    },

    displayTimeTaken: function(timeTaken) {
        // If there are minutes, display in minutes
        // If there are only seconds, display in seconds
        var minute = Math.round(timeTaken / 60);

        if (minute > 0) {
            return minute;
        } else {
            return '<1';
        }
    },

    editTask: function(id) {
        var taskId = $(id).attr('id');
        $('#task-' + taskId).focus();
    },

    cancelSave: function() {
        if (h.oldTaskInfo !== '') {
          $('#' + h.currentTaskEdit).text(h.oldTaskInfo);
          h.oldTaskInfo = '';
        }
        
        HistoryWidget.hideSave();
    },

    showSave: function(id) {
        HistoryWidget.saveTask(h.currentTaskEdit);

        h.oldTaskInfo = $('#' + id).text();
        h.currentTaskEdit = id;
        $('#' + h.currentTaskEdit).attr('tabindex', "1").addClass('focus-border');
        var taskSaveAreaId = id.substring(10);

        if (!h.taskSaveShowing) {
            var currentTaskSaveArea = $("<div>", {
                "id": "task-save-area",
                "class": "task-save-area"
            }).insertAfter($('#' + taskSaveAreaId));

            $("<button>", {
                "id": "save-button",
                "class": "save-button button-small button__accent3 waves-effect waves-light",
                "text": "Save"
            }).appendTo(currentTaskSaveArea);

            $("<button>", {
                "id": "cancel-button",
                "class": "cancel-button button-ghost waves-effect waves-light",
                "text": "Cancel"
            }).appendTo(currentTaskSaveArea);

            h.taskSaveShowing = true;
        }
            
    },

    saveTask: function(id) {
        if (id !== '') {
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

            h.oldTaskInfo = '';
        }

        
        HistoryWidget.hideSave();
    },

    hideSave: function() {
        $('#' + h.currentTaskEdit).prop('tabindex', null).removeClass('focus-border');
        h.taskSaveArea = $('#task-save-area');
        h.taskSaveArea.remove();
        h.taskSaveShowing = false;
    },

    clearHistory: function() {

        
        localStorage.removeItem("taskData");
        localStorage.removeItem("rowData");
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
          taskItem: "history__task-item task-icon",
          taskDescription: "history__task-description",
          taskTime: "history__task-duration task-time__arrow",
          taskStart: "history__task-time",
          id: params.id,
          date: params.date,
          type: params.type,
          timeLabel: params.timeLabel
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
                "class": '' + dateString + '-body'
            }).appendTo($('.' + dateString));

        }

        var historyTaskItem = $("<div>", {
            "class" : defaults.taskItem + ' fade-in2 ' + defaults.type + '-icon',
            "id": defaults.id
        }).prependTo($('.' + dateString + '-body'));

        var historyTaskDuration = $("<div>", {
            "class" : defaults.taskTime + ' arrow-' + defaults.type,
            "text": params.timeTaken,
            "data-label": "Duration"
          }).appendTo(historyTaskItem);

        $("<abbr>", {
            'class': 'history__task-duration-label',
            'text': defaults.timeLabel
        }).appendTo(historyTaskDuration);

        var descriptionContainer = $("<div>", {
            "class": 'description-container',
            "id": defaults.id + '-container',
            "data-label": "Task"
        }).appendTo(historyTaskItem);

        $("<div>", {
            "class" : defaults.taskDescription,
            "text": params.description,
            "id": 'task-edit-' + defaults.id,
            "contenteditable": 'true'
        }).appendTo(descriptionContainer);

        var historyTaskTime = $("<div>", {
            "class": "history__task-time"
        }).appendTo(descriptionContainer);

        $("<div>", {
            "class" : defaults.taskStart,
            "text": params.timeStarted + ' - ' + params.timeEnded,
            "data-label": "Times"
          }).appendTo(historyTaskTime);

        $("<button>", {
            "class" : 'edit-task button-ghost waves-effect waves-light',
            "id" : 'edit-' + defaults.id,
            "text" : 'Edit'
        }).appendTo(historyTaskItem);



        
    }
};

// 

$(document).ready(function() {
    "use strict";
    SettingsWidget.init();
    TimerWidget.init();
    HistoryWidget.init();
});