import React, { useState, useContext, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clientRoute, LOGIN_PATH } from "../../constants/routes";
import {
  Menu,
  X,
  User,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  AlertTriangle,
  Loader2,
  Wallet,
  Plus,
} from "lucide-react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import AnimatedModal from "../common/AnimatedModal";
import { apiCall } from "../../utils/apiCall";
import LoadMoneyModal from "../LoadMoneyModal";

// ── Logout Modal ───────────────────────────────────────────────────────────

const LogoutModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [logoutAll, setLogoutAll] = useState(false);

  const handleConfirm = () => onConfirm(logoutAll);

  const handleClose = () => {
    if (loading) return;
    setLogoutAll(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setLogoutAll(false);
    }
  }, [isOpen]);

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={handleClose}
      closeDisabled={loading}
      maxWidth="max-w-sm"
      backdropClassName="bg-black/50 backdrop-blur-sm"
      panelClassName="bg-primary border border-border rounded-lg shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={18} className="text-red-400" />
          </span>
          <h3 className="text-base font-semibold text-primary-foreground">
            Sign out?
          </h3>
        </div>
        <button
          onClick={handleClose}
          disabled={loading}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-secondary-foreground hover:text-primary-foreground hover:bg-secondary transition-colors disabled:opacity-40"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pb-4 space-y-4">
        <p className="text-sm text-secondary-foreground leading-relaxed">
          You'll be signed out of your current session. Any unsaved changes will
          be lost.
        </p>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Toggle — logout all devices */}
        <button
          type="button"
          onClick={() => setLogoutAll((v) => !v)}
          disabled={loading}
          className="w-full flex items-center justify-between gap-3 group disabled:opacity-50"
        >
          <div className="text-left">
            <p className="text-sm font-medium text-primary-foreground">
              Sign out of all devices
            </p>
            <p className="text-xs text-secondary-foreground mt-0.5">
              Terminates every active session, including mobile and other
              browsers.
            </p>
          </div>

          {/* Toggle pill */}
          <div
            className={`relative flex-shrink-0 w-11 h-6 rounded-full border transition-colors duration-200
                ${logoutAll
                ? "bg-indigo-600 border-indigo-500"
                : "bg-secondary border-border group-hover:border-secondary-foreground/40"
              }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200
                  ${logoutAll ? "translate-x-5" : "translate-x-0"}`}
            />
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-5 py-4 border-t border-border bg-secondary/40">
        <button
          onClick={handleClose}
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-primary hover:bg-secondary text-primary-foreground transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60 shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Signing out…
            </>
          ) : logoutAll ? (
            "Sign out everywhere"
          ) : (
            "Sign out"
          )}
        </button>
      </div>
    </AnimatedModal>
  );
};

// ── Wallet Balance Pill ─────────────────────────────────────────────────────

const WalletBalance = ({ onClick, balance, loading, error }) => {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(balance ?? 0);

  return (
    <button
      onClick={onClick}
      title={error ? "Failed to load balance — click to retry" : "Load wallet balance"}
      className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-border bg-secondary hover:bg-secondary/70 transition-colors"
    >
      <Wallet className="w-4 h-4 text-emerald-500 flex-shrink-0" />

      {loading ? (
        <Loader2 size={13} className="animate-spin text-secondary-foreground" />
      ) : error ? (
        <span className="text-xs font-medium text-red-400">Retry</span>
      ) : (
        <span className="text-sm font-semibold text-primary-foreground tabular-nums">
          {formatted}
        </span>
      )}

      <span className="hidden sm:flex items-center justify-center w-5 h-5 rounded-lg bg-emerald-500/15 group-hover:bg-emerald-500/25 transition-colors">
        <Plus size={12} className="text-emerald-400" />
      </span>
    </button>
  );
};

// ── Navbar ─────────────────────────────────────────────────────────────────

