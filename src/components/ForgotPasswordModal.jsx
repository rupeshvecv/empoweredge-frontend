import React, { useState, useEffect, useRef } from 'react';
import { requestPasswordOtp, resetPassword } from '../services/authService';

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1: enter email, 2: enter otp+new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0); // seconds left until resend allowed
  const timerRef = useRef(null);
  const [pwValid, setPwValid] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const OTP_LENGTH = 6;

  const validateEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

  useEffect(() => {
    // countdown timer for resend cooldown
    if (resendCooldown > 0) {
      timerRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendCooldown]);

  useEffect(() => {
    // validate password rules whenever password changes
    const p = newPassword || '';
    setPwValid({
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
    });
  }, [newPassword]);

  const handleRequestOtp = async () => {
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordOtp(email);
      setMessage('An OTP has been sent to your registered email.');
      setStep(2);
      setResendCooldown(60); // 60s cooldown before resend
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await requestPasswordOtp(email);
      setMessage('OTP resent to your registered email.');
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError('');
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    // enforce stronger password rules
    const allValid = Object.values(pwValid).every(Boolean);
    if (!allValid) {
      setError('Password does not meet the strength requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setMessage('Password reset successful. You can now login with your new password.');
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div onClick={onClose} className="fixed inset-0" /> {/* This is the overlay */}
      <div className="bg-white p-6 rounded w-full max-w-md relative z-10"> {/* This is the modal content */}
        <h3 className="text-xl font-bold mb-4">Forgot Password</h3>
        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}

        {step === 1 && (
          <>
            <label className="block text-sm font-medium text-gray-700">Registered Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input w-full mb-3" />
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="btn-light">Cancel</button>
              <button onClick={handleRequestOtp} className="btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
              placeholder={`${'•'.repeat(OTP_LENGTH)}`}
              className="input w-full mb-3"
            />
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">OTP should be {OTP_LENGTH} digits.</div>
              <div>
                <button onClick={() => setStep(1)} className="btn-light mr-2">Back</button>
                <button onClick={handleResend} className="btn-light mr-2" disabled={resendCooldown > 0 || loading}>
                  {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                </button>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input w-full mb-1" />
            <div className="text-xs mb-3">
              <div className={pwValid.length ? 'text-green-600' : 'text-red-600'}>• At least 8 characters</div>
              <div className={pwValid.upper ? 'text-green-600' : 'text-red-600'}>• One uppercase letter</div>
              <div className={pwValid.lower ? 'text-green-600' : 'text-red-600'}>• One lowercase letter</div>
              <div className={pwValid.number ? 'text-green-600' : 'text-red-600'}>• One number</div>
              <div className={pwValid.special ? 'text-green-600' : 'text-red-600'}>• One special character</div>
            </div>

            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input w-full mb-3" />

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <div className="text-sm text-red-600 mb-2">Passwords do not match.</div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setStep(1)} className="btn-light">Back</button>
              <button
                onClick={handleReset}
                className="btn-primary"
                disabled={loading || otp.length < OTP_LENGTH || !Object.values(pwValid).every(Boolean) || newPassword !== confirmPassword}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
