import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button,
  Alert,
  Modal,
  Spinner,
  FloatingLabel,
  Badge,
  Navbar,
  Nav,
  Dropdown,
  ProgressBar,
  ListGroup,
  Tab,
  Tabs,
  Accordion
} from 'react-bootstrap';
import { 
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaDownload,
  FaPrint,
  FaIdCard,
  FaGlobe,
  FaHome,
  FaInfoCircle,
  FaSearch,
  FaExclamationTriangle,
  FaStar,
  FaHistory,
  FaBus,
  FaCamera,
  FaUtensils,
  FaHotel,
  FaTicketAlt,
  FaMoneyBillWave,
  FaLanguage
} from 'react-icons/fa';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { 
  collection, 
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Tour1 from '../assets/getimage_32b1b85a-085a-4618-8327-70eb4ccafc60.webp';

const EgyptTours = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  
  // Firestore data states with real-time updates
  const [tours, setTours] = useState([]);
  const [cities, setCities] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  
  // Translations
  const translations = {
    en: {
      appName: "Egypt Tours",
      home: "Home",
      bookNow: "Book Now",
      about: "About",
      welcomeTitle: "Explore Egypt's Wonders",
      welcomeSubtitle: "Book your guided tours to Egypt's most famous landmarks",
      searchTitle: "Find Your Perfect Tour",
      bookTourButton: "Book This Tour",
      loading: "Loading...",
      dataLoadError: "Error loading data. Please refresh the page.",
      languages: {
        en: "English",
        ar: "العربية"
      },
      tourTypes: {
        all: "All Tours",
        historical: "Historical",
        cultural: "Cultural",
        adventure: "Adventure",
        food: "Food"
      },
      tourDetails: {
        duration: "Duration",
        hours: "hours",
        price: "Price per person",
        includes: "Tour Includes",
        itinerary: "Itinerary",
        highlights: "Highlights",
        meetingPoint: "Meeting Point",
        requirements: "Requirements",
        groupSize: "Max Group Size",
        persons: "persons",
        languages: "Available Languages"
      },
      bookingForm: {
        title: "Book Your Tour",
        fullName: "Full Name *",
        phone: "Phone Number *",
        email: "Email *",
        nationality: "Nationality",
        participants: "Number of Participants *",
        tourDate: "Tour Date *",
        specialRequests: "Special Requests",
        submit: "Confirm Booking"
      },
      confirmation: {
        title: "Booking Confirmed!",
        reference: "Booking Reference",
        details: "Tour Details",
        passengerInfo: "Passenger Information",
        importantInfo: "Important Information",
        download: "Download Receipt",
        print: "Print Receipt",
        close: "Close"
      }
    },
    ar: {
      appName: "جولات مصر",
      home: "الرئيسية",
      bookNow: "احجز الآن",
      about: "من نحن",
      welcomeTitle: "اكتشف عجائب مصر",
      welcomeSubtitle: "احجز جولاتك الإرشادية إلى أشهر معالم مصر",
      searchTitle: "ابحث عن جولتك المثالية",
      bookTourButton: "احجز هذه الجولة",
      loading: "جاري التحميل...",
      dataLoadError: "خطأ في تحميل البيانات. الرجاء تحديث الصفحة.",
      languages: {
        en: "English",
        ar: "العربية"
      },
      tourTypes: {
        all: "جميع الجولات",
        historical: "تاريخية",
        cultural: "ثقافية",
        adventure: "مغامرات",
        food: "طعام"
      },
      tourDetails: {
        duration: "المدة",
        hours: "ساعات",
        price: "السعر للفرد",
        includes: "تشمل الجولة",
        itinerary: "برنامج الرحلة",
        highlights: "أبرز المعالم",
        meetingPoint: "نقطة التجمع",
        requirements: "متطلبات",
        groupSize: "الحد الأقصى للمجموعة",
        persons: "أشخاص",
        languages: "اللغات المتاحة"
      },
      bookingForm: {
        title: "احجز جولتك",
        fullName: "الاسم الكامل *",
        phone: "رقم الهاتف *",
        email: "البريد الإلكتروني *",
        nationality: "الجنسية",
        participants: "عدد المشاركين *",
        tourDate: "تاريخ الجولة *",
        specialRequests: "طلبات خاصة",
        submit: "تأكيد الحجز"
      },
      confirmation: {
        title: "تم تأكيد الحجز!",
        reference: "رقم الحجز",
        details: "تفاصيل الجولة",
        passengerInfo: "معلومات المسافر",
        importantInfo: "معلومات مهمة",
        download: "تحميل الإيصال",
        print: "طباعة الإيصال",
        close: "إغلاق"
      }
    }
  };

  const t = translations[language];

  // Booking form state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    duration: '',
    type: 'all',
    priceRange: [0, 1000],
    sortBy: 'popularity'
  });

  // Form Data
  const [formData, setFormData] = useState({
    tourId: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    nationality: '',
    participants: 1,
    tourDate: '',
    specialRequests: ''
  });

  // Validation Errors
  const [errors, setErrors] = useState({});

  // Set up real-time listeners for Firestore data
  useEffect(() => {
    setIsDataLoading(true);
    setDataError(null);

    // Tours collection listener
    const toursQuery = query(collection(db, 'tours'), orderBy('popularity', 'desc'));
    const toursUnsubscribe = onSnapshot(toursQuery, 
      (snapshot) => {
        const toursData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          pricePerPerson: doc.data().price,
          rating: (Math.random() * 2 + 3).toFixed(1) // Mock rating 3-5
        }));
        setTours(toursData);
      },
      (error) => {
        console.error('Error loading tours:', error);
        setDataError(error.message);
        addNotification(
          language === 'ar' 
            ? 'خطأ في تحميل الجولات. الرجاء المحاولة مرة أخرى.' 
            : 'Error loading tours. Please try again.', 
          'danger'
        );
      }
    );

    // Cities collection listener
    const citiesQuery = query(collection(db, 'cities'));
    const citiesUnsubscribe = onSnapshot(citiesQuery, 
      (snapshot) => {
        const citiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCities(citiesData);
      },
      (error) => {
        console.error('Error loading cities:', error);
        setDataError(error.message);
        addNotification(
          language === 'ar' 
            ? 'خطأ في تحميل المدن. الرجاء المحاولة مرة أخرى.' 
            : 'Error loading cities. Please try again.', 
          'danger'
        );
      }
    );

    // Testimonials collection listener
    const testimonialsQuery = query(collection(db, 'testimonials'));
    const testimonialsUnsubscribe = onSnapshot(testimonialsQuery, 
      (snapshot) => {
        const testimonialsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTestimonials(testimonialsData);
        setIsDataLoading(false);
      },
      (error) => {
        console.error('Error loading testimonials:', error);
        setDataError(error.message);
        addNotification(
          language === 'ar' 
            ? 'خطأ في تحميل التقييمات. الرجاء المحاولة مرة أخرى.' 
            : 'Error loading testimonials. Please try again.', 
          'danger'
        );
        setIsDataLoading(false);
      }
    );

    // Clean up listeners on unmount
    return () => {
      toursUnsubscribe();
      citiesUnsubscribe();
      testimonialsUnsubscribe();
    };
  }, [language]);

  // Filtered tours
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      if (searchFilters.city && tour.city !== searchFilters.city) return false;
      if (searchFilters.duration && tour.duration !== searchFilters.duration) return false;
      if (searchFilters.type !== 'all' && !tour.types.includes(searchFilters.type)) return false;
      if (tour.price < searchFilters.priceRange[0] || tour.price > searchFilters.priceRange[1]) return false;
      return true;
    }).sort((a, b) => {
      switch (searchFilters.sortBy) {
        case 'price': return a.price - b.price;
        case 'duration': return a.duration - b.duration;
        case 'popularity': return b.popularity - a.popularity;
        case 'rating': return b.rating - a.rating;
        default: return b.popularity - a.popularity;
      }
    });
  }, [tours, searchFilters]);

  // Available cities for filter
  const availableCities = useMemo(() => {
    const uniqueCities = [...new Set(tours.map(tour => tour.city))];
    return uniqueCities.map(city => ({
      value: city,
      label: city
    }));
  }, [tours]);

  // Notification system
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.tourId) newErrors.tourId = language === 'ar' ? 'الرجاء اختيار جولة' : 'Please select a tour';
    if (!formData.fullName.trim()) newErrors.fullName = language === 'ar' ? 'الاسم الكامل مطلوب' : 'Full name is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = language === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح' : 'Please enter a valid email';
    if (!formData.participants || formData.participants < 1) newErrors.participants = language === 'ar' ? 'يجب أن يكون عدد المشاركين 1 على الأقل' : 'At least 1 participant is required';
    if (!formData.tourDate) newErrors.tourDate = language === 'ar' ? 'تاريخ الجولة مطلوب' : 'Tour date is required';

    // Validate tour date is in the future
    if (formData.tourDate) {
      const selectedDate = new Date(formData.tourDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.tourDate = language === 'ar' 
          ? 'تاريخ الجولة يجب أن يكون في المستقبل' 
          : 'Tour date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// ... داخل ملف OurTravels.jsx

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification(
        language === 'ar' 
          ? 'الرجاء ملء جميع الحقول المطلوبة بشكل صحيح' 
          : 'Please fill in all required fields correctly', 
        'danger'
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate booking reference
      const reference = `ET${Date.now().toString().slice(-6)}`;
      
      // Get tour details
      const tour = tours.find(t => t.id === formData.tourId);
      
      // Create booking data
      const bookingData = {
        ...formData,
        bookingReference: reference,
        timestamp: serverTimestamp(),
        status: 'confirmed',
        language: language,
        tourName: tour?.name?.[language] || tour?.name?.en || tour?.name,
        tourCity: tour?.city,
        tourDuration: tour?.duration,
        tourPrice: tour?.price,
        totalAmount: tour?.price * formData.participants
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'bookings'), bookingData);


      try {
        const tour = tours.find(t => t.id === formData.tourId); // البحث عن الجولة من قائمة 'tours'
        const notificationPayload = {
          tourCity: tour?.city || 'Unknown City', // مدينة الجولة
          tourName: tour?.name?.[language] || tour?.name?.en || tour?.name, // اسم الجولة باللغة المختارة
          customerName: formData.fullName, // اسم العميل من بيانات الفورم
        };
      
        await fetch('/.netlify/functions/send-booking-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationPayload),
        });
      
      } catch (notificationError) {
          console.error("Failed to send notification:", notificationError);
          // لا توقف العملية كلها إذا فشل الإشعار، فقط سجل الخطأ
      }
      
      // Increment tour popularity
      if (tour?.id) {
        const tourRef = doc(db, 'tours', tour.id);
        await updateDoc(tourRef, {
          popularity: increment(1)
        });
      }
      
      setBookingReference(reference);
      addNotification(
        language === 'ar' 
          ? 'تم تأكيد الحجز بنجاح!' 
          : 'Booking confirmed successfully!', 
        'success'
      );
      
      // Reset form
      setFormData({
        tourId: '',
        fullName: '',
        phoneNumber: '',
        email: '',
        nationality: '',
        participants: 1,
        tourDate: '',
        specialRequests: ''
      });
      
      // Show confirmation
      setShowBookingModal(false);
      setShowConfirmation(true);
      
    } catch (error) {
      console.error('Booking error:', error);
      addNotification(
        language === 'ar' 
          ? 'فشل في إتمام الحجز. الرجاء المحاولة مرة أخرى.' 
          : 'Failed to complete booking. Please try again.', 
        'danger'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

// ... باقي الكود في الملف

  // Input change handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Open booking modal with selected tour
  const openBookingModal = (tour) => {
    setSelectedTour(tour);
    setFormData(prev => ({ ...prev, tourId: tour.id }));
    setShowBookingModal(true);
  };

  // Download receipt function
  const downloadReceipt = () => {
    const tour = tours.find(t => t.id === formData.tourId);
    
    const receiptData = `
${language === 'ar' ? 'إيصال حجز جولات مصر' : 'EGYPT TOURS BOOKING RECEIPT'}
${language === 'ar' ? '============================' : '============================'}
${language === 'ar' ? 'رقم الحجز:' : 'Booking Reference:'} ${bookingReference}
${language === 'ar' ? 'التاريخ:' : 'Date:'} ${new Date().toLocaleDateString()}

${language === 'ar' ? 'تفاصيل الجولة:' : 'TOUR DETAILS:'}
${language === 'ar' ? 'اسم الجولة:' : 'Tour Name:'} ${tour?.name?.[language] || tour?.name?.en || tour?.name}
${language === 'ar' ? 'المدينة:' : 'City:'} ${tour?.city}
${language === 'ar' ? 'المدة:' : 'Duration:'} ${tour?.duration} ${language === 'ar' ? 'ساعات' : 'hours'}
${language === 'ar' ? 'السعر للفرد:' : 'Price per person:'} ${tour?.price} ${language === 'ar' ? 'جنيه' : 'EGP'}
${language === 'ar' ? 'عدد المشاركين:' : 'Participants:'} ${formData.participants}
${language === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'} ${tour?.price * formData.participants} ${language === 'ar' ? 'جنيه' : 'EGP'}

${language === 'ar' ? 'تفاصيل المسافر:' : 'PASSENGER DETAILS:'}
${language === 'ar' ? 'الاسم:' : 'Name:'} ${formData.fullName}
${language === 'ar' ? 'الهاتف:' : 'Phone:'} ${formData.phoneNumber}
${language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'} ${formData.email}
${language === 'ar' ? 'الجنسية:' : 'Nationality:'} ${formData.nationality || (language === 'ar' ? 'غير محدد' : 'Not specified')}

${language === 'ar' ? 'تاريخ الجولة:' : 'Tour Date:'} ${formData.tourDate || (language === 'ar' ? 'سيتم تأكيده' : 'To be confirmed')}

${language === 'ar' ? 'شكرًا لاختياركم جولات مصر!' : 'Thank you for choosing Egypt Tours!'}
    `;

    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tour-booking-${bookingReference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading screen
  if (isDataLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h4 className="mt-3">{t.loading}</h4>
        </div>
      </div>
    );
  }

  // Error screen
  if (dataError) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <FaExclamationTriangle size={60} className="text-danger mb-3" />
          <h4 className="text-danger mb-3">{t.dataLoadError}</h4>
          <Button variant="primary" onClick={() => window.location.reload()}>
            {language === 'ar' ? 'إعادة تحميل' : 'Reload Page'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Navigation */}
      <Navbar expand="lg" className="shadow-sm bg-white">
        <Container>
          <Navbar.Brand 
            href="#" 
            className="fw-bold" 
            style={{ color: '#1E40AF' }}
            onClick={() => navigate('/')}
          >
            {t.appName}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate('/')}>
                <FaHome className="me-1" /> {t.home}
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/travels')}>
                <FaSearch className="me-1" /> {t.bookNow}
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/about')}>
                <FaInfoCircle className="me-1" /> {t.about}
              </Nav.Link>
            </Nav>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="dropdown-language">
                <FaLanguage className="me-1" /> {t.languages[language]}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setLanguage('en')}>
                  {t.languages.en}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setLanguage('ar')}>
                  {t.languages.ar}
                </Dropdown.Item>
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
          onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          dismissible
        >
          {notification.message}
        </Alert>
      ))}

      {/* Hero Section */}
      <div 
        className="py-5 text-white" 
        style={{ 
          background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Container className="py-5">
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-4">{t.welcomeTitle}</h1>
              <p className="lead mb-5">{t.welcomeSubtitle}</p>
              <Button 
                variant="primary" 
                size="lg" 
                className="px-5 py-3 fw-bold"
                onClick={() => window.scrollTo({
                  top: document.getElementById('tours-section').offsetTop - 100,
                  behavior: 'smooth'
                })}
              >
                {t.bookNow}
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-5">
        {/* Search Filters */}
        <Row className="justify-content-center mb-5" id="tours-section">
          <Col lg={10}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h4 className="mb-4">
                  <FaSearch className="me-2" /> {t.searchTitle}
                </h4>
                
                <Row className="g-3">
                  <Col md={4}>
                    <FloatingLabel label={language === 'ar' ? 'المدينة' : 'City'}>
                      <Form.Select
                        value={searchFilters.city}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, city: e.target.value }))}
                        className="border-0 shadow-sm"
                      >
                        <option value="">{language === 'ar' ? 'جميع المدن' : 'All Cities'}</option>
                        {availableCities.map(city => (
                          <option key={city.value} value={city.value}>{city.label}</option>
                        ))}
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                  <Col md={4}>
                    <FloatingLabel label={language === 'ar' ? 'نوع الجولة' : 'Tour Type'}>
                      <Form.Select
                        value={searchFilters.type}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="border-0 shadow-sm"
                      >
                        <option value="all">{t.tourTypes.all}</option>
                        <option value="historical">{t.tourTypes.historical}</option>
                        <option value="cultural">{t.tourTypes.cultural}</option>
                        <option value="adventure">{t.tourTypes.adventure}</option>
                        <option value="food">{t.tourTypes.food}</option>
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                  <Col md={4}>
                    <FloatingLabel label={language === 'ar' ? 'ترتيب النتائج' : 'Sort By'}>
                      <Form.Select
                        value={searchFilters.sortBy}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="border-0 shadow-sm"
                      >
                        <option value="popularity">{language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</option>
                        <option value="price-asc">{language === 'ar' ? 'السعر (منخفض إلى مرتفع)' : 'Price (Low to High)'}</option>
                        <option value="price-desc">{language === 'ar' ? 'السعر (مرتفع إلى منخفض)' : 'Price (High to Low)'}</option>
                        <option value="rating">{language === 'ar' ? 'أعلى التقييمات' : 'Top Rated'}</option>
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                </Row>

                {/* Price Range Filter */}
                <div className="mt-4">
                  <h6 className="mb-3">
                    {language === 'ar' ? 'نطاق السعر' : 'Price Range'}:
                    <span className="ms-2 text-primary">
                      {searchFilters.priceRange[0]} - {searchFilters.priceRange[1]} {language === 'ar' ? 'جنيه' : 'EGP'}
                    </span>
                  </h6>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Range
                      min={0}
                      max={2000}
                      step={100}
                      value={searchFilters.priceRange[1]}
                      onChange={(e) => setSearchFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                      }))}
                      className="flex-grow-1"
                    />
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => setSearchFilters(prev => ({
                        ...prev,
                        priceRange: [0, 2000]
                      }))}
                    >
                      {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tours List */}
        <Row className="mb-5">
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                {language === 'ar' ? 'جولاتنا السياحية' : 'Our Tours'}
              </h2>
              <Badge bg="info" className="d-flex align-items-center">
                {filteredTours.length} {language === 'ar' ? 'جولة متاحة' : 'tours available'}
              </Badge>
            </div>
          </Col>
          
          {filteredTours.length === 0 ? (
            <Col xs={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center p-5">
                  <FaSearch size={50} className="text-muted mb-3" />
                  <h5 className="text-muted">
                    {language === 'ar' ? 'لا توجد جولات تطابق معايير البحث' : 'No tours match your search criteria'}
                  </h5>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setSearchFilters({
                      city: '',
                      duration: '',
                      type: 'all',
                      priceRange: [0, 1000],
                      sortBy: 'popularity'
                    })}
                  >
                    {language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            filteredTours.map(tour => {
              const isPopular = tour.popularity > 70;
              const isTopRated = tour.rating > 4.5;
              
              return (
                <Col md={4} key={tour.id} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm position-relative">
                    {isPopular && (
                      <div className="position-absolute top-0 start-0 m-2">
                        <Badge bg="danger">
                          <FaStar className="me-1" />
                          {language === 'ar' ? 'شائع' : 'Popular'}
                        </Badge>
                      </div>
                    )}
                    {isTopRated && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <Badge bg="warning" text="dark">
                          ⭐ {tour.rating}
                        </Badge>
                      </div>
                    )}
                    <Card.Img 
                      variant="top" 
                      src={Tour1} 
                      style={{ height: '200px', objectFit: 'cover' }} 
                    />
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold mb-0">
                          {tour.name?.[language] || tour.name?.en || tour.name}
                        </h5>
                        <Badge bg="light" text="dark" className="px-2 py-1">
                          {tour.city}
                        </Badge>
                      </div>
                      <div className="d-flex justify-content-between mb-3">
                        <small className="text-muted">
                          <FaClock className="me-1" />
                          {tour.duration} {t.tourDetails.hours}
                        </small>
                        <h6 className="mb-0 text-primary fw-bold">
                          {tour.price} {language === 'ar' ? 'جنيه' : 'EGP'}
                        </h6>
                      </div>
                      <p className="text-muted small mb-3">
                        {tour.shortDescription?.[language] || tour.shortDescription?.en || tour.shortDescription}
                      </p>
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {tour.types?.map((type, index) => (
                          <Badge key={index} bg="secondary" className="small">
                            {t.tourTypes[type] || type}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        variant="outline-primary" 
                        className="w-100"
                        onClick={() => openBookingModal(tour)}
                      >
                        {t.bookTourButton}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>

        {/* Why Choose Us */}
        <Row className="mb-5">
          <Col xs={12}>
            <h2 className="text-center mb-5">
              <FaCheck className="me-3 text-success" /> {language === 'ar' ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
            </h2>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="mb-3">
                  <div 
                    className="mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#3B82F620'
                    }}
                  >
                    <FaUser size={24} style={{ color: '#3B82F6' }} />
                  </div>
                </div>
                <h5 className="fw-bold mb-3">
                  {language === 'ar' ? 'مرشدون سياحيون معتمدون' : 'Certified Tour Guides'}
                </h5>
                <p className="text-muted">
                  {language === 'ar' 
                    ? 'مرشدون محترفون يتحدثون عدة لغات ويمتلكون معرفة عميقة بتاريخ مصر' 
                    : 'Professional multilingual guides with deep knowledge of Egyptian history'}
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="mb-3">
                  <div 
                    className="mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#10B98120'
                    }}
                  >
                    <FaBus size={24} style={{ color: '#10B981' }} />
                  </div>
                </div>
                <h5 className="fw-bold mb-3">
                  {language === 'ar' ? 'مواصلات مريحة' : 'Comfortable Transportation'}
                </h5>
                <p className="text-muted">
                  {language === 'ar' 
                    ? 'سيارات ومركبات مكيفة حديثة لنقلك بكل راحة وأمان' 
                    : 'Modern air-conditioned vehicles for comfortable and safe transportation'}
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="mb-3">
                  <div 
                    className="mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#F59E0B20'
                    }}
                  >
                    <FaTicketAlt size={24} style={{ color: '#F59E0B' }} />
                  </div>
                </div>
                <h5 className="fw-bold mb-3">
                  {language === 'ar' ? 'تذاكر دخول مشمولة' : 'Entrance Tickets Included'}
                </h5>
                <p className="text-muted">
                  {language === 'ar' 
                    ? 'أسعارنا تشمل تذاكر دخول جميع المواقع الأثرية والمتاحف' 
                    : 'Our prices include entrance tickets to all archaeological sites and museums'}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <Row className="mb-5">
            <Col xs={12}>
              <h2 className="text-center mb-5">
                <FaUser className="me-3 text-primary" /> {language === 'ar' ? 'آراء عملائنا' : 'Customer Reviews'}
              </h2>
            </Col>
            {testimonials.map(testimonial => (
              <Col md={4} key={testimonial.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <div 
                          className="me-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#3B82F620'
                          }}
                        >
                          <FaUser size={20} style={{ color: '#3B82F6' }} />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">
                            {testimonial.name?.[language] || testimonial.name?.en || testimonial.name}
                          </h6>
                          <small className="text-muted">
                            {testimonial.verified && (
                              <span className="text-success me-1">
                                ✓ {language === 'ar' ? 'مؤكد' : 'Verified'}
                              </span>
                            )}
                            {testimonial.date}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              style={{ 
                                color: i < (testimonial.rating || 5) ? '#F59E0B' : '#E5E7EB',
                                fontSize: '1rem'
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mb-0 fst-italic">
                      "{testimonial.comment?.[language] || testimonial.comment?.en || testimonial.comment}"
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Booking Modal */}
      <Modal 
        show={showBookingModal} 
        onHide={() => setShowBookingModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t.bookingForm.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTour && (
            <div className="mb-4">
              <h5 className="mb-3">
                {selectedTour.name?.[language] || selectedTour.name?.en || selectedTour.name}
              </h5>
              <Row>
                <Col md={6}>
                  <p className="mb-1">
                    <strong>{t.tourDetails.duration}:</strong> {selectedTour.duration} {t.tourDetails.hours}
                  </p>
                  <p className="mb-1">
                    <strong>{t.tourDetails.price}:</strong> {selectedTour.price} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-1">
                    <strong>{t.tourDetails.groupSize}:</strong> {selectedTour.maxGroupSize || 15} {t.tourDetails.persons}
                  </p>
                  <p className="mb-1">
                    <strong>{t.tourDetails.languages}:</strong> {selectedTour.languages?.join(', ') || (language === 'ar' ? 'الإنجليزية، العربية' : 'English, Arabic')}
                  </p>
                </Col>
              </Row>
            </div>
          )}
          
          <Form onSubmit={handleSubmit}>
            <input type="hidden" value={formData.tourId} />
            
            <Row className="g-3">
              <Col md={6}>
                <FloatingLabel label={t.bookingForm.fullName}>
                  <Form.Control
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    isInvalid={!!errors.fullName}
                    className="border-0 shadow-sm"
                    placeholder={t.bookingForm.fullName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fullName}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <div className="form-floating">
                  <PhoneInput
                    international
                    defaultCountry="EG"
                    value={formData.phoneNumber}
                    onChange={(phone) => handleInputChange('phoneNumber', phone)}
                    className={`border-0 shadow-sm ${errors.phoneNumber ? 'is-invalid' : ''}`}
                    inputStyle={{
                      width: '100%',
                      height: '58px',
                      border: 'none',
                      paddingLeft: '60px'
                    }}
                  />
                  <label>{t.bookingForm.phone}</label>
                  {errors.phoneNumber && (
                    <div className="invalid-feedback d-block">
                      {errors.phoneNumber}
                    </div>
                  )}
                </div>
              </Col>
              <Col md={6}>
                <FloatingLabel label={t.bookingForm.email}>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    isInvalid={!!errors.email}
                    className="border-0 shadow-sm"
                    placeholder={t.bookingForm.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel label={t.bookingForm.nationality}>
                  <Form.Select
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="border-0 shadow-sm"
                  >
                    <option value="">{language === 'ar' ? 'اختر الجنسية' : 'Select Nationality'}</option>
                    <option value={language === 'ar' ? 'مصري' : 'Egyptian'}>
                      {language === 'ar' ? 'مصري' : 'Egyptian'}
                    </option>
                    <option value={language === 'ar' ? 'سعودي' : 'Saudi'}>
                      {language === 'ar' ? 'سعودي' : 'Saudi'}
                    </option>
                    <option value={language === 'ar' ? 'إماراتي' : 'Emirati'}>
                      {language === 'ar' ? 'إماراتي' : 'Emirati'}
                    </option>
                    <option value={language === 'ar' ? 'أمريكي' : 'American'}>
                      {language === 'ar' ? 'أمريكي' : 'American'}
                    </option>
                    <option value={language === 'ar' ? 'أوروبي' : 'European'}>
                      {language === 'ar' ? 'أوروبي' : 'European'}
                    </option>
                    <option value={language === 'ar' ? 'آسيوي' : 'Asian'}>
                      {language === 'ar' ? 'آسيوي' : 'Asian'}
                    </option>
                    <option value={language === 'ar' ? 'آخر' : 'Other'}>
                      {language === 'ar' ? 'آخر' : 'Other'}
                    </option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel label={t.bookingForm.participants}>
                  <Form.Control
                    type="number"
                    min="1"
                    max={selectedTour?.maxGroupSize || 15}
                    value={formData.participants}
                    onChange={(e) => handleInputChange('participants', parseInt(e.target.value) || 1)}
                    isInvalid={!!errors.participants}
                    className="border-0 shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.participants}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel label={t.bookingForm.tourDate}>
                  <Form.Control
                    type="date"
                    value={formData.tourDate}
                    onChange={(e) => handleInputChange('tourDate', e.target.value)}
                    isInvalid={!!errors.tourDate}
                    className="border-0 shadow-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.tourDate}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
              <Col md={12}>
                <FloatingLabel label={t.bookingForm.specialRequests}>
                  <Form.Control
                    as="textarea"
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    className="border-0 shadow-sm"
                    style={{ height: '100px' }}
                    placeholder={language === 'ar' ? 'أي طلبات خاصة أو احتياجات خاصة' : 'Any special requests or needs'}
                  />
                </FloatingLabel>
              </Col>
            </Row>

            <div className="text-center mt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="px-5 py-3 fw-bold"
                style={{
                  background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
                  border: 'none',
                  borderRadius: '50px',
                  minWidth: '200px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <FaCheck className="me-2" />
                    {t.bookingForm.submit}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Booking Confirmation Modal */}
      <Modal 
        show={showConfirmation} 
        onHide={() => setShowConfirmation(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header className="border-0 text-center">
          <Modal.Title className="w-100 text-center" style={{ color: '#10B981' }}>
            <FaCheck className="me-3" size={40} />
            {t.confirmation.title}
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
                backgroundColor: '#10B98120'
              }}
            >
              <FaCheck size={50} style={{ color: '#10B981' }} />
            </div>
            <h4 className="mb-3">
              {language === 'ar' ? 'تم تأكيد حجز جولتك بنجاح!' : 'Your tour booking has been confirmed!'}
            </h4>
            <Alert variant="success" className="d-inline-block px-4 py-2">
              <strong>
                {t.confirmation.reference}: {bookingReference}
              </strong>
            </Alert>
          </div>

          {/* Tour Details Section */}
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header style={{ backgroundColor: '#1E40AF', color: 'white' }}>
              <h5 className="mb-0 d-flex align-items-center">
                <FaMapMarkerAlt className="me-2" />
                {t.confirmation.details}
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      className="me-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#3B82F620'
                      }}
                    >
                      <FaBus size={20} style={{ color: '#3B82F6' }} />
                    </div>
                    <div>
                      <small className="text-muted d-block">
                        {language === 'ar' ? 'اسم الجولة' : 'Tour Name'}
                      </small>
                      <strong>
                        {formData.tourId && (() => {
                          const tour = tours.find(t => t.id === formData.tourId);
                          return tour?.name?.[language] || tour?.name?.en || tour?.name;
                        })()}
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
                        backgroundColor: '#EF444420'
                      }}
                    >
                      <FaMapMarkerAlt size={20} style={{ color: '#EF4444' }} />
                    </div>
                    <div>
                      <small className="text-muted d-block">
                        {language === 'ar' ? 'المدينة' : 'City'}
                      </small>
                      <strong>
                        {formData.tourId && (() => {
                          const tour = tours.find(t => t.id === formData.tourId);
                          return tour?.city;
                        })()}
                      </strong>
                    </div>
                  </div>
                </Col>
              </Row>
              
              {/* Tour Details */}
              <Row className="g-3 mt-3">
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <div className="mb-2">
                      <FaClock size={30} style={{ color: '#10B981' }} />
                    </div>
                    <h6 className="mb-1">
                      {language === 'ar' ? 'المدة' : 'Duration'}
                    </h6>
                    <small className="text-muted">
                      {formData.tourId && (() => {
                        const tour = tours.find(t => t.id === formData.tourId);
                        return `${tour?.duration} ${t.tourDetails.hours}`;
                      })()}
                    </small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <div className="mb-2">
                      <FaMoneyBillWave size={30} style={{ color: '#F59E0B' }} />
                    </div>
                    <h6 className="mb-1">
                      {language === 'ar' ? 'السعر للفرد' : 'Price per person'}
                    </h6>
                    <small className="text-muted">
                      {formData.tourId && (() => {
                        const tour = tours.find(t => t.id === formData.tourId);
                        return `${tour?.price} ${language === 'ar' ? 'جنيه' : 'EGP'}`;
                      })()}
                    </small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <div className="mb-2">
                      <FaUser size={30} style={{ color: '#3B82F6' }} />
                    </div>
                    <h6 className="mb-1">
                      {language === 'ar' ? 'عدد المشاركين' : 'Participants'}
                    </h6>
                    <small className="text-muted">
                      {formData.participants}
                    </small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Passenger Information */}
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header style={{ backgroundColor: '#F8FAFC' }}>
              <h5 className="mb-0 d-flex align-items-center">
                <FaUser className="me-2" />
                {t.confirmation.passengerInfo}
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      {t.bookingForm.fullName}:
                    </span>
                    <strong>{formData.fullName}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      {t.bookingForm.phone}:
                    </span>
                    <strong>{formData.phoneNumber}</strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      {t.bookingForm.email}:
                    </span>
                    <strong>{formData.email}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      {t.bookingForm.nationality}:
                    </span>
                    <strong>{formData.nationality || (language === 'ar' ? 'غير محدد' : 'Not specified')}</strong>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Important Information */}
          <Alert variant="info" className="mt-3">
            <div className="d-flex align-items-start">
              <FaIdCard className="me-2 mt-1" />
              <div>
                <strong>
                  {t.confirmation.importantInfo}:
                </strong>
                <ul className="mb-0 mt-2">
                  <li>
                    {language === 'ar' 
                      ? 'الرجاء حفظ رقم الحجز الخاص بك للرجوع إليه لاحقاً' 
                      : 'Please save your booking reference number for future reference'}
                  </li>
                  <li>
                    {language === 'ar' 
                      ? 'سوف تتلقى رسالة تأكيد بالبريد الإلكتروني خلال 24 ساعة' 
                      : 'You will receive a confirmation email within 24 hours'}
                  </li>
                  <li>
                    {language === 'ar' 
                      ? 'يمكنك التواصل معنا على الرقم 0123456789 لأي استفسارات' 
                      : 'You can contact us at 0123456789 for any inquiries'}
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
            {t.confirmation.download}
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={() => window.print()}
            className="d-flex align-items-center"
          >
            <FaPrint className="me-2" />
            {t.confirmation.print}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowConfirmation(false)}
            style={{
              background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
              border: 'none'
            }}
          >
            {t.confirmation.close}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EgyptTours;