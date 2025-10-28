

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Package, Menu, X, FileText, Search, Plus, ChevronUp, ChevronDown } from "lucide-react";
import TombIcon from "@/components/icons/TombIcon";
import KantharosIcon from "@/components/icons/KantharosIcon";
import WarriorHeadIcon from "@/components/icons/WarriorHeadIcon";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  // Determine background based on current page
  const getPageBackground = () => {
    const path = location.pathname;
    if (path.includes('Tombs') || path.includes('TombDetail') || path.includes('AddTomb') || path.includes('EditTomb')) {
      return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/82fedaa6e_s-l1200.jpg';
    }
    if (path.includes('Documentation') || path.includes('DocumentationDetail') || path.includes('AddDocumentation')) {
      return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6d55911be_Screenshot2025-08-18alle184911.png';
    }
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6d55911be_Screenshot2025-08-18alle184911.png';
  };

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        // Use a threshold to prevent hiding on minor scrolls
        if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
          setShowNav(false);
        } else {
          if (window.scrollY < lastScrollY.current - 5) {
             setShowNav(true);
          }
        }
        // Update ref without causing re-render
        lastScrollY.current = window.scrollY;
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar, { passive: true });
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(createPageUrl(`Home?search=${encodeURIComponent(searchTerm.trim())}`));
    }
  };

  const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
    color: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
  {
    title: "Tombe",
    url: createPageUrl("Tombs"),
    icon: TombIcon,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
  },
  {
    title: "Reperti",
    url: createPageUrl("Artifacts"),
    icon: KantharosIcon,
    color: "bg-gradient-to-br from-amber-500 to-amber-600"
  },
  {
    title: "Documentazione",
    url: createPageUrl("Documentation"),
    icon: FileText,
    color: "bg-gradient-to-br from-purple-500 to-purple-600"
  }];


  const NavLink = ({ item, isMobile = false }) => {
    const isActive = location.pathname === item.url;

    if (isMobile) {
      return (
        <Link
          to={item.url}
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
          isActive ? 'bg-blue-50 border border-blue-200 shadow-sm scale-[1.02]' : 'hover:bg-gray-50'}`
          }>

          <div className={`${item.color} p-3 rounded-xl shadow-sm`}>
            <item.icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <span className={`text-lg font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
              {item.title}
            </span>
          </div>
          {isActive &&
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          }
        </Link>);

    }

    // Desktop Navlink
    return (
      <Link
        to={item.url}
        className={`group relative px-4 py-2 rounded-lg transition-colors duration-200 ${
        isActive ? 'text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
        }>

        <span className="text-xs font-semibold transition-all duration-200 opacity-100 scale-100">


          {item.title}
        </span>
        {isActive &&
        <motion.div
          layoutId="active-nav-indicator" className="bg-red-600 absolute -bottom-2 left-0 right-0 h-0.5 rounded-full"

          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }} />

        }
      </Link>);

  };

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <div
      className="min-h-screen relative bg-gray-50"
      style={{
        backgroundImage: `url(${getPageBackground()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>

      <div className="relative z-10 min-h-screen bg-white/90 backdrop-blur-sm">
        {/* Desktop Horizontal Sidebar - Optimized transition */}
        <nav className={`hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm transition-transform duration-300 ease-in-out ${
        showNav ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="max-w-7xl mx-auto px-6 h-20">
            <div className="flex items-center justify-between h-full">
              {/* Logo - Now using actual logo image */}
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  className="flex items-center gap-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}>

                  <div className="bg-slate-950 p-2 w-12 h-12 rounded-xl shadow-md border border-gray-100">
                    <WarriorHeadIcon className="w-full h-full" />
                  </div>
                  <div className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 scale-0 w-0' : 'opacity-100 scale-100'} min-w-0`}>
                    <h1 className="text-gray-900 text-base font-bold leading-tight">Crocifisso del Tufo

                    </h1>
                    <p className="text-xs text-gray-500 leading-tight">Sistema Informativo Digitale</p>
                  </div>
                </motion.div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2 flex-1 justify-center max-w-md">
                {navigationItems.map((item) => <NavLink key={item.title} item={item} />)}
              </div>

              {/* Search & Controls */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`relative transition-all duration-300 w-64 min-w-0`}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearch}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm" />

                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">

                  {sidebarCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-white/98 backdrop-blur-xl z-50 border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-white rounded-xl shadow-md p-2 border border-gray-100 flex-shrink-0">
                <WarriorHeadIcon className="w-full h-full" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 truncate">Crocifisso del Tufo</h1>
                <p className="text-xs text-gray-500 truncate">Sistema Informativo Digitale</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(true)}
              className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors touch-manipulation flex-shrink-0">

              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </header>

        {/* Mobile Navigation */}
        <AnimatePresence>
        {isMobileMenuOpen &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50">

            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
              className="absolute inset-x-4 top-4 bottom-4 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

              <div className="p-6 h-full flex flex-col">
                {/* Header with consistent spacing */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-white rounded-xl shadow-md p-1.5 border border-gray-100 flex-shrink-0">
                      <WarriorHeadIcon className="w-full h-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold text-gray-900 truncate">Crocifisso del Tufo</h2>
                      <p className="text-sm text-gray-500 truncate">Sistema Informativo Digitale</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-gray-100 rounded-xl text-gray-600 touch-manipulation flex-shrink-0">

                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Search Bar Mobile */}
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca nel database..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(e);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-base" />

                </div>
                
                {/* Navigation Links */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {navigationItems.map((item) =>
                  <NavLink key={item.title} item={item} isMobile={true} />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
          }
        </AnimatePresence>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-xl border-t border-gray-200 shadow-lg">
          <div className="safe-area-inset-bottom">
            <div className="grid grid-cols-4 gap-1 p-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 touch-manipulation ${
                    isActive ? 'bg-blue-50 scale-105' : 'hover:bg-gray-50'}`
                    }>

                    <div className={`${item.color} p-2 rounded-lg shadow-sm transition-all duration-200 ${
                    isActive ? 'shadow-md scale-110' : ''}`
                    }>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs font-medium transition-all duration-200 truncate max-w-full ${
                    isActive ? 'text-blue-600' : 'text-gray-600'}`
                    }>
                      {item.title}
                    </span>
                    {isActive &&
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    }
                  </Link>);

              })}
            </div>
          </div>
        </nav>

        {/* Main Content with Page Transitions */}
        <main className={`transition-all duration-300 md:pt-24 pb-24 md:pb-8`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}>

                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>);

}

