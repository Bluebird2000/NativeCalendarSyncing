import {Platform} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import moment from 'moment';

const _ = require('lodash');
const POC = 'POC';

class ReminderService {
  constructor() {
    this.deviceHasAccess = false;
    this.deviceCalendarId = null;
    RNCalendarEvents.requestPermissions(false)
      .then(permission => {
        if (permission == 'authorized' || permission == 'undetermined') {
          this.deviceHasAccess = true;
          // check if device has custom calendar
          this.getCalendar(POC)
            .then(async ({calendar, googleCal}) => {
              if (!calendar) {
                // create custom calendar if it doesn't exist
                let calendar = {
                  title: POC,
                  color: '#666',
                  entityType: 'event',
                };
                if (Platform.OS == 'android') {
                  calendar = {
                    ...calendar,
                    name: 'Custom Events',
                    accessLevel: 'owner',
                    ownerAccount: googleCal ? googleCal.source : 'default',
                    source: {
                      name: googleCal ? googleCal.source : 'App Name',
                      type: 'com.package_name',
                    },
                  };
                }
                RNCalendarEvents.saveCalendar(calendar)
                  .then(calendar => {
                    this.deviceCalendarId = calendar;
                    console.log('Calendar created', calendar);
                  })
                  .catch(error => {
                    console.error(error);
                  });
              } else {
                this.deviceCalendarId = calendar.id;
              }
            })
            .catch(error => {
              console.error(error);
            });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  getCalendar(name) {
    return new Promise((resolve, reject) => {
      let googleCal = null;
      this.getCalendars()
        .then(async calendars => {
          let calendar = await _.find(calendars, function (cal) {
            return cal.title == name;
          });
          // get google calendar account on android
          if (Platform.OS == 'android') {
            googleCal = _.find(calendars, function (cal) {
              return cal.type == 'com.google';
            });
          }
          resolve({calendar, googleCal});
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  getCalendars() {
    return new Promise((resolve, reject) => {
      RNCalendarEvents.findCalendars()
        .then(calendars => {
          resolve(calendars);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  addEvent(data) {
    return new Promise((resolve, reject) => {
      try {
        this.getCalendar(POC)
          .then(async ({calendar}) => {
            if (!calendar) throw Error(`${POC} does not exist`);
            const {title, note, startDate, endDate} = data;
            RNCalendarEvents.saveEvent(title, {
              title: title,
              notes: note,
              description: note,
              startDate: startDate,
              endDate: endDate,
              deviceCalendarId: calendar.id,
              event: true,
              alarms: [{date: startDate}, {date: endDate}],
            })
              .then(event => {
                console.log('Event created', event);
                resolve(event);
              })
              .catch(error => {
                reject(error);
              });
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  getEvents(startDate, endDate) {
    return new Promise((resolve, reject) => {
      this.getCalendar(POC)
        .then(({calendar}) => {
          RNCalendarEvents.fetchAllEvents(startDate, endDate, [calendar.id])
            .then(events => {
              resolve(
                _.orderBy(events, function (event) {
                  return moment(event.startDate);
                }),
              );
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  deleteCalendars() {
    return new Promise((resolve, reject) => {
      this.getCalendars()
        .then(async calendars => {
          const custom_calendars = _.filter(calendars, function (cal) {
            return cal.title == POC;
          });
          await _.forEach(custom_calendars, function (cal) {
            RNCalendarEvents.removeCalendar(cal.id);
          });
          resolve(true);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

export default ReminderService;
