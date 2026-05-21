import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { Screenings } from './components/Screenings';
import { SeatSelection } from './components/SeatSelection';
import { MyBookings } from './components/MyBookings';
import { AdminPanel } from './components/AdminPanel';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/screenings" element={<Screenings />} />
          <Route path="/seats/:screeningId" element={<SeatSelection />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;