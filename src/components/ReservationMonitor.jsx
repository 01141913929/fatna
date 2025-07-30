// ReservationMonitor.js
import { useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const ReservationMonitor = () => {
  useEffect(() => {
    const formatReservationDetails = (reservationData) => {
      try {
        const details = [];
        if (reservationData.customerName) {
          details.push(`العميل: ${reservationData.customerName}`);
        }
        if (reservationData.tripName) {
          details.push(`الرحلة: ${reservationData.tripName}`);
        }
        if (reservationData.date) {
          const date = reservationData.date.toDate();
          const dateStr = date.toLocaleDateString('ar-EG');
          details.push(`التاريخ: ${dateStr}`);
        }
        if (reservationData.numberOfPersons) {
          details.push(`عدد الأشخاص: ${reservationData.numberOfPersons}`);
        }
        return details.join('\n');
      } catch (error) {
        console.error("⚠️ خطأ في تنسيق تفاصيل الحجز:", error);
        return "تم إضافة حجز جديد";
      }
    };

    const showBrowserNotification = (title, body) => {
      // Check if browser supports notifications
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
      }

      // Check if notification permissions have been granted
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      } 
      // Otherwise, ask for permission
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification(title, { body });
          }
        });
      }
    };

    const onNewReservation = (reservationData) => {
      console.log('\n📝 تم إضافة حجز جديد!');
      const details = formatReservationDetails(reservationData);
      console.log('تفاصيل الحجز:', details);

      const notificationTitle = "🚨 حجز جديد!";
      const notificationBody = 
        `تم حجز رحلة: ${reservationData.from || ''} → ${reservationData.to || ''} 
        بواسطة ${reservationData.customerName || ''} 
        بتاريخ ${reservationData.date?.toDate().toLocaleDateString('ar-EG') || ''} 
        وعدد الأشخاص: ${reservationData.numberOfPersons || ''}`;

      // Show browser notification
      showBrowserNotification(notificationTitle, notificationBody);
    };

    try {
      console.log('\n🔄 جاري بدء مراقبة الحجوزات...');
      const reservationsRef = collection(db, 'reservations');
      const unsubscribe = onSnapshot(reservationsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            onNewReservation(change.doc.data());
          }
        });
      });
      console.log('✅ تم بدء المراقبة بنجاح');

      return () => {
        unsubscribe();
        console.log('👋 تم إيقاف المراقبة');
      };
    } catch (error) {
      console.error('❌ خطأ غير متوقع:', error);
    }
  }, []);

  return null; // This component doesn't render anything
};

export default ReservationMonitor;