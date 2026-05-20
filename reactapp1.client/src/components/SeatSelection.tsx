import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Screening } from '../types/index';
import './SeatSelection.css';

export const SeatSelection: React.FC = () => {
  const { screeningId } = useParams<{ screeningId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reservingSeats, setReservingSeats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadScreening = async () => {
      try {
        const data = await api.getScreening(parseInt(screeningId!));
        setScreening(data);
      } catch (err) {
        setError('Failed to load screening');
      } finally {
        setLoading(false);
      }
    };

    loadScreening();
  }, [screeningId, user, navigate]);

  const isReserved = (row: number, seat: number): boolean => {
    return screening?.reservations?.some(r => r.row === row && r.seat === seat) || false;
  };

  const isMyReservation = (row: number, seat: number): boolean => {
    return screening?.reservations?.some(r => r.row === row && r.seat === seat && r.userId === user?.id) || false;
  };

  const handleSeatClick = async (row: number, seat: number) => {
    if (!isReserved(row, seat) || isMyReservation(row, seat)) {
      const seatKey = `${row}-${seat}`;
      setReservingSeats(prev => new Set(prev).add(seatKey));

      try {
        await api.toggleReservation(parseInt(screeningId!), row, seat);
        setSuccess('Seat reservation toggled successfully');
        
        // Reload screening to get updated reservations
        const updatedScreening = await api.getScreening(parseInt(screeningId!));
        setScreening(updatedScreening);
        
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to toggle seat');
      } finally {
        setReservingSeats(prev => {
          const next = new Set(prev);
          next.delete(seatKey);
          return next;
        });
      }
    }
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  if (!screening) {
    return <div className="container mt-5"><p>Screening not found</p></div>;
  }

  return (
    <div className="container mt-5">
      <div className="mb-4">
        <h2>{screening.title}</h2>
        <p><strong>Cinema:</strong> {screening.cinema?.name}</p>
        <p><strong>Time:</strong> {new Date(screening.startTime).toLocaleString()}</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="seat-selection-container">
        <div className="screen">SCREEN</div>
        <div className="seats-grid">
          {Array.from({ length: screening.cinema!.rows }, (_, rowIdx) => (
            <div key={rowIdx} className="seats-row">
              <span className="row-label">Row {rowIdx + 1}</span>
              {Array.from({ length: screening.cinema!.seatsPerRow }, (_, seatIdx) => {
                const seatKey = `${rowIdx + 1}-${seatIdx + 1}`;
                const reserved = isReserved(rowIdx + 1, seatIdx + 1);
                const mine = isMyReservation(rowIdx + 1, seatIdx + 1);
                const reserving = reservingSeats.has(seatKey);

                return (
                  <button
                    key={seatIdx}
                    onClick={() => handleSeatClick(rowIdx + 1, seatIdx + 1)}
                    disabled={reserved && !mine}
                    className={`seat ${mine ? 'my-seat' : ''} ${reserved && !mine ? 'reserved' : ''} ${reserving ? 'reserving' : ''}`}
                    title={`Row ${rowIdx + 1}, Seat ${seatIdx + 1}`}
                  >
                    {seatIdx + 1}
                  </button>
                );
              })}
              <span className="row-label">Row {rowIdx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="d-flex gap-2 mb-3">
          <div><span className="seat available"></span> Available</div>
          <div><span className="seat my-seat"></span> My Reservation</div>
          <div><span className="seat reserved"></span> Reserved</div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/screenings')}>
          Back to Screenings
        </button>
      </div>
    </div>
  );
};
