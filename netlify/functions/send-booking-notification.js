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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const details = JSON.parse(event.body);
    const db = admin.firestore();

    const tokensSnapshot = await db.collection('admin_tokens').get();
    if (tokensSnapshot.empty) {
      console.log('No device tokens found.');
      return { statusCode: 200, body: 'No tokens.' };
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    const uniqueTokens = [...new Set(tokens)]; // De-duplicate tokens to prevent double notifications

    // بناء رسالة إشعار احترافية
    const messagePayload = {
      notification: {
        title: `🎉 حجز جديد من: ${details.customerName}`,
        body: `تم تأكيد حجز لـ "${details.tourName}" بمبلغ إجمالي ${details.totalAmount || 'N/A'} جنيه.`,
      },
      data: {
        // بيانات إضافية لفتح الحجز مباشرة عند الضغط على الإشعار
        bookingId: details.bookingReference || '',
        customerName: details.customerName || '',
        tourName: details.tourName || '',
        screen: 'BookingDetails', // اسم الشاشة التي ستفتح في التطبيق
      },
      // تخصيص الإشعارات للأنظمة المختلفة
      android: {
        priority: 'high',
        notification: {
          icon: 'ic_notification', // تأكد من وجود أيقونة بهذا الاسم في تطبيق الأندرويد
          color: '#1E40AF', // لون الأيقونة
          sound: 'default',
          imageUrl: details.imageUrl || '', // رابط صورة لعرضها في الإشعار
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
          image: details.imageUrl || '', // رابط صورة لعرضها في الإشعار (iOS)
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
      body: JSON.stringify({ message: "Notifications sent successfully!" }),
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send notifications.' }),
    };
  }
};