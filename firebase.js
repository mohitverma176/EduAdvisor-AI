
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
