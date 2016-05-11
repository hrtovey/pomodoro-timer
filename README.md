# Pomdoro+
Pomodoro timer plus task history.

This pomodoro timer was created for a Free Code Camp project with the following requirements:

- User Story: I can start a 25 minute pomodoro, and the timer will go off once 25 minutes has elapsed.
- User Story: I can reset the clock for my next pomodoro.
- User Story: I can customize the length of each pomodoro.

As part of this project, I opted to additionally learn the following technologies:

- Web Notifications API
- Web Storage API

The pomodoro timer functions as a timer that walks you through a pomodoro cycle. The user:

- Writes in the task they'd like to work on
- Starts a Pomodoro (default of 25 minutes)
- Finishes the Pomodoro and is prompted to begin a Short Break (default of 5 minutes)
- Repeats this Pomodoro/Short Break cycle with the same or a new task until they have completed 4 Pomodoro work sessions
- Is then prompted to begin a Long Break (default of 20 minutes).

The user can change settings including how long each timer is and whether or not they receive sound and/or desktop notifications.

In addition to the pomodoro timer, I opted to include some functionality that I wanted to increase my productivity. I added a task history section so that I could keep track of what I had done with my time.

I also included the ability to download task history as a PDF or a CSV file.

Task History and Settings are tracked through the Web Storage API (using localStorage), so that settings and task history can be tracked over multiple sessions.

Feel free to fork this project and add your favorite time tracking features!
