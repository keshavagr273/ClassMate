import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markAllNotificationsAsRead } from '../../../slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { Heart } from 'lucide-react';

const MagGlassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
  </svg>
);

const LogoIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="56" height="56" rx="16" fill="#6366F1"/>
    <path d="M28 16L46 24L28 32L10 24L28 16Z" fill="#fff"/>
    <path d="M28 32V40" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <ellipse cx="28" cy="40.5" rx="6" ry="2.5" fill="#fff" fillOpacity="0.7"/>
  </svg>
);

const NotificationPanel = ({ notifications, loading, onMarkAllRead }) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full right-0 mt-4 w-80 bg-[#1e2935] border border-[#2b3640] rounded-xl shadow-lg z-50"
    >
      <div className="p-4 border-b border-[#2b3640] flex justify-between items-center">
        <h3 className="text-white font-bold">Notifications</h3>
        <button onClick={onMarkAllRead} className="text-sm text-[#9eadbd] hover:text-white">Mark all as read</button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-[#9eadbd]">Loading...</div>
        ) : notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif.id} className={`p-4 border-b border-[#2b3640] ${!notif.is_read ? 'bg-[#2b3640]' : ''}`}>
              <p className="text-white text-sm">{notif.message}</p>
              <p className="text-xs text-[#9eadbd] mt-1">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-[#9eadbd]">You're all caught up!</div>
        )}
      </div>
    </motion.div>
  );

function NavBar() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { notifications, unreadCount, loading: notificationsLoading } = useSelector(state => state.notifications);

  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const notificationPanelRef = useRef(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getNotifications());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Since Clubs and Events pages were removed, these links will temporarily point to home.
  // You can update these paths if you decide to re-implement the pages.
  const navLinks = [
    { name: 'SkillSwap', path: '/skill-exchange' },
    { name: 'ClassPulse', path: '/attendance' },
    { name: 'CampusBazaar', path: '/marketplace' },
    { name: 'FoundIt!', path: '/lost-found' },
    { name: 'RideLoop', path: '/rides' },
  ];

  return (
    <header className="text-xs flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#2b3640] px-4 py-2">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <div className="size-10 flex items-center justify-center">
            <LogoIcon />
          </div>
          <h2 className="text-white text-xs font-extrabold leading-tight tracking-[-0.015em]">ClassMate</h2>
        </Link>
        <nav className="flex items-center gap-4">
          {navLinks.map(link => (
            <Link key={link.name} to={link.path} className="text-white text-xs font-bold leading-normal">
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4">
        <label className="flex flex-col min-w-32 !h-10 max-w-48">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <div className="text-[#9eadbd] flex border-none bg-[#2b3640] items-center justify-center pl-2 rounded-l-xl border-r-0">
              <MagGlassIcon />
            </div>
            <input
              placeholder="Search"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white text-xs font-bold focus:outline-0 focus:ring-0 border-none bg-[#2b3640] focus:border-none h-full placeholder:text-[#9eadbd] px-2 rounded-l-none border-l-0 pl-1 leading-normal"
            />
          </div>
        </label>
        <div className="relative" ref={notificationPanelRef}>
            <button
              onClick={() => setNotificationOpen(prev => !prev)}
              className="relative flex max-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 w-8 bg-[#2b3640] text-white gap-1 text-xs font-bold leading-normal tracking-[0.015em] min-w-0 px-1.5"
              aria-label="Show notifications"
              title="Show notifications"
            >
              <div className="text-white">
                <BellIcon />
              </div>
              {unreadCount > 0 && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-[#1e2935]"></div>
              )}
            </button>
            <AnimatePresence>
                {isNotificationOpen && (
                    <NotificationPanel
                        notifications={notifications}
                        loading={notificationsLoading}
                        onMarkAllRead={() => dispatch(markAllNotificationsAsRead())}
                    />
                )}
            </AnimatePresence>
        </div>
        {isAuthenticated && user ? (
          <Link to="/profile">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
              style={{ backgroundImage: `url(${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'})` }}
            ></div>
          </Link>
        ) : (
          <Link to="/login" className="text-white text-xs font-bold leading-normal">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default NavBar;
  