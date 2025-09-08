import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button,
  Navbar, Nav, Dropdown, Spinner, Form, Alert,
  FloatingLabel, Badge, Modal
} from 'react-bootstrap';
import { 
  FaPlane, FaCar, FaGlobe, FaBus, FaSearch, 
  FaCheck, FaHome, FaInfoCircle, FaTruck,
  FaUser, FaPhone, FaCalendarAlt, FaClock,
  FaDownload, FaPrint, FaMapMarkerAlt, FaStar,
  FaExclamationTriangle, FaCheckCircle, FaSync, FaExclamationCircle
} from 'react-icons/fa';
import { collection, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useNavigate } from 'react-router-dom';
import { isValidPhoneNumber } from 'react-phone-number-input';
import company_logo from "../assets/company_logo.jpeg";

const Airports = () => {
  const navigate = useNavigate();
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [lang, setLang] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    passengers: 1
  });
  const [phoneError, setPhoneError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [airports, setAirports] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Color scheme
  const colors = {
    primary: '#4F46E5',
    secondary: '#10B981',
    accent: '#F59E0B',
    light: '#F3F4F6',
    dark: '#1F2937',
    background: '#F9FAFB'
  };

  // Icon mapping
  const iconMap = {
    FaCar: FaCar,
    FaBus: FaBus,
    FaTruck: FaTruck
  };

  // Fetch data from Firestore with real-time updates and enhanced error handling
  useEffect(() => {
    let unsubscribeAirports = () => {};
    let unsubscribeVehicles = () => {};
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelays = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff retry delays

    const setupListeners = async () => {
      setIsLoading(true);
      setConnectionStatus('connecting');

      try {
        // Airports listener with enhanced error handling
        unsubscribeAirports = onSnapshot(
          collection(db, 'airports'),
          (snapshot) => {
            const airportsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setAirports(airportsData);
            setConnectionStatus('connected');
            retryCount = 0;
          },
          (error) => {
            console.error("Airports listener error:", error);
            handleFirestoreError(error, 'airports listener');
            setConnectionStatus('disconnected');
            
            // Exponential backoff retry logic
            if (retryCount < maxRetries) {
              const delay = retryDelays[retryCount];
              setTimeout(() => {
                retryCount++;
                setupListeners();
              }, delay);
            } else {
              setConnectionStatus('error');
              addNotification(
                'Failed to connect after multiple attempts. Please refresh the page',
                'warning'
              );
            }
          }
        );

        // Vehicles listener with enhanced error handling
        unsubscribeVehicles = onSnapshot(
          collection(db, 'vehicles'),
          (snapshot) => {
            const vehiclesData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                pricePerKm: data.price / 100,
                popularity: Math.floor(Math.random() * 100) + 20,
                rating: (Math.random() * 2 + 3).toFixed(1)
              };
            });
            setVehicles(vehiclesData);
            setConnectionStatus('connected');
            retryCount = 0;
          },
          (error) => {
            console.error("Vehicles listener error:", error);
            handleFirestoreError(error, 'vehicles listener');
            setConnectionStatus('disconnected');
            
            // Exponential backoff retry logic
            if (retryCount < maxRetries) {
              const delay = retryDelays[retryCount];
              setTimeout(() => {
                retryCount++;
                setupListeners();
              }, delay);
            } else {
              setConnectionStatus('error');
              addNotification(
                'Failed to connect after multiple attempts. Please refresh the page',
                'warning'
              );
            }
          }
        );

      } catch (error) {
        console.error("Error setting up listeners:", error);
        setConnectionStatus('error');
        addNotification(
          "Error loading data",
          "danger"
        );
      } finally {
        setIsLoading(false);
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      unsubscribeAirports();
      unsubscribeVehicles();
    };
  }, [lang]);

  // Handle Firestore errors with user-friendly messages
  const handleFirestoreError = (error, context) => {
    console.error(`Firestore error in ${context}:`, error);
    
    let errorMessage = '';
    
    // Provide friendly error messages based on error codes
    switch (error.code) {
      case 'permission-denied':
        errorMessage = 'You do not have permission to perform this action';
        break;
      case 'unavailable':
        errorMessage = 'Service is unavailable. Please check your internet connection';
        break;
      case 'aborted':
        errorMessage = 'The operation was aborted';
        break;
      default:
        errorMessage = `An unexpected error occurred: ${error.message}`;
    }
    
    addNotification(errorMessage, "danger");
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

  // Translations
  const translations = {
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
      about: "About",
      loading: "Loading...",
      connectionError: "Connection issue. Retrying...",
      vehicleFeatures: "Features",
      per100km: "per 100km",
      popular: "Popular",
      verified: "Verified"
    }
  };

  const t = translations[lang] || translations['en'];

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
      addNotification(
        "Please fill all required fields",
        "warning"
      );
      return;
    }

    if (phoneError) {
      addNotification(t.invalidPhone, "warning");
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    if (!vehicle) {
      addNotification(
        "Selected vehicle not found",
        "danger"
      );
      return;
    }

    if (bookingData.passengers > vehicle.capacity) {
      addNotification(
        `Passenger count (${bookingData.passengers}) exceeds vehicle capacity (${vehicle.capacity})`,
        "danger"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const reference = `AIR${Date.now().toString().slice(-6)}`;
      const reservationDateTime = `${selectedDate} ${selectedTime}`;
      
      const bookingDoc = {
        airportCode: selectedAirport.code,
        airportId: selectedAirport.id,
        airportName: selectedAirport.name[lang] || selectedAirport.name.en,
        createdAt: serverTimestamp(),
        customerName: bookingData.name,
        customerPhone: bookingData.phone,
        language: lang,
        maxCapacity: vehicle.capacity,
        passengerCount: bookingData.passengers,
        reservationDate: selectedDate,
        reservationDateTime: reservationDateTime,
        reservationTime: selectedTime,
        status: 'confirmed',
        updatedAt: serverTimestamp(),
        vehicleName: vehicle.name[lang] || vehicle.name.en,
        vehicleType: vehicle.id,
        bookingReference: reference
      };

      const docRef = await addDoc(collection(db, 'airport_reservation'), bookingDoc);
      
      // ---<<< بداية الكود الجديد لإرسال الإشعار >>>---
      try {
        // تجميع بيانات الإشعار
      const notificationPayload = {
  customerName: bookingData.name,
  tourName: `Airport Transfer: ${selectedAirport.name[lang] || selectedAirport.name.en}`,
  bookingReference: reference,
  imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=2070&auto=format&fit=crop',
};

        // إرسال البيانات إلى Netlify Function
        await fetch('/.netlify/functions/send-booking-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationPayload),
        });

      } catch (notificationError) {
        // في حال فشل الإشعار، لا تتوقف العملية، فقط سجل الخطأ
        console.error("Failed to send airport booking notification:", notificationError);
      }
      // ---<<< نهاية الكود الجديد لإرسال الإشعار >>>---

      // Show confirmation
      setBookingReference(reference);
      setShowConfirmation(true);
      
      addNotification(t.bookingSuccess, "success");
      
      // Reset form
      setSelectedVehicle('');
      setSelectedDate('');
      setSelectedTime('');
      setBookingData({
        name: '',
        phone: '',
        passengers: 1
      });

    } catch (error) {
      console.error("Booking error:", error);
      handleFirestoreError(error, 'booking submission');
      addNotification(
        "Booking failed",
        "danger"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadReceipt = () => {
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const airport = airports.find(a => a.id === selectedAirport?.id);
    
    const receiptData = `
Airport Booking Receipt
============================
Booking Reference: ${bookingReference}
Date: ${new Date().toLocaleDateString()}

Booking Details:
Airport: ${airport?.name[lang] || airport?.name.en} (${airport?.code})
Vehicle: ${vehicle?.name[lang] || vehicle?.name.en}
Price: ${vehicle?.price} USD

Passenger Information:
Name: ${bookingData.name}
Phone: ${bookingData.phone}
Passengers: ${bookingData.passengers}

Trip Date: ${selectedDate}
Trip Time: ${selectedTime}

Thank you for choosing our service!
    `;

    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airport-booking-${bookingReference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ConnectionStatusIndicator = () => {
    const statusMessages = {
      connected: "Connected",
      connecting: "Connecting...",
      disconnected: "Disconnected. Retrying...",
      error: "Connection Error"
    };

    const statusIcons = {
      connected: FaCheckCircle,
      connecting: FaSync,
      disconnected: FaExclamationTriangle,
      error: FaExclamationCircle
    };

    const StatusIcon = statusIcons[connectionStatus];
    const statusColor = connectionStatus === 'connected' ? 'success' : 
                       connectionStatus === 'connecting' ? 'warning' : 'danger';

    return (
      <Alert variant={statusColor} className="position-fixed bottom-0 end-0 m-3 d-flex align-items-center" style={{ zIndex: 9999 }}>
        <StatusIcon className="me-2" />
        <span>{statusMessages[connectionStatus]}</span>
      </Alert>
    );
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">{t.loading}</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: colors.background }}>
      {/* Navigation */}
      <Navbar expand="lg" className="shadow-sm bg-white sticky-top">
        <Container>
          <Navbar.Brand 
            className="fw-bold" 
            style={{ color: colors.primary, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
                  <img
                    src={company_logo}
                    alt="Company Logo"
                    height="35"
                    className="me-2"
                    style={{ 
                      objectFit: "contain",
                      transition: "opacity 0.3s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = "0.8"}
                    onMouseLeave={(e) => e.target.style.opacity = "1"}
                  />
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

      <ConnectionStatusIndicator />

      {/* Hero Section */}
      <div className="py-5 text-white" style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <Container className="py-5">
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-4">{t.title}</h1>
              <p className="lead mb-5">{t.subtitle}</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-5">
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-4">
                <Row className="g-4">
                  {/* Airport Selection */}
                  <Col md={6}>
                    <FloatingLabel label={t.selectAirport}>
                      <Form.Select
                        value={selectedAirport?.id || ''}
                        onChange={(e) => {
                          const airport = airports.find(a => a.id === e.target.value);
                          setSelectedAirport(airport);
                        }}
                        className="border-0 shadow-sm"
                        style={{ height: '58px' }}
                      >
                        <option value="">{t.selectAirport}</option>
                        {airports.map(airport => (
                          <option key={airport.id} value={airport.id}>
                            {airport.name[lang] || airport.name.en} ({airport.code})
                          </option>
                        ))}
                      </Form.Select>
                    </FloatingLabel>
                  </Col>

                  {/* Vehicle Selection */}
                  <Col md={6}>
                    <FloatingLabel label={t.selectVehicle}>
                      <Form.Select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="border-0 shadow-sm"
                        style={{ height: '58px' }}
                      >
                        <option value="">{t.selectVehicle}</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name[lang] || vehicle.name.en}
                          </option>
                        ))}
                      </Form.Select>
                    </FloatingLabel>
                  </Col>

                  {/* Date and Time Selection */}
                  <Col md={6}>
                    <FloatingLabel label={t.selectDate}>
                      <Form.Control
                        type="date"
                        value={selectedDate}
                        min={getMinDate()}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-0 shadow-sm"
                        style={{ height: '58px' }}
                      />
                    </FloatingLabel>
                  </Col>

                  <Col md={6}>
                    <FloatingLabel label={t.selectTime}>
                      <Form.Select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="border-0 shadow-sm"
                        style={{ height: '58px' }}
                      >
                        <option value="">{t.selectTime}</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </Form.Select>
                    </FloatingLabel>
                  </Col>

                  {/* Passenger Information */}
                  <Col md={4}>
                    <FloatingLabel label={t.nameLabel}>
                      <Form.Control
                        type="text"
                        value={bookingData.name}
                        onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                        className="border-0 shadow-sm"
                        style={{ height: '58px' }}
                      />
                    </FloatingLabel>
                  </Col>

                  <Col md={4}>
                    <FloatingLabel label={t.phoneLabel}>
                      <PhoneInput
                        international
                        defaultCountry="EG"
                        value={bookingData.phone}
                        onChange={handlePhoneChange}
                        className={`border-0 shadow-sm ${phoneError ? 'is-invalid' : ''}`}
                        inputStyle={{
                          width: '100%',
                          height: '58px',
                          border: 'none',
                          paddingLeft: '60px'
                        }}
                      />
                      {phoneError && (
                        <div className="invalid-feedback d-block">
                          {phoneError}
                        </div>
                      )}
                    </FloatingLabel>
                  </Col>

                  <Col md={4}>
                    <FloatingLabel label={t.passengersLabel}>
                      <Form.Control
                        type="number"
                        min="1"
                        max="15"
                        value={bookingData.passengers}
                        onChange={(e) => {
                          const value = Math.min(parseInt(e.target.value) || 1, 15);
                          setBookingData({...bookingData, passengers: value});
                        }}
                        className="border-0 shadow-sm"
                        style={{ height: '58px' }}
                      />
                    </FloatingLabel>
                  </Col>
                </Row>

                {/* Vehicle Showcase */}
                {vehicles.length > 0 && (
                  <div className="mt-5">
                    <h4 className="mb-4 d-flex align-items-center">
                      <FaCar className="me-3" />
                      Available Vehicle Options
                    </h4>
                    <Row>
                      {vehicles.map(vehicle => {
                        const isPopular = vehicle.popularity > 70;
                        const isTopRated = vehicle.rating > 4.5;
                        const IconComponent = iconMap[vehicle.icon] || FaCar;

                        return (
                          <Col md={4} key={vehicle.id} className="mb-4">
                            <Card 
                              className={`h-100 border-0 shadow-sm transition-all ${selectedVehicle === vehicle.id ? 'border-primary border-2' : ''}`}
                              onClick={() => setSelectedVehicle(vehicle.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <Card.Body className="text-center p-4">
                                <div className="mb-3 mx-auto">
                                  <div
                                    className="mx-auto d-flex align-items-center justify-content-center"
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      borderRadius: '50%',
                                      backgroundColor: `${vehicle.color}20`,
                                    }}
                                  >
                                    <IconComponent size={24} style={{ color: vehicle.color }} />
                                  </div>
                                </div>
                                <h5 className="fw-bold mb-2">
                                  {vehicle.name[lang] || vehicle.name.en}
                                </h5>
                                <div className="d-flex justify-content-center gap-2 mb-3">
                                  <Badge bg="light" text="dark" className="px-3 py-2">
                                    {vehicle.capacity} passengers
                                  </Badge>
                                  <Badge bg="info" className="px-3 py-2">
                                    {/* {vehicle.price} USD */}
                                  </Badge>
                                </div>
                                <div className="d-flex flex-wrap justify-content-center gap-1 mb-3">
                                  {(vehicle.features[lang] || vehicle.features.en || []).map((feature, index) => (
                                    <Badge key={index} bg="secondary" className="small">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                )}

                {/* Submit Button */}
                <div className="text-center mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-5 py-3 fw-bold"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedAirport || !selectedVehicle || !selectedDate || !selectedTime || !bookingData.name || !bookingData.phone || phoneError}
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      border: 'none',
                      borderRadius: '50px',
                      minWidth: '200px'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
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

      {/* Booking Confirmation Modal */}
      <Modal
        show={showConfirmation}
        onHide={() => setShowConfirmation(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="w-100 text-center" style={{ color: colors.secondary }}>
            <FaCheck className="me-3" />
            {t.bookingSuccess}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: `${colors.secondary}20`,
              }}
            >
              <FaCheck size={50} style={{ color: colors.secondary }} />
            </div>
            <h4 className="mb-3">
              Your booking has been confirmed!
            </h4>
            <Alert variant="success" className="d-inline-block px-4 py-2">
              <strong>
                Booking Reference: {bookingReference}
              </strong>
            </Alert>
          </div>

          <Card className="border-0 shadow-sm mb-3">
            <Card.Header style={{ backgroundColor: colors.primary, color: 'white' }}>
              <h5 className="mb-0 d-flex align-items-center">
                <FaMapMarkerAlt className="me-2" />
                Booking Details
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="me-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: `${colors.primary}20`,
                      }}
                    >
                      <FaPlane size={20} style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <small className="text-muted d-block">
                        Airport
                      </small>
                      <strong>
                        {selectedAirport?.name[lang] || selectedAirport?.name.en} ({selectedAirport?.code})
                      </strong>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="me-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: `${colors.secondary}20`,
                      }}
                    >
                      <FaCar size={20} style={{ color: colors.secondary }} />
                    </div>
                    <div>
                      <small className="text-muted d-block">
                        Vehicle
                      </small>
                      <strong>
                        {vehicles.find(v => v.id === selectedVehicle)?.name[lang] || 
                         vehicles.find(v => v.id === selectedVehicle)?.name.en}
                      </strong>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="g-3 mt-3">
                <Col md={6}>
                  <div className="text-center p-3 border rounded">
                    <div className="mb-2">
                      <FaCalendarAlt size={30} style={{ color: colors.secondary }} />
                    </div>
                    <h6 className="mb-1">
                      Trip Date
                    </h6>
                    <small className="text-muted">
                      {selectedDate}
                    </small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center p-3 border rounded">
                    <div className="mb-2">
                      <FaClock size={30} style={{ color: colors.accent }} />
                    </div>
                    <h6 className="mb-1">
                      Trip Time
                    </h6>
                    <small className="text-muted">
                      {selectedTime}
                    </small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-3">
            <Card.Header style={{ backgroundColor: colors.light }}>
              <h5 className="mb-0 d-flex align-items-center">
                <FaUser className="me-2" />
                Passenger Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      Name:
                    </span>
                    <strong>{bookingData.name}</strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      Phone:
                    </span>
                    <strong>{bookingData.phone}</strong>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Alert variant="info" className="mt-3">
            <div className="d-flex align-items-start">
              <FaInfoCircle className="me-2 mt-1" />
              <div>
                <strong>
                  Important Information:
                </strong>
                <ul className="mb-0 mt-2">
                  <li>
                    Please save your booking reference for future reference
                  </li>
                  <li>
                    You will receive a confirmation email
                  </li>
                  <li>
                    You can contact us at 0123456789 for any inquiries
                  </li>
                </ul>
              </div>
            </div>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0 d-flex justify-content-center gap-3">
          <Button
            variant="outline-primary"
            onClick={downloadReceipt}
            className="d-flex align-items-center"
          >
            <FaDownload className="me-2" />
            Download Receipt
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowConfirmation(false)}
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              border: 'none',
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Airports;