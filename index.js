/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import BackgroundFetch from 'react-native-background-fetch';
import axios from 'axios';

const headlessTask = async event => {
  if (event.timeout) {
    console.log('sync-data-headless timeout: ', event.taskId);
    BackgroundFetch.finish(event.taskId);
    return;
  }
  console.log('sync-data-headless start: ', event.taskId);
  const body = {
    name: 'sync-data-headless-release',
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
    console.log('sync-data-headless request success. do something here: ');
  }

  BackgroundFetch.finish(event.taskId);
};

BackgroundFetch.registerHeadlessTask(headlessTask);

AppRegistry.registerComponent(appName, () => App);
