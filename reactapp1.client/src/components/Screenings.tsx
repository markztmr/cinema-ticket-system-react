import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Screening } from '../types/index';

export const Screenings: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const loadScreenings = async () => {
      try {
        const data = await api.getScreenings();
        setScreenings(data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
      } catch (err) {
        setError('Failed to load screenings');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadScreenings();
    }
  }, [user, authLoading, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (authLoading || loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Available Screenings</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        {screenings.length === 0 ? (
          <div className="col-12">
            <p className="text-muted">No screenings available</p>
          </div>
        ) : (
          screenings.map((screening) => (
            <div key={screening.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{screening.title}</h5>
                  <p className="card-text">
                    <strong>Cinema:</strong> {screening.cinema?.name}
                  </p>
                  <p className="card-text">
                    <strong>Date & Time:</strong> {formatDate(screening.startTime)}
                  </p>
                  <p className="card-text">
                    <strong>Room Size:</strong> {screening.cinema?.rows} x {screening.cinema?.seatsPerRow}
                  </p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate(`/seats/${screening.id}`)}
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
