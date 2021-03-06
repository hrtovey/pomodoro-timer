// Notifications backwards
// 

var t,
TimerWidget,
s,
SettingsWidget,
h,
HistoryWidget,
a,
AboutWidget;


TimerWidget = {
    // Create variables to use throughout code.
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
        description: "",
        new_degrees: 0,
        difference: 0,
        color: "#EE424E",
        red: "#EE424E",
        orange: "#FFA468",
        blue: "#69E1B4",
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
        startTime: $('#start-time'),
        wav: 'sound/ringing-bells.mp3',
        audio: ''
    },

    init: function() {
        // initialize t to equal the settings object
        t = this.settings;

        // create new setting and set it to new Audio (of t.wav)
        t.audio = new Audio(t.wav);

        // call bindUIActions function
        this.bindUIActions();
        
        // Display the Pomodoro tomato image with the correct timer setting (either 25 or previous settings)
        TimerWidget.displayTimerFoyer('pomo', s.timerSetting);
        // Animate Timer
        // Setup canvas for timer animations
        t.canvas = $("#timer-animation")[0];
        t.ctx = t.canvas.getContext("2d");
        //dimensions
        t.W = t.canvas.width;
        t.H = t.canvas.height;
        
        // Draw timer so it's ready to go
        TimerWidget.draw();

    },

    bindUIActions: function() {
        // When user clicks the settings button, open settings area
        t.changeSettingsButton.on('click', function () {
            SettingsWidget.enterSettings();
        });

        // When user clicks the reset button on the timer, reset the time on the timer
        t.resetButton.on('click', function() {
            TimerWidget.reset();
        });

        // When user clicks the play/pause button, pause or play the timer.
        t.pausePlay.on('click', function() {
            TimerWidget.setPlayPause($(this));
        });


        // When user clicks the Start Timer button, start a pomodoro timer.
        t.startPomodoroButton.on('click', function() {
            TimerWidget.showTimer($(this), 'pomo');
        });

        t.startShortBreakButton.on('click', function() {
            TimerWidget.showTimer($(this), 'short-break');
        });

        t.startLongBreakButton.on('click', function() {
            TimerWidget.showTimer($(this), 'long-break');
        });
    },

    showTimer: function(button, type) {
        // Choose all the different timer settings that vary between timer types. Current Task, timer color, "In Progress" text color, and timer length.
        TimerWidget.chooseTimerSettings(type);
        
        // Hide Task Input and Start Timer button
        h.taskInput.addClass('hide');
        button.addClass('hide');

        // Show task being worked on (user-entered text, or placeholders)
        h.taskWritten.text(h.currentTask).removeClass('hide');

        // Cancel any timers currently running
        TimerWidget.cancelTimer();

        // Set the timer type
        t.timerType = type;

        // Reset the timer canvas animation
        t.degrees = 0;

        // Hide the Timer Foyer.
        TimerWidget.hideTimerFoyer();

        // Start the timer based on countdown setting and timer type
        TimerWidget.startTimer(t.timerCountdownStart, t.timerType);
    },

    chooseTimerSettings: function(type) {
        // If user starts a pomodoro, the currentTask will be whatever the user entered in the task input or "Working Hard." The timer color will be red. The "In Progress" text will be light red. The timer will be set to 25 minutes (or whatever number has been entered in the Settings). The description will be set to the current task.
        if (type === 'pomo') {
            if (h.taskInput.val() === '') {
                h.currentTask = "Working Hard";
            } else {
                h.currentTask = h.taskInput.val();
            }
            t.color = t.red;
            t.progressNotification.removeClass().addClass('progress-notification pomodoro-progress');
            t.timerCountdownStart = s.timerSetting;
            t.description = h.currentTask;

        // If user starts a short break, the currentTask will be "Take a short break. You've earned it." The timer color will be orange. The "In Progress" text will be light orange. The timer will be set to 5 minutes (or whatever number has been entered in the Settings section). The description will be set to "Short Break".
        } else if (type === 'short-break') {
            t.color = t.orange;
            t.progressNotification.removeClass().addClass('progress-notification short-break-progress');
            t.timerCountdownStart = s.shortBreakSetting;
            h.currentTask = "Take a short break. You've earned it!";
            t.description = "Short Break";

        // If user starts a long break, the currentTask will be "Nice work! Time to take a longer break." The timer color will be blue. The "In Progress" text will be a light blue. The timer will be to 20 minutes (or whatever number has been entered in the Settings section). The description will be set to "Long Break".
        } else if (type === 'long-break') {
            t.color = t.blue;
            t.progressNotification.removeClass().addClass('progress-notification long-break-progress');
            t.timerCountdownStart = s.longBreakSetting;
            h.currentTask = "Nice work! Time to take a longer break.";
            t.description = "Long Break";
        }
    },

    reset: function() {
        // When timer is reset, cancel both the regular timer and the pause timer.
        TimerWidget.cancelTimer();
        TimerWidget.cancelPauseTimer();

        // Show the timer foyer where users can start the timer over again.
        switch(t.timerType) {
            // If the timer being reset was a pomodoro, show the Pomodoro Foyer.
            case 'pomo':
                TimerWidget.displayTimerFoyer('pomo', s.timerSetting);
                break;
            // If the timer being reset was a short break, show the Short Break Foyer.
            case 'short-break':
                TimerWidget.displayTimerFoyer('short-break', s.shortBreakSetting);
                break;
            // If the timer being reset was a long break, show the Long Break Foyer.
            case 'long-break':
                TimerWidget.displayTimerFoyer('long-break', s.longBreakSetting);
                break;
            // Otherwise, just show the Pomdoro Foyer in case things go wonky.
            default:
                TimerWidget.displayTimerFoyer('pomo', s.timerSetting);

        }
    },

    setPlayPause: function(element) {
        // If the user pressed play, switch to pause button. If the user pressed pause, switch to play button.
        element.toggleClass("paused");

        // Set the playpause variable to true if user presses play button. Set the playpause variable to false if user presses the pause button.
        t.playpause = !t.playpause;

        // If user presses play button, cancel the pause timer, store the pause timer data in local storage, and then start the regular timer again from where user left off.
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
        // If user presses pause button, pause the regular timer.
        } else {
            TimerWidget.pauseTimer();
        }
    },

    pauseTimer: function() {
        // When timer is paused, assign timerEnd to the current time.
        t.timerEnd = moment();

        // Stop the regular timer.
        clearInterval(t.runningTimer);



        // Store the information from the regular timer into local storage.
        HistoryWidget.storeLocally({
            description: t.description,
            timeTaken: HistoryWidget.displayTimeTaken(t.timerBegin - t.timerCountdown),
            timeStarted: t.timerStart.format('h:mm a'),
            timeEnded: t.timerEnd.format('h:mm a'),
            id: t.timerEnd.format('x'),
            date: t.timerEnd.format('MMMM Do, YYYY'),
            type: t.timerType,
            timeLabel: h.timeLabel
        });

        // Show the "timer paused" text.
        t.pauseText.removeClass('hide');

        // Start the pause timer at 0.
        t.pauseCounter = 0;

        // Assign pauseStartMoment to current time.
        t.pauseStartMoment = moment();

        // Create a minute and second variable based on the pause counter time.
        var minute = Math.floor(t.pauseCounter / 60);
        var second = t.pauseCounter % 60;

        // Show the minute and second in the pause timer display.
        t.pauseMinuteDisplay.text(TimerWidget.formatTime(minute));
        t.pauseSecondDisplay.text(TimerWidget.formatTime(second));

        // Start a pause timer that counts up from 0.
        t.runningPauseTimer = setInterval(TimerWidget.intervalTimerUp, 1000);
    },

    cancelTimer: function() {
        // When a timer is cancelled, make note of what time it is and assign that time to timerEnd.
        t.timerEnd = moment();

        // Stop the running timer.
        clearInterval(t.runningTimer);

        // Set the timerCountdown to 0.
        t.timerCountdown = 0;
    },

    pomoFlow: function(type) {
        // If sound notifications are turned on, play the sound notification.
        if (s.soundOn === true) {
            t.audio.play();
        }

        // If the timer type completed is a pomodoro timer, add 1 to the pomodoro count.
        if (type === 'pomo') {
            // If desktop notifications are on, show desktop notification.
            if (s.notifyOn === true) {
                SettingsWidget.notify('img/coffee-notification.png', 'Nice work!', 'You deserve a break.');
            }

            t.pomoCount += 1;

            // If there have been 4 pomodoro timers since starting (or the last long break), show the Long Break foyer.
            if (t.pomoCount % 4 === 0) {
                TimerWidget.displayTimerFoyer('long-break', s.longBreakSetting);

            // Otherwise, show the Short Break Foyer.
            } else {
                TimerWidget.displayTimerFoyer('short-break', s.shortBreakSetting);
            }
        }

        // If the timer completed was a short break or long break, show the Pomdoro Foyer.
        else {        
            if (s.notifyOn === true) {
                // If desktop notifications are on, show desktop notification.
                SettingsWidget.notify('img/tomato-notification.png', 'Break Over!', 'Back to work.');
            }
            TimerWidget.displayTimerFoyer('pomo', s.timerSetting);
        }

        // Store timer information locally. 
        HistoryWidget.storeLocally({
            description: t.description,
            timeTaken: HistoryWidget.displayTimeTaken(t.timerBegin - t.timerCountdown),
            timeStarted: t.timerStart.format('h:mm a'),
            timeEnded: t.timerEnd.format('h:mm a'),
            id: t.timerEnd.format('x'),
            date: t.timerEnd.format('MMMM Do, YYYY'),
            type: type,
            timeLabel: h.timeLabel
        });
        
    },


    displayTimerFoyer: function(type, countdown) {
        // Make sure the Pause area is hidden
        t.pauseArea.addClass('hide');

        // Display the countdown time on top of the background image
        var minute = Math.floor(countdown / 60);
        var second = countdown % 60;
        t.startTime.text(TimerWidget.formatTime(minute) + ':' + TimerWidget.formatTime(second));

        // If the timer is going to be a pomodoro:
        // - Show the task input form.
        // - Show the Start Pomodoro button.
        // - Hide the Task Written area.
        // - Show the pomodoro background image.
        // - Set the timer type to "pomo".
        if (type === 'pomo') {
            
            h.taskInput.removeClass('hide');
            t.startPomodoroButton.removeClass('hide');
            h.taskWritten.addClass('hide');
            t.backgroundImage.removeClass().addClass('background-image background__pomodoro fade-in2');
            t.timerType = "pomo";
        } 

        // If the timer is going to be a short break:
        // - Show the Start Short Break button.
        // - Change the Task Written area to "Take a short break. You've earned it!".
        // - Show the short break background image.
        // - Set the timer type to "short-break".
        else if (type === 'short-break') {
            t.startShortBreakButton.removeClass('hide');
            h.taskWritten.text("Take a short break. You've earned it!");
            t.backgroundImage.removeClass().addClass('background-image background__short-break fade-in2');
            t.timerType = "short-break";
        } 

        // If the timer is going to be a long break:
        // - Show the Start Long Break button.
        // - Change the Task Written text to "Nice work! Time to take a longer break.".
        // - Show the long break background image.
        // - Set the timer type to "long-break".
        else if (type === 'long-break') {
            t.startLongBreakButton.removeClass('hide');
            h.taskWritten.text("Nice work! Time to take a longer break.");
            t.backgroundImage.removeClass().addClass('background-image background__long-break fade-in2');
            t.timerType = "long-break";
        }

        // Show the start time.
        t.startTime.removeClass('hide');
        // Hide the progress notification.
        t.progressNotification.addClass('hide');
        // Fade out the timer.
        TimerWidget.hideSection(t.timer);
        // Cancel the pause timer if it's going.
        TimerWidget.cancelPauseTimer();
        
    },

    hideSection: function(element) {
        element.removeClass('fade-in2').addClass('fade-out2');
        
    },

    startTimer: function(setting, type) {

        // Set how much time is on the timer when it starts.
        t.timerBegin = setting;

        // Set the timer Start at current time.
        t.timerStart = moment();

        // Set how much time is on the timer (should be the same as timerBegin when the timer starts the first time).
        t.timerCountdown = setting;

        // Calculate the degree to help draw and animate the timer based on the starting time on the timer.
        t.degreeCalculation = 360 / t.timerCountdownStart;

        // Show the timer!
        TimerWidget.displayTimer(t.timerCountdown);

        // Create a running timer and start it!
        t.runningTimer = setInterval(TimerWidget.intervalTimer, 1000, type);

        // Make sure the Empty State for Task History is hidden.
        h.historyEmptyState.addClass('hide');

        // Show Task History section.
        h.historyData.removeClass('hide');
    },

    intervalTimerUp: function() {
        // Set the pause current moment to current time.
        t.pauseCurrentMoment = moment();

        // Set count to the difference between the current time and the starting time on the pause timer.
        t.count = t.pauseCurrentMoment.diff(t.pauseStartMoment, 'second');

        // Display t.count in a timer format.
        var minute = Math.floor(t.count / 60);
        var second = t.count % 60;
        t.pauseMinuteDisplay.text(TimerWidget.formatTime(minute));
        t.pauseSecondDisplay.text(TimerWidget.formatTime(second));

    },


    cancelPauseTimer: function() {
        // Morph pause/play button into pause icon.
        t.pausePlay.removeClass("paused");
        // Set playpause to true (play).
        t.playpause = true;
        // Stop the pause timer.
        clearInterval(t.runningPauseTimer);
        // 
        // t.degrees = t.new_degrees;  What does this do?
        // Hide the pause text.
        t.pauseText.addClass('hide');
    },

    intervalTimer: function(type) {
        // If the timer reaches 1 (or goes below it), don't run the timer again.
        if (t.timerCountdown <= 1) {
            TimerWidget.cancelTimer();
        }

        // If the timer is greater than 0, change the timer countdown number.
        if (t.timerCountdown > 0) {
            t.timerCountdown = t.timerBegin - Math.round((moment() - t.timerStart) / 1000);
        } 

        // If the timer countdown left is less than or equal to 0, show the Timer Foyer.
        else if (t.timerCountdown <= 0) {
            TimerWidget.pomoFlow(type);
        }

        
        // Show timer
        TimerWidget.displayTimer(t.timerCountdown);

        
    },

    hideTimerFoyer: function() {
        // Fade in timer, fade out background image, hide pause area.
        t.timer.removeClass('fade-out2 fade-out hide').addClass('fade-in2');
        TimerWidget.hideSection(t.backgroundImage);
        t.pauseArea.removeClass('hide');
    },

    displayTimer: function(countdown) {
        // Take the countdown and format it into timer-like display.
        var minute = Math.floor(countdown / 60);
        var second = countdown % 60;
        // Display timer number.
        t.text = '' + TimerWidget.formatTime(minute) + ':' + TimerWidget.formatTime(second);
        
        // Draw timer.
        TimerWidget.draw();
    },

    formatTime: function(time) {
        // Take given time and add leading 0 if the number is less than 10.
        if (time < 10) {
            return '0' + time;
        } else {
            return time;
        }
    },

    // Animating Timer

    initAnimation: function() {
        // Clear the canvas everytime a chart is drawn.
        t.ctx.closePath();
        t.ctx.clearRect(0, 0, t.W, t.H);
        
        // Create background 360 degree arc.
        t.ctx.beginPath();
        t.ctx.strokeStyle = t.bgcolor;
        t.ctx.lineWidth = 15;
        t.ctx.arc(t.W/2, t.H/2, 100, 0, Math.PI*2, false); //you can see the arc now
        t.ctx.stroke();
        t.ctx.closePath();
        
        // Create simple arc for timer.
        // Angle in radians = angle in degrees * PI / 180
        var radians = t.degrees * Math.PI / 180;
        t.ctx.beginPath();
        t.ctx.strokeStyle = t.color;
        t.ctx.lineWidth = 15;

        // Start arc from top.
        t.ctx.arc(t.W/2, t.H/2, 100, 0 - 90*Math.PI/180, radians - 90*Math.PI/180, false); 
        
        // Draw the arc.
        t.ctx.stroke();
        
        // Add text
        t.ctx.fillStyle = t.textColor;
        t.ctx.font = "300 50px lato";

        // Center text.
        var text_width = t.ctx.measureText(t.text).width;
        t.ctx.fillText(t.text, t.W/2 - text_width/2, t.H/2 + 15);
    },

    draw: function() {
        // Cancel animation if a new timer is drawn.
        if(typeof t.animation_loop !== undefined) {clearInterval(t.animation_loop);}
        
        // Create degrees from timer countdown.
        t.new_degrees = Math.round((t.timerCountdownStart-t.timerCountdown)*t.degreeCalculation);
        t.difference = t.degrees - t.new_degrees;
        
        // Create animation loop that animates every second.
        t.animation_loop = setInterval(TimerWidget.animate_to, 1000/t.difference);
    },

    animate_to: function() {
        // Clear animation loop if degrees reaches new_degrees.
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

SettingsWidget = {
    // Create variables to use throughout code.
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
        overlay: $('#overlay'),
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
        s.overlay.removeClass('hide');
        s.settingsSection.removeClass('hide');
        s.settingsSection.addClass('fade-in');
        $('.settings-modal').focus();
    },

    exitSettings: function() {
        s.settingsSection.addClass('hide');
        s.overlay.addClass('hide');
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

        if (!h.taskSaveShowing) {
            var currentTaskSaveArea = $("<div>", {
                "id": "task-save-area",
                "class": "task-save-area"
            }).insertAfter($('#' + id));

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


        var headerImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANEAAAAlCAYAAADcOQzgAAAABGdBTUEAALGPC/xhBQAAEB9JREFUeAHtXAl4FFUSrplMkklCQoBg5BJQMJyBBSGCnCpEAcEFRXBF5fDzwwAuBJZLXXCXgN8qrByKqLCCCnjiugooihCRU5dwBBICCcgSFQi5M0kmM9t/x9e8ftPdmSGTANr1fUm/o169etWv3lFVPRa3BFRNcLmd9Hn6EmoWGUudouOrSc1sbkrg+pKA1R/sVric9HNhOh3J3kJut8sfJE0apgSuGwn4RYlySv4nD9hRUUjF5XnXzeBNRk0J+EMCflGiIz9/pfDidJUpaTNhSuD3IAHLldyJCsty6KK0+xSVXaTs/DTKyj2gyKpJRAcKtNrJZg2i8OAoigiOpgahTSnS3ogsFouCZyZMCfxWJOC1EpWUF9Dx8zso/eIuKiy74NX4LWSlOkH1KchWh8IC61GLel2oVf04U5m8kp6JdL1IoEolcjgLKeWnrXQ696C0q0RJO0pjslqsdPjnLbpjDLKGUO8W4yj6vJ2sZy+QK+cSWUrLyVVRIbexNqxPwfH9yWL1y2lSlw+zwpRAbUjAZtSJ82gauYryqHNAC+p8qSFV/PQLBfXtST/QbqWZ1WKjqJAW9EvxKams0jIXHtyQmjoaUeGUBHKXOxVcPlH6n60U9pcpZGvelC/2On327FnKzMwyxG/UqBHZQ+zUtEkTQzyz0lgCjRqr31H2ubPGDX5ntZpKBNdRyRtvU+mGD1XiCJ0/i86EnaPDmZW70C31elBc4xEUeOYCnW55kXZkrZFM3E7KcZwjR4NACp7wGDlefVNFg2Vcx9Op8Mk/k33MwxQ8ahhZAgJYlVfPU6cy6aFRo73CBdKK5cuoT5/eFBUV5XUbE9GUgDcS8DhPuUtKqOiZRR4KFDjwLirr1pp2nV5LAdZg6t/ySeoVdC+VJzxHBRMTKXr1frrn5ikUFBAmK9L2zNUUPGIQWdvcqssHdqmS1WupYNbz5C4t1cXzR0XCpMnUMbYzJSd/6w9yJg1TAooEVErkLiun/GnPUvmevQoCS9hHD6fk0+so0BZK98XMomY5Dajg6VlUkXVaRinf/CXV+dtGGtp8qmSNk453hWmSwr1DYQkTGAndZ8UPKVQ4cz65y2rePD7yoVF05MhRXV7MClMCvkpApURFS18nV3qGBw1LsyaUF+WmsopiGtpmNkWcyKWiqXOJctWO1YqDB8kyfTENrjeeOt04hDJy9tCPjQoo8PY4D5pigfNwKhUtXikWe52fO2c24azO/tKOp9L+fXto44b1HjQGDIyn/Px8j3KzwJQAk4C7qJicx9KVP+T1QFEix9btVL75C0086w03SH6fQBoSM50CtuylopnzyF2sTRQ7U/HEGRT7v2Y0ssMCKq8oI1u/npp0xcLyL78mx+fbxOIrykdERFDTpk3le9DhQwc9aBw8mOJRZhaYEmAScJ7+kXKnJip/yOuBrEQVv1ygkqWv6uFQxclMCvwgmYomP0PF/3xF1+LGCLjyC6hotnTPmb+Smqc4yXnkGKuq8ulY9Ra5CgqrxPMFAcaENavVBo5Dhw75QsLENSWgKwHZOlfyzgdEDoP7SG4ula55W5eIXgXuVlr3Kz18lLsLCsjx7scU+uQYIzSf61q1aqVqcyozU5VnGdyX0tPT6dtdu2j9+g1y8aRJCdS2TRvq3r2bvLsxXP554cIF2rjxPbkIpvXhw/9IpZKx5JtvdtCB77+n5ctXEKMzePAgCg4OlnFxrNy9e4+Cg0LgxQ8cSB07dlDwZGSNfzD1Hz2aqmo/evQo6ty5E3Xt0pXat2+n0UpdBD737dtPO5OTZT5R269fX3rwgQfo7rvvUiMb5EDn8OEjlHoslTZv3iKPHejPzJ1DkH+PHrcTTghasGXLVjp58qRcFR8fL+HfIh+5t237SnkXjCdefowW5JiScoiwOP59QZJcDPxed9xBcXFxXsmS0fL1aXEVFrkvjXiMLOXlvratMXxrRDhFbFxNlqBA3T527kxWmbhxJ8Lk0wNMtm7db1eqYe7m70tQgqSFixTFURCFBCbEhAnjPSa3SB+0X125UplIPBlM8oVJC6hAWjAmT3laEwf4GM/0xGkefaEOE/aNN95UJgzKtAB9zZk9S9e0n5Fxkp597jldHrRoavmJsPgsSEqqks6/1qym+PiBHmSxyCxIWiiXM571ZIPjOe+qgAKOHTfegyZfAIWaO2cOdejQni/WTZenplHetOlKfd3FL1JguxglzydspTt3X1MKBOZwHCzb/18KvqM7z2u10tnZP6na9+7VS8lDgfRemIL0awKrXG5enu7kZvhGPizscA0aNJCshEcMJx0mVmTdupSQ8BQjKz+hQC++tFjZNVSVQgZ9ZWdn07KlL6smHtCgQL379BVa+J6FAsFY4w08Pnac7LPDTq0HjGfs4lrAK9CHH35EkyZP0UJTlYEW/r78YqvXiqQiYJCxOlOuTXOv86B/+Xp3/XqVGNjxDhMSOxD/wrBL4Q4F696/P9nkcZ/C5N74XuXRTUVUI7N82VL5xWFnAl0GoMH6HDXqIbkfvOBFiypXY4YHpcUux8MG6diI9jygn+SdlZNE7Av9YIwYKwOksQPxwHZn0MGfeI/kcVkaC5CoQGw8zDoqjgk+u/37LwctM1r8k8kGZaCHPwBPCzREBcKJBHIE/5CDuACBV/DsT7BVpJ3wJz2/0XKlpfmFFs7K69a9TRs2bFTRY9v6oUOHVUc4CH3G9ETlCAULHwATInH6DMIxEjBz5my6s39/3TsScMRVD/eUmDbqOwomx6KFSUp/4KtOWJhqcmClZ3xgAsyaNRvkZcDERzQGvzqjAn0tXbacVqx4RcbD6n7/sGGKIu/du09RYiCAj/nz/qq6s+BegqMTnNR68Nnnm1VVUOYRI4YrZcxC2q5tWxo67H6lfPGSJYSjHbsbKhVcAu9iyuRJCk9LFr/E1ZK0G6vzorzBf1xcd/k+yysb7q5MuWSrW3GJii4yztOV/k9WgbzmVwihIWRzX8pheNfUs+KS2gdVFXMwFPDRCMWSCT4jI0PzzoAXzSaluEM9/tijmi8W+CMffFBRIvCDicjoiPxhRWSKyupwqUY5O/ujfPy4cR794cXzgHEQVR6XduzYyVdRwlNPeSgQENAXlIYpEco2ffKJokQfb9qEIgXAh9alX1ROpYGUwAIlKvSQIYN5FCXdrdttsqKyxQw7zYkTGR4yYg2g1PxixsrZEwsLW9BQpiVvlENJBwy4G0kFsLuPGfOIPN6i196k8h++V+r0EkUvL9OsCpSMN1YqdmhWXu1CPT+UHl9YaRGNwP5w9oawRMAKxF40JgF7qcDDi9NTCtSLL2PXd9+huFoQGVnXo33Dhg09ylgBrIY8YMfRAygxxsQAMsKYxXFjNxMVnrUxep45o/adYJEx2lmgqDykGZw2tBYXo7b9+vXjq1VpLA5YOHkQeefrfE3bqF49kg6JvrarcfyAyEi/9oGJglUbTwaYTDzccvPNfNYjLa7UmJSLX3rRA6+6BUYTkVd69CPyJPYtjkkcM/B5I4vY3iifk6M+xRgpP+iICwYMHnog4op4Ytuq8EXeGO+21mrXB+sHvsqKE5evFAGtY8gaXodVK0+0t1luiCL3NahE1ujqR1tjiw+XViGcx2NjO3qskg7H5Ys2pALcqgBKyB8jcEE3mvRV0fOlnjcMoB2/IOjREceEMdvtwSp0EUdVaZDBkZmHkJAQPuuRttvtqrI8YRFTVVaRgYWUB5E2X4e0yBvjPWzsIyKqnBdN3HUmPqFv4rbdGE1lqcc1CV3NQkt0tE/dQ2GM/ERaxMTJVODFS+UVCDRrS4G0+hJ50RqjOCZxzFptvC0LDQ1VoZZIXwAYgcOhvjrU9WLR0qMH0z8PIm2+DmmRN5F3Ed+XvDWg2x98wa81XFv3a5OvWhNALXYkKlotdv2b6Moa3Fvy4gvb7FUfmXTZDurepcbZEM/JVRkKRH8NM5PWOKNcB2KfRj4PHP/EMWHM4j1KLwSK61Yz2bhxY1V5ZlaWKi9m8CElD8xXx5d5mxbbis50kY4YKynyLuL7krdapM+nA3t7F2XtC+Hq4Ab17+Pzl65X0h+OYvykhNkVplM9+Orr7aqq27p2VeVrIyP2KZq8eR7gA+Odlhgrxgwl4u9TMJCICwSjY6SkzZpV+tAYLszdWoYLVr/ilUqfFcuLisDKvXmKbddvqIxz1GqLMfBuBeCIvGu187bMCkT7mJHSvyBv29QoniU0jOwPX3bW1WhnEnH4UnhA/JfWhML9g/eJoE3Pnj34prWSFvuEE/HAAU8/B0J64NDkgR8rzNE8vLV2nSqiAXWQA8Kh9AAKKZqOl0mRFKIiYUdcu26dyiAD0zucoVcKaCua7z/66GOPMUCBXlv1uqob8OzPu6wN1G1NbiT7o38ix6o1qs6uRsY+cSwF1JfM7rUE8I/wDlCs3AhUfeGFhdSyRUs6f/48HTt+3CPMBiEl4rGoNlhGn+ibj827b+gw2ajSp3dv0nMyi87Ivn37qNhFGBFi+RD1jCh0rTGrGvyagc/tvfffVxSE0UEEOI6OmVmZhG+3sNvxkDhtKp+9ojRo8CZ/hBPBj4YIeBgOcIRDnt+NsQMzP6FRp5awUIIjlQHyeiArESrtDwyhsuRd5JK+5rtaENClC9kHqb3LtcHLE09MkINKee8+wnr0ACsZfxzSw6upcvQNHvhQFkxeMZ6O9Y9jHMbIAyIREBvHRz9jsvETjuGjPz1LIFZ0hB1hAjMcPTqMHsJzjJzaDK+qJ2iAFh+7B2UVFZbRwTjAqze7kK15M6qbNI81NXzKxzlg4Nd2wpOepYCWzQ0b1FSltW0bCn9+Rk2RN6QLoSLERDyaiI3wErAL8LFhIk5t5cEDeAFPRoAx6YXP3HNPvExDrz1oI2ZwemKiHopcDoXE5MRuZwQ4fiEw9EqiI/ToghZo8kc7LVzwphVjqIXra5nHjze68vKpQPr9BJfB57C+dlIVvjXmVor4xzwy2jJFGjiv89ae+vXr++Xl4DyflpZOZ86ckT8hQL+4xGLVay15p/VWMbTjPznX4weGC+YtB22E7WgdC9mqDhw9WqjDfQMxaJBHZYwdycexm266iWIgVy98MWzMe/dW/kANGy+b7OgDRgrmazFSXNxBUlOPSce4LGKm89jYWII1zOgO5K1cMGY9wD3w3Llz8jEOOHAit2zRgtq1a6sZX6hHx9dyDyUCAfnzbulHQ5zS8a6mIXDAnRQ2ZQJZBMddTfdr0jcl4C8JaCoRI+744htyLFul+6MkDO9KnpbwcAqZlkDBfSQ/lQmmBK5jCRgqEcZVIf2OdskHn5Lz062SMhVVe6hQnqChg8g+YjBZ61Ydq1btDk0CpgRqWAJVKhHrH58mOD7bRmXbvyW3dAZ3uyp/d5vVGz1htLDEtKagu/qS/d47ySJd5E0wJfBbkYDXSsQPGD9kV5ZylPAJt0u6SLov5ZM77xK5C4srw8WlHcZSL5Is0Q0pKLY9BXZqR5YqInx5+mbalMD1JIH/A2bMmA+5akIhAAAAAElFTkSuQmCC";
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
            var task = h.row[i].task.split(",").join("");

            var rowData = "" + date + "," + task + "," + h.row[i]["time started"] + "," + h.row[i]["time ended"] + "," + h.row[i]["time spent"];
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

        var historyContainer = $('<div>', {
            "class": "history__container"
        }).prependTo($('.' + dateString + '-body'));

        var historyTaskItem = $("<div>", {
            "class" : defaults.taskItem + ' fade-in2 ' + defaults.type + '-icon',
            "id": defaults.id
        }).appendTo(historyContainer);

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
        s.overlay.removeClass('hide');
    },

    closeAbout: function() {
        a.aboutSection.addClass('hide');
        s.overlay.addClass('hide');
    }
};

// 

$(document).ready(function() {
    "use strict";
    // Order is important as the Timer Widget relies on variables from History Widget and Settings Widget.
    SettingsWidget.init();
    HistoryWidget.init();
    TimerWidget.init();
    AboutWidget.init();
});