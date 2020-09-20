
import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
      apiKey: "YOUR_KEY",
      authDomain: "YOUR_DOMAIN",
      databaseURL: "YOUR_URL",
      projectId: "YOUR_ID",
      storageBucket: "YOUR_BUCKET",
      messagingSenderId: "YOUR_ID",
      appId: "YOUR_ID",
      measurementId: "YOUR_ID"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
