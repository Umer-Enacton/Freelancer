import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { LogOut, Clock, Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-slate-900 text-slate-100 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-slate-200 hover:text-white transition z-50"
            onClick={closeMobileMenu}
          >
            <Clock className="w-6 h-6" />
            <span className="hidden sm:inline">Time Tracker</span>
            <span className="sm:hidden">Tracker</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-200 hover:text-white transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className="text-slate-200 hover:text-white transition"
                >
                  Projects
                </Link>
                <div className="flex items-center gap-4 text-slate-200">
                  <span className="text-sm">Welcome, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 hover:bg-slate-800 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition font-semibold"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition z-50"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />

          {/* Menu Drawer */}
          <div className="fixed top-16 left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-lg z-40 md:hidden animate-in slide-in-from-top duration-200">
            <div className="container mx-auto px-4 py-4">
              {isAuthenticated ? (
                <div className="flex flex-col gap-4">
                  <div className="pb-4 border-b border-slate-800">
                    <p className="text-sm text-slate-400">Logged in as</p>
                    <p className="text-white font-semibold">{user?.name}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    className="px-4 py-3 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/projects"
                    className="px-4 py-3 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    onClick={closeMobileMenu}
                  >
                    Projects
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-3 text-center hover:bg-slate-800 rounded-lg transition"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-3 text-center bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition font-semibold"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
