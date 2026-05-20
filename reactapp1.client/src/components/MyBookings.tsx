import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Booking } from '../types/index';

export const MyBookings: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  useEffect(() => {
    if (loading) {
      return; // Wait for auth to load
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const loadBookings = async () => {
      try {
        const data = await api.getMyBookings();
        setBookings(data);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setLoadingBookings(false);
      }
    };

    loadBookings();
  }, [user, loading, navigate]);

  const handleCancel = async (id: number) => {
    setCancelingId(id);
    try {
      await api.cancelReservation(id);
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err) {
      setError('Failed to cancel booking');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Bookings</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {bookings.length === 0 ? (
        <div className="alert alert-info">
          You haven't made any bookings yet. <a href="/screenings">Browse screenings</a>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Film Title</th>
                <th>Cinema</th>
                <th>Date & Time</th>
                <th>Seat</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.screening?.title}</td>
                  <td>{booking.screening?.cinema?.name}</td>
                  <td>{new Date(booking.screening?.startTime || '').toLocaleString()}</td>
                  <td>Row {booking.row}, Seat {booking.seat}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelingId === booking.id}
                    >
                      {cancelingId === booking.id ? 'Canceling...' : 'Cancel'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
