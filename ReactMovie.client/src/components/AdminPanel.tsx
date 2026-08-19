import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Screening, Cinema, User } from '../types/index';

export const AdminPanel: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'screenings' | 'users'>('screenings');
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [cinemaId, setCinemaId] = useState('');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        const [screeningsData, cinemasData, usersData] = await Promise.all([
          api.getScreenings(),
          api.getCinemas(),
          api.getAllUsers()
        ]);
        setScreenings(screeningsData.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
        setCinemas(cinemasData);
        setUsers(usersData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, navigate]);

  const handleCreateScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!cinemaId || !title || !startTime) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const newScreening = await api.createScreening(parseInt(cinemaId), title, new Date(startTime).toISOString());
      setScreenings([...screenings, newScreening].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
      setCinemaId('');
      setTitle('');
      setStartTime('');
      setSuccess('Screening created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create screening');
    }
  };

  const handleDeleteScreening = async (id: number) => {
    setDeletingId(id);
    try {
      await api.deleteScreening(id);
      setScreenings(screenings.filter(s => s.id !== id));
      setSuccess('Screening deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete screening');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteUser = async (id: number) => {
    setDeletingUserId(id);
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  if (authLoading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Panel</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'screenings' ? 'active' : ''}`}
            onClick={() => setActiveTab('screenings')}
            type="button"
            role="tab"
          >
            Screenings
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            type="button"
            role="tab"
          >
            Users
          </button>
        </li>
      </ul>

      {activeTab === 'screenings' && (
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Create New Screening</h5>
                <form onSubmit={handleCreateScreening}>
                  <div className="mb-3">
                    <label htmlFor="cinema" className="form-label">
                      Cinema
                    </label>
                    <select
                      id="cinema"
                      className="form-control"
                      value={cinemaId}
                      onChange={(e) => setCinemaId(e.target.value)}
                      required
                    >
                      <option value="">Select Cinema</option>
                      {cinemas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.rows}x{c.seatsPerRow})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Film Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="startTime" className="form-label">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      className="form-control"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Create Screening
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Screenings</h5>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Cinema</th>
                        <th>Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {screenings.map((screening) => (
                        <tr key={screening.id}>
                          <td>{screening.title}</td>
                          <td>{screening.cinema?.name}</td>
                          <td>{new Date(screening.startTime).toLocaleString()}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteScreening(screening.id)}
                              disabled={deletingId === screening.id}
                            >
                              {deletingId === screening.id ? '...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Manage Users</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Admin</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.firstName} {u.lastName}</td>
                          <td>{u.phoneNumber}</td>
                          <td>{u.isAdmin ? '✓ Yes' : 'No'}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={() => navigate(`/profile/${u.id}`)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deletingUserId === u.id}
                            >
                              {deletingUserId === u.id ? '...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