const Navbar = ({
  toggleSidebar,
  isMobile,
  sidebarOpen,
  isDesktopSidebarExpanded,
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState(false);
  const [loadMoneyOpen, setLoadMoneyOpen] = useState(false);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();

  const isSidebarOpen = isMobile ? sidebarOpen : isDesktopSidebarExpanded;

  // Guards against StrictMode double-invoke, overlapping fetches, and
  // setState calls after the component has unmounted.
  const isFetchingBalance = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchBalance = useCallback(async () => {
    if (isFetchingBalance.current) return; // already in flight, skip
    isFetchingBalance.current = true;

    setBalanceLoading(true);
    setBalanceError(false);
    try {
      const response = await apiCall("/transactions/balance", "GET");
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch balance");
      }

      if (isMounted.current) {
        setBalance(data?.data?.balance ?? 0);
      }
    } catch (err) {
      console.error("fetchBalance error:", err);
      if (isMounted.current) {
        setBalanceError(true);
      }
    } finally {
      isFetchingBalance.current = false;
      if (isMounted.current) {
        setBalanceLoading(false);
      }
    }
  }, []);


  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const openLogoutModal = () => {
    setOpenDropdown(false);
    setLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async (logoutAll) => {
    setLoggingOut(true);
    try {
      await logout(logoutAll ? { logout_all: true } : {});
      navigate(LOGIN_PATH);
    } finally {
      setLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  const handleWalletClick = () => {
    if (balanceError) {
      fetchBalance();
      return;
    }
    setLoadMoneyOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 h-16 bg-nav shadow-md border-b border-border">
        <div className="px-2 sm:px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left section */}
            <div className="flex items-center md:space-x-4">
              <button
                onClick={toggleSidebar}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none flex-shrink-0
                  ${isSidebarOpen ? "text-secondary-foreground" : "text-secondary-foreground hover:text-primary-foreground hover:bg-secondary"}`}
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => navigate(clientRoute("/home"))}
                className="flex items-center gap-0 rounded-lg transition-opacity duration-200 hover:opacity-90 focus:outline-none"
              >
                <div className="w-6 h-6 flex-shrink-0">
                  <img
                    src="/logo512.png"
                    alt="FinFiler Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-primary-foreground tracking-tight">
                    Fin<span className="font-light text-indigo-500">Filer</span>
                  </span>
                </div>
              </button>
            </div>

            {/* Right section */}
            <div className="flex items-center md:space-x-4">
              <WalletBalance
                onClick={handleWalletClick}
                balance={balance}
                loading={balanceLoading}
                error={balanceError}
              />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-secondary-foreground hover:bg-secondary transition-colors focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="flex items-center space-x-3 p-1.5 pr-3 rounded-lg hover:bg-secondary transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <div className="relative">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt="Profile"
                        className="w-9 h-9 rounded-lg object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shadow-md bg-gradient-to-br from-blue-500 to-indigo-600">
                        <span className="text-white font-bold text-sm uppercase">
                          {user?.first_name ? user.first_name.charAt(0) : "U"}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-nav bg-emerald-400" />
                  </div>

                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-primary-foreground capitalize">
                      {user?.first_name || "User"}
                    </p>
                    <p className="text-xs text-secondary-foreground capitalize">
                      {user?.user_type || "User"}
                    </p>
                  </div>

                  <ChevronDown className="w-4 h-4 text-secondary-foreground group-hover:text-primary-foreground transition-colors hidden md:block" />
                </button>

                {/* Dropdown */}
                {openDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdown(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-secondary shadow-2xl">
                      {/* Mobile user info */}
                      <div className="flex items-center gap-3 border-b border-border bg-primary p-4 md:hidden">
                        {user?.image ? (
                          <img
                            src={user.image}
                            alt="Profile"
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold uppercase">
                              {user?.first_name
                                ? user.first_name.charAt(0)
                                : "U"}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-primary-foreground capitalize">
                            {user?.first_name || "User"}
                          </p>
                          <p className="text-xs text-secondary-foreground capitalize">
                            {user?.mobile || "User"}
                          </p>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5 space-y-0.5">
                        <button
                          onClick={() => {
                            setOpenDropdown(false);
                            navigate(clientRoute("/profile"));
                          }}
                          className="group w-full text-left px-3 py-2.5 text-sm font-medium text-secondary-foreground hover:text-primary-foreground hover:bg-indigo-500/10 rounded-xl transition-all duration-150 flex items-center gap-3 border border-transparent hover:border-indigo-500/20"
                        >
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary group-hover:bg-indigo-500/20 transition-colors">
                            <User className="w-4 h-4 text-secondary-foreground group-hover:text-indigo-400 transition-colors" />
                          </span>
                          My Profile
                        </button>

                        <div className="border-t border-border/60 my-1 mx-1" />

                        <button
                          onClick={openLogoutModal}
                          className="group w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-150 flex items-center gap-3 border border-transparent hover:border-red-500/20"
                        >
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary group-hover:bg-red-500/15 transition-colors">
                            <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-colors" />
                          </span>
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout confirmation modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        loading={loggingOut}
      />

      {/* Load money modal */}
      <LoadMoneyModal
        isOpen={loadMoneyOpen}
        onClose={() => setLoadMoneyOpen(false)}
        onSuccess={(newBalance) => {
          if (typeof newBalance === "number") {
            setBalance(newBalance);
          } else {
            fetchBalance();
          }
        }}
      />
    </>
  );
};

export default Navbar;