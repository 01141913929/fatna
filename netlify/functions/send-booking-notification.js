const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
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
  // Define CORS headers to allow requests from your Firebase domain
  const headers = {
    'Access-Control-Allow-Origin': 'https://quran-web-1.web.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Browsers send an OPTIONS request first to check CORS policy (preflight request)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers,
      body: ''
    };
  }

  // Ensure the request is a POST request for the actual logic
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers, 
      body: 'Method Not Allowed' 
    };
  }

  try {
    const details = JSON.parse(event.body);
    const db = admin.firestore();

    const tokensSnapshot = await db.collection('admin_tokens').get();
    if (tokensSnapshot.empty) {
      console.log('No device tokens found.');
      return { 
        statusCode: 200, 
        headers, 
        body: 'No tokens.' 
      };
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    const uniqueTokens = [...new Set(tokens)];

    const messagePayload = {
      notification: {
        title: `🎉 حجز جديد من: ${details.customerName}`,
        body: `تم تأكيد حجز لـ "${details.tourName}" بمبلغ إجمالي ${details.totalAmount || 'N/A'} جنيه.`,
      },
      data: {
        bookingId: details.bookingReference || '',
        customerName: details.customerName || '',
        tourName: details.tourName || '',
        screen: 'BookingDetails',
      },
      android: {
        priority: 'high',
        notification: {
          icon: 'ic_notification',
          color: '#1E40AF',
          sound: 'default',
          imageUrl: details.imageUrl || '',
        },
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            sound: 'default',
          },
        },
        fcm_options: {
          image: details.imageUrl || '',
        },
      },
    };

    if (uniqueTokens.length > 0) {
        const response = await admin.messaging().sendEachForMulticast({
            tokens: uniqueTokens,
            ...messagePayload,
        });

        console.log('Successfully sent messages:', response.successCount);
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                failedTokens.push({ token: uniqueTokens[idx], error: resp.error.message });
                }
            });
            console.log('Failed messages:', failedTokens);
        }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Notifications sent successfully!" }),
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send notifications.' }),
    };
  }
};