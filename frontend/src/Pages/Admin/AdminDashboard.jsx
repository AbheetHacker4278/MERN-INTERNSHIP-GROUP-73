import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AdminDashboard.css";

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "—";

const StatusBadge = ({ status }) => (
    <span className={`status-badge ${status}`}>
        {status === "pending" && "⏳"}
        {status === "confirmed" && "✅"}
        {status === "completed" && "🎉"}
        {status === "canceled" && "❌"}
        {" "}{status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Auth
    const [adminUser, setAdminUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Data
    const [stats, setStats] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [users, setUsers] = useState([]);

    // UI state — default to URL ?tab= param if valid
    const VALID_TABS = ["overview", "reservations", "users"];
    const initialTab = VALID_TABS.includes(searchParams.get("tab"))
        ? searchParams.get("tab")
        : "overview";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortField, setSortField] = useState("createdAt");
    const [sortDir, setSortDir] = useState("desc");

    // Delete modal
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ── Auth Check ───────────────────────────────────────────────────────────
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await axios.get("/api/me", { withCredentials: true });
                if (data.success && data.user?.role === "admin") {
                    setAdminUser(data.user);
                } else {
                    toast.error("Access denied. Admins only.");
                    navigate("/");
                }
            } catch {
                toast.error("Please login as admin.");
                navigate("/login");
            } finally {
                setAuthChecked(true);
            }
        };
        checkAuth();
    }, [navigate]);

    // ── Fetch Stats ──────────────────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/admin/stats", {
                withCredentials: true,
            });
            if (data.success) setStats(data.stats);
        } catch (err) {
            toast.error("Failed to load stats");
        }
    }, []);

    // ── Fetch Reservations ───────────────────────────────────────────────────
    const fetchReservations = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/admin/reservations", {
                withCredentials: true,
            });
            if (data.success) setReservations(data.reservations);
        } catch (err) {
            toast.error("Failed to load reservations");
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch Users ──────────────────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/admin/users", {
                withCredentials: true,
            });
            if (data.success) setUsers(data.users);
        } catch (err) {
            toast.error("Failed to load users");
        }
    }, []);

    // ── Initial Load ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (authChecked && adminUser) {
            fetchStats();
            fetchReservations();
            fetchUsers();
        }
    }, [authChecked, adminUser, fetchStats, fetchReservations, fetchUsers]);

    // ── Update Status ────────────────────────────────────────────────────────
    const handleStatusChange = async (id, newStatus) => {
        try {
            const { data } = await axios.put(
                `/api/admin/reservations/${id}`,
                { status: newStatus },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(`Status updated to "${newStatus}"`);
                setReservations((prev) =>
                    prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
                );
                fetchStats();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const { data } = await axios.delete(
                `/api/admin/reservations/${deleteTarget}`,
                { withCredentials: true }
            );
            if (data.success) {
                toast.success("Reservation deleted");
                setReservations((prev) => prev.filter((r) => r._id !== deleteTarget));
                fetchStats();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        } finally {
            setDeleteTarget(null);
        }
    };

    // ── Logout ───────────────────────────────────────────────────────────────
    const handleLogout = async () => {
        await axios.get("/api/logout", { withCredentials: true });
        toast.success("Logged out");
        navigate("/login");
    };

    // ── Filtered + Sorted Reservations ───────────────────────────────────────
    const filteredReservations = reservations
        .filter((r) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                r.firstName?.toLowerCase().includes(q) ||
                r.lastName?.toLowerCase().includes(q) ||
                r.email?.toLowerCase().includes(q) ||
                r.phone?.includes(q);
            const matchStatus =
                filterStatus === "all" || r.status === filterStatus;
            return matchSearch && matchStatus;
        })
        .sort((a, b) => {
            let va = a[sortField] || "";
            let vb = b[sortField] || "";
            if (sortField === "createdAt" || sortField === "date") {
                va = new Date(va);
                vb = new Date(vb);
            } else {
                va = String(va).toLowerCase();
                vb = String(vb).toLowerCase();
            }
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

    const toggleSort = (field) => {
        if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortField(field); setSortDir("asc"); }
    };

    const sortArrow = (field) =>
        sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : " ⇅";

    // ── Render ───────────────────────────────────────────────────────────────
    if (!authChecked) {
        return (
            <div className="admin-loading" style={{ minHeight: "100vh", background: "#0f1117" }}>
                <div className="admin-spinner" />
                <span>Authenticating…</span>
            </div>
        );
    }

    if (!adminUser) return null;

    return (
        <div className="admin-root">
            {/* ── Sidebar ── */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <h2>🍽️ Admin Panel</h2>
                    <p>Restaurant Management</p>
                </div>

                <nav className="admin-nav">
                    {[
                        { id: "overview", icon: "📊", label: "Overview" },
                        { id: "reservations", icon: "📅", label: "Reservations" },
                        { id: "users", icon: "👥", label: "Users" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="admin-main">
                {/* Topbar */}
                <div className="admin-topbar">
                    <h1>
                        {activeTab === "overview" && "Dashboard Overview"}
                        {activeTab === "reservations" && "Manage Reservations"}
                        {activeTab === "users" && "All Users"}
                    </h1>
                    <div className="admin-topbar-right">
                        <span className="admin-user-badge">
                            👤 {adminUser.name || adminUser.email}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="admin-content">

                    {/* ══════ OVERVIEW TAB ══════ */}
                    {activeTab === "overview" && (
                        <>
                            {/* Stats */}
                            <div className="admin-stats-grid">
                                {[
                                    { cls: "total", icon: "📋", label: "Total Bookings", val: stats?.total },
                                    { cls: "pending", icon: "⏳", label: "Pending", val: stats?.pending },
                                    { cls: "confirmed", icon: "✅", label: "Confirmed", val: stats?.confirmed },
                                    { cls: "completed", icon: "🎉", label: "Completed", val: stats?.completed },
                                    { cls: "canceled", icon: "❌", label: "Canceled", val: stats?.canceled },
                                    { cls: "users", icon: "👥", label: "Total Users", val: stats?.totalUsers },
                                ].map(({ cls, icon, label, val }) => (
                                    <div key={cls} className={`stat-card ${cls}`}>
                                        <div className="stat-icon">{icon}</div>
                                        <div className="stat-label">{label}</div>
                                        <div className="stat-value">
                                            {val !== undefined ? val : <span style={{ fontSize: "1rem" }}>…</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent reservations */}
                            <div className="admin-panel">
                                <div className="admin-panel-header">
                                    <h2>📌 Recent Bookings</h2>
                                    <button
                                        className="admin-view-all-btn"
                                        onClick={() => setActiveTab("reservations")}
                                        title="View all reservations"
                                    >
                                        📋 View All Reservations
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="admin-loading"><div className="admin-spinner" /><span>Loading…</span></div>
                                ) : reservations.slice(0, 5).length === 0 ? (
                                    <div className="admin-empty">
                                        <div className="empty-icon">📭</div>
                                        <p>No reservations yet</p>
                                    </div>
                                ) : (
                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Guest</th>
                                                    <th>Date</th>
                                                    <th>Time</th>
                                                    <th>Status</th>
                                                    <th>Booked On</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reservations.slice(0, 5).map((r) => (
                                                    <tr key={r._id}>
                                                        <td>
                                                            <div style={{ fontWeight: 600, color: "#f1f5f9" }}>
                                                                {r.firstName} {r.lastName}
                                                            </div>
                                                            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{r.email}</div>
                                                        </td>
                                                        <td>{formatDate(r.date)}</td>
                                                        <td>{r.time}</td>
                                                        <td><StatusBadge status={r.status} /></td>
                                                        <td>{formatDate(r.createdAt)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ══════ RESERVATIONS TAB ══════ */}
                    {activeTab === "reservations" && (
                        <div className="admin-panel">
                            <div className="admin-panel-header">
                                <h2>📅 All Reservations ({filteredReservations.length})</h2>
                                <div className="admin-controls">
                                    <input
                                        className="admin-search"
                                        placeholder="🔍 Search name, email, phone…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <select
                                        className="admin-filter"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="canceled">Canceled</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="admin-loading"><div className="admin-spinner" /><span>Loading…</span></div>
                            ) : filteredReservations.length === 0 ? (
                                <div className="admin-empty">
                                    <div className="empty-icon">🔍</div>
                                    <p>No reservations match your filters</p>
                                </div>
                            ) : (
                                <div className="admin-table-wrap">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th onClick={() => toggleSort("firstName")}>Guest{sortArrow("firstName")}</th>
                                                <th>Contact</th>
                                                <th onClick={() => toggleSort("date")}>Date{sortArrow("date")}</th>
                                                <th>Time</th>
                                                <th onClick={() => toggleSort("status")}>Status{sortArrow("status")}</th>
                                                <th>Change Status</th>
                                                <th onClick={() => toggleSort("createdAt")}>Booked On{sortArrow("createdAt")}</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReservations.map((r) => (
                                                <tr key={r._id}>
                                                    <td>
                                                        <div style={{ fontWeight: 600, color: "#f1f5f9" }}>
                                                            {r.firstName} {r.lastName}
                                                        </div>
                                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                                            {r.user?.email || r.email}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>{r.email}</div>
                                                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{r.phone}</div>
                                                    </td>
                                                    <td>{formatDate(r.date)}</td>
                                                    <td>{r.time}</td>
                                                    <td><StatusBadge status={r.status} /></td>
                                                    <td>
                                                        <select
                                                            className="status-select"
                                                            value={r.status}
                                                            onChange={(e) => handleStatusChange(r._id, e.target.value)}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="canceled">Canceled</option>
                                                        </select>
                                                    </td>
                                                    <td>{formatDate(r.createdAt)}</td>
                                                    <td>
                                                        <div className="action-btns">
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() => setDeleteTarget(r._id)}
                                                                title="Delete reservation"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════ USERS TAB ══════ */}
                    {activeTab === "users" && (
                        <div className="admin-panel">
                            <div className="admin-panel-header">
                                <h2>👥 All Users ({users.length})</h2>
                            </div>
                            {users.length === 0 ? (
                                <div className="admin-loading"><div className="admin-spinner" /><span>Loading…</span></div>
                            ) : (
                                <div className="admin-table-wrap">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u._id}>
                                                    <td>
                                                        <span
                                                            className="user-avatar"
                                                            style={{ fontSize: "0.75rem" }}
                                                        >
                                                            {(u.name || u.email || "?")[0].toUpperCase()}
                                                        </span>
                                                        <span style={{ fontWeight: 600, color: "#f1f5f9" }}>
                                                            {u.name || "—"}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: "#94a3b8" }}>{u.email}</td>
                                                    <td>
                                                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                                                    </td>
                                                    <td style={{ color: "#64748b" }}>{formatDate(u.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>🗑️ Delete Reservation</h3>
                        <p>
                            This action is <strong>permanent</strong> and cannot be undone.
                            <br />Are you sure you want to delete this reservation?
                        </p>
                        <div className="admin-modal-btns">
                            <button className="btn-confirm" onClick={handleDelete}>
                                Yes, Delete
                            </button>
                            <button
                                className="btn-cancel-modal"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
