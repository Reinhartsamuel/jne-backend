const admin = require("firebase-admin");
// const serviceAccount = require('./intrapreneuer-firebase-adminsdk-a5zeu-625c0f5172.json');
const serviceAccount = require('./intrapreneuer-firebase-adminsdk-a5zeu-8df5bcaaff.json');

admin.initializeApp({
    credential: admin.credential.cert(
        serviceAccount
    )
  });
// const {getAuth} = require("firebase-admin/auth");

const auth = admin.auth();
const db = admin.firestore();
const messaging = admin.messaging();
const FieldValue = admin.firestore.FieldValue;
const FieldPath = admin.firestore.FieldPath;
const getAuth = admin.auth();

module.exports = { auth, db, admin, FieldValue, FieldPath, messaging, getAuth };