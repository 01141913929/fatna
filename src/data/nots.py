# coding: utf-8
import firebase_admin
from firebase_admin import credentials, firestore, messaging
import json
from datetime import datetime
import sys
import io

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# تهيئة Firebase Admin
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ تم الاتصال بـ Firebase بنجاح")
except Exception as e:
    print("❌ خطأ في الاتصال بـ Firebase:", str(e))
    exit(1)

def format_reservation_details(reservation_data):
    """تنسيق تفاصيل الحجز للإشعار"""
    try:
        details = []
        if 'customerName' in reservation_data:
            details.append(f"العميل: {reservation_data['customerName']}")
        if 'tripName' in reservation_data:
            details.append(f"الرحلة: {reservation_data['tripName']}")
        if 'date' in reservation_data:
            # تحويل Timestamp إلى تاريخ إذا كان موجوداً
            if isinstance(reservation_data['date'], datetime):
                date_str = reservation_data['date'].strftime("%Y-%m-%d")
            else:
                date_str = str(reservation_data['date'])
            details.append(f"التاريخ: {date_str}")
        if 'numberOfPersons' in reservation_data:
            details.append(f"عدد الأشخاص: {reservation_data['numberOfPersons']}")
        
        return "\n".join(details)
    except Exception as e:
        print("⚠️ خطأ في تنسيق تفاصيل الحجز:", str(e))
        return "تم إضافة حجز جديد"

def send_fcm(title, body, token):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                icon='ic_launcher',  # استخدم أيقونة مخصصة إذا أردت
                color='#1976D2',     # لون الشريط الجانبي للإشعار
                sound='default',     # صوت الإشعار
                channel_id='my_custom_channel',  # نفس channel id في التطبيق
            ),
        ),
    )
    response = messaging.send(message)
    print('✅ تم إرسال الإشعار بنجاح:', response)

def on_snapshot(col_snapshot, changes, read_time):
    """معالجة التغييرات في مجموعة الحجوزات"""
    for change in changes:
        if change.type.name == 'ADDED':
            print("\n📝 تم إضافة حجز جديد!")
            reservation_data = change.document.to_dict()
            
            # تنسيق تفاصيل الحجز
            details = format_reservation_details(reservation_data)
            
            try:
                # جلب توكنات الأدمن
                admin_tokens = db.collection('admin_tokens').stream()
                for doc in admin_tokens:
                    token = doc.to_dict().get('token')
                    if token:
                        send_fcm(
                            "🚨 حجز جديد!",
                            f"تم حجز رحلة: {reservation_data.get('from', '')} → {reservation_data.get('to', '')} بواسطة {reservation_data.get('customerName', '')} بتاريخ {reservation_data.get('date', '')} وعدد الأشخاص: {reservation_data.get('numberOfPersons', '')}",
                            token
                        )
            except Exception as e:
                print("❌ خطأ في معالجة الحجز:", str(e))

# بدء مراقبة مجموعة الحجوزات
try:
    print("\n🔄 جاري بدء مراقبة الحجوزات...")
    col_query = db.collection('reservations')
    query_watch = col_query.on_snapshot(on_snapshot)
    print("✅ تم بدء المراقبة بنجاح")
    print("\n⏳ النظام يعمل الآن... اضغط Ctrl+C للخروج")
    
    # إبقاء السكريبت يعمل
    while True:
        input()
except KeyboardInterrupt:
    print("\n👋 تم إيقاف النظام بواسطة المستخدم")
except Exception as e:
    print("❌ خطأ غير متوقع:", str(e))