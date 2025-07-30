import { FaCheck, FaArrowRight, FaPhone } from 'react-icons/fa';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

// Import your vehicle images
import SedanReal from '../assets/SEDAN.jpeg';
import SuvReal from '../assets/SUV.jpeg';
import MinibusReal from '../assets/MINIBUS.jpg';

const VehicleShowcase = ({ language }) => {
    // Vehicle data with images
    const vehicles = [
      {
        id: 1,
        type: 'sedan',
        name: { en: 'Sedan', ar: 'سيارة سيدان' },
        image: SedanReal,
        features: { 
          en: ['4 passengers', 'Air conditioning', 'Luxury interior'],
          ar: ['4 ركاب', 'تكييف هواء', 'داخلية فاخرة']
        },
        price: 1200
      },
      {
        id: 2,
        type: 'suv',
        name: { en: 'SUV', ar: 'سيارة دفع رباعي' },
        image: SuvReal,
        features: { 
          en: ['6 passengers', 'Spacious interior', 'All-terrain'],
          ar: ['6 ركاب', 'داخلية فسيحة', 'جميع التضاريس']
        },
        price: 1800
      },
      {
        id: 3,
        type: 'minibus',
        name: { en: 'Minibus', ar: 'ميني باص' },
        image: MinibusReal,
        features: { 
          en: ['12 passengers', 'Comfortable seats', 'Ample luggage space'],
          ar: ['12 راكب', 'مقاعد مريحة', 'مساحة كبيرة للأمتعة']
        },
        price: 2500
      }
    ];
  
    return (
      <section className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <Container>
  
          <Row className="g-4">
            {vehicles.map((vehicle) => (
              <Col lg={4} md={6} key={vehicle.id}>
                <div className="h-100 d-flex flex-column">
                  <Card className="border-0 shadow-sm overflow-hidden flex-grow-1">
                    {/* Vehicle Image with Hover Effect */}
                    <div 
                      className="position-relative overflow-hidden" 
                      style={{ height: '250px' }}
                    >
                      <img
                        src={vehicle.image}
                        alt={vehicle.name[language] || vehicle.name.en}
                        className="w-100 h-100 object-cover"
                        style={{
                          transition: 'transform 0.5s ease',
                          objectPosition: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {/* Price Tag */}
                      <div 
                        className="position-absolute bottom-0 start-0 m-3 bg-white px-3 py-2 rounded-pill shadow-sm"
                        style={{ zIndex: 1 }}
                      >
                        {/* <span className="fw-bold text-primary">
                          {vehicle.price} {language === 'ar' ? 'جنيه/يوم' : 'EGP/day'}
                        </span> */}
                      </div>
                    </div>
  
                    <Card.Body className="p-4">
                      <h3 className="h4 fw-bold mb-3">
                        {vehicle.name[language] || vehicle.name.en}
                      </h3>
                      
                      {/* Features List */}
                      <ul className="list-unstyled mb-4">
                        {(vehicle.features[language] || vehicle.features.en).map((feature, index) => (
                          <li key={index} className="mb-2 d-flex align-items-center">
                            <FaCheck className="text-success me-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
  
                    
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    );
  };

  export default VehicleShowcase;