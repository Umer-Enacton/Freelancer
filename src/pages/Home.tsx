import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { Clock, BarChart3, Calendar, TrendingUp } from "lucide-react";

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/5 to-transparent" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Track Your Time, Boost Your Productivity
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-slate-600 leading-relaxed">
            A simple and powerful time tracking solution for individuals and
            teams. Monitor projects, manage sessions, and gain insights into
            your work patterns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-lg border border-slate-200 hover:shadow-xl hover:border-slate-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-lg border border-slate-200 hover:shadow-xl hover:border-slate-300"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all duration-300 border-2 border-slate-200 hover:border-slate-300 shadow-lg"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Features
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover how our platform helps you stay organized and productive
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Time Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Track work sessions with precise check-in and check-out times
                for all your projects.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Project Management
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Organize your work into projects and track time entries for
                better organization.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Analytics & Reports
              </h3>
              <p className="text-slate-600 leading-relaxed">
                View detailed summaries and charts to understand your
                productivity patterns.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Break Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor breaks and calculate net working time for accurate
                productivity metrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Join thousands of professionals who trust our platform to manage
              their time effectively.
            </p>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all duration-300 shadow-lg border border-slate-200 hover:border-slate-300 hover:shadow-xl"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
