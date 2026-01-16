const firebaseConfig = {
  apiKey: "AIzaSyCV6_F5OVRD2jGLfJFK2AmXpkUSSQi1ykI",
  authDomain: "medisafe-iot.firebaseapp.com",
  databaseURL: "https://medisafe-iot-default-rtdb.firebaseio.com",
  projectId: "medisafe-iot",
  storageBucket: "medisafe-iot.appspot.com",
  messagingSenderId: "477331177068",
  appId: "1:477331177068:web:d7a734f111484808dce249"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
console.log("🔥 Firebase initialized");
