var t,
TimerWidget = {
    settings: {
        timerSection: $('#timer'),
        changeSettingsButton: $('#change-settings'),
        startPomodoroButton: $('#start-pomodoro'),
        startShortBreakButton: $('#start-short-break'),
        startLongBreakButton: $('#start-long-break'),
        runningTimer: '',
        timerBeginning: 0
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
            TimerWidget.startTimer(s.timerSetting);
        });

        t.startShortBreakButton.on('click', function() {
            TimerWidget.cancelTimer();
            TimerWidget.startTimer(s.shortBreakSetting);
        });

        t.startLongBreakButton.on('click', function() {
            TimerWidget.cancelTimer();
            TimerWidget.startTimer(s.longBreakSetting);
        });
    },

    cancelTimer: function() {
        clearInterval(t.runningTimer);
    },

    startTimer: function(setting) {
        t.timerBeginning = setting;
        t.runningTimer = setInterval(TimerWidget.intervalTimer, 1000, setting);
    },

    intervalTimer: function(setting) {
        if (t.timerBeginning > 0) {
            
        } else {
            TimerWidget.cancelTimer();
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