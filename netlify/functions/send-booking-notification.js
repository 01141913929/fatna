const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variables
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
} catch (error) {
  console.error('Firebase admin initialization error', error.stack);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const bookingDetails = JSON.parse(event.body);
    const db = admin.firestore();

    const tokensSnapshot = await db.collection('admin_tokens').get();
    if (tokensSnapshot.empty) {
      console.log('No device tokens found.');
      return { statusCode: 200, body: 'No device tokens to send notification to.' };
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    // Corrected: Renamed 'from' to 'tourCity' and 'to' to 'tourName'
    const messagePayload = {
      notification: {
        title: '🎉 New Booking Confirmed!',
        body: `A new booking has been received for a tour in ${bookingDetails.tourCity} for the ${bookingDetails.tourName} tour.`,
      },
      data: {
        tourCity: bookingDetails.tourCity || '',
        tourName: bookingDetails.tourName || '',
        customerName: bookingDetails.customerName || ''
      },
    };

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: messagePayload.notification,
      data: messagePayload.data,
    });

    console.log('Successfully sent message:', response.successCount, 'messages');
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push({ token: tokens[idx], error: resp.error.message });
        }
      });
      console.log('Failed messages:', failedTokens);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Notifications sent successfully!", successCount: response.successCount }),
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send notifications.' }),
    };
  }
};