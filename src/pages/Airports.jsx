import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button,
  Navbar, Nav, Dropdown, Spinner, Form, Alert,
  FloatingLabel
} from 'react-bootstrap';
import { 
  FaPlane, FaCar, FaGlobe, FaBus, FaSearch, 
  FaCheck, FaHome, FaInfoCircle
} from 'react-icons/fa';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useNavigate } from 'react-router-dom';
import { isValidPhoneNumber } from 'react-phone-number-input';

const Airports = () => {
  const navigate = useNavigate();
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [lang, setLang] = useState('ar');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    passengers: 1
  });
  const [phoneError, setPhoneError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [airports, setAirports] = useState([]);

  // Color scheme
  const colors = {
    primary: '#4F46E5',
    secondary: '#10B981',
    accent: '#F59E0B',
    light: '#F3F4F6',
    dark: '#1F2937',
    background: '#F9FAFB'
  };

  // Generate time slots (24 hours)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fetch airports from Firestore
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const airportsCollection = collection(db, 'airports');
        const snapshot = await getDocs(airportsCollection);
        const airportsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAirports(airportsData);
      } catch (error) {
        console.error("Error fetching airports:", error);
        addNotification("Failed to load airports", "danger");
      }
    };
    
    fetchAirports();
  }, []);

  // Vehicle types with translations
  const vehicleTypes = [
    { 
      id: 'sedan', 
      name: { ar: "سيدان", en: "Sedan", cn: "轿车" }, 
      icon: <FaCar />, 
      capacity: 4,
      priceMultiplier: 1 
    },
    { 
      id: 'suv', 
      name: { ar: "SUV", en: "SUV", cn: "越野车" }, 
      icon: <FaCar />, 
      capacity: 6,
      priceMultiplier: 1.5 
    },
    { 
      id: 'minibus', 
      name: { ar: "ميكروباص", en: "Minibus", cn: "小巴" }, 
      icon: <FaBus />, 
      capacity: 12,
      priceMultiplier: 2 
    }
  ];

  // Translations
  const translations = {
    ar: {
      title: "حجز نقل المطارات",
      subtitle: "اختر المطار وسنوفر لك أفضل وسائل النقل",
      selectAirport: "اختر المطار",
      selectVehicle: "اختر نوع المركبة",
      selectDate: "اختر التاريخ",
      selectTime: "اختر الوقت",
      searchButton: "إرسال الحجز",
      searching: "جاري الإرسال...",
      bookingTitle: "تأكيد الحجز",
      nameLabel: "الاسم الكامل",
      phoneLabel: "رقم الهاتف",
      passengersLabel: "عدد الركاب",
      confirmBooking: "تأكيد الحجز",
      cancel: "إلغاء",
      bookingSuccess: "تم تأكيد الحجز بنجاح",
      totalPrice: "السعر الإجمالي",
      includesTaxes: "يشمل جميع الضرائب",
      maxCapacity: "الحد الأقصى",
      reservationDetails: "تفاصيل الحجز",
      dateTime: "التاريخ والوقت",
      invalidPhone: "رقم الهاتف غير صالح",
      languages: {
        ar: "العربية",
        en: "الإنجليزية",
        cn: "الصينية"
      },
      home: "الرئيسية",
      bookNow: "احجز الآن",
      about: "حول"
    },
    en: {
      title: "Airport Transfer Booking",
      subtitle: "Choose your airport and we'll provide the best transportation",
      selectAirport: "Select Airport",
      selectVehicle: "Select Vehicle Type",
      selectDate: "Select Date",
      selectTime: "Select Time",
      searchButton: "Send Reservation",
      searching: "Sending...",
      bookingTitle: "Booking Confirmation",
      nameLabel: "Full Name",
      phoneLabel: "Phone Number",
      passengersLabel: "Passengers",
      confirmBooking: "Confirm Booking",
      cancel: "Cancel",
      bookingSuccess: "Booking confirmed successfully",
      totalPrice: "Total Price",
      includesTaxes: "Includes all taxes",
      maxCapacity: "Max capacity",
      reservationDetails: "Reservation Details",
      dateTime: "Date & Time",
      invalidPhone: "Invalid phone number",
      languages: {
        ar: "Arabic",
        en: "English",
        cn: "Chinese"
      },
      home: "Home",
      bookNow: "Book Now",
      about: "About"
    },
    cn: {
      title: "机场接送预订",
      subtitle: "选择您的机场，我们将提供最佳交通服务",
      selectAirport: "选择机场",
      selectVehicle: "选择车辆类型",
      selectDate: "选择日期",
      selectTime: "选择时间",
      searchButton: "发送预订",
      searching: "发送中...",
      bookingTitle: "预订确认",
      nameLabel: "全名",
      phoneLabel: "电话号码",
      passengersLabel: "乘客人数",
      confirmBooking: "确认预订",
      cancel: "取消",
      bookingSuccess: "预订成功确认",
      totalPrice: "总价",
      includesTaxes: "包括所有税费",
      maxCapacity: "最大容量",
      reservationDetails: "预订详情",
      dateTime: "日期时间",
      invalidPhone: "电话号码无效",
      languages: {
        ar: "阿拉伯语",
        en: "英语",
        cn: "中文"
      },
      home: "首页",
      bookNow: "立即预订",
      about: "关于"
    }
  };

  const t = translations[lang] || translations['ar'];

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications([...notifications, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handlePhoneChange = (phone) => {
    setBookingData({...bookingData, phone});
    if (phone) {
      setPhoneError(isValidPhoneNumber(phone) ? '' : t.invalidPhone);
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedAirport || !selectedVehicle || !selectedDate || !selectedTime || !bookingData.name || !bookingData.phone) {
      addNotification("Please fill all required fields", "warning");
      return;
    }

    if (phoneError) {
      addNotification(t.invalidPhone, "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const vehicle = vehicleTypes.find(v => v.id === selectedVehicle);
      const reservationDoc = {
        airportId: selectedAirport.id,
        airportName: selectedAirport.name[lang] || selectedAirport.name.en,
        airportCode: selectedAirport.code,
        vehicleType: selectedVehicle,
        vehicleName: vehicle?.name[lang] || vehicle?.name.en,
        customerName: bookingData.name,
        customerPhone: bookingData.phone,
        passengerCount: bookingData.passengers,
        reservationDate: selectedDate,
        reservationTime: selectedTime,
        reservationDateTime: `${selectedDate} ${selectedTime}`,
        maxCapacity: vehicle?.capacity || 4,
        status: 'confirmed',
        language: lang,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'airport_reservation'), reservationDoc);
      
      navigate('/confirmation', {
        state: {
          bookingId: docRef.id,
          ...reservationDoc,
          formattedDateTime: formatDateTime(selectedDate, selectedTime)
        }
      });
      
    } catch (error) {
      console.error("Reservation failed:", error);
      addNotification("Reservation failed", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return '';
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleString(lang === 'ar' ? 'ar-EG' : lang === 'cn' ? 'zh-CN' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-vh-100" style={{ 
      backgroundColor: colors.background,
      backgroundImage: 'radial-gradient(at 40% 20%, hsla(240,100%,90%,0.3) 0px, transparent 50%)',
      position: 'relative'
    }}>
      {/* Navigation */}
      <Navbar expand="lg" className="shadow-sm bg-white sticky-top">
        <Container>
          <Navbar.Brand 
            className="fw-bold" 
            style={{ color: colors.primary }}
            onClick={() => navigate('/')}
          >
            <FaPlane className="me-2" />
            {t.title}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate('/')}>
                <FaHome className="me-1" /> {t.home}
              </Nav.Link>
              <Nav.Link active>
                <FaSearch className="me-1" /> {t.bookNow}
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/about')}>
                <FaInfoCircle className="me-1" /> {t.about}
              </Nav.Link>
            </Nav>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center">
                <FaGlobe className="me-2" />
                {t.languages[lang]}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Object.entries(t.languages).map(([key, value]) => (
                  <Dropdown.Item 
                    key={key} 
                    onClick={() => setLang(key)}
                    active={lang === key}
                  >
                    {value}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Notifications */}
      {notifications.map(notification => (
        <Alert 
          key={notification.id}
          variant={notification.type}
          className="position-fixed top-0 end-0 m-3"
          style={{ zIndex: 9999, minWidth: '300px' }}
          dismissible
          onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
        >
          {notification.message}
        </Alert>
      ))}

      <Container className="py-5">
        {/* Search Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Card className="border-0 shadow-lg overflow-hidden">
              <Card.Header className="border-0 py-3 text-white" style={{ 
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                borderRadius: '0.5rem 0.5rem 0 0'
              }}>
                <h3 className="mb-0 d-flex align-items-center">
                  <FaSearch className="me-2" />
                  {t.selectAirport}
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group controlId="airportSelect">
                      <Form.Label className="fw-bold mb-3">{t.selectAirport}</Form.Label>
                      <Form.Select 
                        value={selectedAirport?.id || ''}
                        onChange={(e) => {
                          const airport = airports.find(a => a.id === e.target.value);
                          setSelectedAirport(airport);
                        }}
                        size="lg"
                        className="border-2"
                      >
                        <option value="">{t.selectAirport}</option>
                        {airports.map(airport => (
                          <option key={airport.id} value={airport.id}>
                            {airport.name[lang] || airport.name.en} ({airport.code})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="vehicleSelect">
                      <Form.Label className="fw-bold mb-3">{t.selectVehicle}</Form.Label>
                      <div className="d-grid gap-2">
                        {vehicleTypes.map(vehicle => (
                          <Button
                            key={vehicle.id}
                            variant={selectedVehicle === vehicle.id ? "primary" : "outline-primary"}
                            className="py-3 d-flex align-items-center justify-content-center gap-3"
                            onClick={() => setSelectedVehicle(vehicle.id)}
                          >
                            {vehicle.icon}
                            <span>{vehicle.name[lang] || vehicle.name.en}</span>
                          </Button>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="dateSelect">
                      <Form.Label className="fw-bold mb-3">{t.selectDate}</Form.Label>
                      <Form.Control
                        type="date"
                        value={selectedDate}
                        min={getMinDate()}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        size="lg"
                        className="border-2"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="timeSelect">
                      <Form.Label className="fw-bold mb-3">{t.selectTime}</Form.Label>
                      <Form.Select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        size="lg"
                        className="border-2"
                      >
                        <option value="">{t.selectTime}</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  {/* Customer Details */}
                  <Col md={6}>
                    <Form.Group controlId="customerName">
                      <FloatingLabel controlId="floatingName" label={t.nameLabel}>
                        <Form.Control 
                          type="text" 
                          value={bookingData.name}
                          onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                          placeholder={t.nameLabel}
                          size="lg"
                          className="border-2"
                          required
                        />
                      </FloatingLabel>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="customerPhone">
                      <Form.Label className="fw-bold mb-2">{t.phoneLabel}</Form.Label>
                      <PhoneInput
                        international
                        defaultCountry="EG"
                        value={bookingData.phone}
                        onChange={handlePhoneChange}
                        className={`form-control form-control-lg border-2 ${phoneError ? 'is-invalid' : ''}`}
                        required
                      />
                      {phoneError && (
                        <Form.Text className="text-danger">
                          {phoneError}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <Form.Group controlId="passengersCount">
                      <FloatingLabel controlId="floatingPassengers" label={t.passengersLabel}>
                        <Form.Control 
                          type="number" 
                          min="1"
                          max="12"
                          value={bookingData.passengers}
                          onChange={(e) => {
                            const value = Math.min(parseInt(e.target.value) || 1, 12);
                            setBookingData({...bookingData, passengers: value});
                          }}
                          size="lg"
                          className="border-2"
                          required
                        />
                      </FloatingLabel>
                      <Form.Text className="text-muted">
                        {t.maxCapacity}: 12
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-center mt-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="px-5 py-3 rounded-pill fw-bold shadow-sm"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedAirport || !selectedVehicle || !selectedDate || !selectedTime || !bookingData.name || !bookingData.phone || phoneError}
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      border: 'none',
                      minWidth: '200px'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        {t.searching}
                      </>
                    ) : (
                      <>
                        <FaCheck className="me-2" />
                        {t.searchButton}
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Airports;