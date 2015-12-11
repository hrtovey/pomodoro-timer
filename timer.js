// Remember to use Date.now() to compare time stamps

var t,
TimerWidget = {
    settings: {
        timerSection: $('#timer'),
        changeSettingsButton: $('#change-settings'),
        startPomodoroButton: $('#start-pomodoro'),
        startShortBreakButton: $('#start-short-break'),
        startLongBreakButton: $('#start-long-break'),
        runningTimer: '',
        timerBegin: 0,
        timerCountdown: 0,
        timerStart: moment(),
        pomoCount: 0,
        statement: $('#statement'),
        timerEnd: moment()
    },

    init: function() {
        t = this.settings;
        this.bindUIActions();

    },

    bindUIActions: function() {
        t.changeSettingsButton.on('click', function () {
            SettingsWidget.enterSettings();
        });

        t.startPomodoroButton.on('click', function() {
            TimerWidget.cancelTimer();
            TimerWidget.startTimer(s.timerSetting, 'pomo');
        });

        t.startShortBreakButton.on('click', function() {
            TimerWidget.cancelTimer();
            TimerWidget.startTimer(s.shortBreakSetting, 'short-break');
        });

        t.startLongBreakButton.on('click', function() {
            TimerWidget.cancelTimer();
            TimerWidget.startTimer(s.longBreakSetting, 'long-break');
        });
    },

    cancelTimer: function(type) {
        t.timerEnd = moment();
        clearInterval(t.runningTimer);
        t.timerCountdown = 0;
        if (type === 'pomo') {
            t.pomoCount += 1;
            h.taskArea .removeClass('hide');
        }
        t.statement.removeClass('hide');
        t.statement.text(TimerWidget.chooseStatement(type));

    },

    startTimer: function(setting, type) {
        t.timerBegin = setting;
        t.timerStart = moment();
        t.timerCountdown = setting;
        t.statement.addClass('hide');
        h.taskArea.addClass('hide');
        TimerWidget.displayTimer(t.timerCountdown);
        t.runningTimer = setInterval(TimerWidget.intervalTimer, 1000, type);
    },

    chooseStatement: function(type) {
        if (type === 'pomo') {
            if (t.pomoCount % 4 === 0) {
                return "Take a long break!"
            } else {
                return "Take a short break!"
            }
        } else {
            return "Back to work with you!";
        }
    },

    intervalTimer: function(type) {
        if (t.timerCountdown > 1) {
            t.timerCountdown = t.timerBegin - Math.round((moment() - t.timerStart) / 1000);
        } else {
            TimerWidget.cancelTimer(type);
            if (type === 'short-break' || type === 'long-break') {
                HistoryWidget.storeLocally({
                    description: 'Break Time',
                    timeTaken: t.timerBegin,
                    timeStarted: t.timerStart.format('h:mm:ss a'),
                    timeEnded: t.timerEnd.format('h:mm:ss a'),
                    id: t.timerEnd.format('x')
                });
            }
        }
        TimerWidget.displayTimer(t.timerCountdown);
    },

    displayTimer: function(countdown) {
        var minute = Math.floor(countdown / 60);
        var second = countdown % 60;
        $('#time').removeClass('hide');
        $('#minute-display').text(TimerWidget.formatTime(minute));
        $('#second-display').text(TimerWidget.formatTime(second));
    },

    formatTime: function(time) {
        if (time < 10) {
            return '0' + time;
        } else {
            return time;
        }
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
    },

    enterSettings: function() {
        t.timerSection.addClass('hide');
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
        taskInput: $('#task-input'),
        historyData: $('#history-data'),
        taskInputButton: $('#task-input-button'),
        taskList: []
    },

    init: function() {
        h = this.settings;
        this.bindUIActions();

    },

    bindUIActions: function() {
        h.taskInputButton.on('click', function() {
            HistoryWidget.addTask();
        });
    },

    addTask: function() {
        h.taskList.push([h.taskInput.val(), t.timerStart - t.timerCountdown]);
        HistoryWidget.displayTaskHistory();
    },

    displayTaskHistory: function() {
        h.historyData.text(h.taskList);
    }
};

$(document).ready(function() {

  SettingsWidget.init();
  TimerWidget.init();
  HistoryWidget.init();

});