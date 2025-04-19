import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { CalendarIcon, ClockIcon, PhoneIcon, AtSymbolIcon, UserIcon, LogOutIcon, CalendarDaysIcon, XIcon, CheckIcon, XCircleIcon } from "@heroicons/react/outline";

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
  
      setIsCancelling(true);
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
      setIsCancelling(false);
      setShowCancelConfirm(false);
      setReservationToCancel(null);
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

  const getStatusBadgeClass = (status) => {
    switch(status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Auth Controls */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Make a Reservation</h2>
          
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={toggleProfileDropdown}
                className="flex items-center px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                  {userData?.name?.charAt(0).toUpperCase() || userData?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-700">{userData?.name || userData?.email?.split('@')[0]}</span>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-800">{userData?.name || userData?.email?.split('@')[0]}</p>
                    <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      onClick={toggleReservations}
                      className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                    >
                      <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-500" />
                      {showReservations ? "Hide" : "View"} My Reservations
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                    >
                      <LogOutIcon className="h-5 w-5 mr-2 text-gray-500" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Sign In / Register
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Reservation Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Book Your Table</h3>
              <p className="text-gray-600">Please fill in the form below to reserve your table</p>
            </div>

            {!isAuthenticated && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-blue-800">Please sign in to make a reservation</p>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="text-blue-600 font-medium hover:underline mt-1"
                  >
                    Sign in or create an account
                  </button>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100 flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-green-800">
                  Signed in as <span className="font-medium">{userData?.name || userData?.email?.split('@')[0]}</span>
                </p>
              </div>
            )}

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isAuthenticated}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!isAuthenticated}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Date
                    </div>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={!isAuthenticated}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Time
                    </div>
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={!isAuthenticated}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <AtSymbolIcon className="h-4 w-4 mr-1 text-gray-500" />
                    Email
                  </div>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isAuthenticated}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-500" />
                    Phone Number
                  </div>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isAuthenticated}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                  placeholder="Phone Number"
                />
              </div>

              <button
                type="submit"
                onClick={handleReservation}
                disabled={!isAuthenticated}
                className={`w-full py-3 px-6 flex items-center justify-center rounded-lg font-medium transition-colors ${
                  isAuthenticated
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isAuthenticated ? "Book Table" : "Sign in to Book"}
              </button>
            </form>
          </div>

          {/* Image or My Reservations */}
          <div className="relative">
            {showReservations ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">My Reservations</h3>
                  <button
                    onClick={toggleReservations}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
                  {isLoading ? (
                    <div className="p-8 flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : userReservations.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {userReservations.map((reservation) => (
                        <div key={reservation._id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {reservation.firstName} {reservation.lastName}
                              </h4>
                              <p className="text-sm text-gray-500">{formatDate(reservation.date)} at {reservation.time}</p>
                            </div>
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(reservation.status)}`}
                            >
                              {reservation.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {reservation.phone}
                            </div>
                            <div className="flex items-center">
                              <AtSymbolIcon className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="truncate">{reservation.email}</span>
                            </div>
                          </div>

                          {reservation.status === 'canceled' && reservation.updatedAt && (
                            <p className="text-xs text-gray-500 italic">
                              Cancelled on: {new Date(reservation.updatedAt).toLocaleString()}
                            </p>
                          )}

                          {reservation.status !== 'canceled' && (
                            <button
                              onClick={() => handleCancelClick(reservation._id)}
                              disabled={isCancelling && reservationToCancel === reservation._id}
                              className="text-sm flex items-center text-red-600 hover:text-red-800 font-medium"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              {isCancelling && reservationToCancel === reservation._id ? (
                                <span className="flex items-center">
                                  <div className="animate-spin h-3 w-3 mr-2 border-2 border-red-600 border-t-transparent rounded-full"></div>
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
                    <div className="p-8 text-center">
                      <div className="bg-gray-100 rounded-full p-3 inline-flex justify-center mb-4">
                        <CalendarDaysIcon className="h-8 w-8 text-gray-500" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-1">No reservations yet</h4>
                      <p className="text-gray-600">Book your first table to get started</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full rounded-xl overflow-hidden shadow-sm relative">
                <img
                  src="/reservation.png"
                  alt="Restaurant ambiance"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Reserve Your Experience</h3>
                  <p className="text-white/90 mb-4">Enjoy exceptional dining in our elegant atmosphere</p>
                  {isAuthenticated && (
                    <button 
                      onClick={toggleReservations}
                      className="bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
                    >
                      <CalendarDaysIcon className="h-5 w-5 mr-2" />
                      View My Reservations
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isLogin ? "Sign In" : "Create Account"}
                  </h2>
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <XIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                
                <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {isLogin ? "Sign In" : "Create Account"}
                  </button>
                </form>
                
                <div className="mt-6 text-center text-sm text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="ml-1 text-blue-600 font-medium hover:underline"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Cancel Reservation</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to cancel this reservation? This action cannot be undone.</p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={confirmCancel}
                  className="py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Reservation;