import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  Settings, 
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({
  toggleSidebar,
  isMobile,
  sidebarOpen,
  isDesktopSidebarExpanded,
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isSidebarOpen = isMobile ? sidebarOpen : isDesktopSidebarExpanded;

  return (
    <>
      <nav className="sticky top-0 z-40 h-16 bg-nav shadow-md border-b border-border">
        <div className="px-4 h-full">
          <div className="flex items-center justify-between h-full">

            {/* Left section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none flex-shrink-0
                  ${isSidebarOpen ? 'text-secondary-foreground' : 'text-secondary-foreground hover:text-primary-foreground hover:bg-secondary'}`}
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 rounded-lg transition-opacity duration-200 hover:opacity-90 focus:outline-none"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">FF</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-primary-foreground tracking-tight">
                    fin<span className="font-light text-indigo-500">filer</span>
                  </span>
                </div>
              </button>
            </div>

            {/* Right section - User Menu & Theme Toggle */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-secondary-foreground hover:bg-secondary transition-colors focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex items-center space-x-3 p-1.5 pr-3 rounded-lg hover:bg-secondary transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="relative">
                  {user?.image ? (
                    <img src={user.image} alt="Profile" className="w-9 h-9 rounded-lg object-cover shadow-md" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shadow-md bg-gradient-to-br from-blue-500 to-indigo-600">
                      <span className="text-white font-bold text-sm uppercase">{user?.first_name ? user.first_name.charAt(0) : 'U'}</span>
                    </div>
                  )}
                  {/* Online dot */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-primary-foreground capitalize">
                    {user?.first_name || 'User'}
                  </p>
                  <p className="text-xs text-secondary-foreground capitalize">
                    {user?.user_type || 'User'}
                  </p>
                </div>

                <ChevronDown className="w-4 h-4 text-secondary-foreground group-hover:text-primary-foreground transition-colors hidden md:block" />
              </button>

              {/* Dropdown Menu */}
              {openDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-nav rounded-xl shadow-xl border border-border overflow-hidden z-50">
                    {/* Mobile user info */}
                    <div className="md:hidden p-4 border-b border-border bg-secondary flex items-center gap-3">
                      {user?.image ? (
                        <img src={user.image} alt="Profile" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-white font-bold uppercase">{user?.first_name ? user.first_name.charAt(0) : 'U'}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-primary-foreground capitalize">{user?.first_name || 'User'}</p>
                        <p className="text-xs text-secondary-foreground capitalize">{user?.user_type || 'User'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => { setOpenDropdown(false); navigate('/profile'); }}
                      className="w-full text-left px-4 py-3 text-sm text-primary-foreground hover:bg-secondary transition-colors flex items-center gap-3"
                    >
                      <User className="w-4 h-4 text-secondary-foreground" />
                      My Profile
                    </button>

                    <button
                      onClick={() => { setOpenDropdown(false); navigate('/settings'); }}
                      className="w-full text-left px-4 py-3 text-sm text-primary-foreground hover:bg-secondary transition-colors flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4 text-secondary-foreground" />
                      Settings
                    </button>

                    <div className="border-t border-border my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;