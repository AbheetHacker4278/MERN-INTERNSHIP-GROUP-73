import React, { useState, useEffect } from "react";
import "./NavbarPremium.css";
import { data } from "../restApi.json";
import { Link } from "react-scroll";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Scroll effect for navbar glass blur
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if user is logged in (cookie-based auth via /api/me)
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { }
    }
    axios.get("/api/me", { withCredentials: true })
      .then(({ data }) => { if (data.success) setUser(data.user); })
      .catch(() => { localStorage.removeItem("user"); setUser(null); });
  }, []);

  const handleLogout = async () => {
    await axios.get("/api/logout", { withCredentials: true });
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <nav className={`navbar-premium ${scrolled ? "navbar-scrolled" : ""}`}>
      {/* Brand */}
      <div className="nav-brand">
        <span className="brand-icon">🍽️</span>
        <span className="brand-text">RESTRO<span className="brand-accent">BOOK</span></span>
      </div>

      {/* Desktop + Mobile Drawer Links */}
      <div className={`nav-links-desktop ${show ? "nav-mobile-open" : ""}`}>

        {/* ── Page scroll links ── */}
        <div className="nav-links-list">
          {data[0].navbarLinks.map((el) => (
            <Link
              key={el.id}
              to={el.link}
              spy smooth
              duration={500}
              offset={-80}
              className="nav-link"
              onClick={() => setShow(false)}
            >
              {el.title}
            </Link>
          ))}
        </div>

        {/* ── Action buttons ── */}
        <div className="nav-actions">

          {/* ═══ ADMIN BUTTONS (only when admin is logged in) ═══ */}
          {isAdmin && (
            <div className="nav-admin-group">
              {/* Admin badge label */}
              <span className="nav-admin-label">🔐 ADMIN</span>

              {/* ⚙️ Admin Dashboard */}
              <button
                className="nav-btn-admin"
                onClick={() => { navigate("/admin"); setShow(false); }}
                title="Admin Dashboard"
              >
                ⚙️ Dashboard
              </button>

              {/* 📋 All Reservations */}
              <button
                className="nav-btn-admin nav-btn-admin--reservations"
                onClick={() => { navigate("/admin?tab=reservations"); setShow(false); }}
                title="View All Reservations"
              >
                📋 All Reservations
              </button>

              {/* 👥 All Users */}
              <button
                className="nav-btn-admin nav-btn-admin--users"
                onClick={() => { navigate("/admin?tab=users"); setShow(false); }}
                title="View All Users"
              >
                👥 All Users
              </button>
            </div>
          )}

          {/* ═══ USER SECTION ═══ */}
          {user ? (
            <div className="nav-user-group">
              <span className="nav-user-name">
                {isAdmin ? "🛡️" : "👤"} {user.name || user.email?.split("@")[0]}
              </span>
              <button className="nav-btn-outline" onClick={() => { handleLogout(); setShow(false); }}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                className="nav-btn-outline"
                onClick={() => { navigate("/login"); setShow(false); }}
              >
                Login
              </button>
              <button
                className="nav-btn-primary"
                onClick={() => { navigate("/signup"); setShow(false); }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hamburger */}
      <button
        className="nav-hamburger"
        onClick={() => setShow(!show)}
        aria-label="Toggle menu"
      >
        {show ? <IoClose /> : <GiHamburgerMenu />}
      </button>

      {/* Mobile overlay */}
      {show && <div className="nav-overlay" onClick={() => setShow(false)} />}
    </nav>
  );
};

export default Navbar;
