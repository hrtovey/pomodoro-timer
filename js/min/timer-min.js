var t,TimerWidget,s,SettingsWidget,h,HistoryWidget,t,TimerWidget={settings:{timerSection:$("#timer"),changeSettingsButton:$("#change-settings"),startPomodoroButton:$("#start-pomodoro"),startShortBreakButton:$("#start-short-break"),startLongBreakButton:$("#start-long-break"),runningTimer:"",timerBegin:0,timerCountdown:1500,timerStart:moment(),pomoCount:0,statement:$("#statement"),timerEnd:moment(),startTimerButton:$("#start-timer"),pauseTimerButton:$("#pause-timer"),timerType:"",runningPauseTimer:"",pauseCounter:0,pauseStartMoment:moment(),pauseTime:$("#pause-time"),count:0,pauseCurrentMoment:moment(),pauseText:$("#pause-text")},init:function(){t=this.settings,this.bindUIActions(),TimerWidget.displayTimer(t.timerCountdown)},bindUIActions:function(){t.changeSettingsButton.on("click",function(){SettingsWidget.enterSettings()}),t.startPomodoroButton.on("click",function(){TimerWidget.cancelTimer(),h.currentTask=h.taskInput.val(),t.timerSection.removeClass("hide"),t.timerType="pomo",TimerWidget.startTimer(s.timerSetting,t.timerType)}),t.startShortBreakButton.on("click",function(){TimerWidget.cancelTimer(),t.timerType="short-break",TimerWidget.startTimer(s.shortBreakSetting,t.timerType),t.pauseTimerButton.addClass("hide")}),t.startLongBreakButton.on("click",function(){TimerWidget.cancelTimer(),t.timerType="long-break",TimerWidget.startTimer(s.longBreakSetting,t.timerType),t.pauseTimerButton.addClass("hide")}),t.pauseTimerButton.on("click",function(){TimerWidget.pauseTimer()}),t.startTimerButton.on("click",function(){TimerWidget.cancelPauseTimer(),TimerWidget.startTimer(t.timerCountdown,t.timerType)})},pauseTimer:function(){t.timerEnd=moment(),clearInterval(t.runningTimer),t.startTimerButton.removeClass("hide"),t.pauseTimerButton.addClass("hide"),HistoryWidget.storeLocally({description:h.currentTask,timeTaken:HistoryWidget.displayTimeTaken(t.timerBegin-t.timerCountdown),timeStarted:t.timerStart.format("h:mm:ss a"),timeEnded:t.timerEnd.format("h:mm:ss a"),id:t.timerEnd.format("x")}),h.historyData.removeClass("hide"),t.pauseText.removeClass("hide"),t.pauseCounter=0,t.pauseStartMoment=moment();var e=Math.floor(t.pauseCounter/60),i=t.pauseCounter%60;$("#pause-minute-display").text(TimerWidget.formatTime(e)),$("#pause-second-display").text(TimerWidget.formatTime(i)),t.runningPauseTimer=setInterval(TimerWidget.intervalTimerUp,1e3)},cancelTimer:function(e){t.timerEnd=moment(),clearInterval(t.runningTimer),t.timerCountdown=0,"pomo"===e&&(t.pomoCount+=1,h.taskArea.removeClass("hide")),t.statement.removeClass("hide"),t.statement.text(TimerWidget.chooseStatement(e))},startTimer:function(e,i){t.timerBegin=e,t.timerStart=moment(),t.timerCountdown=e,t.statement.addClass("hide"),TimerWidget.displayTimer(t.timerCountdown),t.runningTimer=setInterval(TimerWidget.intervalTimer,1e3,i),t.pauseTimerButton.removeClass("hide"),t.startTimerButton.addClass("hide")},chooseStatement:function(e){return"pomo"===e?t.pomoCount%4===0?"Take a long break!":"Take a short break!":"Back to work with you!"},intervalTimerUp:function(){t.pauseCurrentMoment=moment(),t.count=t.pauseCurrentMoment.diff(t.pauseStartMoment,"second");var e=Math.floor(t.count/60),i=t.count%60;$("#pause-minute-display").text(TimerWidget.formatTime(e)),$("#pause-second-display").text(TimerWidget.formatTime(i))},cancelPauseTimer:function(){clearInterval(t.runningPauseTimer),HistoryWidget.storeLocally({description:"Interrupted!",timeTaken:HistoryWidget.displayTimeTaken(t.count),timeStarted:t.pauseStartMoment.format("h:mm:ss a"),timeEnded:t.pauseCurrentMoment.format("h:mm:ss a"),id:t.pauseCurrentMoment.format("x")}),t.pauseText.addClass("hide")},intervalTimer:function(e){t.timerCountdown>1?t.timerCountdown=t.timerBegin-Math.round((moment()-t.timerStart)/1e3):(TimerWidget.cancelTimer(e),h.historyData.removeClass("hide"),"short-break"===e||"long-break"===e?HistoryWidget.storeLocally({description:"Break Time",timeTaken:HistoryWidget.displayTimeTaken(t.timerBegin-t.timerCountdown),timeStarted:t.timerStart.format("h:mm:ss a"),timeEnded:t.timerEnd.format("h:mm:ss a"),id:t.timerEnd.format("x")}):HistoryWidget.storeLocally({description:h.currentTask,timeTaken:HistoryWidget.displayTimeTaken(t.timerBegin-t.timerCountdown),timeStarted:t.timerStart.format("h:mm:ss a"),timeEnded:t.timerEnd.format("h:mm:ss a"),id:t.timerEnd.format("x")})),TimerWidget.displayTimer(t.timerCountdown)},displayTimer:function(t){var e=Math.floor(t/60),i=t%60;$("#time").removeClass("hide"),$("#minute-display").text(TimerWidget.formatTime(e)),$("#second-display").text(TimerWidget.formatTime(i))},formatTime:function(t){return 10>t?"0"+t:t}},s,SettingsWidget={settings:{timeInput:$("#time-input"),shortBreakInput:$("#short-break"),longBreakInput:$("#long-break"),saveButton:$("#save-settings"),cancelButton:$("#cancel-settings"),settingsSection:$("#settings"),timerSetting:1500,shortBreakSetting:300,longBreakSetting:1200},init:function(){s=this.settings,this.bindUIActions()},bindUIActions:function(){s.saveButton.on("click",function(){SettingsWidget.saveSettings()}),s.cancelButton.on("click",function(){SettingsWidget.exitSettings()})},saveSettings:function(){TimerWidget.cancelTimer(),s.timerSetting=60*s.timeInput.val(),s.shortBreakSetting=60*s.shortBreakInput.val(),s.longBreakSetting=60*s.longBreakInput.val(),SettingsWidget.exitSettings(),TimerWidget.displayTimer(s.timerSetting)},enterSettings:function(){s.settingsSection.removeClass("hide")},exitSettings:function(){s.settingsSection.addClass("hide"),t.timerSection.removeClass("hide")}},h,HistoryWidget={settings:{taskArea:$("#task-area"),taskInput:$("#task-input"),historyData:$("#history-data"),historyDataTable:$("#history-data-table"),taskInputButton:$("#task-input-button"),data:JSON.parse(localStorage.getItem("taskData"))||{},clearHistory:$("#clear-history"),saveButton:$("#save-button"),taskSaveArea:$("#task-save-area"),cancelButton:$("#cancel-button"),currentTaskEdit:"",editTaskButton:$("#edit-task"),oldTaskInfo:"",exportButton:$("#export-table"),row:JSON.parse(localStorage.getItem("rowData"))||[],currentTask:""},init:function(){h=this.settings,this.bindUIActions(),$.each(h.data,function(t,e){HistoryWidget.addTask(e)}),$.isEmptyObject(h.data)||h.historyData.removeClass("hide")},bindUIActions:function(){h.taskInput.keyup(function(t){13===t.which&&h.taskInputButton.click()}),h.clearHistory.on("click",function(){HistoryWidget.clearHistory()}),h.historyDataTable.on("click",".edit-task",function(){HistoryWidget.editTask(this.id)}),h.historyDataTable.on("focus",".history__task-description",function(){HistoryWidget.showSave($(this).attr("id"))}),h.historyDataTable.on("keydown",".history__task-description",function(t){return 13===t.which&&$(this).blur(),13!==t.which}),h.saveButton.on("click",function(){HistoryWidget.saveTask(h.currentTaskEdit)}),h.cancelButton.on("click",function(){HistoryWidget.cancelSave()}),h.historyDataTable.on("click",".edit-task",function(){HistoryWidget.editTask(this)}),h.exportButton.on("click",function(){HistoryWidget.exportTable()})},displayTimeTaken:function(t){var e=Math.floor(t/60),i=t%60;return TimerWidget.formatTime(e)+":"+TimerWidget.formatTime(i)},editTask:function(t){var e=$(t).attr("id");$("#task-"+e).focus()},cancelSave:function(){$("#"+h.currentTaskEdit+">.history__task-description").text(h.oldTaskInfo),HistoryWidget.hideSave()},showSave:function(t){h.oldTaskInfo=$(t).text(),h.currentTaskEdit=t,h.taskSaveArea.removeClass("hide")},saveTask:function(t){var e=$("#"+t).parent().parent().attr("id");h.data[e].description=$("#"+h.currentTaskEdit).text(),localStorage.setItem("taskData",JSON.stringify(h.data));for(var i=0;i<h.row.length;i++)h.row[i].id===e&&(h.row[i].task=$("#"+h.currentTaskEdit).text(),localStorage.setItem("rowData",JSON.stringify(h.row)));HistoryWidget.hideSave()},hideSave:function(){h.taskSaveArea.addClass("hide")},clearHistory:function(){$.each(h.data,function(t,e){$("#"+e.id).remove()}),localStorage.clear(),h.data={},h.row=[]},storeLocally:function(t){h.data[t.id]=t,localStorage.setItem("taskData",JSON.stringify(h.data)),h.row.push({task:t.description,"time spent":t.timeTaken,"time started":t.timeStarted,"time ended":t.timeEnded,id:t.id}),localStorage.setItem("rowData",JSON.stringify(h.row)),HistoryWidget.addTask(t)},exportTable:function(){var t=[{title:"Task",dataKey:"task"},{title:"Time Spent",dataKey:"time spent"},{title:"Time Started",dataKey:"time started"},{title:"Time Ended",dataKey:"time ended"}],e=new jsPDF("p","pt");e.autoTable(t,h.row),e.save("table.pdf")},addTask:function(t){var e={taskItem:"history__task-item",taskDescription:"history__task-description",taskTime:"history__task-time",taskStart:"history__task-start",taskEnd:"history__task-end",id:t.id},i=$("<tr>",{"class":e.taskItem,id:e.id}).prependTo($("#history-data-body"));$("<td>",{"class":"description-container",id:e.id+"-container","data-label":"Task"}).appendTo(i),$("<div>",{"class":e.taskDescription,text:t.description,id:"task-edit-"+t.id,contenteditable:"true"}).appendTo($("#"+e.id+"-container")),$("<button>",{"class":"edit-task",id:"edit-"+t.id,text:"Edit"}).insertAfter($("#task-edit-"+t.id)),$("<td>",{"class":e.taskTime,text:t.timeTaken,"data-label":"Time"}).appendTo(i),$("<td>",{"class":e.taskStart,text:t.timeStarted,"data-label":"Start"}).appendTo(i),$("<td>",{"class":e.taskEnd,text:t.timeEnded,"data-label":"End"}).appendTo(i)}};$(document).ready(function(){SettingsWidget.init(),TimerWidget.init(),HistoryWidget.init()});