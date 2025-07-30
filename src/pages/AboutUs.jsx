import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Navbar,
  Dropdown,
  Nav,
  Button,
  Badge,
  ProgressBar,
  Alert,
  Modal,
  Form,
  FloatingLabel,
  Spinner
} from 'react-bootstrap';
import {
  FaGlobe,
  FaBus,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaHome,
  FaSearch,
  FaInfoCircle,
  FaPlane,
  FaStar,
  FaUsers,
  FaAward,
  FaShieldAlt,
  FaRoute,
  FaCar,
  FaTruck,
  FaCheck,
  FaHeart,
  FaDownload,
  FaPrint,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaEye,
  FaEyeSlash,
  FaCalculator,
  FaCalendarAlt,
  FaMap,
  FaCompass,
  FaLightbulb,
  FaRocket,
  FaHandshake,
  FaMedal,
  FaTrophy,
  FaCertificate,
  FaGraduationCap,
  FaBriefcase,
  FaUserTie,
  FaUserGraduate,
  FaUserCog,
  FaUserShield,
  FaUserCheck,
  FaUserClock,
  FaUserFriends,
  FaUserPlus,
  FaUserEdit,
  FaUserSecret,
  FaUserNinja,
  FaUserAstronaut
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import IMG from "../assets/suv.png"
import IMG2 from "../assets/suv.png"

const AboutUs = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('ar');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    service: ''
  });
  
  // Color scheme matching your app
  const colors = {
    primary: '#1E40AF',
    secondary: '#10B981',
    accent: '#F59E0B',
    light: '#F3F4F6',
    dark: '#1F2937',
    background: '#F8FAFC'
  };

  // Translations
  const translations = {
    ar: {
      title: "وصلني",
      subtitle: "تعرف على شركتنا وخدماتنا",
      aboutTitle: "شركة وصلني للنقل السياحي",
      aboutText: "نحن شركة متخصصة في مجال النقل السياحي في مصر، نقدم خدمات نقل متميزة بين المطارات والمدن السياحية الرئيسية. لدينا أسطول حديث من السيارات والسائقين المحترفين.",
      servicesTitle: "خدماتنا",
      services: [
        "نقل من المطارات إلى الفنادق",
        "جولات سياحية يومية",
        "حجوزات سيارات مع سائق",
        "خدمات النقل للمجموعات"
      ],
      contactTitle: "اتصل بنا",
      address: "الغردقة، مصر",
      phone: "+201551927216",
      email: "mohamedhafiza1234@gmail.com",
      hours: "24/7",
      teamTitle: "فريقنا",
      languages: {
        ar: "العربية",
        en: "الإنجليزية",
        cn: "الصينية"
      }
    },
    en: {
      title: "Wasalny",
      subtitle: "Learn about our company and services",
      aboutTitle: "Wasalny Tourism Transport Company",
      aboutText: "We are a specialized tourist transportation company in Egypt, providing premium transfer services between airports and major tourist cities. We have a modern fleet of vehicles and professional drivers.",
      servicesTitle: "Our Services",
      services: [
        "Airport to hotel transfers",
        "Daily tour services",
        "Chauffeur-driven car rentals",
        "Group transportation services"
      ],
      contactTitle: "Contact Us",
      address: "Hurghada, Egypt",
      phone: "+201551927216",
      email: "mohamedhafiza1234@gmail.com",
      hours: "24/7",
      teamTitle: "Our Team",
      languages: {
        ar: "Arabic",
        en: "English",
        cn: "Chinese"
      }
    },
    cn: {
      title: "Wasalny",
      subtitle: "了解我们的公司和服务",
      aboutTitle: "Wasalny旅游运输公司",
      aboutText: "我们是埃及专业的旅游交通公司，提供机场与主要旅游城市之间的优质接送服务。我们拥有现代化的车队和专业司机。",
      servicesTitle: "我们的服务",
      services: [
        "机场到酒店接送",
        "每日旅游服务",
        "司机驾驶汽车租赁",
        "团体交通服务"
      ],
      contactTitle: "联系我们",
      address: "埃及赫尔格达",
      phone: "+201551927216",
      email: "mohamedhafiza1234@gmail.com",
      hours: "24/7",
      teamTitle: "我们的团队",
      languages: {
        ar: "阿拉伯语",
        en: "英语",
        cn: "中文"
      }
    }
  };
  const t = translations[lang] || translations['ar'];

  // Enhanced team members data
  const teamMembers = [
    {
      name: lang === 'ar' ? "فاطنه حوسني" : lang === 'cn' ? "胡斯尼的诱惑" : "Fatna Hosny",
      position: lang === 'ar' ? "المدير العام" : lang === 'cn' ? "总经理" : "General Manager",
      image: IMG2,
      experience: lang === 'ar' ? "15+ سنة خبرة" : lang === 'cn' ? "15年以上经验" : "15+ Years Experience",
      expertise: lang === 'ar' ? "إدارة الأعمال السياحية" : lang === 'cn' ? "旅游业务管理" : "Tourism Business Management",
      achievements: ["إدارة 50+ مركبة", "خدمة 10,000+ عميل", "تطوير 20+ مسار"]
    },
    {
      name: lang === 'ar' ? "محمد عبد الرحيم" : lang === 'cn' ? "穆罕默德·阿卜杜勒·拉希姆" : "Mohamed Abd El Raheem",
      position: lang === 'ar' ? "مدير العمليات" : lang === 'cn' ? "运营经理" : "Operations Manager",
      image: IMG2,
      experience: lang === 'ar' ? "12+ سنة خبرة" : lang === 'cn' ? "12年以上经验" : "12+ Years Experience",
      expertise: lang === 'ar' ? "إدارة العمليات اللوجستية" : lang === 'cn' ? "物流运营管理" : "Logistics Operations Management",
      achievements: ["تحسين 40% في الكفاءة", "تقليل التكاليف 25%", "إدارة 100+ سائق"]
    }
  ];

  // Company statistics
  const stats = [
    { icon: FaUsers, value: "10,000+", label: lang === 'ar' ? "عميل راضي" : lang === 'cn' ? "满意客户" : "Happy Clients" },
    { icon: FaRoute, value: "50+", label: lang === 'ar' ? "مسار نشط" : lang === 'cn' ? "活跃路线" : "Active Routes" },
    { icon: FaCar, value: "100+", label: lang === 'ar' ? "مركبة حديثة" : lang === 'cn' ? "现代车辆" : "Modern Vehicles" },
    { icon: FaStar, value: "4.9", label: lang === 'ar' ? "تقييم متوسط" : lang === 'cn' ? "平均评分" : "Average Rating" }
  ];

  // Company achievements
  const achievements = [
    { icon: FaAward, title: lang === 'ar' ? "أفضل شركة نقل سياحي 2023" : lang === 'cn' ? "2023年最佳旅游运输公司" : "Best Tourism Transport 2023", description: lang === 'ar' ? "حصلنا على جائزة أفضل شركة نقل سياحي في مصر" : lang === 'cn' ? "我们获得了埃及最佳旅游运输公司奖" : "Awarded best tourism transport company in Egypt" },
    { icon: FaShieldAlt, title: lang === 'ar' ? "شهادة الأمان الدولية" : lang === 'cn' ? "国际安全认证" : "International Safety Certificate", description: lang === 'ar' ? "جميع مركباتنا حاصلة على شهادات الأمان الدولية" : lang === 'cn' ? "我们所有车辆都获得国际安全认证" : "All our vehicles have international safety certificates" },
    { icon: FaHandshake, title: lang === 'ar' ? "شراكة مع 100+ فندق" : lang === 'cn' ? "与100多家酒店合作" : "Partnership with 100+ Hotels", description: lang === 'ar' ? "شراكات استراتيجية مع أفضل الفنادق في مصر" : lang === 'cn' ? "与埃及最好的酒店建立战略合作伙伴关系" : "Strategic partnerships with Egypt's best hotels" }
  ];

  // Services with details
  const services = [
    {
      icon: FaPlane,
      title: lang === 'ar' ? "نقل المطارات" : lang === 'cn' ? "机场接送" : "Airport Transfers",
      description: lang === 'ar' ? "خدمة نقل متميزة من وإلى جميع مطارات مصر" : lang === 'cn' ? "往返埃及所有机场的优质接送服务" : "Premium transfer service to and from all Egyptian airports",
      features: lang === 'ar' ? ["تتبع الرحلة في الوقت الفعلي", "سائقين محترفين", "مركبات حديثة"] : lang === 'cn' ? ["实时航班跟踪", "专业司机", "现代车辆"] : ["Real-time flight tracking", "Professional drivers", "Modern vehicles"]
    },
    {
      icon: FaRoute,
      title: lang === 'ar' ? "جولات سياحية" : lang === 'cn' ? "旅游观光" : "Tourist Tours",
      description: lang === 'ar' ? "اكتشف أجمل الأماكن السياحية في مصر مع مرشدين محترفين" : lang === 'cn' ? "与专业导游一起探索埃及最美丽的旅游景点" : "Discover Egypt's most beautiful tourist spots with professional guides",
      features: lang === 'ar' ? ["مرشدين محترفين", "جداول مرنة", "أسعار تنافسية"] : lang === 'cn' ? ["专业导游", "灵活时间表", "有竞争力的价格"] : ["Professional guides", "Flexible schedules", "Competitive prices"]
    },
    {
      icon: FaCar,
      title: lang === 'ar' ? "تأجير السيارات" : lang === 'cn' ? "汽车租赁" : "Car Rental",
      description: lang === 'ar' ? "استأجر سيارات حديثة مع سائقين محترفين لرحلاتك" : lang === 'cn' ? "为您的旅行租用配备专业司机的现代汽车" : "Rent modern cars with professional drivers for your trips",
      features: lang === 'ar' ? ["سيارات حديثة", "سائقين محترفين", "تأمين شامل"] : lang === 'cn' ? ["现代汽车", "专业司机", "全面保险"] : ["Modern cars", "Professional drivers", "Comprehensive insurance"]
    }
  ];

  // Handle contact form submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      setShowContactModal(false);
      setContactForm({ name: '', email: '', phone: '', message: '', service: '' });
      alert(lang === 'ar' ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' : lang === 'cn' ? '您的消息已成功发送！我们很快会与您联系。' : 'Your message has been sent successfully! We will contact you soon.');
    }, 2000);
  };

  // Show stats on scroll
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('stats-section');
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setShowStats(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [showBookNowFab, setShowBookNowFab] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBookNowFab(window.scrollY > 300);
      // Sticky navbar shadow
      const navbar = document.getElementById('main-navbar');
      if (navbar) {
        if (window.scrollY > 10) {
          navbar.classList.add('shadow-lg');
        } else {
          navbar.classList.remove('shadow-lg');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="min-vh-100 position-relative"
      style={{
        background: 'linear-gradient(135deg, #F8FAFC 60%, #E0E7FF 100%)',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* Sticky Navbar with shadow */}
      <Navbar id="main-navbar" expand="lg" className="shadow-sm bg-white sticky-top" style={{ transition: 'box-shadow 0.3s' }}>
        <Container>
          <Navbar.Brand 
            href="#" 
            className="fw-bold" 
            style={{ color: colors.primary }}
            onClick={() => navigate('/')}
          >
            {t.title}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate('/')}>
                <FaHome className="me-1" /> {lang === 'ar' ? 'الرئيسية' : lang === 'cn' ? '首页' : 'Home'}
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/user-travels')}>
                <FaSearch className="me-1" /> {lang === 'ar' ? 'احجز الآن' : lang === 'cn' ? '立即预订' : 'Book Now'}
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/airports')}>
                <FaPlane className="me-1" /> {lang === 'ar' ? 'المطارات' : lang === 'cn' ? '机场' : 'Airports'}
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/about')}>
                <FaInfoCircle className="me-1" /> {lang === 'ar' ? 'من نحن' : lang === 'cn' ? '关于我们' : 'About'}
              </Nav.Link>
            </Nav>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="dropdown-language">
                <FaGlobe className="me-1" /> {t.languages[lang]}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setLang('ar')}>
                  {t.languages.ar}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setLang('en')}>
                  {t.languages.en}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setLang('cn')}>
                  {t.languages.cn}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-5">
        {/* Enhanced Hero Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Card className="border-0 shadow-lg" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: `2px solid ${colors.primary}20`,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '8px',
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                width: '100%'
              }} />
              <Card.Body className="text-center py-5 px-4">
                <div className="mb-4">
                  <div 
                    className="mx-auto d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: `${colors.primary}20`
                    }}
                  >
                    <FaRocket size={40} style={{ color: colors.primary }} />
                  </div>
                  <h1 className="display-5 fw-bold mb-3" style={{ color: colors.primary }}>
                    {t.title}
                  </h1>
                  <p className="lead mb-4" style={{ color: colors.dark }}>
                    {t.subtitle}
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={() => navigate('/user-travels')}
                      style={{ background: colors.primary, border: 'none' }}
                    >
                      <FaSearch className="me-2" />
                      {lang === 'ar' ? 'احجز الآن' : lang === 'cn' ? '立即预订' : 'Book Now'}
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="lg"
                      onClick={() => setShowContactModal(true)}
                      style={{ borderColor: colors.primary, color: colors.primary }}
                    >
                      <FaPhone className="me-2" />
                      {lang === 'ar' ? 'اتصل بنا' : lang === 'cn' ? '联系我们' : 'Contact Us'}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Company Statistics Section */}
        <Row className="justify-content-center mb-5" id="stats-section">
          <Col lg={10}>
            <Card className="border-0 shadow-lg" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: `2px solid ${colors.primary}20`
            }}>
              <Card.Header style={{ backgroundColor: colors.primary, color: 'white', borderRadius: '20px 20px 0 0' }}>
                <h3 className="mb-0 text-center">
                  <FaTrophy className="me-2" />
                  {lang === 'ar' ? 'إحصائيات الشركة' : lang === 'cn' ? '公司统计' : 'Company Statistics'}
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  {stats.map((stat, index) => (
                    <Col md={3} key={index}>
                      <div className="text-center p-3">
                        <div 
                          className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: `${colors.secondary}20`
                          }}
                        >
                          <stat.icon size={30} style={{ color: colors.secondary }} />
                        </div>
                        <h2 className="fw-bold mb-2" style={{ color: colors.primary }}>
                          {showStats ? stat.value : '0'}
                        </h2>
                        <p className="text-muted mb-0">{stat.label}</p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Services Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Card className="border-0 shadow-lg mb-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: `2px solid ${colors.primary}20`
            }}>
              <Card.Header style={{ backgroundColor: colors.secondary, color: 'white', borderRadius: '20px 20px 0 0' }}>
                <h3 className="mb-0 text-center">
                  <FaRoute className="me-2" />
                  {lang === 'ar' ? 'خدماتنا المتميزة' : lang === 'cn' ? '我们的优质服务' : 'Our Premium Services'}
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  {services.map((service, index) => (
                    <Col md={4} key={index}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                          <div 
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: '70px',
                              height: '70px',
                              borderRadius: '50%',
                              backgroundColor: `${colors.primary}20`
                            }}
                          >
                            <service.icon size={35} style={{ color: colors.primary }} />
                          </div>
                          <h5 className="fw-bold mb-3" style={{ color: colors.primary }}>
                            {service.title}
                          </h5>
                          <p className="text-muted mb-4">
                            {service.description}
                          </p>
                          <div className="text-start">
                            {service.features.map((feature, idx) => (
                              <div key={idx} className="d-flex align-items-center mb-2">
                                <FaCheck size={14} className="me-2" style={{ color: colors.secondary }} />
                                <small className="text-muted">{feature}</small>
                              </div>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Company Achievements Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Card className="border-0 shadow-lg mb-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: `2px solid ${colors.primary}20`
            }}>
              <Card.Header style={{ backgroundColor: colors.accent, color: 'white', borderRadius: '20px 20px 0 0' }}>
                <h3 className="mb-0 text-center">
                  <FaMedal className="me-2" />
                  {lang === 'ar' ? 'إنجازاتنا' : lang === 'cn' ? '我们的成就' : 'Our Achievements'}
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  {achievements.map((achievement, index) => (
                    <Col md={4} key={index}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                          <div 
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              backgroundColor: `${colors.accent}20`
                            }}
                          >
                            <achievement.icon size={30} style={{ color: colors.accent }} />
                          </div>
                          <h6 className="fw-bold mb-3" style={{ color: colors.primary }}>
                            {achievement.title}
                          </h6>
                          <p className="text-muted mb-0 small">
                            {achievement.description}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Team Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Card className="border-0 shadow-lg mb-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: `2px solid ${colors.primary}20`
            }}>
              <Card.Header style={{ backgroundColor: colors.primary, color: 'white', borderRadius: '20px 20px 0 0' }}>
                <h3 className="mb-0 text-center">
                  <FaUsers className="me-2" />
                  {lang === 'ar' ? 'فريقنا المحترف' : lang === 'cn' ? '我们的专业团队' : 'Our Professional Team'}
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  {teamMembers.map((member, index) => (
                    <Col key={index} md={6}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                          <Image 
                            src={member.image} 
                            alt={member.name}
                            roundedCircle
                            className="mx-auto mb-3"
                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                          />
                          <h5 className="fw-bold mb-2" style={{ color: colors.primary }}>{member.name}</h5>
                          <Badge bg="secondary" className="mb-3">{member.position}</Badge>
                          <p className="text-muted mb-3">{member.experience}</p>
                          <p className="text-muted mb-3 small">{member.expertise}</p>
                          <div className="text-start">
                            <h6 className="mb-2" style={{ color: colors.secondary }}>
                              {lang === 'ar' ? 'الإنجازات:' : lang === 'cn' ? '成就:' : 'Achievements:'}
                            </h6>
                            {member.achievements.map((achievement, idx) => (
                              <div key={idx} className="d-flex align-items-center mb-1">
                                <FaStar size={12} className="me-2" style={{ color: colors.accent }} />
                                <small className="text-muted">{achievement}</small>
                              </div>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Contact Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Card className="border-0 shadow-lg" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: `2px solid ${colors.primary}20`
            }}>
              <Card.Header style={{ backgroundColor: colors.secondary, color: 'white', borderRadius: '20px 20px 0 0' }}>
                <h3 className="mb-0 text-center">
                  <FaPhone className="me-2" />
                  {lang === 'ar' ? 'تواصل معنا' : lang === 'cn' ? '联系我们' : 'Contact Us'}
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  <Col md={3}>
                    <div className="text-center p-3">
                      <div 
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: `${colors.primary}20`
                        }}
                      >
                        <FaMapMarkerAlt size={25} style={{ color: colors.primary }} />
                      </div>
                      <h6 className="fw-bold">{lang === 'ar' ? "العنوان" : lang === 'cn' ? "地址" : "Address"}</h6>
                      <p className="text-muted small">{t.address}</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3">
                      <div 
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: `${colors.secondary}20`
                        }}
                      >
                        <FaPhone size={25} style={{ color: colors.secondary }} />
                      </div>
                      <h6 className="fw-bold">{lang === 'ar' ? "الهاتف" : lang === 'cn' ? "电话" : "Phone"}</h6>
                      <p className="text-muted small">{t.phone}</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3">
                      <div 
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: `${colors.accent}20`
                        }}
                      >
                        <FaEnvelope size={25} style={{ color: colors.accent }} />
                      </div>
                      <h6 className="fw-bold">Email</h6>
                      <p className="text-muted small">{t.email}</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3">
                      <div 
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: `${colors.primary}20`
                        }}
                      >
                        <FaClock size={25} style={{ color: colors.primary }} />
                      </div>
                      <h6 className="fw-bold">{lang === 'ar' ? "ساعات العمل" : lang === 'cn' ? "营业时间" : "Working Hours"}</h6>
                      <p className="text-muted small">{t.hours}</p>
                    </div>
                  </Col>
                </Row>
                
                <div className="text-center mt-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => setShowContactModal(true)}
                    style={{ background: colors.primary, border: 'none' }}
                  >
                    <FaEnvelope className="me-2" />
                    {lang === 'ar' ? 'أرسل رسالة' : lang === 'cn' ? '发送消息' : 'Send Message'}
                  </Button>
                </div>

                {/* Social Media Links */}
                <div className="text-center mt-4">
                  <h6 className="mb-3">{lang === 'ar' ? 'تابعنا على' : lang === 'cn' ? '关注我们' : 'Follow Us'}</h6>
                  <div className="d-flex justify-content-center gap-3">
                    <Button variant="outline-success" size="sm">
                      <FaWhatsapp />
                    </Button>
                    <Button variant="outline-primary" size="sm">
                      <FaFacebook />
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      <FaInstagram />
                    </Button>
                    <Button variant="outline-info" size="sm">
                      <FaTwitter />
                    </Button>
                    <Button variant="outline-primary" size="sm">
                      <FaLinkedin />
                    </Button>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <h6 className="mb-3">{lang === 'ar' ? 'موقعنا على الخريطة' : lang === 'cn' ? '我们的地图位置' : 'Our Location on Map'}</h6>
                  <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(30,64,175,0.08)', maxWidth: 400, margin: '0 auto' }}>
                    <iframe
                      title="Company Location"
                      src="https://www.openstreetmap.org/export/embed.html?bbox=33.799%2C27.257%2C33.809%2C27.267&layer=mapnik"
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="success"
                      size="lg"
                      href="https://wa.me/201551927216"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-inline-flex align-items-center"
                    >
                      <FaWhatsapp className="me-2" />
                      {lang === 'ar' ? 'تواصل عبر واتساب' : lang === 'cn' ? '通过WhatsApp联系我们' : 'Contact via WhatsApp'}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Contact Modal */}
      <Modal 
        show={showContactModal} 
        onHide={() => setShowContactModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEnvelope className="me-2" />
            {lang === 'ar' ? 'أرسل رسالة لنا' : lang === 'cn' ? '给我们发消息' : 'Send us a Message'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleContactSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <FloatingLabel label={lang === 'ar' ? 'الاسم الكامل' : lang === 'cn' ? '全名' : 'Full Name'}>
                  <Form.Control
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="border-0 shadow-sm"
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel label={lang === 'ar' ? 'البريد الإلكتروني' : lang === 'cn' ? '电子邮件' : 'Email'}>
                  <Form.Control
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="border-0 shadow-sm"
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel label={lang === 'ar' ? 'رقم الهاتف' : lang === 'cn' ? '电话号码' : 'Phone Number'}>
                  <Form.Control
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="border-0 shadow-sm"
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel label={lang === 'ar' ? 'نوع الخدمة' : lang === 'cn' ? '服务类型' : 'Service Type'}>
                  <Form.Select
                    value={contactForm.service}
                    onChange={(e) => setContactForm(prev => ({ ...prev, service: e.target.value }))}
                    className="border-0 shadow-sm"
                  >
                    <option value="">{lang === 'ar' ? 'اختر الخدمة' : lang === 'cn' ? '选择服务' : 'Select Service'}</option>
                    <option value="airport">{lang === 'ar' ? 'نقل المطارات' : lang === 'cn' ? '机场接送' : 'Airport Transfer'}</option>
                    <option value="tour">{lang === 'ar' ? 'جولات سياحية' : lang === 'cn' ? '旅游观光' : 'Tourist Tours'}</option>
                    <option value="rental">{lang === 'ar' ? 'تأجير السيارات' : lang === 'cn' ? '汽车租赁' : 'Car Rental'}</option>
                    <option value="other">{lang === 'ar' ? 'أخرى' : lang === 'cn' ? '其他' : 'Other'}</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={12}>
                <FloatingLabel label={lang === 'ar' ? 'الرسالة' : lang === 'cn' ? '消息' : 'Message'}>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                    className="border-0 shadow-sm"
                  />
                </FloatingLabel>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowContactModal(false)}>
            {lang === 'ar' ? 'إلغاء' : lang === 'cn' ? '取消' : 'Cancel'}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleContactSubmit}
            disabled={isLoading}
            style={{ background: colors.primary, border: 'none' }}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                {lang === 'ar' ? 'جاري الإرسال...' : lang === 'cn' ? '发送中...' : 'Sending...'}
              </>
            ) : (
              <>
                <FaEnvelope className="me-2" />
                {lang === 'ar' ? 'إرسال الرسالة' : lang === 'cn' ? '发送消息' : 'Send Message'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Floating Book Now Button */}
      {showBookNowFab && (
        <Button
          variant="primary"
          size="lg"
          className="position-fixed"
          style={{
            right: 24,
            bottom: 32,
            zIndex: 1050,
            borderRadius: '50%',
            width: 64,
            height: 64,
            boxShadow: '0 4px 24px rgba(30,64,175,0.2)',
            background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => navigate('/user-travels')}
          aria-label={lang === 'ar' ? 'احجز الآن' : lang === 'cn' ? '立即预订' : 'Book Now'}
        >
          <FaSearch size={28} />
        </Button>
      )}
      {/* Footer */}
      <footer className="mt-5 pt-4 pb-2 bg-white border-top shadow-sm" style={{ background: '#fff', color: colors.primary }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
              <span className="fw-bold">{lang === 'ar' ? '© 2023 وصلني. جميع الحقوق محفوظة.' : lang === 'cn' ? '© 2023 Wasalny. 保留所有权利。' : '© 2023 Wasalny. All rights reserved.'}</span>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <span className="me-2">{lang === 'ar' ? 'تابعنا:' : lang === 'cn' ? '关注我们:' : 'Follow us:'}</span>
              <a href="#" className="me-2 text-primary"><FaFacebook /></a>
              <a href="#" className="me-2 text-success"><FaWhatsapp /></a>
              <a href="#" className="me-2 text-danger"><FaInstagram /></a>
              <a href="#" className="me-2 text-info"><FaTwitter /></a>
              <a href="#" className="me-2 text-primary"><FaLinkedin /></a>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default AboutUs;