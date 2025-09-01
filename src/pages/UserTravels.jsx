import { useState, useEffect, useCallback, useMemo } from "react";
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
} from "react-bootstrap";
import {
  FaCar,
  FaBus,
  FaTruck,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaUsers,
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
  FaFilter,
  FaSort,
  FaRoute,
  FaPlane,
  FaArrowRight,
} from "react-icons/fa";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import MinibusReal from "../assets/MINIBUS.jpg";
import SedanReal from "../assets/SEDAN.jpeg";
import SuvReal from "../assets/SUV.jpeg";
import subimg from "../assets/car.png";
import company_logo from "../assets/company_logo.jpeg";
import { motion } from "framer-motion";

// Error boundary component
const ErrorBoundary = ({ children, onReset }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = () => {
    setHasError(false);
    setError(null);
    onReset();
  };

  return hasError ? (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <FaExclamationTriangle size={60} className="text-danger mb-3" />
        <h4 className="text-danger mb-3">
          {error?.message || "Something went wrong"}
        </h4>
        <Button variant="primary" onClick={handleReset}>
          Try Again
        </Button>
      </div>
    </div>
  ) : (
    children
  );
};

const vehicleImages = {
  minibus: MinibusReal,
  sedan: SedanReal,
  suv: SuvReal,
};

const getVehicleImage = (vehicle) => {
  const vehicleType =
    vehicle.type?.toLowerCase() ||
    vehicle.name?.en?.toLowerCase() ||
    vehicle.name?.toLowerCase() ||
    "";

  if (vehicleImages[vehicleType]) {
    return vehicleImages[vehicleType];
  }

  if (vehicle.image) {
    return vehicle.image;
  }

  return subimg;
};

