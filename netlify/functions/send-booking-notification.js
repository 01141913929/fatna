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
  // ## بداية التعديل ##

  // 1. إنشاء قائمة بالمواقع المسموح لها بالاتصال
  const allowedOrigins = [
    'https://egyptvista.online',
    'https://quran-web-1.web.app'
  ];

  // 2. الحصول على مصدر الطلب القادم من المتصفح
  const origin = event.headers.origin;
  
  // 3. إعداد الهيدرز الأساسية
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 4. التحقق إذا كان مصدر الطلب ضمن القائمة المسموح بها
  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  
  // ## نهاية التعديل ##

  // Browsers send an OPTIONS request first to check CORS policy
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Ensure the request is a POST request
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

    // ... باقي الكود يبقى كما هو بدون تغيير ...
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    const uniqueTokens = [...new Set(tokens)];
    const messagePayload = {
       notification: {
    title: `🎉 حجز جديد من: ${details.customerName}`,
    body: `تم تأكيد حجز جديد لـ "${details.tourName}". اضغط للمزيد من التفاصيل.`, // <-- النص الجديد بدون السعر
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
        await admin.messaging().sendEachForMulticast({
            tokens: uniqueTokens,
            ...messagePayload,
        });
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