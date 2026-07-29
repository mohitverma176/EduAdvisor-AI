// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBVccSeiIUL8olkQu8x-ELBdR_bS7NW8U4",
//   authDomain: "eduadvisiorai.firebaseapp.com",
//   projectId: "eduadvisiorai",
//   storageBucket: "eduadvisiorai.firebasestorage.app",
//   messagingSenderId: "188855950690",
//   appId: "1:188855950690:web:dfca5ec4afb95da934603b",
//   measurementId: "G-FLNL4P28DB"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


// firebase.js


import { initializeApp } 
from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";


import {

getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut

}
from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


import {

getFirestore,
doc,
setDoc,
getDoc

}
from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



// PASTE YOUR FIREBASE CONFIG HERE

const firebaseConfig = {
  apiKey: "AIzaSyBVccSeiIUL8olkQu8x-ELBdR_bS7NW8U4",
  authDomain: "eduadvisiorai.firebaseapp.com",
  projectId: "eduadvisiorai",
  storageBucket: "eduadvisiorai.firebasestorage.app",
  messagingSenderId: "188855950690",
  appId: "1:188855950690:web:dfca5ec4afb95da934603b",
  measurementId: "G-FLNL4P28DB"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


const db = getFirestore(app);



export {

auth,
db,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut,
doc,
setDoc,
getDoc

};