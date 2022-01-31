import moment from 'moment';
import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';

import ReminderService from './app/services/NativeCalendarService';

const App = () => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const Reminder = new ReminderService();

  const addEventToCalendar = () => {
    Reminder.addEvent({
      title: title ? title : 'Native Syncing Feasibility',
      note: note
        ? note
        : 'As a customer, I want to sync my Wellthy experience with my other apps so that my mobile experience is intuitive and connected.',
      startDate: moment().toISOString(),
      endDate: moment().toISOString(),
    })
      .then(result => {
        Alert.alert(
          'Event Created',
          'New Event has been successfully added to your device calendar',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
        );
        console.log('.....result', result);
      })
      .catch(error => {
        console.log('.....reminder error', error);
        // handle errror here
      });
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Natiive App Syncing Feasibility</Text>
      <View>
        <View>
          <TextInput
            style={styles.input}
            onChangeText={title => setTitle(title)}
            placeholder="Title"
            value={title}
          />
        </View>

        <View>
          <TextInput
            style={styles.input}
            onChangeText={note => setNote(note)}
            placeholder="Note"
            value={note}
          />
        </View>

        <TouchableOpacity
          onPress={() => addEventToCalendar()}
          style={{
            backgroundColor: '#1436A4',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
          }}>
          <Text style={{color: '#ffffff'}}>Add Task to calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    width: 320,
    padding: 10,
    borderColor: '#777777',
    borderRadius: 6,
  },
});

export default App;
