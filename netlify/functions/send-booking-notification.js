const admin = require('firebase-admin');

// تهيئة Firebase Admin SDK باستخدام متغيرات البيئة
// لا تضع بيانات المفتاح هنا مباشرة أبداً
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
  // التأكد من أن الطلب هو POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const bookingDetails = JSON.parse(event.body);
    const db = admin.firestore();

    // 1. جلب كل توكنات الأجهزة من Firestore
    const tokensSnapshot = await db.collection('admin_tokens').get();
    if (tokensSnapshot.empty) {
      console.log('No device tokens found.');
      return { statusCode: 200, body: 'No device tokens to send notification to.' };
    }
    
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    const message = {
      notification: {
        title: '🎉 حجز جديد تم تأكيده!',
        body: `تم استلام حجز جديد من ${bookingDetails.from} إلى ${bookingDetails.to}.`,
      },
      data: {
        custom_from: bookingDetails.from || '',
        custom_to: bookingDetails.to || '',
        customer_name: bookingDetails.customerName || ''
      },
      tokens: tokens,
    };
    
    // 3. إرسال الإشعارات
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: '🎉 حجز جديد تم تأكيده!',
        body: `تم استلام حجز جديد من ${bookingDetails.from} إلى ${bookingDetails.to}.`,
      },
      data: {
        from: bookingDetails.from || '',
        to: bookingDetails.to || '',
        customerName: bookingDetails.customerName || ''
      },
    });
    
    
    console.log('Successfully sent message:', response.successCount, 'messages');
    if (response.failureCount > 0) {
        console.log('Failed messages:', response.responses.filter(r => !r.success));
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