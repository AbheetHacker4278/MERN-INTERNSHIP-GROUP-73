import React, { useState, useEffect } from "react";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Reservation = () => {
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");

  // Auth states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Reservation states
  const [userReservations, setUserReservations] = useState([]);
  const [showReservations, setShowReservations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const navigate = useNavigate();

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data } = await axios.get("https://mern-internship-group-73-1.onrender.com/api/me", {
        withCredentials: true,
      });
      if (data.success) {
        setIsAuthenticated(true);
        setUserData(data.user);
        if (data.user?.email) setEmail(data.user.email);
        fetchUserReservations();
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

  const fetchUserReservations = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("https://mern-internship-group-73-1.onrender.com/api/reservations", {
        withCredentials: true,
      });
      console.log("Reservations data:", data); // Debug log
      if (data.success) setUserReservations(data.reservations);
    } catch (error) {
      toast.error("Failed to load reservations");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (reservationId) => {
    setReservationToCancel(reservationId);
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    try {
      // Optimistic update
      setUserReservations(prev =>
        prev.map(res =>
          res._id === reservationToCancel
            ? { ...res, status: 'canceled', updatedAt: new Date().toISOString() }
            : res
        )
      );
  
      setIsLoading(true);
      const { data } = await axios.delete(
        `https://mern-internship-group-73-1.onrender.com/api/reservations/${reservationToCancel}`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success(data.message);
      // Refresh data from server to ensure consistency
      await fetchUserReservations();
    } catch (error) {
      console.error('Cancellation error:', error.response?.data || error.message);
      
      // Revert optimistic update on error
      setUserReservations(prev =>
        prev.map(res =>
          res._id === reservationToCancel
            ? { 
                ...res, 
                status: error.response?.data?.originalStatus || 'confirmed',
                updatedAt: res.updatedAt // Keep original updatedAt
              }
            : res
        )
      );
      
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Cancellation failed. Please try again."
      );
    } finally {
      setIsLoading(false);
      setShowCancelConfirm(false);
      setReservationToCancel(null);
      setIsCancelling(true);
// ... then in finally:
      setIsCancelling(false);
    }
  };

  const handleReservation = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to make a reservation");
      setShowAuthModal(true);
      return;
    }

    if (!firstName || !lastName || !email || !date || !time || !phone) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const { data } = await axios.post(
        "https://mern-internship-group-73-1.onrender.com/api/v1/reservation/send",
        { firstName, lastName, email, phone, date, time },
        { withCredentials: true }
      );

      toast.success(data.message);
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail(userData?.email || "");
      setTime("");
      setDate("");
      fetchUserReservations();
      navigate("/success");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reservation failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "https://mern-internship-group-73-1.onrender.com/api/login",
        { email: username, password },
        { withCredentials: true }
      );
      toast.success("Login successful!");
      setShowAuthModal(false);
      await checkAuthStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      const { data } = await axios.post(
        "https://mern-internship-group-73-1.onrender.com/api/signup",
        { name: username.split('@')[0], email: username, password },
        { withCredentials: true }
      );
      toast.success("Registration successful!");
      setShowAuthModal(false);
      await checkAuthStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogout = async () => {
    try {
      await axios.get("https://mern-internship-group-73-1.onrender.com/api/logout", { withCredentials: true });
      toast.success("Logged out successfully");
      setIsAuthenticated(false);
      setUserData(null);
      setEmail("");
      setShowProfileDropdown(false);
      setUserReservations([]);
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const toggleProfileDropdown = () => setShowProfileDropdown(!showProfileDropdown);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleReservations = () => {
    if (!showReservations && userReservations.length === 0) {
      fetchUserReservations();
    }
    setShowReservations(!showReservations);
  };

  return (
    <section className="reservation" id="reservation">
      <div className="container">
        {/* User Profile Dropdown */}
        <div className="flex justify-end p-4 relative">
          {isAuthenticated ? (
            <div className="relative">
              <div
                className="cursor-pointer bg-white rounded-full p-1 shadow-md flex items-center justify-center relative"
                onClick={toggleProfileDropdown}
              >
                <FaUserCircle className="text-yellow-500" size={30} />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {showProfileDropdown && (
                <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg w-64 z-50 overflow-hidden border border-gray-200">
                  <div className="p-4 flex items-center bg-gray-50 border-b border-gray-200">
                    <FaUserCircle className="text-gray-700" size={40} />
                    <div className="ml-3 overflow-hidden">
                      <p className="font-bold text-gray-800">{userData?.name || userData?.email.split('@')[0]}</p>
                      <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
                    </div>
                  </div>

                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition-colors border-b border-gray-200"
                    onClick={toggleReservations}
                  >
                    {showReservations ? "Hide" : "View"} My Reservations
                  </button>

                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors"
              onClick={() => setShowAuthModal(true)}
            >
              Login / Signup
            </button>
          )}
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="auth-modal-overlay">
            <div className="auth-modal">
              <button
                className="close-modal"
                onClick={() => setShowAuthModal(false)}
              >
                &times;
              </button>
              <h2>{isLogin ? "Login" : "Sign Up"}</h2>

              <form onSubmit={isLogin ? handleLogin : handleSignup}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button type="submit" className="auth-submit">
                  {isLogin ? "Login" : "Sign Up"}
                </button>
              </form>

              <p className="auth-toggle">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={toggleAuthMode}
                >
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {showCancelConfirm && (
          <div className="confirmation-modal-overlay">
            <div className="confirmation-modal">
              <h3>Cancel Reservation</h3>
              <p>Are you sure you want to cancel this reservation?</p>
              <div className="modal-buttons">
                <button
                  className="confirm-btn"
                  onClick={confirmCancel}
                >
                  Yes, Cancel
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  No, Keep It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Reservations Section */}
        {isAuthenticated && showReservations && (
          <div className="user-reservations-container">
            <div className="reservations-header">
              <h2>My Reservations</h2>
              <button onClick={toggleReservations} className="close-reservations">
                &times;
              </button>
            </div>

            {isLoading ? (
              <div className="loading-spinner">Loading...</div>
            ) : userReservations.length > 0 ? (
              <div className="reservations-list">
                {userReservations.map((reservation) => (
                  <div key={reservation._id} className="reservation-card">
                    <div className="reservation-header">
                      <h3>{reservation.firstName} {reservation.lastName}</h3>
                      <span className="reservation-date">{formatDate(reservation.date)}</span>
                    </div>
                    <div className="reservation-details">
                      <p><strong>Time:</strong> {reservation.time}</p>
                      <p><strong>Phone:</strong> {reservation.phone}</p>
                      <p><strong>Email:</strong> {reservation.email}</p>
                      <p>
                        <strong>Status:</strong>
                        <span className={`status-${reservation.status.toLowerCase()}`}>
                          {reservation.status}
                        </span>
                      </p>
                      {reservation.status === 'canceled' && reservation.updatedAt && (
                        <p className="cancellation-time">
                          Cancelled on: {new Date(reservation.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {reservation.status !== 'canceled' && (
                      <button
                        onClick={() => handleCancelClick(reservation._id)}
                        className="cancel-reservation-btn"
                        disabled={isCancelling && reservationToCancel === reservation._id}
                      >
                        {isCancelling && reservationToCancel === reservation._id ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Cancelling...
                          </span>
                        ) : (
                          "Cancel Reservation"
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reservations">
                <p>You don't have any reservations yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Reservation Form */}
        <div className="banner">
          <img src="/reservation.png" alt="res" />
        </div>
        <div className="banner">
          <div className="reservation_form_box">
            <h1>MAKE A RESERVATION</h1>
            <p>For Further Questions, Please Call</p>
            {!isAuthenticated && (
              <div className="auth-required-notice">
                <p>Please <button onClick={() => setShowAuthModal(true)}>login or signup</button> to make a reservation</p>
              </div>
            )}
            {isAuthenticated && (
              <div className="auth-success-notice">
                <p>You are logged in as <strong>{userData?.name || userData?.email.split('@')[0]}</strong></p>
              </div>
            )}
            <form>
              <div>
                <input
                  type="text"
                  placeholder="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isAuthenticated}
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isAuthenticated}
                />
              </div>
              <div>
                <input
                  type="date"
                  placeholder="Date *"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={!isAuthenticated}
                />
                <input
                  type="time"
                  placeholder="Time *"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={!isAuthenticated}
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email *"
                  className="email_tag"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isAuthenticated}
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isAuthenticated}
                />
              </div>
              <button
                type="submit"
                onClick={handleReservation}
                className={!isAuthenticated ? "disabled-btn" : ""}
                disabled={!isAuthenticated}
              >
                RESERVE NOW{" "}
                <span>
                  <HiOutlineArrowNarrowRight />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .container {
          position: relative;
        }
        
        /* Auth Modal Styles */
        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .auth-modal {
          background-color: white;
          border-radius: 8px;
          padding: 2rem;
          width: 90%;
          max-width: 400px;
          position: relative;
        }
        
        .close-modal {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        .form-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .auth-submit {
          width: 100%;
          background-color: #f8b400;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 1rem;
        }
        
        .auth-toggle {
          text-align: center;
          margin-top: 1rem;
        }
        
        .toggle-btn {
          background: none;
          border: none;
          color: #f8b400;
          cursor: pointer;
          font-weight: bold;
        }
        
        /* Notices */
        .auth-required-notice {
          background-color: #ffecb3;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .auth-success-notice {
          background-color: #e8f5e9;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-align: center;
          border-left: 4px solid #4CAF50;
        }
        
        .auth-required-notice button {
          background: none;
          border: none;
          color: #f8b400;
          cursor: pointer;
          font-weight: bold;
        }
        
        /* Reservations List */
        .user-reservations-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          overflow: hidden;
        }
        
        .reservations-header {
          background-color: #f8b400;
          color: white;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .close-reservations {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .reservations-list {
          max-height: 400px;
          overflow-y: auto;
          padding: 1rem;
        }
        
        .reservation-card {
          background-color: #f9f9f9;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1rem;
          border-left: 4px solid #f8b400;
        }
        
        .reservation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .reservation-details p {
          margin: 0.3rem 0;
        }
        
        /* Status Styles */
        .status-pending {
          color: #ff9800;
          font-weight: bold;
          text-transform: capitalize;
          margin-left: 5px;
        }

        .status-confirmed {
          color: #4CAF50;
          font-weight: bold;
          text-transform: capitalize;
          margin-left: 5px;
        }

        .status-canceled {
          color: #f44336;
          font-weight: bold;
          text-transform: capitalize;
          margin-left: 5px;
          text-decoration: line-through;
        }

        .cancellation-time {
          color: #888;
          font-size: 0.9rem;
          margin-top: 5px;
          font-style: italic;
        }
        
        /* Cancel Button */
        .cancel-reservation-btn {
          background-color: #ff4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          margin-top: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .cancel-reservation-btn:hover {
          background-color: #cc0000;
        }
        
        /* Confirmation Modal */
        .confirmation-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .confirmation-modal {
          background-color: white;
          border-radius: 8px;
          padding: 2rem;
          width: 90%;
          max-width: 400px;
        }
        
        .modal-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }
        
        .confirm-btn {
          background-color: #ff4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .modal-buttons .cancel-btn {
          background-color: #f8b400;
          color: white;
        }
        
        /* Disabled State */
        .disabled-btn {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        input:disabled {
          background-color: #f2f2f2;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
};

export default Reservation;