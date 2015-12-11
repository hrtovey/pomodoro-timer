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
        taskArea: $('#task-area'),
        taskInput: $('#task-input'),
        historyData: $('#history-data'),
        historyDataTable: $('#history-data-table'),
        taskInputButton: $('#task-input-button'),
        historyDataTable: $('#history-data-table'),
        data: JSON.parse(localStorage.getItem("taskData")) || {},
        clearHistory: $('#clear-history'),
        saveButton: $('#save-button'),
        taskSaveArea: $('#task-save-area'),
        cancelButton: $('#cancel-button'),
        currentTaskEdit: '',
        editTaskButton: $('#edit-task'),
        oldTaskInfo: ''
    },

    init: function() {
        h = this.settings;
        this.bindUIActions();
        $.each(h.data, function (index, params) {
            HistoryWidget.addTask(params);
        });

    },

    bindUIActions: function() {
        h.taskInputButton.on('click', function() {
            HistoryWidget.storeLocally({
              description: h.taskInput.val(),
              timeTaken: t.timerBegin,
              timeStarted: t.timerStart.format('h:mm:ss a'),
              timeEnded: t.timerEnd.format('h:mm:ss a'),
              id: t.timerEnd.format('x')
            });
        });

        h.clearHistory.on('click', function() {
            HistoryWidget.clearHistory();
        });

        h.historyDataTable.on('click', '.edit-task', function() {
            HistoryWidget.editTask(this.id);
        });

        h.historyDataTable.on('focus', '.history__task-description', function() {
            HistoryWidget.showSave($(this).parent().attr('id'));
        });

        h.historyDataTable.on('keydown', '.history__task-description', function(e) {
            if (e.which === 13) {
                $(this).blur();
            }

            return e.which != 13;
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
    },

    editTask: function(id) {
        $(id).siblings('.history__task-description').focus();
    },

    cancelSave: function() {
        $('#' + h.currentTaskEdit + '>.history__task-description').text(h.oldTaskInfo);
        HistoryWidget.hideSave();
    },

    showSave: function(id) {
        h.oldTaskInfo = $('#' + id + '>.history__task-description').text();
        h.currentTaskEdit = id;
        h.taskSaveArea.removeClass('hide');
    },

    saveTask: function(id) {
        // stores new content in localstorage
        h.data[id]['description'] = $('#' + h.currentTaskEdit + '>.history__task-description').text();
        localStorage.setItem("taskData", JSON.stringify(h.data));
        HistoryWidget.hideSave();
    },

    hideSave: function() {
        h.taskSaveArea.addClass('hide');
    },

    clearHistory: function(params) {

        $.each(h.data, function (index, params) {
            $('#' + params.id).remove();
        });
        localStorage.clear();

    },

    storeLocally: function(params) {
        // Saving element in local storage
        h.data[params.id] = params;
        localStorage.setItem("taskData", JSON.stringify(h.data));

        HistoryWidget.addTask(params);
    },

    addTask: function(params) {
        var defaults = {
          // CSS selectors and attributes that would be used by the JavaScript functions
          taskItem: "history__task-item",
          taskDescription: "history__task-description",
          taskTime: "history__task-time",
          taskStart: "history__task-start",
          taskEnd: "history__task-end",
          id: params.id
        };

        var wrapper = $("<tr>", {
            "class" : defaults.taskItem,
            "id": defaults.id
        }).appendTo($('#history-data-table'));

        $("<td>", {
            "class" : defaults.taskDescription,
            "text": params.description,
            "contenteditable": 'true'
        }).appendTo(wrapper);

        $("<td>", {
            "class" : defaults.taskTime,
            "text": params.timeTaken
          }).appendTo(wrapper);

        $("<td>", {
            "class" : defaults.taskStart,
            "text": params.timeStarted
          }).appendTo(wrapper);

        $("<td>", {
            "class" : defaults.taskEnd,
            "text": params.timeEnded
        }).appendTo(wrapper);

        $("<button>", {
            "class" : 'edit-task',
            "id" : 'edit-task-' + params.id,
            "text" : 'Edit'
        }).appendTo(wrapper);
    
        h.taskArea.addClass('hide');
    }
};

$(document).ready(function() {

  SettingsWidget.init();
  TimerWidget.init();
  HistoryWidget.init();

});