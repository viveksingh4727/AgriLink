import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (_error) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const handleNotificationClick = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((c) => c.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (_e) {}
  };

  const navItems = user?.role === "farmer"
    ? [
        { to: "/farmer", label: "Dashboard", icon: "📊" },
        { to: "/my-listings", label: "My Listings", icon: "📦" },
        { to: "/marketplace", label: "Marketplace", icon: "🏪" },
        { to: "/weather", label: "Weather", icon: "🌤️" },
      ]
    : user?.role === "buyer"
      ? [
          { to: "/buyer", label: "Dashboard", icon: "📊" },
          { to: "/marketplace", label: "Marketplace", icon: "🏪" },
          { to: "/my-orders", label: "My Orders", icon: "🛒" },
          { to: "/weather", label: "Weather", icon: "🌤️" },
        ]
      : [
          { to: "/marketplace", label: "Marketplace", icon: "🏪" },
          { to: "/weather", label: "Weather", icon: "🌤️" },
          { to: "/login", label: "Login", icon: "🔑" },
          { to: "/register", label: "Register", icon: "📝" },
        ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-surface-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to={user ? (user.role === "farmer" ? "/farmer" : "/buyer") : "/marketplace"}
              className="flex items-center gap-3 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-400 text-lg font-bold text-white shadow-sm group-hover:shadow-glow transition-shadow duration-300">
                🌾
              </div>
              <div className="hidden sm:block">
                <p className="text-base font-bold text-surface-900 leading-tight">AgriLink AI</p>
                <p className="text-[10px] font-medium text-surface-400 uppercase tracking-widest">Smart Marketplace</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotifOpen((c) => !c)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-600 hover:bg-surface-50 transition-colors"
                  >
                    <span className="text-base">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white animate-pulse-soft">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-surface-200 bg-white p-3 shadow-lg animate-scale-in">
                        <p className="mb-2 text-sm font-bold text-surface-900">Notifications</p>
                        <div className="max-h-72 space-y-1.5 overflow-y-auto">
                          {notifications.length === 0 && (
                            <p className="py-4 text-center text-sm text-surface-400">No notifications yet</p>
                          )}
                          {notifications.map((n) => (
                            <button
                              key={n._id}
                              type="button"
                              onClick={() => handleNotificationClick(n._id)}
                              className={`w-full rounded-lg p-3 text-left text-sm transition-colors ${
                                n.read ? "text-surface-500 hover:bg-surface-50" : "bg-brand-50 text-surface-800 font-medium hover:bg-brand-100"
                              }`}
                            >
                              {n.message}
                              <span className="mt-1 block text-xs text-surface-400">
                                {new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-surface-800 to-surface-900 text-sm font-bold text-white hover:shadow-lg transition-shadow"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="hidden sm:flex btn-secondary !py-2 !px-4 !text-xs"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary !py-2 !px-5 !text-xs">
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileOpen((c) => !c)}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50"
              >
                {mobileOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-surface-200 bg-white animate-slide-down">
            <nav className="mx-auto max-w-7xl px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-surface-600 hover:bg-surface-50"
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <span className="text-lg">🚪</span>
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
