// TripCard.js
import React from 'react';
import { Card, Row, Col, Badge, Button, ListGroup } from 'react-bootstrap';
import {
  FaCarSide, FaClock, FaCheckCircle, FaTimesCircle,
  FaDollarSign, FaStar, FaMapMarkerAlt, FaListUl,
  FaRoute, FaUserFriends, FaChair, FaSuitcase
} from 'react-icons/fa';

import sedanImg from '../assets/sedan.png';
import suvImg from '../assets/suv.png';
import minibusImg from '../assets/minibus.png';

const vehicleTypes = {
  sedan: {
    name: { ar: "سيدان", en: "Sedan", cn: "轿车" },
    image: sedanImg, capacity: 5,
    icon: <FaCarSide className="text-primary" />,
    bgColor: 'bg-primary-light', textColor: 'text-primary'
  },
  suv: {
    name: { ar: "SUV", en: "SUV", cn: "越野车" },
    image: suvImg, capacity: 3,
    icon: <FaCarSide className="text-success" />,
    bgColor: 'bg-success-light', textColor: 'text-success'
  },
  minibus: {
    name: { ar: "ميكروباص", en: "Minibus", cn: "小巴" },
    image: minibusImg, capacity: 10,
    icon: <FaUserFriends className="text-warning" />,
    bgColor: 'bg-warning-light', textColor: 'text-warning'
  }
};

const TripCard = ({ trip, lang = 'en', onBook }) => {
  const vehicle = vehicleTypes[trip.vehicleType] || vehicleTypes.sedan;

  const t = {
    ar: {
      duration: "المدة", price: "السعر", amenities: "الخدمات",
      fromPoints: "نقاط الانطلاق", toPoints: "نقاط الوصول",
      seats: "المقاعد", luggage: "الأمتعة المسموحة",
      bookNow: "احجز الآن", unavailable: "غير متاح"
    },
    en: {
      duration: "Duration", price: "Price", amenities: "Amenities",
      fromPoints: "From Points", toPoints: "To Points",
      seats: "Seats", luggage: "Luggage",
      bookNow: "Book Now", unavailable: "Unavailable"
    },
    cn: {
      duration: "时长", price: "价格", amenities: "设施",
      fromPoints: "出发点", toPoints: "目的地",
      seats: "座位", luggage: "行李",
      bookNow: "立即预订", unavailable: "不可用"
    }
  }[lang];

  return (
    <Card className="h-100 shadow-sm border-0 overflow-hidden">
      <Card.Header className={`${vehicle.bgColor} py-3`}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">
              <span className="text-dark">{trip.from}</span>
              <span className={`mx-2 ${vehicle.textColor}`}>→</span>
              <span className="text-dark">{trip.to}</span>
            </h5>
            <small className="text-muted">
              <FaClock className={`me-1 ${vehicle.textColor}`} />
              {trip.time} • {t.duration}: {trip.duration}
            </small>
          </div>
          <Badge pill className="px-3 py-2 bg-white text-dark">
            {vehicle.icon} {vehicle.name[lang] || vehicle.name.en}
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        <Row className="g-0 h-100">
          <Col md={4} className="d-flex flex-column align-items-center justify-content-center p-3 border-end">
            <img src={vehicle.image} alt={vehicle.name[lang]} className="img-fluid mb-3" style={{ maxHeight: '100px', objectFit: 'contain' }} />
            <div className="text-center">
              <Badge bg="light" text="dark" className="px-3 py-2 mb-2">
                <FaChair className={`me-1 ${vehicle.textColor}`} />
                {vehicle.capacity} {t.seats}
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2 ms-2">
                <FaSuitcase className={`me-1 ${vehicle.textColor}`} />
                {trip.luggage || '1 bag'}
              </Badge>
            </div>
          </Col>

          <Col md={8} className="p-3">
            <div className="h-100 d-flex flex-column">
              <div className="d-flex justify-content-between mb-3">
                <div className={`fs-4 fw-bold ${vehicle.textColor}`}>
                  <FaDollarSign className="me-1" />
                  {trip.price} {trip.currency || 'EGP'}
                </div>
                {trip.rating && (
                  <div className="d-flex align-items-center">
                    <FaStar className="text-warning me-1" />
                    <span className="fw-bold">{trip.rating}</span>
                  </div>
                )}
              </div>

              {trip.amenities?.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">
                    <FaListUl className="me-1" /> {t.amenities}
                  </small>
                  <div className="d-flex flex-wrap gap-2">
                    {trip.amenities.map((amenity, idx) => (
                      <Badge key={idx} pill bg="light" text="dark" className="px-2">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-grow-1 mb-3">
                {trip.fromPoints?.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted d-block mb-1"><FaRoute className="me-1" /> {t.fromPoints}</small>
                    <ListGroup variant="flush" className="small">
                      {trip.fromPoints.map((point, idx) => (
                        <ListGroup.Item key={`from-${idx}`} className="px-0 py-1 border-0">
                          <FaMapMarkerAlt className={`me-2 ${vehicle.textColor}`} />{point}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
                {trip.toPoints?.length > 0 && (
                  <div>
                    <small className="text-muted d-block mb-1"><FaRoute className="me-1" /> {t.toPoints}</small>
                    <ListGroup variant="flush" className="small">
                      {trip.toPoints.map((point, idx) => (
                        <ListGroup.Item key={`to-${idx}`} className="px-0 py-1 border-0">
                          <FaMapMarkerAlt className={`me-2 ${vehicle.textColor}`} />{point}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <Button
                  variant={trip.available ? 'primary' : 'secondary'}
                  onClick={() => trip.available && onBook(trip)}
                  disabled={!trip.available}
                  className="w-100 d-flex justify-content-between align-items-center"
                  size="lg"
                >
                  <span>{trip.available ? t.bookNow : t.unavailable}</span>
                  <span>{trip.available ? <FaCheckCircle className="ms-2" /> : <FaTimesCircle className="ms-2" />}</span>
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TripCard;