const EgyptTravelHome = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connected");

  // Firestore data states with data validation
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [customPlaces, setCustomPlaces] = useState([]);
  const [travelPrices, setTravelPrices] = useState([]);

  // Translations
  const translations = {
    en: {
      appName: "EGYPT VISTA",
      home: "Home",
      bookNow: "Book Now",
      about: "About",
      welcomeTitle: "Explore Egypt in Comfort",
      welcomeSubtitle:
        "Book your private transportation across Egypt's beautiful cities",
      searchTitle: "Where would you like to go?",
      from: "From",
      to: "To",
      searchButton: "Search",
      vehicleTypes: "Our Vehicle Types",
      whyChooseUs: "Why Choose Us?",
      testimonials: "What Our Customers Say",
      footer: "© 2023 EGYPT VISTA. All rights reserved.",
      bookNowButton: "Book Your Ride Now",
      loading: "Loading...",
      dataLoadError: "Error loading data. Please refresh the page.",
      connectionError: "Connection issues. Trying to reconnect...",
      languages: {
        en: "English",
        ar: "العربية",
      },
    },
    ar: {
      appName: "مصر للسياحة",
      home: "الرئيسية",
      bookNow: "احجز الآن",
      about: "من نحن",
      welcomeTitle: "استكشف مصر براحة",
      welcomeSubtitle: "احجز مواصلاتك الخاصة عبر مدن مصر الجميلة",
      searchTitle: "إلى أين تريد الذهاب؟",
      from: "من",
      to: "إلى",
      searchButton: "بحث",
      vehicleTypes: "أنواع المركبات لدينا",
      whyChooseUs: "لماذا تختارنا؟",
      testimonials: "ما يقوله عملاؤنا",
      footer: "© 2023 مصر للسياحة. جميع الحقوق محفوظة.",
      bookNowButton: "احجز رحلتك الآن",
      loading: "جاري التحميل...",
      dataLoadError: "خطأ في تحميل البيانات. الرجاء تحديث الصفحة.",
      connectionError: "مشاكل في الاتصال. جاري إعادة الاتصال...",
      languages: {
        en: "English",
        ar: "العربية",
      },
    },
  };

  const t = translations[language];

  // Booking form state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    departureGovernorate: "",
    departureCity: "",
    destinationGovernorate: "",
    destinationCity: "",
    carType: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    nationality: "",
    passengers: 1,
    tripDate: "",
    tripTime: "",
  });

  const [searchFilters, setSearchFilters] = useState({
    priceRange: [0, 10000],
    vehicleType: "",
    maxPassengers: 15,
    sortBy: "price",
  });

  const [newPlace, setNewPlace] = useState({
    governorate: "",
    city: "",
    type: "departure",
  });

  const [errors, setErrors] = useState({});

  // Icon mapping for vehicles
  const iconMap = {
    FaCar: FaCar,
    FaBus: FaBus,
    FaTruck: FaTruck,
  };

  // Data validation functions
  const validateVehicleData = (vehicle) => {
    const requiredFields = [
      "name",
      "icon",
      "capacity",
      "price",
      "description",
      "features",
      "color",
    ];
    return requiredFields.every((field) => vehicle[field] !== undefined);
  };

  const validateLocationData = (location) => {
    const requiredFields = ["governorate", "city"];
    return requiredFields.every((field) => location[field] !== undefined);
  };

  // Enhanced notification system
  const addNotification = useCallback((message, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  // Helper function to get price for a specific route and vehicle type
  const getPriceForRoute = useCallback(
    (departure, destination, vehicleType) => {
      if (!departure || !destination || !vehicleType) return null;

      // Find matching route (both directions)
      const route = travelPrices.find(
        (price) =>
          (price.departureGovernorate === departure &&
            price.destinationGovernorate === destination) ||
          (price.departureGovernorate === destination &&
            price.destinationGovernorate === departure)
      );

      if (!route) {
        return null; // Return null if no route exists
      }

      return route?.prices?.[vehicleType] || null;
    },
    [travelPrices]
  );

  // Real-time data listeners with error handling
  useEffect(() => {
    let unsubscribeVehicles = () => {};
    let unsubscribeLocations = () => {};
    let unsubscribeTestimonials = () => {};
    let unsubscribeTravelPrices = () => {};

    const setupListeners = async () => {
      setIsDataLoading(true);
      setDataError(null);

      try {
        // Vehicles listener
        unsubscribeVehicles = onSnapshot(
          query(collection(db, "vehicles"), orderBy("price", "asc")),
          (snapshot) => {
            try {
              const vehiclesData = snapshot.docs
                .map((doc) => {
                  const data = doc.data();
                  if (!validateVehicleData(data)) {
                    console.warn("Invalid vehicle data:", doc.id, data);
                    return null;
                  }
                  return {
                    id: doc.id,
                    ...data,
                    pricePerKm: data.price / 100,
                    popularity: Math.floor(Math.random() * 100) + 20,
                    rating: (Math.random() * 2 + 3).toFixed(1),
                    name: data.name || {
                      en: "Vehicle",
                      ar: "مركبة",
                      cn: "车辆",
                    },
                    description: data.description || { en: "", ar: "", cn: "" },
                    features: data.features || { en: [], ar: [], cn: [] },
                    type: data.id,
                  };
                })
                .filter(Boolean);

              setVehicles(vehiclesData);
              setConnectionStatus("connected");
            } catch (error) {
              console.error("Error processing vehicles data:", error);
              setDataError(error.message);
              addNotification(
                language === "ar"
                  ? "خطأ في معالجة بيانات المركبات"
                  : "Error processing vehicles data",
                "danger"
              );
            }
          },
          (error) => {
            console.error("Vehicles listener error:", error);
            setConnectionStatus("disconnected");
            setDataError(error.message);
            addNotification(
              language === "ar"
                ? "خطأ في الاتصال بقاعدة البيانات"
                : "Database connection error",
              "danger"
            );
            setTimeout(setupListeners, 5000);
          }
        );

        // Locations listener
        unsubscribeLocations = onSnapshot(
          query(collection(db, "locations")),
          (snapshot) => {
            try {
              const locationsData = snapshot.docs
                .map((doc) => {
                  const data = doc.data();
                  if (!validateLocationData(data)) {
                    console.warn("Invalid location data:", doc.id, data);
                    return null;
                  }
                  return {
                    id: doc.id,
                    ...data,
                    distanceFromCairo: Math.floor(Math.random() * 800) + 20,
                    popularity: Math.floor(Math.random() * 100) + 10,
                  };
                })
                .filter(Boolean);

              setLocations(locationsData);
            } catch (error) {
              console.error("Error processing locations data:", error);
              addNotification(
                language === "ar"
                  ? "خطأ في معالجة بيانات المواقع"
                  : "Error processing locations data",
                "danger"
              );
            }
          },
          (error) => {
            console.error("Locations listener error:", error);
            addNotification(
              language === "ar"
                ? "خطأ في الاتصال بقاعدة البيانات"
                : "Database connection error",
              "danger"
            );
          }
        );

        unsubscribeTravelPrices = onSnapshot(
          query(collection(db, "routes")),
          (snapshot) => {
            const routesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTravelPrices(routesData);
          },
          (error) => {
            console.error("Routes listener error:", error);
            addNotification(
              language === "ar"
                ? "خطأ في الاتصال بقاعدة البيانات"
                : "Database connection error",
              "danger"
            );
          }
        );

        // Testimonials listener
        unsubscribeTestimonials = onSnapshot(
          query(collection(db, "testimonials")),
          (snapshot) => {
            try {
              const testimonialsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                helpful: Math.floor(Math.random() * 50) + 5,
                verified: Math.random() > 0.3,
              }));

              setTestimonials(testimonialsData);
            } catch (error) {
              console.error("Error processing testimonials data:", error);
              addNotification(
                language === "ar"
                  ? "خطأ في معالجة بيانات الشهادات"
                  : "Error processing testimonials data",
                "danger"
              );
            }
          },
          (error) => {
            console.error("Testimonials listener error:", error);
            addNotification(
              language === "ar"
                ? "خطأ في الاتصال بقاعدة البيانات"
                : "Database connection error",
              "danger"
            );
          }
        );

        // Load custom places from localStorage
        const savedCustomPlaces = localStorage.getItem("customPlaces");
        if (savedCustomPlaces) {
          try {
            setCustomPlaces(JSON.parse(savedCustomPlaces));
          } catch (error) {
            console.error("Error loading custom places:", error);
          }
        }
      } catch (error) {
        console.error("Error setting up listeners:", error);
        setDataError(error.message);
        addNotification(
          language === "ar"
            ? "خطأ في تحميل البيانات. الرجاء المحاولة مرة أخرى."
            : "Error loading data. Please try again.",
          "danger"
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      unsubscribeVehicles();
      unsubscribeLocations();
      unsubscribeTestimonials();
      unsubscribeTravelPrices();
    };
  }, [language, addNotification]);

  // Save custom places to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("customPlaces", JSON.stringify(customPlaces));
  }, [customPlaces]);

  // Connection status indicator
  useEffect(() => {
    if (connectionStatus === "disconnected") {
      const timer = setTimeout(() => {
        setConnectionStatus("reconnecting");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  // Smart computed properties with memoization
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((vehicle) => {
        if (
          searchFilters.vehicleType &&
          vehicle.id !== searchFilters.vehicleType
        )
          return false;
        if (vehicle.capacity > searchFilters.maxPassengers) return false;
        if (
          vehicle.price < searchFilters.priceRange[0] ||
          vehicle.price > searchFilters.priceRange[1]
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        switch (searchFilters.sortBy) {
          case "price":
            return a.price - b.price;
          case "popularity":
            return b.popularity - a.popularity;
          case "rating":
            return b.rating - a.rating;
          default:
            return a.price - b.price;
        }
      });
  }, [vehicles, searchFilters]);

  // Enhanced governorates with custom places
  const getAllGovernorates = useMemo(() => {
    const allPlaces = [
      ...locations.map((location) => ({
        value: location.governorate?.en || location.governorate,
        label:
          location.governorate?.[language] ||
          location.governorate?.en ||
          location.governorate,
        type: "official",
        popularity: location.popularity || 0,
      })),
      ...customPlaces.map((place) => ({
        value: place.governorate,
        label: place.governorate,
        type: "custom",
        city: place.city,
        id: place.id,
      })),
    ];
    return allPlaces.sort((a, b) => b.popularity - a.popularity);
  }, [locations, customPlaces, language]);

  const getGovernorates = useCallback(() => {
    return getAllGovernorates;
  }, [getAllGovernorates]);

  const getCitiesForGovernorate = (governorate) => {
    const location = locations.find(
      (loc) => (loc.governorate?.en || loc.governorate) === governorate
    );

    if (location) {
      if (location.pickupPoints) {
        return location.pickupPoints.map((point) => ({
          value: point?.en || point,
          label: point?.[language] || point?.en || point,
        }));
      }
      return [
        {
          value: location.city?.en || location.city,
          label:
            location.city?.[language] || location.city?.en || location.city,
        },
      ];
    }

    const customPlace = customPlaces.find(
      (place) => place.governorate === governorate
    );
    if (customPlace) {
      return [
        {
          value: customPlace.city,
          label: customPlace.city,
        },
      ];
    }

    return [];
  };

  // Reset form with confirmation
  const resetForm = useCallback(() => {
    if (
      window.confirm(
        language === "ar"
          ? "هل أنت متأكد من إعادة تعيين جميع البيانات؟"
          : "Are you sure you want to reset all data?"
      )
    ) {
      setFormData({
        departureGovernorate: "",
        departureCity: "",
        destinationGovernorate: "",
        destinationCity: "",
        carType: "",
        fullName: "",
        phoneNumber: "",
        email: "",
        nationality: "",
        passengers: 1,
        tripDate: "",
        tripTime: "",
      });
      setErrors({});
      setSearchFilters({
        priceRange: [0, 10000],
        vehicleType: "",
        maxPassengers: 15,
        sortBy: "price",
      });
      setShowAdvancedSearch(false);

      addNotification(
        language === "ar"
          ? "✅ تم إعادة تعيين النموذج بنجاح"
          : "✅ Form has been successfully reset",
        "success"
      );
    }
  }, [language, addNotification]);

  // Add/remove custom places
  const addCustomPlace = useCallback(
    (place) => {
      setCustomPlaces((prev) => {
        const exists = prev.find(
          (p) => p.governorate === place.governorate && p.city === place.city
        );
        if (exists) {
          addNotification(
            language === "ar"
              ? "هذا المكان موجود بالفعل"
              : "This place already exists",
            "warning"
          );
          return prev;
        }
        return [...prev, { ...place, id: Date.now() }];
      });
      addNotification(
        language === "ar"
          ? "تم إضافة المكان بنجاح"
          : "Place added successfully",
        "success"
      );
    },
    [language, addNotification]
  );

  const removeCustomPlace = useCallback(
    (placeId) => {
      setCustomPlaces((prev) => prev.filter((p) => p.id !== placeId));
      addNotification(
        language === "ar" ? "تم حذف المكان" : "Place removed",
        "info"
      );
    },
    [language, addNotification]
  );

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.departureGovernorate)
      newErrors.departureGovernorate =
        language === "ar"
          ? "الرجاء اختيار المحافظة"
          : "Please select departure governorate";
    if (!formData.departureCity)
      newErrors.departureCity =
        language === "ar"
          ? "الرجاء اختيار المدينة"
          : "Please select departure city";
    if (!formData.destinationGovernorate)
      newErrors.destinationGovernorate =
        language === "ar"
          ? "الرجاء اختيار المحافظة"
          : "Please select destination governorate";
    if (!formData.destinationCity)
      newErrors.destinationCity =
        language === "ar"
          ? "الرجاء اختيار المدينة"
          : "Please select destination city";
    if (!formData.carType)
      newErrors.carType =
        language === "ar"
          ? "الرجاء اختيار نوع المركبة"
          : "Please select a vehicle type";
    if (!formData.fullName.trim())
      newErrors.fullName =
        language === "ar" ? "الاسم الكامل مطلوب" : "Full name is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber =
        language === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
    if (!formData.email.trim())
      newErrors.email =
        language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email =
        language === "ar"
          ? "الرجاء إدخال بريد إلكتروني صحيح"
          : "Please enter a valid email";

    if (formData.carType && formData.passengers) {
      const selectedVehicle = vehicles.find((v) => v.id === formData.carType);
      if (selectedVehicle && formData.passengers > selectedVehicle.capacity) {
        newErrors.passengers =
          language === "ar"
            ? `عدد الركاب (${formData.passengers}) أكبر من سعة المركبة (${selectedVehicle.capacity})`
            : `Number of passengers (${formData.passengers}) exceeds vehicle capacity (${selectedVehicle.capacity})`;
      }
    }

    if (
      formData.departureGovernorate &&
      formData.destinationGovernorate &&
      formData.departureGovernorate === formData.destinationGovernorate &&
      formData.departureCity === formData.destinationCity
    ) {
      newErrors.destinationGovernorate =
        language === "ar"
          ? "لا يمكن أن يكون مكان المغادرة والوصول متطابقين"
          : "Departure and destination cannot be the same";
    }

    // Validate that the route exists in travelPrices
    // In the validateForm function, add this check:
    if (formData.departureGovernorate && formData.destinationGovernorate) {
      const routeExists = travelPrices.some(
        (price) =>
          (price.departureGovernorate === formData.departureGovernorate &&
            price.destinationGovernorate === formData.destinationGovernorate) ||
          (price.departureGovernorate === formData.destinationGovernorate &&
            price.destinationGovernorate === formData.departureGovernorate)
      );

      if (!routeExists) {
        newErrors.destinationGovernorate =
          language === "ar"
            ? "لا تتوفر رحلات بين هذه المحافظات حالياً"
            : "No trips available between these governorates currently";
      }
    }

    if (formData.tripDate) {
      const selectedDate = new Date(formData.tripDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.tripDate =
          language === "ar"
            ? "تاريخ الرحلة يجب أن يكون في المستقبل"
            : "Trip date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification(
        language === "ar"
          ? "الرجاء ملء جميع الحقول المطلوبة بشكل صحيح"
          : "Please fill in all required fields correctly",
        "danger"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const reference = `EGT${Date.now().toString().slice(-6)}`;
      const vehiclePrice = getPriceForRoute(
        formData.departureGovernorate,
        formData.destinationGovernorate,
        formData.carType
      );

      const bookingData = {
        ...formData,
        bookingReference: reference,
        price: vehiclePrice,
        timestamp: serverTimestamp(),
        status: "confirmed",
        language: language,
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);

      try {
        const vehicle = vehicles.find((v) => v.id === bookingData.carType);
        const notificationPayload = {
          tourCity: bookingData.departureGovernorate,
          tourName: `Trip from ${bookingData.departureCity} to ${bookingData.destinationCity}`,
          customerName: bookingData.fullName,
          bookingReference: reference,
          totalAmount: vehiclePrice || vehicle?.price,
          imageUrl:
            vehicle?.imageUrl ||
            "https://orionmagazine.org/wp-content/uploads/2015/09/8589130570139-dusk-camel-pyramids-cairo-egypt-top-travel-lists-wallpaper-hd.jpg",
        };

        await fetch("/.netlify/functions/send-booking-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notificationPayload),
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
      }

      setBookingReference(reference);
      addNotification(
        language === "ar"
          ? "تم تأكيد الحجز بنجاح!"
          : "Booking confirmed successfully!",
        "success"
      );

      setFormData({
        departureGovernorate: "",
        departureCity: "",
        destinationGovernorate: "",
        destinationCity: "",
        carType: "",
        fullName: "",
        phoneNumber: "",
        email: "",
        nationality: "",
        passengers: 1,
        tripDate: "",
        tripTime: "",
      });

      setShowBookingModal(false);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Booking error:", error);
      addNotification(
        language === "ar"
          ? "فشل في إتمام الحجز. الرجاء المحاولة مرة أخرى."
          : "Failed to complete booking. Please try again.",
        "danger"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced input handling with smart features
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }

      if (field === "departureGovernorate") {
        setFormData((prev) => ({ ...prev, departureCity: "" }));
        const customPlace = customPlaces.find(
          (place) => place.governorate === value
        );
        if (customPlace) {
          setFormData((prev) => ({ ...prev, departureCity: customPlace.city }));
        }
      }

      if (field === "destinationGovernorate") {
        setFormData((prev) => ({ ...prev, destinationCity: "" }));
        const customPlace = customPlaces.find(
          (place) => place.governorate === value
        );
        if (customPlace) {
          setFormData((prev) => ({
            ...prev,
            destinationCity: customPlace.city,
          }));
        }
      }
    },
    [errors, customPlaces]
  );

  // Download receipt function
  const downloadReceipt = () => {
    const vehicle = vehicles.find((v) => v.id === formData.carType);
    const vehiclePrice = getPriceForRoute(
      formData.departureGovernorate,
      formData.destinationGovernorate,
      formData.carType
    );

    const receiptData = `
${language === "ar" ? "إيصال حجز مصر للسياحة" : "EGYPT VISTA BOOKING RECEIPT"}
${language === "ar" ? "============================" : "============================"}
${language === "ar" ? "رقم الحجز:" : "Booking Reference:"} ${bookingReference}
${language === "ar" ? "التاريخ:" : "Date:"} ${new Date().toLocaleDateString()}

${language === "ar" ? "تفاصيل الرحلة:" : "TRIP DETAILS:"}
${language === "ar" ? "من:" : "From:"} ${formData.departureGovernorate} - ${formData.departureCity}
${language === "ar" ? "إلى:" : "To:"} ${formData.destinationGovernorate} - ${formData.destinationCity}
${language === "ar" ? "نوع المركبة:" : "Vehicle:"} ${vehicle?.name?.[language] || vehicle?.name?.en || vehicle?.name}
${language === "ar" ? "السعر:" : "Price:"} ${vehiclePrice} ${language === "ar" ? "دولار" : "USD"}

${language === "ar" ? "تفاصيل المسافر:" : "PASSENGER DETAILS:"}
${language === "ar" ? "الاسم:" : "Name:"} ${formData.fullName}
${language === "ar" ? "الهاتف:" : "Phone:"} ${formData.phoneNumber}
${language === "ar" ? "البريد الإلكتروني:" : "Email:"} ${formData.email}
${language === "ar" ? "الجنسية:" : "Nationality:"} ${formData.nationality || (language === "ar" ? "غير محدد" : "Not specified")}
${language === "ar" ? "عدد الركاب:" : "Passengers:"} ${formData.passengers}

${language === "ar" ? "تاريخ الرحلة:" : "Trip Date:"} ${formData.tripDate || (language === "ar" ? "سيتم تأكيده" : "To be confirmed")}
${language === "ar" ? "وقت الرحلة:" : "Trip Time:"} ${formData.tripTime || (language === "ar" ? "سيتم تأكيده" : "To be confirmed")}

${language === "ar" ? "شكرًا لاختياركم مصر للسياحة!" : "Thank you for choosing EGYPT VISTA!"}
    `;

    const blob = new Blob([receiptData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-${bookingReference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading screen
  if (isDataLoading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <h4 className="mt-3">{t.loading}</h4>
        </div>
      </div>
    );
  }

  // Error screen
  if (dataError) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <div className="text-center">
          <FaExclamationTriangle size={60} className="text-danger mb-3" />
          <h4 className="text-danger mb-3">{t.dataLoadError}</h4>
          <Button variant="primary" onClick={() => window.location.reload()}>
            {language === "ar" ? "إعادة تحميل" : "Reload Page"}
          </Button>
        </div>
      </div>
    );
  }

  // Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (
      connectionStatus === "disconnected" ||
      connectionStatus === "reconnecting"
    ) {
      return (
        <Alert
          variant="warning"
          className="position-fixed bottom-0 end-0 m-3"
          style={{ zIndex: 9999 }}
        >
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            <span>{t.connectionError}</span>
          </div>
        </Alert>
      );
    }
    return null;
  };

  return (
    <ErrorBoundary onReset={() => window.location.reload()}>
      <div className="min-vh-100" style={{ backgroundColor: "#F8FAFC" }}>
        {/* Navigation */}
        <Navbar expand="lg" className="shadow-sm bg-white">
          <Container>
            <Navbar.Brand
              href="#"
              className="fw-bold d-flex align-items-center"
              style={{ color: "#1E40AF", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <img
                src={company_logo} // Replace with your actual logo path
                alt="Company Logo"
                height="35"
                className="me-2"
                style={{
                  objectFit: "contain",
                  transition: "opacity 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              />
              {t.appName}
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link onClick={() => navigate("/")}>
                  <FaHome className="me-1" /> {t.home}
                </Nav.Link>
                <Nav.Link onClick={() => navigate("/travels")}>
                  <FaRoute className="me-1" />{" "}
                  {language === "ar" ? "رحلاتنا" : "Our Travels"}
                </Nav.Link>
                <Nav.Link onClick={() => setShowBookingModal(true)}>
                  <FaSearch className="me-1" /> {t.bookNow}
                </Nav.Link>
                <Nav.Link onClick={() => navigate("/airports")}>
                  <FaPlane className="me-1" />{" "}
                  {language === "ar" ? "المطارات" : "Airports"}
                </Nav.Link>
                <Nav.Link onClick={() => navigate("/about")}>
                  <FaInfoCircle className="me-1" /> {t.about}
                </Nav.Link>
              </Nav>
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-primary"
                  id="dropdown-language"
                >
                  <FaGlobe className="me-1" /> {t.languages[language]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setLanguage("en")}>
                    {t.languages.en}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setLanguage("ar")}>
                    {t.languages.ar}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Notifications */}
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            variant={notification.type}
            className="position-fixed top-0 end-0 m-3"
            style={{ zIndex: 9999, minWidth: "300px" }}
            onClose={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
            dismissible
          >
            {notification.message}
          </Alert>
        ))}

        <ConnectionStatusIndicator />

        {/* Hero Section */}
        <div
          className="py-5 text-white"
          style={{
            background:
              "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
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
                  onClick={() => setShowBookingModal(true)}
                >
                  {t.bookNowButton}
                </Button>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Main Content */}
        <Container className="py-5">
          {/* Enhanced Search with Custom Places */}
          <Row className="justify-content-center mb-5">
            <Col lg={10}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() =>
                          setShowAdvancedSearch(!showAdvancedSearch)
                        }
                      >
                        <FaFilter className="me-1" />
                        {language === "ar" ? "خيارات متقدمة" : "Advanced"}
                      </Button>
                      {/* <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => setShowAddPlaceModal(true)}
                      >
                        <FaMapMarkerAlt className="me-1" />
                        {language === "ar" ? "إضافة مكان" : "Add Place"}
                      </Button> */}
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={resetForm}
                      >
                        <FaTimes className="me-1" />
                        {language === "ar" ? "إعادة تعيين" : "Reset"}
                      </Button>
                    </div>
                  </div>

                  <Row className="g-3">
                    <Col md={5}>
                      <FloatingLabel label={t.from}>
                        <Form.Select
                          className="border-0 shadow-sm"
                          style={{ height: "58px" }}
                          value={formData.departureGovernorate}
                          onChange={(e) =>
                            handleInputChange(
                              "departureGovernorate",
                              e.target.value
                            )
                          }
                        >
                          <option value="">{t.from}</option>
                          <optgroup
                            label={
                              language === "ar"
                                ? "الأماكن الرسمية"
                                : "Official Places"
                            }
                          >
                            {getGovernorates()
                              .filter((gov) => gov.type === "official")
                              .map((gov) => (
                                <option key={gov.value} value={gov.value}>
                                  {gov.label} {gov.popularity > 70 && "🔥"}
                                </option>
                              ))}
                          </optgroup>
                          {customPlaces.length > 0 && (
                            <optgroup
                              label={
                                language === "ar"
                                  ? "الأماكن المخصصة"
                                  : "Custom Places"
                              }
                            >
                              {getGovernorates()
                                .filter((gov) => gov.type === "custom")
                                .map((gov) => (
                                  <option key={gov.value} value={gov.value}>
                                    {gov.label} ✨
                                  </option>
                                ))}
                            </optgroup>
                          )}
                        </Form.Select>
                      </FloatingLabel>
                    </Col>

                    <Col md={5}>
                      <FloatingLabel label={t.to}>
                        <Form.Select
                          className="border-0 shadow-sm"
                          style={{ height: "58px" }}
                          value={formData.destinationGovernorate}
                          onChange={(e) =>
                            handleInputChange(
                              "destinationGovernorate",
                              e.target.value
                            )
                          }
                        >
                          <option value="">{t.to}</option>
                          <optgroup
                            label={
                              language === "ar"
                                ? "الأماكن الرسمية"
                                : "Official Places"
                            }
                          >
                            {getGovernorates()
                              .filter((gov) => gov.type === "official")
                              .map((gov) => (
                                <option key={gov.value} value={gov.value}>
                                  {gov.label} {gov.popularity > 70 && "🔥"}
                                </option>
                              ))}
                          </optgroup>
                          {customPlaces.length > 0 && (
                            <optgroup
                              label={
                                language === "ar"
                                  ? "الأماكن المخصصة"
                                  : "Custom Places"
                              }
                            >
                              {getGovernorates()
                                .filter((gov) => gov.type === "custom")
                                .map((gov) => (
                                  <option key={gov.value} value={gov.value}>
                                    {gov.label} ✨
                                  </option>
                                ))}
                            </optgroup>
                          )}
                        </Form.Select>
                      </FloatingLabel>
                    </Col>

                    <Col md={2}>
                      <Button
                        variant="primary"
                        className="w-100 h-100"
                        onClick={() => setShowBookingModal(true)}
                      >
                        {t.searchButton}
                      </Button>
                    </Col>
                  </Row>

                  {/* Advanced Search Options */}
                  {showAdvancedSearch && (
                    <Row className="mt-4 g-3">
                      <Col md={3}>
                        <FloatingLabel
                          label={
                            language === "ar" ? "نوع المركبة" : "Vehicle Type"
                          }
                        >
                          <Form.Select
                            value={searchFilters.vehicleType}
                            onChange={(e) =>
                              setSearchFilters((prev) => ({
                                ...prev,
                                vehicleType: e.target.value,
                              }))
                            }
                            className="border-0 shadow-sm"
                          >
                            <option value="">
                              {language === "ar" ? "جميع الأنواع" : "All Types"}
                            </option>
                            <option value="sedan">
                              {language === "ar" ? "سيارة سيدان" : "Sedan"}
                            </option>
                            <option value="suv">
                              {language === "ar" ? "سيارة SUV" : "SUV"}
                            </option>
                            <option value="minibus">
                              {language === "ar" ? "ميني باص" : "Minibus"}
                            </option>
                            <option value="bus">
                              {language === "ar" ? "باص" : "Bus"}
                            </option>
                          </Form.Select>
                        </FloatingLabel>
                      </Col>

                      <Col md={3}>
                        <FloatingLabel
                          label={language === "ar" ? "الترتيب حسب" : "Sort By"}
                        >
                          <Form.Select
                            value={searchFilters.sortBy}
                            onChange={(e) =>
                              setSearchFilters((prev) => ({
                                ...prev,
                                sortBy: e.target.value,
                              }))
                            }
                            className="border-0 shadow-sm"
                          >
                            <option value="price">
                              {language === "ar" ? "السعر" : "Price"}
                            </option>
                            <option value="popularity">
                              {language === "ar" ? "الشعبية" : "Popularity"}
                            </option>
                            <option value="rating">
                              {language === "ar" ? "التقييم" : "Rating"}
                            </option>
                          </Form.Select>
                        </FloatingLabel>
                      </Col>

                      <Col md={3}>
                        <FloatingLabel
                          label={
                            language === "ar"
                              ? "الحد الأقصى للركاب"
                              : "Max Passengers"
                          }
                        >
                          <Form.Control
                            type="number"
                            min="1"
                            max="15"
                            value={searchFilters.maxPassengers}
                            onChange={(e) =>
                              setSearchFilters((prev) => ({
                                ...prev,
                                maxPassengers: parseInt(e.target.value),
                              }))
                            }
                            className="border-0 shadow-sm"
                          />
                        </FloatingLabel>
                      </Col>

                      <Col md={3}>
                        <Button
                          variant="outline-secondary"
                          className="w-100 h-100"
                          onClick={() =>
                            setSearchFilters({
                              priceRange: [0, 10000],
                              vehicleType: "",
                              maxPassengers: 15,
                              sortBy: "price",
                            })
                          }
                        >
                          <FaTimes className="me-1" />
                          {language === "ar" ? "إعادة تعيين" : "Reset"}
                        </Button>
                      </Col>
                    </Row>
                  )}

                  {/* Custom Places Display */}
                  {customPlaces.length > 0 && (
                    <Alert variant="info" className="mt-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>
                            {language === "ar"
                              ? "الأماكن المخصصة:"
                              : "Custom Places:"}
                          </strong>
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {customPlaces.map((place) => (
                              <Badge
                                key={place.id}
                                bg="light"
                                text="dark"
                                className="d-flex align-items-center gap-1"
                              >
                                {place.governorate} - {place.city}
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 text-danger"
                                  onClick={() => removeCustomPlace(place.id)}
                                >
                                  <FaTimes size={12} />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Smart Vehicle Types with Filtering */}
          <Row className="mb-5">
            <Col xs={12}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">{t.vehicleTypes}</h2>
                <div className="d-flex gap-2">
                  <Badge bg="info" className="d-flex align-items-center">
                    <FaFilter className="me-1" />
                    {filteredVehicles.length}{" "}
                    {language === "ar" ? "مركبة" : "vehicles"}
                  </Badge>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  >
                    <FaSort className="me-1" />
                    {language === "ar" ? "ترتيب" : "Sort"}
                  </Button>
                </div>
              </div>
            </Col>

            {filteredVehicles.length === 0 ? (
              <Col xs={12}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="text-center p-5">
                    <FaSearch size={50} className="text-muted mb-3" />
                    <h5 className="text-muted">
                      {language === "ar"
                        ? "لا توجد مركبات تطابق معايير البحث"
                        : "No vehicles match your search criteria"}
                    </h5>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        setSearchFilters({
                          priceRange: [0, 10000],
                          vehicleType: "",
                          maxPassengers: 15,
                          sortBy: "price",
                        })
                      }
                    >
                      {language === "ar"
                        ? "إعادة تعيين الفلاتر"
                        : "Reset Filters"}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ) : (
              filteredVehicles.map((vehicle) => {
                const isPopular = vehicle.popularity > 70;
                const isTopRated = vehicle.rating > 4.5;
                const IconComponent = iconMap[vehicle.icon] || FaCar;

                // Get price for this vehicle type on the selected route
                const routePrice = getPriceForRoute(
                  formData.departureGovernorate,
                  formData.destinationGovernorate,
                  vehicle.id
                );

                return (
                  <Col md={4} key={vehicle.id} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm position-relative">
                      {isPopular && (
                        <div
                          className="position-absolute top-0 start-0 m-2"
                          style={{ zIndex: 10 }}
                        >
                          <Badge bg="danger">
                            <FaStar className="me-1" />
                            {language === "ar" ? "شائع" : "Popular"}
                          </Badge>
                        </div>
                      )}
                      {isTopRated && (
                        <div
                          className="position-absolute top-0 end-0 m-2"
                          style={{ zIndex: 10 }}
                        >
                          <Badge bg="warning" text="dark">
                            ⭐ {vehicle.rating}
                          </Badge>
                        </div>
                      )}
                      <Card.Body className="text-center p-4">
                        <div className="mb-3 mx-auto">
                          <img
                            src={getVehicleImage(vehicle)}
                            alt={
                              vehicle.name?.[language] ||
                              vehicle.name?.en ||
                              "Vehicle"
                            }
                            className="img-fluid rounded"
                            style={{
                              width: "120px",
                              height: "80px",
                              objectFit: "cover",
                              border: `2px solid ${vehicle.color || "#007bff"}20`,
                            }}
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/120x80/${vehicle.color?.replace("#", "") || "007bff"}/ffffff?text=${encodeURIComponent(vehicle.name?.[language] || vehicle.name?.en || "Vehicle")}`;
                            }}
                          />
                        </div>
                        <h4 className="fw-bold mb-3">
                          {vehicle.name?.[language] ||
                            vehicle.name?.en ||
                            "Vehicle"}
                        </h4>
                        <div className="d-flex justify-content-center gap-2 mb-3">
                          <Badge bg="light" text="dark" className="px-3 py-2">
                            {vehicle.capacity}{" "}
                            {language === "ar" ? "راكب" : "passengers"}
                          </Badge>
                          <Badge bg="info" className="px-3 py-2">
                            {vehicle.popularity}%{" "}
                            {language === "ar" ? "شعبية" : "popular"}
                          </Badge>
                        </div>
                        <p className="text-muted mb-4">
                          {vehicle.description?.[language] ||
                            vehicle.description?.en ||
                            ""}
                        </p>
                        <div className="d-flex flex-wrap justify-content-center gap-1 mb-3">
                          {(
                            vehicle.features?.[language] ||
                            vehicle.features?.en ||
                            []
                          ).map((feature, index) => (
                            <Badge key={index} bg="secondary" className="small">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        {routePrice ? (
                          <div className="mb-2">
                            <span className="h5 text-primary fw-bold">
                              {routePrice} {language === "ar" ? "دولار" : "USD"}
                            </span>
                            <small className="text-muted d-block">
                              {language === "ar" ? "سعر الرحلة" : "Trip price"}
                            </small>
                          </div>
                        ) : (
                          <div className="mb-2">
                            <small className="text-danger">
                              {language === "ar"
                                ? "الرحلة غير متوفرة حالياً"
                                : "Sorry there is no travel yet... choose to see one"}
                            </small>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })
            )}
          </Row>
            <Card className="rounded-2xl shadow-xl p-6 flex justify-center bg-white">
              <motion.img
                src={company_logo}
                alt="Company Logo"
                className="h-32 w-auto"
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.1, rotate: 2 }}
              />
            </Card>
            <br /><br />
          {/* Why Choose Us */}
          <Row className="mb-5">
            <Col xs={12}>
              <h2 className="text-center mb-5">
                <FaCheck className="me-3 text-success" /> {t.whyChooseUs}
              </h2>
            </Col>


            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <div
                      className="mx-auto d-flex align-items-center justify-content-center"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "#3B82F620",
                      }}
                    >
                      <FaCheck size={24} style={{ color: "#3B82F6" }} />
                    </div>
                  </div>
                  <h5 className="fw-bold mb-3">
                    {language === "ar"
                      ? "سائقون محترفون"
                      : "Professional Drivers"}
                  </h5>
                  <p className="text-muted">
                    {language === "ar"
                      ? "سائقون مدربون وذوو خبرة يعرفون جميع الطرق جيدًا"
                      : "Trained and experienced drivers who know all routes well"}
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
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "#10B98120",
                      }}
                    >
                      <FaCheck size={24} style={{ color: "#10B981" }} />
                    </div>
                  </div>
                  <h5 className="fw-bold mb-3">
                    {language === "ar" ? "مركبات حديثة" : "Modern Vehicles"}
                  </h5>
                  <p className="text-muted">
                    {language === "ar"
                      ? "أسطولنا من المركبات حديث ومجهز بأحدث وسائل الراحة"
                      : "Our fleet of vehicles is modern and equipped with the latest amenities"}
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
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "#F59E0B20",
                      }}
                    >
                      <FaCheck size={24} style={{ color: "#F59E0B" }} />
                    </div>
                  </div>
                  <h5 className="fw-bold mb-3">
                    {language === "ar" ? "أسعار تنافسية" : "Competitive Prices"}
                  </h5>
                  <p className="text-muted">
                    {language === "ar"
                      ? "نقدم أسعارًا تنافسية مع ضمان جودة الخدمة"
                      : "We offer competitive prices while ensuring service quality"}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Enhanced Testimonials */}
          {testimonials.length > 0 && (
            <Row className="mb-5">
              <Col xs={12}>
                <h2 className="text-center mb-5">
                  <FaUsers className="me-3 text-primary" /> {t.testimonials}
                </h2>
              </Col>

              {testimonials.map((testimonial) => (
                <Col md={4} key={testimonial.id} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="me-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor: "#3B82F620",
                            }}
                          >
                            <FaUser size={20} style={{ color: "#3B82F6" }} />
                          </div>

                          <div>
                            <h6 className="mb-0 fw-bold">
                              {testimonial.name?.[language] ||
                                testimonial.name?.en ||
                                testimonial.name}
                            </h6>
                            <small className="text-muted">
                              {testimonial.verified && (
                                <span className="text-success me-1">
                                  ✓ {language === "ar" ? "مؤكد" : "Verified"}
                                </span>
                              )}
                              {testimonial.helpful}{" "}
                              {language === "ar"
                                ? "شخص وجد هذا مفيداً"
                                : "people found this helpful"}
                            </small>
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="mb-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                style={{
                                  color:
                                    i < (testimonial.rating || 5)
                                      ? "#F59E0B"
                                      : "#E5E7EB",
                                  fontSize: "1rem",
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <small className="text-muted">
                            {testimonial.rating || 5}/5
                          </small>
                        </div>
                      </div>

                      <p className="mb-0 fst-italic">
                        "
                        {testimonial.comment?.[language] ||
                          testimonial.comment?.en ||
                          testimonial.comment}
                        "
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
              {language === "ar" ? "نموذج الحجز" : "Booking Form"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              {/* Departure Location Section */}
              <div className="mb-4">
                <h5 className="mb-3 d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  {language === "ar" ? "مكان المغادرة" : "Departure Location"}
                </h5>

                <Row className="g-3">
                  <Col md={6}>
                    <FloatingLabel
                      label={language === "ar" ? "المحافظة *" : "Governorate *"}
                    >
                      <Form.Select
                        value={formData.departureGovernorate}
                        onChange={(e) =>
                          handleInputChange(
                            "departureGovernorate",
                            e.target.value
                          )
                        }
                        isInvalid={!!errors.departureGovernorate}
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                      >
                        <option value="">
                          {language === "ar"
                            ? "اختر المحافظة"
                            : "Select Governorate"}
                        </option>
                        {getGovernorates().map((gov) => (
                          <option
                            key={`dep-gov-${gov.value}`}
                            value={gov.value}
                          >
                            {gov.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.departureGovernorate}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>

                  <Col md={6}>
                    <FloatingLabel
                      label={language === "ar" ? "المدينة *" : "City *"}
                    >
                      <Form.Select
                        value={formData.departureCity}
                        onChange={(e) =>
                          handleInputChange("departureCity", e.target.value)
                        }
                        isInvalid={!!errors.departureCity}
                        disabled={
                          !formData.departureGovernorate ||
                          customPlaces.find(
                            (place) =>
                              place.governorate ===
                              formData.departureGovernorate
                          )
                        }
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                      >
                        <option value="">
                          {language === "ar" ? "اختر المدينة" : "Select City"}
                        </option>
                        {formData.departureGovernorate &&
                          getCitiesForGovernorate(
                            formData.departureGovernorate
                          ).map((city) => (
                            <option
                              key={`dep-city-${city.value}`}
                              value={city.value}
                            >
                              {city.label}
                            </option>
                          ))}
                      </Form.Select>
                      {customPlaces.find(
                        (place) =>
                          place.governorate === formData.departureGovernorate
                      ) && (
                        <small className="text-info">
                          {language === "ar"
                            ? "تم تحديد المدينة تلقائياً للمكان المخصص"
                            : "City auto-selected for custom place"}
                        </small>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {errors.departureCity}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                </Row>
              </div>

              {/* Destination Section */}
              <div className="mb-4">
                <h5 className="mb-3 d-flex align-items-center">
                  <FaMapMarkerAlt
                    className="me-2"
                    style={{ color: "#EF4444" }}
                  />
                  {language === "ar" ? "الوجهة" : "Destination"}
                </h5>

                <Row className="g-3">
                  <Col md={6}>
                    <FloatingLabel
                      label={language === "ar" ? "المحافظة *" : "Governorate *"}
                    >
                      <Form.Select
                        value={formData.destinationGovernorate}
                        onChange={(e) =>
                          handleInputChange(
                            "destinationGovernorate",
                            e.target.value
                          )
                        }
                        isInvalid={!!errors.destinationGovernorate}
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                      >
                        <option value="">
                          {language === "ar"
                            ? "اختر المحافظة"
                            : "Select Governorate"}
                        </option>
                        {getGovernorates().map((gov) => (
                          <option
                            key={`dest-gov-${gov.value}`}
                            value={gov.value}
                          >
                            {gov.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.destinationGovernorate}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>

                  <Col md={6}>
                    <FloatingLabel
                      label={language === "ar" ? "المدينة *" : "City *"}
                    >
                      <Form.Select
                        value={formData.destinationCity}
                        onChange={(e) =>
                          handleInputChange("destinationCity", e.target.value)
                        }
                        isInvalid={!!errors.destinationCity}
                        disabled={
                          !formData.destinationGovernorate ||
                          customPlaces.find(
                            (place) =>
                              place.governorate ===
                              formData.destinationGovernorate
                          )
                        }
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                      >
                        <option value="">
                          {language === "ar" ? "اختر المدينة" : "Select City"}
                        </option>
                        {formData.destinationGovernorate &&
                          getCitiesForGovernorate(
                            formData.destinationGovernorate
                          ).map((city) => (
                            <option
                              key={`dest-city-${city.value}`}
                              value={city.value}
                            >
                              {city.label}
                            </option>
                          ))}
                      </Form.Select>
                      {customPlaces.find(
                        (place) =>
                          place.governorate === formData.destinationGovernorate
                      ) && (
                        <small className="text-info">
                          {language === "ar"
                            ? "تم تحديد المدينة تلقائياً للمكان المخصص"
                            : "City auto-selected for custom place"}
                        </small>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {errors.destinationCity}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                </Row>
              </div>

              {/* Route Availability Check */}
              {formData.departureGovernorate &&
                formData.destinationGovernorate && (
                  <div className="mb-3">
                    {travelPrices.some(
                      (price) =>
                        (price.departureGovernorate ===
                          formData.departureGovernorate &&
                          price.destinationGovernorate ===
                            formData.destinationGovernorate) ||
                        (price.departureGovernorate ===
                          formData.destinationGovernorate &&
                          price.destinationGovernorate ===
                            formData.departureGovernorate)
                    ) ? (
                      <Alert
                        variant="success"
                        className="d-flex align-items-center"
                      >
                        <FaCheck className="me-2" />
                        {language === "ar"
                          ? "هذه الرحلة متاحة لل booking"
                          : "This travel is available for booking"}
                      </Alert>
                    ) : (
                      <Alert
                        variant="danger"
                        className="d-flex align-items-center"
                      >
                        <FaTimes className="me-2" />
                        {language === "ar"
                          ? "لا توجد رحلة متاحة بين هذه المحافظات حالياً"
                          : "No available travel between these governorates currently"}
                      </Alert>
                    )}
                  </div>
                )}

              {/* Vehicle Type Selection */}
              <div className="mb-4">
                <h5 className="mb-3 d-flex align-items-center">
                  <FaCar className="me-2" />
                  {language === "ar"
                    ? "اختر نوع المركبة *"
                    : "Choose Your Vehicle *"}
                </h5>

                {errors.carType && (
                  <Alert variant="danger" className="mb-3">
                    {errors.carType}
                  </Alert>
                )}

                <Row className="g-3">
                  {vehicles.map((vehicle) => {
                    const IconComponent = iconMap[vehicle.icon] || FaCar;
                    const isSelected = formData.carType === vehicle.id;
                    const routePrice = getPriceForRoute(
                      formData.departureGovernorate,
                      formData.destinationGovernorate,
                      vehicle.id
                    );
                    const routeExists = travelPrices.some(
                      (price) =>
                        (price.departureGovernorate ===
                          formData.departureGovernorate &&
                          price.destinationGovernorate ===
                            formData.destinationGovernorate) ||
                        (price.departureGovernorate ===
                          formData.destinationGovernorate &&
                          price.destinationGovernorate ===
                            formData.departureGovernorate)
                    );

                    return (
                      <Col md={4} key={vehicle.id}>
                        <Card
                          className={`h-100 transition-all ${
                            isSelected
                              ? "border-primary shadow-lg"
                              : "border-light"
                          } ${!routeExists ? "opacity-50" : ""}`}
                          style={{
                            cursor: routeExists ? "pointer" : "not-allowed",
                            transform: isSelected ? "translateY(-5px)" : "none",
                            transition: "all 0.3s ease",
                            borderWidth: isSelected ? "3px" : "1px",
                          }}
                          onClick={() => {
                            if (routeExists) {
                              handleInputChange("carType", vehicle.id);
                            }
                          }}
                        >
                          <Card.Body className="text-center p-3">
                            <div
                              className="mb-2 mx-auto d-flex align-items-center justify-content-center"
                              style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                backgroundColor: `${vehicle.color}20`,
                              }}
                            >
                              <IconComponent
                                size={24}
                                style={{ color: vehicle.color }}
                              />
                            </div>

                            <h6 className="fw-bold mb-2">
                              {vehicle.name?.[language] ||
                                vehicle.name?.en ||
                                vehicle.name}
                            </h6>

                            <Badge
                              bg="light"
                              text="dark"
                              className="mb-2 px-2 py-1 small"
                            >
                              {vehicle.capacity}{" "}
                              {language === "ar" ? "راكب" : "passengers"}
                            </Badge>

                            {routeExists ? (
                              routePrice ? (
                                <div className="mb-2">
                                  <small className="text-primary fw-bold">
                                    {routePrice}{" "}
                                    {language === "ar" ? "دولار" : "USD"}
                                  </small>
                                </div>
                              ) : (
                                <div className="mb-2">
                                  <small className="text-muted">
                                    {language === "ar"
                                      ? "السعر غير متوفر"
                                      : "Price not available"}
                                  </small>
                                </div>
                              )
                            ) : (
                              <div className="mb-2">
                                <small className="text-danger">
                                  {language === "ar"
                                    ? "غير متاح لهذه الرحلة"
                                    : "Not available for this route"}
                                </small>
                              </div>
                            )}

                            {isSelected && (
                              <div className="mt-2">
                                <FaCheck className="text-primary" size={16} />
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>

              {/* Passenger Information */}
              <div className="mb-4">
                <h5 className="mb-3 d-flex align-items-center">
                  <FaUser className="me-2" />
                  {language === "ar"
                    ? "معلومات المسافر"
                    : "Passenger Information"}
                </h5>

                <Row className="g-3">
                  <Col md={6}>
                    <FloatingLabel
                      label={
                        language === "ar" ? "الاسم الكامل *" : "Full Name *"
                      }
                    >
                      <Form.Control
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        isInvalid={!!errors.fullName}
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                        placeholder={
                          language === "ar" ? "الاسم الكامل" : "Full Name"
                        }
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
                        onChange={(phone) =>
                          handleInputChange("phoneNumber", phone)
                        }
                        className={`border-0 shadow-sm ${errors.phoneNumber ? "is-invalid" : ""}`}
                        inputStyle={{
                          width: "100%",
                          height: "58px",
                          border: "none",
                          paddingLeft: "60px",
                        }}
                      />
                      <label>
                        {language === "ar" ? "رقم الهاتف *" : "Phone Number *"}
                      </label>
                      {errors.phoneNumber && (
                        <div className="invalid-feedback d-block">
                          {errors.phoneNumber}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col md={6}>
                    <FloatingLabel
                      label={
                        language === "ar" ? "البريد الإلكتروني *" : "Email *"
                      }
                    >
                      <Form.Control
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        isInvalid={!!errors.email}
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                        placeholder={
                          language === "ar" ? "البريد الإلكتروني" : "Email"
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>

                  <Col md={6}>
                    <FloatingLabel
                      label={language === "ar" ? "الجنسية" : "Nationality"}
                    >
                      <Form.Select
                        value={formData.nationality}
                        onChange={(e) =>
                          handleInputChange("nationality", e.target.value)
                        }
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                      >
                        <option value="">
                          {language === "ar"
                            ? "اختر الجنسية"
                            : "Select Nationality"}
                        </option>
                        <option value={language === "ar" ? "مصري" : "Egyptian"}>
                          {language === "ar" ? "مصري" : "Egyptian"}
                        </option>
                        <option value={language === "ar" ? "سعودي" : "Saudi"}>
                          {language === "ar" ? "سعودي" : "Saudi"}
                        </option>
                        <option
                          value={language === "ar" ? "إماراتي" : "Emirati"}
                        >
                          {language === "ar" ? "إماراتي" : "Emirati"}
                        </option>
                        <option
                          value={language === "ar" ? "أمريكي" : "American"}
                        >
                          {language === "ar" ? "أمريكي" : "American"}
                        </option>
                        <option
                          value={language === "ar" ? "أوروبي" : "European"}
                        >
                          {language === "ar" ? "أوروبي" : "European"}
                        </option>
                        <option value={language === "ar" ? "آسيوي" : "Asian"}>
                          {language === "ar" ? "آسيوي" : "Asian"}
                        </option>
                        <option value={language === "ar" ? "آخر" : "Other"}>
                          {language === "ar" ? "آخر" : "Other"}
                        </option>
                      </Form.Select>
                    </FloatingLabel>
                  </Col>

                  <Col md={4}>
                    <FloatingLabel
                      label={language === "ar" ? "عدد الركاب" : "Passengers"}
                    >
                      <Form.Control
                        type="number"
                        min="1"
                        max="15"
                        value={formData.passengers}
                        onChange={(e) =>
                          handleInputChange(
                            "passengers",
                            parseInt(e.target.value) || 1
                          )
                        }
                        isInvalid={!!errors.passengers}
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                      />
                      {formData.carType &&
                        formData.passengers &&
                        (() => {
                          const selectedVehicle = vehicles.find(
                            (v) => v.id === formData.carType
                          );

                          if (
                            selectedVehicle &&
                            formData.passengers > selectedVehicle.capacity
                          ) {
                            return (
                              <Form.Control.Feedback type="invalid">
                                {language === "ar"
                                  ? `عدد الركاب (${formData.passengers}) أكبر من سعة المركبة (${selectedVehicle.capacity})`
                                  : `Number of passengers (${formData.passengers}) exceeds vehicle capacity (${selectedVehicle.capacity})`}
                              </Form.Control.Feedback>
                            );
                          }
                          return null;
                        })()}
                    </FloatingLabel>

                    {formData.carType &&
                      (() => {
                        const selectedVehicle = vehicles.find(
                          (v) => v.id === formData.carType
                        );
                        if (selectedVehicle) {
                          return (
                            <small className="text-muted">
                              {language === "ar"
                                ? `سعة المركبة: ${selectedVehicle.capacity} راكب`
                                : `Vehicle capacity: ${selectedVehicle.capacity} passengers`}
                            </small>
                          );
                        }
                        return null;
                      })()}
                  </Col>

                  <Col md={4}>
                    <FloatingLabel
                      label={language === "ar" ? "تاريخ الرحلة" : "Trip Date"}
                    >
                      <Form.Control
                        type="date"
                        value={formData.tripDate}
                        onChange={(e) =>
                          handleInputChange("tripDate", e.target.value)
                        }
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </FloatingLabel>
                  </Col>

                  <Col md={4}>
                    <FloatingLabel
                      label={language === "ar" ? "وقت الرحلة" : "Trip Time"}
                    >
                      <Form.Control
                        type="time"
                        value={formData.tripTime}
                        onChange={(e) =>
                          handleInputChange("tripTime", e.target.value)
                        }
                        className="border-0 shadow-sm"
                        style={{ height: "58px" }}
                      />
                    </FloatingLabel>
                  </Col>
                </Row>
              </div>

              {/* Submit Button */}
              <div className="text-center mt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    isSubmitting ||
                    !travelPrices.some(
                      (price) =>
                        (price.departureGovernorate ===
                          formData.departureGovernorate &&
                          price.destinationGovernorate ===
                            formData.destinationGovernorate) ||
                        (price.departureGovernorate ===
                          formData.destinationGovernorate &&
                          price.destinationGovernorate ===
                            formData.departureGovernorate)
                    )
                  }
                  className="px-5 py-3 fw-bold"
                  style={{
                    background: travelPrices.some(
                      (price) =>
                        (price.departureGovernorate ===
                          formData.departureGovernorate &&
                          price.destinationGovernorate ===
                            formData.destinationGovernorate) ||
                        (price.departureGovernorate ===
                          formData.destinationGovernorate &&
                          price.destinationGovernorate ===
                            formData.departureGovernorate)
                    )
                      ? "linear-gradient(135deg, #1E40AF, #3B82F6)"
                      : "#cccccc",
                    border: "none",
                    borderRadius: "50px",
                    minWidth: "200px",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      {language === "ar" ? "جاري المعالجة..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <FaCheck className="me-2" />
                      {language === "ar" ? "تأكيد الحجز" : "Confirm Booking"}
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Enhanced Booking Confirmation Modal */}
        <Modal
          show={showConfirmation}
          onHide={() => setShowConfirmation(false)}
          size="lg"
          centered
          backdrop="static"
        >
          <Modal.Header className="border-0 text-center">
            <Modal.Title
              className="w-100 text-center"
              style={{ color: "#10B981" }}
            >
              <FaCheck className="me-3" size={40} />
              {language === "ar" ? "تم تأكيد الحجز!" : "Booking Confirmed!"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4">
            <div className="text-center mb-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "#10B98120",
                }}
              >
                <FaCheck size={50} style={{ color: "#10B981" }} />
              </div>
              <h4 className="mb-3">
                {language === "ar"
                  ? "تم تأكيد حجزك بنجاح!"
                  : "Your booking has been confirmed!"}
              </h4>
              <Alert variant="success" className="d-inline-block px-4 py-2">
                <strong>
                  {language === "ar" ? "رقم الحجز:" : "Booking Reference:"}{" "}
                  {bookingReference}
                </strong>
              </Alert>
            </div>

            {/* Travel Details Section */}
            <Card className="border-0 shadow-sm mb-3">
              <Card.Header
                style={{ backgroundColor: "#1E40AF", color: "white" }}
              >
                <h5 className="mb-0 d-flex align-items-center">
                  <FaRoute className="me-2" />
                  {language === "ar" ? "تفاصيل الرحلة" : "Travel Details"}
                </h5>
              </Card.Header>

              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#3B82F620",
                        }}
                      >
                        <FaMapMarkerAlt
                          size={20}
                          style={{ color: "#3B82F6" }}
                        />
                      </div>
                      <div>
                        <small className="text-muted d-block">
                          {language === "ar" ? "مكان المغادرة" : "Departure"}
                        </small>
                        <strong>
                          {formData.departureGovernorate} -{" "}
                          {formData.departureCity}
                        </strong>
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#EF444420",
                        }}
                      >
                        <FaMapMarkerAlt
                          size={20}
                          style={{ color: "#EF4444" }}
                        />
                      </div>
                      <div>
                        <small className="text-muted d-block">
                          {language === "ar" ? "مكان الوصول" : "Destination"}
                        </small>
                        <strong>
                          {formData.destinationGovernorate} -{" "}
                          {formData.destinationCity}
                        </strong>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Vehicle and Trip Details */}
                <Row className="g-3 mt-3">
                  <Col md={4}>
                    <div className="text-center p-3 border rounded">
                      <div className="mb-2">
                        {(() => {
                          const vehicle = vehicles.find(
                            (v) => v.id === formData.carType
                          );
                          const IconComponent = iconMap[vehicle?.icon] || FaCar;
                          return (
                            <IconComponent
                              size={30}
                              style={{ color: vehicle?.color || "#3B82F6" }}
                            />
                          );
                        })()}
                      </div>
                      <h6 className="mb-1">
                        {(() => {
                          const vehicle = vehicles.find(
                            (v) => v.id === formData.carType
                          );
                          return (
                            vehicle?.name?.[language] ||
                            vehicle?.name?.en ||
                            vehicle?.name ||
                            ""
                          );
                        })()}
                      </h6>
                      <small className="text-muted">
                        {formData.passengers}{" "}
                        {language === "ar" ? "راكب" : "passengers"}
                      </small>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className="text-center p-3 border rounded">
                      <div className="mb-2">
                        <FaCalendarAlt size={30} style={{ color: "#10B981" }} />
                      </div>
                      <h6 className="mb-1">
                        {language === "ar" ? "تاريخ الرحلة" : "Trip Date"}
                      </h6>
                      <small className="text-muted">
                        {formData.tripDate
                          ? new Date(formData.tripDate).toLocaleDateString()
                          : language === "ar"
                            ? "سيتم تأكيده"
                            : "To be confirmed"}
                      </small>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className="text-center p-3 border rounded">
                      <div className="mb-2">
                        <FaClock size={30} style={{ color: "#F59E0B" }} />
                      </div>
                      <h6 className="mb-1">
                        {language === "ar" ? "وقت الرحلة" : "Trip Time"}
                      </h6>
                      <small className="text-muted">
                        {formData.tripTime ||
                          (language === "ar"
                            ? "سيتم تأكيده"
                            : "To be confirmed")}
                      </small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Passenger Information */}
            <Card className="border-0 shadow-sm mb-3">
              <Card.Header style={{ backgroundColor: "#F8FAFC" }}>
                <h5 className="mb-0 d-flex align-items-center">
                  <FaUser className="me-2" />
                  {language === "ar"
                    ? "معلومات المسافر"
                    : "Passenger Information"}
                </h5>
              </Card.Header>

              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        {language === "ar" ? "الاسم:" : "Name:"}
                      </span>
                      <strong>{formData.fullName}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        {language === "ar" ? "الهاتف:" : "Phone:"}
                      </span>
                      <strong>{formData.phoneNumber}</strong>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        {language === "ar" ? "البريد الإلكتروني:" : "Email:"}
                      </span>
                      <strong>{formData.email}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        {language === "ar" ? "الجنسية:" : "Nationality:"}
                      </span>
                      <strong>
                        {formData.nationality ||
                          (language === "ar" ? "غير محدد" : "Not specified")}
                      </strong>
                    </div>
                  </Col>
                </Row>

                {/* Price Information */}
                <div className="mt-3 pt-3 border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">
                      {language === "ar" ? "السعر:" : "Price:"}
                    </span>
                    <strong className="h5 text-primary">
                      {getPriceForRoute(
                        formData.departureGovernorate,
                        formData.destinationGovernorate,
                        formData.carType
                      ) || "N/A"}{" "}
                      {language === "ar" ? "دولار" : "USD"}
                    </strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Important Information */}
            <Alert variant="info" className="mt-3">
              <div className="d-flex align-items-start">
                <FaIdCard className="me-2 mt-1" />
                <div>
                  <strong>
                    {language === "ar"
                      ? "معلومات مهمة:"
                      : "Important Information:"}
                  </strong>
                  <ul className="mb-0 mt-2">
                    <li>
                      {language === "ar"
                        ? "الرجاء حفظ رقم الحجز الخاص بك للرجوع إليه لاحقاً"
                        : "Please save your booking reference number for future reference"}
                    </li>
                    <li>
                      {language === "ar"
                        ? "سوف تتلقى رسالة تأكيد بالبريد الإلكتروني خلال 24 ساعة"
                        : "You will receive a confirmation email within 24 hours"}
                    </li>
                    <li>
                      {language === "ar"
                        ? "يمكنك التواصل معنا على الرقم 0123456789 لأي استفسارات"
                        : "You can contact us at 0123456789 for any inquiries"}
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
              {language === "ar" ? "تحميل الإيصال" : "Download Receipt"}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => window.print()}
              className="d-flex align-items-center"
            >
              <FaPrint className="me-2" />
              {language === "ar" ? "طباعة الإيصال" : "Print Receipt"}
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowConfirmation(false)}
              style={{
                background: "linear-gradient(135deg, #1E40AF, #3B82F6)",
                border: "none",
              }}
            >
              {language === "ar" ? "إغلاق" : "Close"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default EgyptTravelHome;
