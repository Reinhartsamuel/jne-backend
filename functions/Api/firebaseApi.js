// const {addDoc, collection} = require("firebase/firestore");

const { db, admin } = require('../config/firebase');

exports.addDocumentFirebase = async function (
  collectionName,
  data,
  companyId,
  id
) {
  if (!companyId) return 'No COMPANY ID';

  try {
    data.createdAt = new Date();
    data.lastUpdated = new Date();
    data.companyId = companyId;
    const docRef = await db.collection(collectionName).doc(id).set(data);
    return docRef.id;
  } catch (error) {
    throw new Error(error.message, 'Failed to send Slack login message');
  }
};

exports.updateDocumentFirebase = async function (collectionName, data, id) {
  try {
    data.lastUpdated = new Date();
    const docRef = await db.collection(collectionName).doc(id).update(data);
    return docRef.id;
  } catch (error) {
    throw new Error(error.message, 'Failed to send Slack login message');
  }
};

exports.setDocumentFirebase = async function (collectionName, data, id) {
  try {
    data.lastUpdated = new Date();
    const docRef = await db
      .collection(collectionName)
      .doc(id)
      .set(data, { merge: true });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message, 'Failed to send Slack login message');
  }
};

exports.getSingleDocumentFirebase = async function (collectionName, docId) {
  try {
    const docRef = db.collection(collectionName).doc(docId);
    const getDoc = await docRef.get();
    return { id: getDoc.id, ...getDoc.data() };
  } catch (error) {
    // return error.message;
    return null;
  }
};

exports.getDocumentWhere = async function (collectionName, conditions) {
  let collectionRef = db.collection(collectionName);
  if (conditions.length > 0) {
    conditions.forEach((condition) => {
      const { field, operator, value } = condition;
      collectionRef = collectionRef.where(field, operator, value);
    });
  }
  const querySnapshot = await collectionRef.get();
  const collectionData = [];
  querySnapshot.forEach((doc) => {
    const docData = doc.data();
    collectionData.push({ id: doc.id, ...docData });
  });
  return collectionData;
};

exports.getDocumentWhereOrderBy = async function (
  collectionName,
  conditions,
  sortBy
) {
  let collectionRef = db.collection(collectionName);
  if (conditions.length > 0) {
    conditions.forEach((condition) => {
      const { field, operator, value } = condition;
      collectionRef = collectionRef.where(field, operator, value);
    });
  }
  collectionRef = collectionRef.orderBy(sortBy.field, sortBy.direction);
  const dataCollection = await collectionRef.get();
  const collectionData = [];
  dataCollection.forEach((doc) => {
    const docData = doc.data();
    collectionData.push({ id: doc.id, ...docData });
  });
  return collectionData;
};

exports.addDocumentFirebaseByUniqueId = async function (collectionName, data) {
  try {
    if(data?.createdAt === undefined){
      data.createdAt = new Date();
    }
    data.lastUpdated = new Date();
    const docRef = await db.collection(collectionName).add(data);
    return docRef.id;
  } catch (error) {
    throw new Error(error.message, 'Failed to send Slack login message');
  }
};

exports.updateDocumentFirebaseArrayKeyTopics = async function (
  collectionName,
  id,
  data,
  type
) {
  try {
    let docRef = db.collection(collectionName).doc(id);
    if (type === 'subscribe') {
      docRef = docRef.set(
        {
          topics: admin.firestore.FieldValue.arrayUnion(`${data}`),
        },
        { merge: true }
      );
    } else {
      docRef = docRef.set(
        {
          topics: admin.firestore.FieldValue.arrayRemove(`${data}`),
        },
        { merge: true }
      );
    }

    const docData = await docRef;
    return docData.id;
  } catch (error) {
    throw new Error(error.message, 'Failed to send Slack login message');
  }
};

exports.getCollectionWithTimeRange = async function (
  collectionPath,
  startDate,
  endDate
) {
  const collectionRef = db.collection(collectionPath);
  const querySnapshot = await collectionRef
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  const documents = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    documents,
  };
};

exports.getSubcollectionWithTimeRange = async function (
  collectionPath,
  documentId,
  subCollection,
  startDate,
  endDate
) {
  const subcollectionData = {};

  for (const subcollectionName of subCollection) {
    const subcollectionRef = db
      .collection(collectionPath)
      .doc(documentId)
      .collection(subcollectionName);
    const querySnapshot = await subcollectionRef
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Menambahkan subkoleksi hanya jika memiliki dokumen
    if (documents.length > 0) {
      subcollectionData[subcollectionName] = {
        documents,
      };
    }
  }

  return subcollectionData;
};

exports.addDocumentsToCollection = async function (collectionPath, documents) {
  const collectionRef = db.collection(collectionPath);

  for (const document of documents) {
    if (!document.createdAt && !document.lastUpdated) {
      // If both createdAt and lastUpdated are not present, set createdAt to the current server time
      document.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    if (document.createdAt) {
      document.createdAt = new Date(
        document.createdAt._seconds * 1000 +
          document.createdAt._nanoseconds / 1000000
      );
    }

    // Handle lastUpdated
    if (document.lastUpdated) {
      document.lastUpdated = new Date(
        document.lastUpdated._seconds * 1000 +
          document.lastUpdated._nanoseconds / 1000000
      );
    }

    await collectionRef.doc(document.id).set(document);
  }
};
