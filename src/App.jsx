// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainNavbar from './components/MainNavbar';
import Footer from './components/Footer'; // Optional
import Home from './pages/Home';
import Airports from './pages/Airports';
import AboutUs from './pages/AboutUs';
import Sidebar from "./components/Sidebar";
import Confirmation from './pages/Confirmation';
import ReservationMonitor from './components/ReservationMonitor';
import UserTravels from './pages/UserTravels';
import OurTravels from './pages/OurTravels';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
            {/* <Sidebar /> */}
            {/* Your other components */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<UserTravels />} />
          <Route path="/airports" element={<Airports />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/user" element={<UserTravels />} />
          <Route path="/travels" element={<OurTravels />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
