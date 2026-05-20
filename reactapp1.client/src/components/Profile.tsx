import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [rowVersion, setRowVersion] = useState<string | undefined>();
  const [targetUserId, setTargetUserId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || (user.id !== parseInt(id!) && !user.isAdmin)) {
      navigate('/');
      return;
    }

    setTargetUserId(parseInt(id!));

    const loadUser = async () => {
      try {
        const userData = await api.getUser(parseInt(id!));
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setPhoneNumber(userData.phoneNumber);
        setRowVersion(userData.rowVersion);
      } catch (err) {
        setError('Failed to load user data');
      }
    };

    loadUser();
  }, [id, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedUser = await updateUser(parseInt(id!), firstName, lastName, phoneNumber, password || undefined, rowVersion);
      setRowVersion(updatedUser?.rowVersion);
      setSuccess('Profile updated successfully');
      setPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('This profile was modified by someone else. Please refresh the page and try again.');
      } else {
        setError(err.response?.data?.error || 'Update failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Edit Profile</h2>
              {user?.id !== targetUserId && user?.isAdmin && (
                <div className="alert alert-info mb-3">
                  You are editing another user's profile
                </div>
              )}
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
