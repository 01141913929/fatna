import { useRef, useState, useEffect } from 'react';
import {
  Nav,
  Button,
  Overlay,
  Tooltip
} from 'react-bootstrap';
import {
  Home,
  MapPin,
  User,
  Route,
  Info,
  Menu,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  X
} from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const overlayTargetRef = useRef(null);

  const navItems = [
    { 
      label: "Home", 
      icon: <Home className="w-5 h-5" />, 
      path: "/",
      description: "Main dashboard overview"
    },
    { 
      label: "Airports", 
      icon: <MapPin className="w-5 h-5" />, 
      path: "/airports",
      description: "Browse airports worldwide"
    },
    { 
      label: "User Travels", 
      icon: <User className="w-5 h-5" />, 
      path: "/user",
      description: "Manage your profile"
    },
    { 
      label: "Our Travels", 
      icon: <Route className="w-5 h-5" />, 
      path: "/travels",
      description: "Track your journeys"
    },
    { 
      label: "About Us", 
      icon: <Info className="w-5 h-5" />, 
      path: "/about",
      description: "Learn more about us"
    }
  ];

  const bottomItems = [
    {
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/settings",
      description: "App preferences"
    },
    {
      label: "Logout",
      icon: <LogOut className="w-5 h-5" />,
      path: "/logout",
      description: "Sign out securely"
    }
  ];

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && overlayTargetRef.current && !overlayTargetRef.current.contains(event.target)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  // Update active item when location changes
  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleItemClick = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const renderNavItem = (item, idx, isBottom = false) => {
    const isActive = activeItem === item.path;
    const isHovered = hoveredItem === `${isBottom ? 'bottom' : 'main'}-${idx}`;
    const uniqueId = `${isBottom ? 'bottom' : 'main'}-${idx}`;

    return (
      <Nav.Item key={uniqueId} className="position-relative mb-1">
        <Button
          onClick={() => handleItemClick(item.path)}
          onMouseEnter={() => {
            setHoveredItem(uniqueId);
            if (isCollapsed) setShowTooltip(uniqueId);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            setShowTooltip(null);
          }}
          className={`
            w-100 d-flex align-items-center gap-3 px-3 py-3 rounded-xl
            transition-all border-0 text-start position-relative overflow-hidden
            ${isActive 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg text-white" 
              : isHovered
                ? "bg-slate-700/50 text-slate-200 shadow-md"
                : "bg-transparent text-slate-400 hover:text-slate-200"
            }
          `}
          style={{
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: isHovered && !isActive ? 'translateX(4px)' : 'translateX(0)',
            ...(isActive && {
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            })
          }}
        >
          {/* Active indicator bar */}
          {isActive && (
            <div 
              className="position-absolute start-0 top-0 bottom-0 bg-white/90 rounded-e-full"
              style={{
                width: '4px',
                animation: 'slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            />
          )}

          {/* Icon container with enhanced styling */}
          <div className={`
            d-flex align-items-center justify-content-center transition-all rounded-lg p-1
            ${isActive 
              ? 'text-white bg-white/20 backdrop-blur-sm' 
              : isHovered 
                ? 'text-indigo-300 bg-slate-600/50' 
                : 'text-slate-500'
            }
          `}
          style={{
            minWidth: '32px',
            height: '32px',
            transition: 'all 0.3s ease',
            transform: isActive ? 'scale(1.1)' : 'scale(1)'
          }}>
            {item.icon}
          </div>

          {/* Label with enhanced typography */}
          <div className={`
            overflow-hidden transition-all
            ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} 
          `}
          style={{
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transitionDelay: isCollapsed ? '0s' : '0.1s'
          }}>
            <div className={`
              font-medium text-sm whitespace-nowrap
              ${isActive ? 'text-white' : isHovered ? 'text-slate-100' : 'text-slate-300'}
            `}>
              {item.label}
            </div>
            {!isCollapsed && item.description && (
              <div className={`
                text-xs mt-0.5 whitespace-nowrap transition-all
                ${isActive ? 'text-indigo-100' : isHovered ? 'text-slate-400' : 'text-slate-500'}
              `}>
              </div>
            )}
          </div>

          {/* Notification badge (example) */}
          {item.path === '/travels' && !isCollapsed && (
            <div className="ms-auto">
              <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 d-flex align-items-center justify-content-center">
                3
              </div>
            </div>
          )}
        </Button>

        {/* Enhanced Tooltip for collapsed state */}
        <Overlay
          show={showTooltip === uniqueId && isCollapsed}
          target={overlayTargetRef.current}
          placement="right"
        >
          {(props) => (
            <Tooltip 
              id={`tooltip-${uniqueId}`} 
              {...props}
              className="custom-tooltip"
            >
              <div className="font-medium">{item.label}</div>
              {item.description && (
                <div className="text-xs opacity-80 mt-1">{item.description}</div>
              )}
            </Tooltip>
          )}
        </Overlay>
      </Nav.Item>
    );
  };

  return (
    <>
      {/* Sidebar Container */}
      <div
        ref={overlayTargetRef}
        className={`
          fixed lg:static top-0 start-0 h-screen 
          bg-gradient-to-b from-slate-900 to-slate-800
          flex flex-col shadow-2xl transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          z-50 lg:z-auto border-e border-slate-700/50
        `}
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >

        {/* Main Navigation */}
        <Nav className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 flex-column gap-1 flex-grow-1`}>
          {navItems.map((item, idx) => renderNavItem(item, idx))}
        </Nav>
      </div>

      {/* Enhanced Custom Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .custom-tooltip {
          --bs-tooltip-bg: rgba(15, 23, 42, 0.95);
          --bs-tooltip-color: white;
          backdrop-filter: blur(8px);
        }

        .custom-tooltip .tooltip-inner {
          background-color: rgba(15, 23, 42, 0.95) !important;
          color: white !important;
          font-size: 0.875rem !important;
          padding: 12px 16px !important;
          border-radius: 8px !important;
          border: 1px solid rgba(71, 85, 105, 0.3) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          backdrop-filter: blur(8px) !important;
          max-width: 200px !important;
        }

        .custom-tooltip .tooltip-arrow::before {
          border-right-color: rgba(15, 23, 42, 0.95) !important;
        }

        /* Smooth scrollbar for navigation */
        .flex-column {
          scrollbar-width: thin;
          scrollbar-color: rgba(71, 85, 105, 0.5) transparent;
        }

        .flex-column::-webkit-scrollbar {
          width: 4px;
        }

        .flex-column::-webkit-scrollbar-track {
          background: transparent;
        }

        .flex-column::-webkit-scrollbar-thumb {
          background-color: rgba(71, 85, 105, 0.5);
          border-radius: 2px;
        }

        .flex-column::-webkit-scrollbar-thumb:hover {
          background-color: rgba(71, 85, 105, 0.7);
        }
      `}</style>
    </>
  );
};

export default Sidebar;