import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import 'bootstrap/dist/css/bootstrap.css';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDXsL-ZGUa486iP8vboQlhBll45QO3LK5s",
    authDomain: "mello-e95f7.firebaseapp.com",
    databaseURL: "https://mello-e95f7.firebaseio.com",
    projectId: "mello-e95f7",
    storageBucket: "mello-e95f7.appspot.com",
    messagingSenderId: "664648585296"
  };
  firebase.initializeApp(config);


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
