// TripsList.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase'; // Adjust path based on your file structure
import TripCard from './TripCard'; // Your existing TripCard component

const TripsList = ({ lang = 'en' }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Translations
  const t = {
    ar: {
      availableTrips: "الرحلات المتاحة",
      loading: "جاري التحميل...",
      error: "حدث خطأ في تحميل البيانات",
      noTrips: "لا توجد رحلات متاحة حالياً",
      tryAgain: "حاول مرة أخرى"
    },
    en: {
      availableTrips: "Available Trips",
      loading: "Loading trips...",
      error: "Error loading trips",
      noTrips: "No trips available at the moment",
      tryAgain: "Try Again"
    },
    cn: {
      availableTrips: "可用行程",
      loading: "加载中...",
      error: "加载行程时出错",
      noTrips: "目前没有可用的行程",
      tryAgain: "重试"
    }
  }[lang];

  // Fetch trips from Firestore
  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a query to get trips ordered by time (optional)
      const tripsQuery = query(
        collection(db, 'trips'),
        orderBy('time', 'asc') // Remove this if you don't want ordering
      );
      
      const querySnapshot = await getDocs(tripsQuery);
      const tripsData = [];
      
      querySnapshot.forEach((doc) => {
        tripsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTrips(tripsData);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Real-time listener (uncomment if you want real-time updates)
  
  const setupRealtimeListener = () => {
    try {
      const tripsQuery = query(
        collection(db, 'trips'),
        orderBy('time', 'asc')
      );
      
      const unsubscribe = onSnapshot(tripsQuery, (snapshot) => {
        const tripsData = [];
        snapshot.forEach((doc) => {
          tripsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setTrips(tripsData);
        setLoading(false);
      }, (err) => {
        console.error('Error in real-time listener:', err);
        setError(err.message);
        setLoading(false);
      });
      
      return unsubscribe;
    } catch (err) {
      console.error('Error setting up listener:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle booking
  const handleBookTrip = (trip) => {
    console.log('Booking trip:', trip);
    // Add your booking logic here
    // You might want to navigate to a booking form or open a modal
    alert(`Booking trip from ${trip.from} to ${trip.to}`);
  };

  // Fetch trips on component mount
  useEffect(() => {
    fetchTrips();
    
    // If using real-time listener, uncomment below:
    // const unsubscribe = setupRealtimeListener();
    // return () => unsubscribe && unsubscribe();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" className="me-3">
          <span className="visually-hidden">{t.loading}</span>
        </Spinner>
        <p className="mt-3">{t.loading}</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>{t.error}</Alert.Heading>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger" 
            onClick={fetchTrips}
          >
            {t.tryAgain}
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4 text-center">{t.availableTrips}</h2>
          
          {trips.length === 0 ? (
            <Alert variant="info" className="text-center">
              <p className="mb-0">{t.noTrips}</p>
            </Alert>
          ) : (
            <Row>
              {trips.map((trip) => (
                <Col key={trip.id} lg={6} xl={4} className="mb-4">
                  <TripCard 
                    trip={trip} 
                    onBook={handleBookTrip}
                    lang={lang}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TripsList;