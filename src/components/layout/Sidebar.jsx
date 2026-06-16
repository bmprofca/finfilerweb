import React, { useState, useEffect } from 'react';
import { 
  House, 
  Sparkles,
  ClipboardList,
  FolderOpen,
  Briefcase,
  Building2,
  Settings,
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isMobile, sidebarOpen, toggleSidebar, onHover, isExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  const menuItems = [
    { icon: House, label: 'Dashboard', path: '/home' },
    { icon: Sparkles, label: 'Services', path: '/services' },
    { icon: ClipboardList, label: 'Orders', path: '/orders' },
    { icon: FolderOpen, label: 'Documents', path: '/documents' },
    { icon: Building2, label: 'Firms', path: '/firms' },
    { icon: Briefcase, label: 'Funds & Business', path: '/funds-business' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActiveRoute = (itemPath) => {
    return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
  };

  useEffect(() => {
    if (onHover && !isMobile) {
      onHover(isHovered);
    }
  }, [isHovered, onHover, isMobile]);

  // ================= MOBILE SIDEBAR =================
  if (isMobile) {
    return (
      <>
        <div className={`
          fixed left-0 top-16 z-30 w-72 h-[calc(100vh-4rem)]
          bg-sidebar transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-y-auto overflow-x-hidden shadow-2xl border-r border-border
        `}>
          <div className="p-4">
            {/* User Profile Section */}
            <div className="mb-6 p-4 bg-indigo-500/10 rounded-2xl">
              <div className="flex items-center gap-3">
                {user?.image ? (
                  <img src={user.image} alt="Profile" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg uppercase">
                    {user?.first_name ? user.first_name.charAt(0) : 'U'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-primary-foreground capitalize">{user?.first_name || 'User'}</p>
                  <p className="text-xs text-secondary-foreground">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = isActiveRoute(item.path);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => toggleSidebar()}
                    className={`
                      flex items-center px-3 py-3 rounded-xl transition-all duration-200 mb-1
                      ${isActive
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-primary-foreground hover:bg-secondary hover:text-indigo-500'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg mr-3
                      ${isActive
                        ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                        : 'bg-secondary text-secondary-foreground'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Help Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="bg-indigo-500/10 rounded-xl p-4">
                <Settings className="text-indigo-500 mb-2" size={20} />
                <p className="text-xs font-semibold text-primary-foreground mb-1">Need Help?</p>
                <p className="text-xs text-secondary-foreground">Contact our support team</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ================= DESKTOP SIDEBAR =================
  const isSidebarExpanded = isExpanded;

  const renderMenuItem = (item, isExpandedState) => {
    const isActive = isActiveRoute(item.path);
    const Icon = item.icon;

    return (
      <Link
        key={item.label}
        to={item.path}
        className={`
          flex items-center rounded-xl transition-all duration-200 group
          ${isExpandedState ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center'}
          ${isActive
            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
            : 'text-primary-foreground hover:bg-secondary hover:text-indigo-500'
          }
        `}
        title={!isExpandedState ? item.label : ''}
      >
        <div className={`
          p-2 rounded-lg transition-all duration-200
          ${isExpandedState ? '' : 'mx-auto'}
          ${isActive
            ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
            : 'bg-secondary text-secondary-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500'
          }
        `}>
          <Icon className="w-4 h-4" />
        </div>
        {isExpandedState && (
          <>
            <span className={`flex-1 text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
            )}
          </>
        )}
        {!isExpandedState && isActive && (
          <span className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full"></span>
        )}
      </Link>
    );
  };

  const handleMouseEnter = () => {
    if (!isSidebarExpanded) {
      setIsHovered(true);
      if (onHover) onHover(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHover) onHover(false);
  };

  return (
    <div
      className={`
        fixed left-0 top-16 z-20 bg-sidebar
        transition-all duration-300 ease-out
        ${isSidebarExpanded ? 'w-64' : 'w-16'}
        h-[calc(100vh-4rem)]
        shadow-lg border-r border-border
        overflow-y-auto overflow-x-hidden
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">


        <nav className="flex-1 py-6 px-2">
          {menuItems.map((item) => renderMenuItem(item, isSidebarExpanded))}
        </nav>

        {/* Footer Section */}
        {isSidebarExpanded && (
          <div className="p-4 border-t border-border">
            <div className="bg-secondary rounded-xl p-3">
              <Settings className="text-indigo-500 mb-2" size={16} />
              <p className="text-xs font-semibold text-primary-foreground">Need Help?</p>
              <p className="text-xs text-secondary-foreground">Support</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;