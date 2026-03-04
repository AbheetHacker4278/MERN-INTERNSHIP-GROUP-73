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
      const { data } = await axios.get("/api/me", {
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
      const { data } = await axios.get("/api/reservations", {
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
        `/api/reservations/${reservationToCancel}`,
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
        "/api/v1/reservation/send",
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
        "/api/login",
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
        "/api/signup",
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
      await axios.get("/api/logout", { withCredentials: true });
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

      {/* ── My Reservations Slide-Panel ── */}
      {isAuthenticated && showReservations && (
        <div className="res-panel-overlay" onClick={toggleReservations}>
          <div className="res-panel" onClick={e => e.stopPropagation()}>
            <div className="res-panel-header">
              <div>
                <h2>📋 My Reservations</h2>
                <p>{userReservations.length} booking{userReservations.length !== 1 ? "s" : ""}</p>
              </div>
              <button className="res-panel-close" onClick={toggleReservations}>✕</button>
            </div>

            <div className="res-panel-body">
              {isLoading ? (
                <div className="res-spinner-wrap">
                  <div className="res-spinner" />
                  <span>Loading reservations…</span>
                </div>
              ) : userReservations.length === 0 ? (
                <div className="res-empty">
                  <div className="res-empty-icon">🍽️</div>
                  <p>No reservations yet.</p>
                  <span>Book your first table below!</span>
                </div>
              ) : (
                userReservations.map((r) => (
                  <div key={r._id} className={`res-card res-card--${r.status}`}>
                    <div className="res-card-top">
                      <div>
                        <strong>{r.firstName} {r.lastName}</strong>
                        <span className={`res-status res-status--${r.status}`}>
                          {r.status === "pending" && "⏳"}
                          {r.status === "confirmed" && "✅"}
                          {r.status === "completed" && "🎉"}
                          {r.status === "canceled" && "❌"}
                          {" "}{r.status}
                        </span>
                      </div>
                      <span className="res-card-date">{formatDate(r.date)}</span>
                    </div>
                    <div className="res-card-details">
                      <span>🕐 {r.time}</span>
                      <span>📞 {r.phone}</span>
                      <span>✉️ {r.email}</span>
                    </div>
                    {r.status === "canceled" && r.updatedAt && (
                      <p className="res-card-cancelled-on">
                        Cancelled: {new Date(r.updatedAt).toLocaleString()}
                      </p>
                    )}
                    {r.status !== "canceled" && (
                      <button
                        className="res-cancel-btn"
                        onClick={() => handleCancelClick(r._id)}
                        disabled={isCancelling && reservationToCancel === r._id}
                      >
                        {isCancelling && reservationToCancel === r._id
                          ? "Cancelling…"
                          : "Cancel Reservation"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Auth Modal ── */}
      {showAuthModal && (
        <div className="rmodal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="rmodal" onClick={e => e.stopPropagation()}>
            <button className="rmodal-close" onClick={() => setShowAuthModal(false)}>✕</button>
            <div className="rmodal-icon">🍽️</div>
            <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p>{isLogin ? "Login to book your table" : "Sign up to get started"}</p>

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="rmodal-form">
              <div className="rmodal-field">
                <label>Email</label>
                <input type="email" value={username} onChange={e => setUsername(e.target.value)} required placeholder="your@email.com" />
              </div>
              <div className="rmodal-field">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              {!isLogin && (
                <div className="rmodal-field">
                  <label>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
                </div>
              )}
              <button type="submit" className="rmodal-submit">
                {isLogin ? "Login" : "Sign Up"}
              </button>
            </form>

            <p className="rmodal-toggle">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={toggleAuthMode}>{isLogin ? "Sign Up" : "Login"}</button>
            </p>
          </div>
        </div>
      )}

      {/* ── Cancel Confirm Modal ── */}
      {showCancelConfirm && (
        <div className="rmodal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="rmodal rmodal--sm" onClick={e => e.stopPropagation()}>
            <div className="rmodal-icon">⚠️</div>
            <h2>Cancel Reservation?</h2>
            <p>This action cannot be undone.</p>
            <div className="rmodal-actions">
              <button className="rmodal-danger" onClick={confirmCancel}>Yes, Cancel It</button>
              <button className="rmodal-ghost" onClick={() => setShowCancelConfirm(false)}>Keep It</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MAIN RESERVATION SECTION
      ══════════════════════════════════════ */}
      <div className="res-hero">

        {/* Left — Info Panel */}
        <div className="res-info">
          <div className="res-info-badge">Book a Table</div>
          <h1 className="res-info-title">
            Reserve Your<br />
            <span>Perfect Evening</span>
          </h1>
          <p className="res-info-desc">
            Experience fine dining at its best. Let us host you for an unforgettable evening of great food, ambiance, and service.
          </p>

          <div className="res-info-features">
            {[
              { icon: "🕐", text: "Flexible Timings" },
              { icon: "🍷", text: "Premium Dining" },
              { icon: "👨‍🍳", text: "Expert Chefs" },
              { icon: "✨", text: "Special Occasions" },
            ].map(f => (
              <div key={f.text} className="res-feature">
                <span className="res-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {isAuthenticated && userData?.role !== "admin" && (
            <button className="res-view-btn" onClick={toggleReservations}>
              📋 View My Reservations
              {userReservations.length > 0 && (
                <span className="res-view-badge">{userReservations.length}</span>
              )}
            </button>
          )}
        </div>

        {/* Right — Form / Admin Panel */}
        <div className="res-form-wrap">

          {userData?.role === "admin" ? (
            /* ── Admin View ── */
            <div className="res-form-card res-admin-card">
              <div className="res-admin-icon">⚙️</div>
              <h2>Admin Mode</h2>
              <p>Admins manage reservations — they don't make them.</p>
              <div className="res-admin-btns">
                <button className="res-admin-primary" onClick={() => navigate("/admin?tab=reservations")}>
                  📋 All Reservations
                </button>
                <button className="res-admin-secondary" onClick={() => navigate("/admin")}>
                  ⚙️ Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* ── User Booking Form ── */
            <div className="res-form-card">
              <div className="res-form-header">
                <h2>Make a Reservation</h2>
                <p>Fill in your details below</p>
              </div>

              {/* Login notice */}
              {!isAuthenticated && (
                <div className="res-notice res-notice--warn">
                  <span>🔒</span>
                  <span>Please <button onClick={() => setShowAuthModal(true)}>login or signup</button> to reserve a table</span>
                </div>
              )}

              {/* Logged-in notice */}
              {isAuthenticated && (
                <div className="res-notice res-notice--ok">
                  <span>✅</span>
                  <span>Logged in as <strong>{userData?.name || userData?.email?.split("@")[0]}</strong></span>
                </div>
              )}

              <form className="res-form" onSubmit={handleReservation}>
                <div className="res-form-row">
                  <div className="res-field">
                    <label>First Name</label>
                    <input type="text" placeholder="John" value={firstName}
                      onChange={e => setFirstName(e.target.value)} disabled={!isAuthenticated} />
                  </div>
                  <div className="res-field">
                    <label>Last Name</label>
                    <input type="text" placeholder="Doe" value={lastName}
                      onChange={e => setLastName(e.target.value)} disabled={!isAuthenticated} />
                  </div>
                </div>

                <div className="res-form-row">
                  <div className="res-field">
                    <label>Date</label>
                    <input type="date" value={date}
                      onChange={e => setDate(e.target.value)} disabled={!isAuthenticated} />
                  </div>
                  <div className="res-field">
                    <label>Time</label>
                    <input type="time" value={time}
                      onChange={e => setTime(e.target.value)} disabled={!isAuthenticated} />
                  </div>
                </div>

                <div className="res-form-row">
                  <div className="res-field">
                    <label>Email</label>
                    <input type="email" placeholder="you@email.com" value={email}
                      onChange={e => setEmail(e.target.value)} disabled={!isAuthenticated} />
                  </div>
                  <div className="res-field">
                    <label>Phone</label>
                    <input type="tel" placeholder="+91 00000 00000" value={phone}
                      onChange={e => setPhone(e.target.value)} disabled={!isAuthenticated} />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`res-submit-btn ${!isAuthenticated ? "res-submit-btn--disabled" : ""}`}
                  disabled={!isAuthenticated}
                >
                  Reserve Now <HiOutlineArrowNarrowRight />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── Inline Styles ── */}
      <style jsx>{`

        /* ══ Section ══ */
        .reservation {
          padding: 0 !important;
          background: linear-gradient(135deg, #fdf6e3 0%, #fff8f0 60%, #fef9f0 100%);
        }

        /* ══ Hero 2-col grid ══ */
        .res-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 40px 60px;
          gap: 60px;
          align-items: center;
        }

        /* ══ Left Info Panel ══ */
        .res-info { display: flex; flex-direction: column; gap: 24px; }

        .res-info-badge {
          display: inline-block;
          width: fit-content;
          padding: 6px 18px;
          background: linear-gradient(135deg, #f8b400, #ff6b35);
          color: #fff;
          border-radius: 50px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .res-info-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.15;
          margin: 0;
          font-family: 'Oswald', sans-serif;
        }

        .res-info-title span { color: #f8b400; }

        .res-info-desc {
          font-size: 1rem;
          color: #666;
          line-height: 1.7;
          max-width: 420px;
        }

        .res-info-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .res-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(248,180,0,0.2);
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #444;
          backdrop-filter: blur(10px);
        }

        .res-feature-icon { font-size: 1.2rem; }

        .res-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
          padding: 12px 24px;
          background: linear-gradient(135deg, #1a1d2e, #2d3258);
          color: #f8b400;
          border: 1px solid rgba(248,180,0,0.3);
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Inter', sans-serif;
        }

        .res-view-btn:hover {
          background: linear-gradient(135deg, #f8b400, #ff6b35);
          color: #fff;
          border-color: transparent;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(248,180,0,0.35);
        }

        .res-view-badge {
          background: #f8b400;
          color: #1a1a1a;
          border-radius: 50px;
          padding: 2px 8px;
          font-size: 0.75rem;
          font-weight: 800;
          min-width: 22px;
          text-align: center;
        }

        /* ══ Right Form Card ══ */
        .res-form-wrap { display: flex; justify-content: center; }

        .res-form-card {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(248,180,0,0.15);
          border-radius: 24px;
          padding: 40px 36px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 60px rgba(248,180,0,0.12), 0 4px 20px rgba(0,0,0,0.06);
          transition: box-shadow 0.3s ease;
        }

        .res-form-card:hover {
          box-shadow: 0 28px 70px rgba(248,180,0,0.18), 0 8px 30px rgba(0,0,0,0.08);
        }

        .res-form-header { margin-bottom: 24px; }
        .res-form-header h2 {
          font-size: 1.6rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 4px;
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .res-form-header p { font-size: 0.85rem; color: #888; margin: 0; }

        /* Notices */
        .res-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .res-notice--warn { background: #fff8e1; border: 1px solid #f8b40040; color: #7a5c00; }
        .res-notice--ok   { background: #f0fdf4; border: 1px solid #22c55e40; color: #166534; }
        .res-notice button {
          background: none; border: none;
          color: #f8b400; font-weight: 700; cursor: pointer; text-decoration: underline;
        }

        /* Form layout */
        .res-form { display: flex; flex-direction: column; gap: 16px; }
        .res-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .res-field { display: flex; flex-direction: column; gap: 6px; }
        .res-field label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .res-field input {
          padding: 11px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #1a1a1a;
          background: #fafafa;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          font-family: 'Inter', sans-serif;
        }
        .res-field input:focus {
          border-color: #f8b400;
          box-shadow: 0 0 0 3px rgba(248,180,0,0.15);
          background: #fff;
        }
        .res-field input:disabled {
          background: #f3f4f6;
          color: #aaa;
          cursor: not-allowed;
          border-color: #e5e7eb;
        }

        .res-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #f8b400, #ff6b35);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 4px;
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          box-shadow: 0 4px 20px rgba(248,180,0,0.35);
        }
        .res-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(248,180,0,0.5);
        }
        .res-submit-btn--disabled {
          background: #d1d5db !important;
          color: #9ca3af !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        /* ══ Admin Card ══ */
        .res-admin-card {
          text-align: center;
          border-top: 4px solid #f8b400;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .res-admin-icon { font-size: 3.5rem; animation: floatIcon 3s ease-in-out infinite; }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .res-admin-card h2 { font-size: 1.8rem; color: #1a1a1a; margin: 0; font-family: 'Oswald', sans-serif; }
        .res-admin-card p { font-size: 0.9rem; color: #666; margin: 0; }
        .res-admin-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
        .res-admin-primary {
          padding: 12px 22px;
          background: linear-gradient(135deg, #f8b400, #ff6b35);
          color: #fff; border: none; border-radius: 10px;
          font-size: 0.88rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s; font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 16px rgba(248,180,0,0.3);
        }
        .res-admin-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(248,180,0,0.4); }
        .res-admin-secondary {
          padding: 12px 22px;
          background: linear-gradient(135deg, #1a1d2e, #2d3258);
          color: #f8b400; border: 1px solid rgba(248,180,0,0.3);
          border-radius: 10px; font-size: 0.88rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;
        }
        .res-admin-secondary:hover { background: linear-gradient(135deg, #2d3258, #3d4278); transform: translateY(-2px); }

        /* ══ My Reservations Slide Panel ══ */
        .res-panel-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex; justify-content: flex-end;
          animation: fadeIn 0.2s ease;
        }
        .res-panel {
          width: 420px; max-width: 95vw;
          background: #fff;
          height: 100vh;
          display: flex; flex-direction: column;
          animation: slideInRight 0.3s ease;
          overflow: hidden;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .res-panel-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 28px 24px 20px;
          background: linear-gradient(135deg, #1a1d2e, #2d3258);
          color: #fff;
          flex-shrink: 0;
        }
        .res-panel-header h2 { font-size: 1.2rem; font-weight: 800; margin: 0 0 4px; color: #f8b400; }
        .res-panel-header p { font-size: 0.8rem; color: #94a3b8; margin: 0; }
        .res-panel-close {
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          color: #fff; border-radius: 8px; width: 34px; height: 34px;
          cursor: pointer; font-size: 14px; transition: background 0.2s; flex-shrink: 0;
        }
        .res-panel-close:hover { background: rgba(255,255,255,0.2); }
        .res-panel-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }

        /* Reservation Card */
        .res-card {
          border-radius: 14px; padding: 18px;
          border-left: 4px solid #f8b400;
          background: #fafafa;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          transition: transform 0.2s;
        }
        .res-card:hover { transform: translateY(-2px); }
        .res-card--canceled { border-left-color: #ef4444; opacity: 0.75; }
        .res-card--confirmed { border-left-color: #22c55e; }
        .res-card--completed { border-left-color: #3b82f6; }

        .res-card-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 12px;
        }
        .res-card-top strong { display: block; font-weight: 700; color: #1a1a1a; font-size: 0.95rem; }
        .res-card-date { font-size: 0.78rem; color: #888; white-space: nowrap; }

        .res-status {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: 50px;
          font-size: 0.7rem; font-weight: 700;
          text-transform: capitalize; margin-top: 4px;
        }
        .res-status--pending   { background: rgba(245,158,11,0.12); color: #d97706; }
        .res-status--confirmed { background: rgba(34,197,94,0.12); color: #16a34a; }
        .res-status--completed { background: rgba(59,130,246,0.12); color: #2563eb; }
        .res-status--canceled  { background: rgba(239,68,68,0.12); color: #dc2626; }

        .res-card-details { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .res-card-details span {
          font-size: 0.78rem; color: #555;
          background: #f1f5f9; border-radius: 6px; padding: 3px 8px;
        }

        .res-card-cancelled-on { font-size: 0.75rem; color: #aaa; font-style: italic; margin: 0 0 8px; }

        .res-cancel-btn {
          width: 100%; padding: 9px;
          background: rgba(239,68,68,0.08); color: #dc2626;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .res-cancel-btn:hover { background: #ef4444; color: #fff; }
        .res-cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Empty & Spinner */
        .res-empty { text-align: center; padding: 60px 20px; color: #aaa; }
        .res-empty-icon { font-size: 3rem; margin-bottom: 12px; }
        .res-empty p { font-size: 1rem; color: #666; margin: 0 0 4px; font-weight: 600; }
        .res-empty span { font-size: 0.85rem; color: #aaa; }

        .res-spinner-wrap { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 60px 0; color: #888; }
        .res-spinner {
          width: 28px; height: 28px; border: 3px solid rgba(248,180,0,0.2);
          border-top-color: #f8b400; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ══ Modals ══ */
        .rmodal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000; animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .rmodal {
          background: #fff; border-radius: 20px; padding: 36px 32px;
          width: 90%; max-width: 420px; text-align: center;
          position: relative; animation: modalPop 0.25s ease;
        }
        .rmodal--sm { max-width: 340px; }
        @keyframes modalPop {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .rmodal-close {
          position: absolute; top: 16px; right: 16px;
          background: #f3f4f6; border: none; border-radius: 8px;
          width: 32px; height: 32px; cursor: pointer; font-size: 13px;
          color: #666; transition: background 0.2s;
        }
        .rmodal-close:hover { background: #e5e7eb; }
        .rmodal-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .rmodal h2 { font-size: 1.3rem; font-weight: 800; color: #1a1a1a; margin: 0 0 6px; }
        .rmodal p { font-size: 0.85rem; color: #888; margin: 0 0 24px; }

        .rmodal-form { text-align: left; display: flex; flex-direction: column; gap: 14px; }
        .rmodal-field { display: flex; flex-direction: column; gap: 5px; }
        .rmodal-field label { font-size: 0.75rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
        .rmodal-field input {
          padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px;
          font-size: 0.9rem; outline: none; transition: border-color 0.2s;
        }
        .rmodal-field input:focus { border-color: #f8b400; box-shadow: 0 0 0 3px rgba(248,180,0,0.12); }

        .rmodal-submit {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #f8b400, #ff6b35);
          color: #fff; border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s; margin-top: 6px;
          box-shadow: 0 4px 16px rgba(248,180,0,0.3);
        }
        .rmodal-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(248,180,0,0.4); }

        .rmodal-toggle { font-size: 0.82rem; color: #888; margin-top: 16px; }
        .rmodal-toggle button { background: none; border: none; color: #f8b400; font-weight: 700; cursor: pointer; }

        .rmodal-actions { display: flex; gap: 10px; justify-content: center; margin-top: 8px; }
        .rmodal-danger {
          padding: 10px 22px; background: #ef4444; color: #fff;
          border: none; border-radius: 8px; font-weight: 700; cursor: pointer;
          transition: all 0.2s;
        }
        .rmodal-danger:hover { background: #dc2626; }
        .rmodal-ghost {
          padding: 10px 22px; background: #f3f4f6; color: #555;
          border: 1px solid #e5e7eb; border-radius: 8px; font-weight: 600; cursor: pointer;
          transition: background 0.2s;
        }
        .rmodal-ghost:hover { background: #e5e7eb; }

        /* ══ Responsive ══ */
        @media (max-width: 900px) {
          .res-hero { grid-template-columns: 1fr; padding: 100px 24px 48px; gap: 40px; }
          .res-form-card { max-width: 100%; }
          .res-info-title { font-size: 2rem; }
        }
        @media (max-width: 480px) {
          .res-form-row { grid-template-columns: 1fr; }
          .res-form-card { padding: 28px 20px; }
        }
      `}</style>
    </section>
  );
};

export default Reservation;

