import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import backgroundImage from '../assets/background.jpg';

export default function Login() {
  const [userName, setuserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login(userName, password);
      navigate('/portalselector');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden">
      {/* ✅ Animated Background */}
      <div
        className="absolute inset-7 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          transform: 'scale(1.1)',
          animation: 'bgZoom 25s ease-in-out infinite alternate',
        }}
      ></div>

      {/* ✅ Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* ✅ Login Card */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-[90%] sm:w-[400px] max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login to EMPOWER EDGE
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userName}
              onChange={(e) => setuserName(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs italic mb-4">{error}</p>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
          <div className="text-center mt-3">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot password?
            </button>
          </div>
        </form>
        {showForgotModal && (
          <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
        )}
      </div>

      {/* ✅ Inline CSS keyframes for animation */}
      <style>{`
        @keyframes bgZoom {
          0% {
            transform: scale(1.1) translate(0, 0);
          }
          50% {
            transform: scale(1.15) translate(-2%, -2%);
          }
          100% {
            transform: scale(1.1) translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
}
