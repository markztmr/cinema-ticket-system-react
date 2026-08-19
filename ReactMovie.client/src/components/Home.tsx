import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mt-5">
      <div className="jumbotron py-5">
        <h1 className="display-4">🎬 Cinema Ticket Booking System</h1>
        <p className="lead">Book your favorite movies online</p>
        <hr className="my-4" />
        {user ? (
          <div>
            <p>Welcome, {user.firstName}!</p>
            <a className="btn btn-primary btn-lg" href="/screenings" role="button">
              Browse Screenings
            </a>
            {user.isAdmin && (
              <a className="btn btn-secondary btn-lg ms-2" href="/admin" role="button">
                Admin Panel
              </a>
            )}
          </div>
        ) : (
          <div>
            <p>Please login or register to book tickets</p>
            <a className="btn btn-primary btn-lg" href="/login" role="button">
              Login
            </a>
            <a className="btn btn-secondary btn-lg ms-2" href="/register" role="button">
              Register
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
