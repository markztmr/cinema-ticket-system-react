import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            🎬 Cinema
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {user ? (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/screenings">
                      Screenings
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/bookings">
                      My Bookings
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href={`/profile/${user.id}`}>
                      Profile
                    </a>
                  </li>
                  {user.isAdmin && (
                    <li className="nav-item">
                      <a className="nav-link" href="/admin">
                        Admin
                      </a>
                    </li>
                  )}
                  <li className="nav-item">
                    <button className="btn btn-outline-light ms-2" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/login">
                      Login
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/register">
                      Register
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      {showAlert && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Logged out successfully
          <button type="button" className="btn-close" onClick={() => setShowAlert(false)}></button>
        </div>
      )}
    </>
  );
};
