/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import axios from 'axios';

import BackgroundFetch, {
  BackgroundFetchStatus,
} from 'react-native-background-fetch';

/// Execute a BackgroundFetch.scheduleTask
///
export const scheduleTask = async name => {
  try {
    await BackgroundFetch.scheduleTask({
      taskId: name,
      stopOnTerminate: false,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      requiresBatteryNotLow: true,
      enableHeadless: true,
      delay: 5000,
      forceAlarmManager: false, // more precise timing with AlarmManager vs default JobScheduler
      periodic: true, // Fire once only.
    });
  } catch (e) {
    console.warn('[BackgroundFetch] scheduleTask fail', e);
  }
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const onBackgroundFetchEvent = async taskId => {
    console.log('sync-data-background');
    const body = {
      name: 'sync-data-background-release',
      date: new Date(),
    };
    const response = await axios
      .post('https://blooming-ridge-36389.herokuapp.com/api/log/', body)
      .then(r => r.data)
      .catch(e => {
        console.log(e);
        return null;
      });
    if (response) {
      console.log('sync-data-background request success. do something here: ');
    }

    if (taskId === 'react-native-background-fetch') {
      try {
        await scheduleTask('sync-data-headless');
      } catch (e) {
        console.warn('[BackgroundFetch] scheduleTask falied', e);
      }
    }
    BackgroundFetch.finish(taskId);
  };

  const onBackgroundFetchTimeout = async taskId => {
    console.log('timeout: ' + taskId);
    BackgroundFetch.finish(taskId);
  };

  const init = async () => {
    let status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        // Android options
        forceAlarmManager: false, // <-- Set true to bypass JobScheduler.
        stopOnTerminate: false,
        enableHeadless: true,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
        requiresCharging: false, // Default
        requiresDeviceIdle: false, // Default
        requiresBatteryNotLow: false, // Default
        requiresStorageNotLow: false, // Default
      },
      onBackgroundFetchEvent,
      onBackgroundFetchTimeout,
    );
    console.log('[BackgroundFetch] configure status: ', status);
    await BackgroundFetch.start();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Text>
          Background task akan dilakukan kurang lebih tiap 15 menit. Tergantung
          constraint dan OS
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
