import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Badge, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaPrint, FaEnvelope, FaCalendarAlt, FaCar, FaMapMarkerAlt, FaPhone, FaUser, FaCopy, FaStar, FaDownload, FaShare } from 'react-icons/fa';

const Confirmation = () => {
  const { state } = useLocation();
  const booking = state || {
    bookingId: 'BK-2025-001234',
    customerName: 'John Doe',
    customerPhone: '+1 (555) 123-4567',
    airportName: 'John F. Kennedy International Airport (JFK)',
    vehicleName: 'Premium Sedan',
    reservationDateTime: 'July 25, 2025 at 3:30 PM'
  };
  
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
    setShowConfetti(true);
    
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const copyBookingId = () => {
    navigator.clipboard.writeText(booking.bookingId);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReceipt = () => {
    const subject = `Booking Confirmation - ${booking.bookingId}`;
    const body = `Dear ${booking.customerName},\n\nYour airport transfer booking has been confirmed!\n\nBooking ID: ${booking.bookingId}\nDate & Time: ${booking.reservationDateTime}\nVehicle: ${booking.vehicleName}\nAirport: ${booking.airportName}\n\nThank you for choosing our service!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Airport Transfer Booking Confirmed',
          text: `My airport transfer is booked! Booking ID: ${booking.bookingId}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="min-vh-100" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
        `,
        animation: showConfetti ? 'float 6s ease-in-out infinite' : 'none'
      }} />

      {/* Confetti Animation */}
      {showConfetti && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `-10px`,
                left: `${Math.random() * 100}%`,
                width: '6px',
                height: '6px',
                background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][Math.floor(Math.random() * 5)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                animation: `confetti-fall 3s linear ${Math.random() * 2}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      <Container className="py-5" style={{ position: 'relative', zIndex: 10 }}>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {/* Copy Alert */}
            {showCopyAlert && (
              <Alert variant="success" className="text-center mb-4" style={{
                transform: 'translateY(-10px)',
                transition: 'all 0.3s ease'
              }}>
                <FaCheckCircle className="me-2" />
                Booking ID copied to clipboard!
              </Alert>
            )}

            {/* Main Confirmation Card */}
            <Card className={`border-0 shadow-lg text-center overflow-hidden ${isAnimated ? 'animate-slide-up' : ''}`} style={{
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              transform: isAnimated ? 'translateY(0)' : 'translateY(50px)',
              opacity: isAnimated ? 1 : 0,
              transition: 'all 0.8s ease'
            }}>
              
              {/* Success Header */}
              <div style={{
                background: 'linear-gradient(135deg, #00b09b, #96c93d)',
                padding: '3rem 2rem',
                color: 'white'
              }}>
                <div className={`text-white mb-4 ${isAnimated ? 'animate-bounce' : ''}`} style={{ 
                  fontSize: '5rem',
                  animation: isAnimated ? 'bounce 2s ease' : 'none'
                }}>
                  <FaCheckCircle />
                </div>
                <h1 className="mb-3" style={{ fontWeight: '700', fontSize: '2.5rem' }}>
                  🎉 Booking Confirmed!
                </h1>
                <p className="lead mb-0" style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                  Your premium airport transfer is all set. Get ready for a smooth ride! ✈️
                </p>
              </div>

              <div className="p-4 p-md-5">
                {/* Booking ID with Copy Feature */}
                <div className="text-center mb-5">
                  <Badge 
                    bg="primary" 
                    className="px-4 py-3 fs-5 position-relative"
                    style={{ 
                      borderRadius: '25px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={copyBookingId}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Booking ID: {booking.bookingId} <FaCopy className="ms-2" />
                  </Badge>
                  <p className="text-muted mt-2 small">Click to copy booking ID</p>
                </div>

                {/* Booking Details Cards */}
                <Row className="g-4 mb-5">
                  <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm" style={{ 
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="rounded-circle bg-primary text-white p-3 me-3">
                            <FaUser />
                          </div>
                          <h5 className="mb-0">Customer Details</h5>
                        </div>
                        <div className="text-start">
                          <p className="mb-2"><strong>Name:</strong> {booking.customerName}</p>
                          <p className="mb-0 d-flex align-items-center">
                            <FaPhone className="me-2 text-muted" />
                            {booking.customerPhone}
                          </p>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm" style={{ 
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="rounded-circle bg-success text-white p-3 me-3">
                            <FaCalendarAlt />
                          </div>
                          <h5 className="mb-0">Trip Schedule</h5>
                        </div>
                        <div className="text-start">
                          <p className="mb-2 d-flex align-items-center">
                            <FaCalendarAlt className="me-2 text-muted" />
                            {booking.reservationDateTime}
                          </p>
                          <Badge bg="info" className="px-3 py-2">On Time Guaranteed</Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm" style={{ 
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="rounded-circle bg-warning text-white p-3 me-3">
                            <FaCar />
                          </div>
                          <h5 className="mb-0">Vehicle Details</h5>
                        </div>
                        <div className="text-start">
                          <p className="mb-2"><strong>{booking.vehicleName}</strong></p>
                          <div className="d-flex align-items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className="text-warning me-1" />
                            ))}
                            <span className="ms-2 text-muted">Premium Service</span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm" style={{ 
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="rounded-circle bg-info text-white p-3 me-3">
                            <FaMapMarkerAlt />
                          </div>
                          <h5 className="mb-0">Destination</h5>
                        </div>
                        <div className="text-start">
                          <p className="mb-2 d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-muted" />
                            {booking.airportName}
                          </p>
                          <Badge bg="success" className="px-3 py-2">GPS Tracked</Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="px-4 py-3 rounded-pill"
                    onClick={handlePrint}
                    style={{ 
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <FaPrint className="me-2" />
                    Print Confirmation
                  </Button>
                  
                  {/* <Button 
                    variant="success" 
                    size="lg"
                    className="px-4 py-3 rounded-pill"
                    onClick={handleEmailReceipt}
                    style={{ 
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <FaEnvelope className="me-2" />
                    Email Receipt
                  </Button> */}
                  
                  <Button 
                    variant="outline-primary" 
                    size="lg"
                    className="px-4 py-3 rounded-pill"
                    onClick={handleShare}
                    style={{ transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <FaShare className="me-2" />
                    Share
                  </Button>
                </div>

                {/* What's Next Section */}
                <Alert variant="light" className="text-start p-4" style={{ 
                  borderRadius: '15px',
                  border: '1px solid rgba(0, 123, 255, 0.2)',
                  background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.05), rgba(108, 92, 231, 0.05))'
                }}>
                  <h5 className="mb-3">🚗 What happens next?</h5>
                  <Row>
                    <Col md={4} className="mb-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary text-white p-2 me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>1</span>
                        </div>
                        <div>
                          <strong>24hrs before</strong>
                          <p className="mb-0 text-muted small">Driver details sent via SMS</p>
                        </div>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-warning text-white p-2 me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>2</span>
                        </div>
                        <div>
                          <strong>30mins before</strong>
                          <p className="mb-0 text-muted small">Driver arrives & calls you</p>
                        </div>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-success text-white p-2 me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>3</span>
                        </div>
                        <div>
                          <strong>Pickup time</strong>
                          <p className="mb-0 text-muted small">Enjoy your comfortable ride!</p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Alert>
              </div>

              {/* Footer */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                padding: '2rem',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px'
              }}>
                <p className="mb-3">
                  <strong>Need help?</strong> Our 24/7 customer support is here for you! 💬
                </p>
                <div className="d-flex justify-content-center gap-4 text-muted">
                  <span>📧 mohamedhafiza1234@gmail.com</span>
                  <span>📞 +201020849387</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-20px,0);
          }
          70% {
            transform: translate3d(0,-10px,0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease forwards;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Confirmation;