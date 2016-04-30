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
                date: t.timerEnd.format('MMMM Do, YYYY'),
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
            date: t.timerEnd.format('MMMM Do, YYYY'),
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

            if (s.soundOn === true) {
                var wav = 'sound/ringing-bells.mp3';
                var audio = new Audio(wav);
                audio.play();
            }

            if (type === 'short-break' || type === 'long-break') {
                if (s.notifyOn === true) {
                    SettingsWidget.notify('img/tomato-notification.png', 'Break Over!', 'Back to work.');
                }
                HistoryWidget.storeLocally({
                    description: 'Break Time',
                    timeTaken: HistoryWidget.displayTimeTaken(t.timerBegin - t.timerCountdown),
                    timeStarted: t.timerStart.format('h:mm a'),
                    timeEnded: t.timerEnd.format('h:mm a'),
                    id: t.timerEnd.format('x'),
                    date: t.timerEnd.format('MMMM Do, YYYY'),
                    type: type,
                    timeLabel: h.timeLabel
                });
            } else {
                if (s.notifyOn === true) {
                    SettingsWidget.notify('img/coffee-notification.png', 'Nice work!', 'You deserve a break.');
                }
                HistoryWidget.storeLocally({
                  description: h.currentTask,
                  timeTaken: HistoryWidget.displayTimeTaken(t.timerBegin - t.timerCountdown),
                  timeStarted: t.timerStart.format('h:mm a'),
                  timeEnded: t.timerEnd.format('h:mm a'),
                  id: t.timerEnd.format('x'),
                  date: t.timerEnd.format('MMMM Do, YYYY'),
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
        setNotifications: $('#setNotifications'),
        setSound: $('#setSound'),
        toastUnsupported: $('#toast-unsupported'),
        toastNotifications: $('#toast-notifications'),
        toastSound: $('#toast-sound'),
        closeToastUnsupported: $('#close-toast-unsupported'),
        closeToastNotifications: $('#close-toast-notifications'),
        closeToastSound: $('#close-toast-sound'),
        timerSetting: 1500,
        shortBreakSetting: 300,
        longBreakSetting: 1200,
        localSettings: JSON.parse(localStorage.getItem("settingsData")) || {},
        notifyOn: false,
        soundOn: true
    },

    init: function() {
        s = this.settings;
        this.bindUIActions();

        if (!jQuery.isEmptyObject(s.localSettings)) {
            s.timerSetting = s.localSettings.timerSetting * 60;
            s.shortBreakSetting = s.localSettings.shortBreakSetting * 60;
            s.longBreakSetting = s.localSettings.longBreakSetting * 60;
            s.notifyOn = s.localSettings.notifyOn;
            s.soundOn = s.localSettings.soundOn;
            s.timeInput.attr('value', s.localSettings.timerSetting || 25);
            s.shortBreakInput.attr('value', s.localSettings.shortBreakSetting || 5);
            s.longBreakInput.attr('value', s.localSettings.longBreakSetting || 20);
        }

        if (s.notifyOn === true) {
            s.setNotifications.attr('checked', true);
        } else {
            s.setNotifications.attr('checked', false);
        }

        if (s.soundOn === true) {
            s.setSound.attr('checked', true);
        } else {
            s.setSound.attr('checked', false);
        }

    },

    bindUIActions: function() {
        s.saveButton.on('click', function () {
            SettingsWidget.saveSettings();
        });

        s.cancelButton.on('click', function() {
            SettingsWidget.exitSettings();
        });

        s.setNotifications.on('click', function() {
            SettingsWidget.checkNotificationSetting(this);
        });

        s.setSound.on('click', function() {
            SettingsWidget.checkSoundSetting(this);
        });

        s.closeToastUnsupported.on('click', function() {
            SettingsWidget.closeToast($(this).parent());
        });

        s.closeToastNotifications.on('click', function() {
            SettingsWidget.closeToast($(this).parent());
        });

        s.closeToastSound.on('click', function() {
            SettingsWidget.closeToast($(this).parent());
        });
    },

    saveSettings: function() {
        s.timerSetting = s.timeInput.val() * 60;
        s.shortBreakSetting = s.shortBreakInput.val() * 60;
        s.longBreakSetting = s.longBreakInput.val() * 60;
        s.localSettings = {
            "timerSetting": s.timeInput.val(),
            "shortBreakSetting": s.shortBreakInput.val(),
            "longBreakSetting": s.longBreakInput.val(),
            "notifyOn": s.notifyOn,
            "soundOn": s.soundOn
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
    },

    checkNotificationSetting: function(element) {
        if($(element).prop('checked')) {
            SettingsWidget.askToNotify();
        } else {
            s.notifyOn = false;
            s.toastNotifications.removeClass('hide');
        }
    },

    askToNotify: function() {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            s.toastUnsupported.removeClass('hide');
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            s.notifyOn = true;
            SettingsWidget.notify('', "Desktop notifications have been enabled.", '');
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
              // If the user accepts, let's create a notification
                if (permission === "granted") {
                    s.notifyOn = true;
                    SettingsWidget.notify('', "Desktop notifications have been enabled.", '');
                }
            });
        } else {
            s.notifyOn = false;
        }

        // At last, if the user has denied notifications, and you 
        // want to be respectful there is no need to bother them any more.
    },

    notify: function(icon, title, body) {
        var options = {
          body: body,
          icon: icon
         };

        var notification = new Notification(title, options);
        setTimeout(notification.close.bind(notification), 5000);
        notification.onclick = function() {
            notification.close();
            window.focus();
        };
    },

    closeToast: function(element) {
        element.addClass('hide');
    },

    checkSoundSetting: function(element) {
        if($(element).prop('checked')) {
            s.soundOn = true;
        } else {
            s.soundOn = false;
            s.toastSound.removeClass('hide');
        }
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
        exportCSV: $('#export-csv'),
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

        h.exportCSV.on('click', function() {
            HistoryWidget.exportTableToCSV.apply(this, [h.row, 'timesheet.csv']);
        });


    },

    displayTimeTaken: function(timeTaken) {
        var hour,
            minute,
            second;

        var timeString = "";
        var time = timeTaken;

        if (time >= 3600) {
            hour = Math.floor(time / 3600);
            time -= hour * 3600;
        } else {
            hour = "00";
        }

        if (time >= 60) {
            minute = Math.floor(time / 60);
            time -= minute * 60;
        } else {
            minute = "00";
        }

        if (time >= 0) {
            second = time;
        }

        timeString = HistoryWidget.addZero(hour) + ":" + HistoryWidget.addZero(minute) + ":" + HistoryWidget.addZero(second);

        return timeString;
    },

    displayTimeOnTable: function(timeTaken) {

        var timeArray = timeTaken.split(":");

        if (timeArray[0] !== "00" || timeArray[1] !== "00") {
            return (parseInt(timeArray[0]) * 60) + parseInt(timeArray[1]);
        } else {
            return "<1";
        }
    },

    addZero: function(time) {
        if (time < 10 && time !== "00") {
            return "0" + time;
        } else {
            return time;
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
            {"task": params.description, "time started": params.timeStarted, "time ended": params.timeEnded, "id": params.id, "time spent": params.timeTaken, "date": params.date}
        );
        localStorage.setItem("rowData", JSON.stringify(h.row));

        HistoryWidget.addTask(params);
    },

    exportTable: function() {
                
        var columns = [
            {title: "Date", dataKey: "date"},
            {title: "Task", dataKey: "task"},
            {title: "Start Time", dataKey: "time started"},
            {title: "Stop Time", dataKey: "time ended"},
            {title: "Duration", dataKey: "time spent"}
            ];


        var headerImg = "data:image/png;base64,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";
        // Only pt supported (not mm or in)
        var doc = new jsPDF('p', 'pt');
        doc.autoTable(columns, h.row, {
            styles: {fillColor: [242, 61, 80], fillStyle: 'S'},
            columnStyles: {
                date: {fillColor: 255}
            },
            headerStyles: {
                fillColor: [242,61,80], fillStyle: 'F'
            },
            margin: {top: 60},
            beforePageContent: function(data) {
                doc.addImage(headerImg, 'JPEG', data.settings.margin.left, 25, 157.142857143, 27.8195488722);
                doc.text("Timesheet", data.settings.margin.left + 168, 46);
            }
        });
        doc.save('timesheet.pdf');
    },

    exportTableToCSV: function(table, filename) {

        var csv = "Date, Task, Start Time, Stop Time, Duration";

        for (var i = 0; i < h.row.length; i++) {
            var date = h.row[i].date.split(",").join("");

            var rowData = "" + date + "," + h.row[i].task + "," + h.row[i]["time started"] + "," + h.row[i]["time ended"] + "," + h.row[i]["time spent"];
            csv += "\r\n" + rowData;
        }

        // Data URI
        var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

        if (window.navigator.msSaveBlob) { // IE 10+
            //alert('IE' + csv);
            window.navigator.msSaveOrOpenBlob(new Blob([csv], {type: "text/plain;charset=utf-8;"}), "timesheet.csv");
        } 
        else {
            $(this).attr({ 'download': filename, 'href': csvData, 'target': '_blank' }); 
        }
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

        var displayTime = HistoryWidget.displayTimeOnTable(params.timeTaken);

        h.historyEmptyState.addClass('hide');

        var dateString = defaults.date;
        dateString = dateString.replace(/[,\s+]/g, '').toLowerCase();

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
            "text": displayTime,
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

var a,
AboutWidget = {
    settings: {
        showAbout: $('#show-about'),
        aboutSection: $('#about-section'),
        closeAbout: $('#close-about')
    },

    init: function() {
        a = this.settings;
        this.bindUIActions();
    },

    bindUIActions: function() {

        a.showAbout.on('click', function () {
            AboutWidget.showAbout();
        });

        a.closeAbout.on('click', function() {
            AboutWidget.closeAbout();
        });
    },

    showAbout: function() {
        a.aboutSection.removeClass('hide');
    },

    closeAbout: function() {
        a.aboutSection.addClass('hide');
    }
};

// 

$(document).ready(function() {
    "use strict";
    SettingsWidget.init();
    TimerWidget.init();
    HistoryWidget.init();
    AboutWidget.init();
});