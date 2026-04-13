import React, { useState, useEffect } from 'react';
import AuthLayout from './AuthLayout.jsx'; 
import { Lock, Mail, ArrowRight, XCircle, CheckCircle, KeyRound, ArrowLeft, RefreshCw, Calculator } from 'lucide-react';
import { auth, googleProvider } from '../firebase'; 
import { signInWithPopup } from 'firebase/auth'; 

const LoginPage = ({ onLogin, onNavigate }) => {
  
  // Configuration
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/auth`;

  // State management
  const [view, setView] = useState('login'); 
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Captcha state
  const [mathCaptcha, setMathCaptcha] = useState({ num1: 0, num2: 0, userAnswer: '' });
  
  // Reset token
  const [resetToken, setResetToken] = useState(null);
  
  // UI toggles
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate new captcha numbers
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10);
    const n2 = Math.floor(Math.random() * 10);
    setMathCaptcha({ num1: n1, num2: n2, userAnswer: '' });
  };

  // Initialization effect
  useEffect(() => {
    // Force logout when visiting login page to prevent direct dashboard access
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Generate initial captcha
    generateCaptcha();

    // Check for password reset token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setView('reset');
    }
  }, []);

  // Validate captcha helper
  const validateCaptcha = () => {
    const sum = mathCaptcha.num1 + mathCaptcha.num2;
    if (parseInt(mathCaptcha.userAnswer) !== sum) {
      setErrors({ submit: 'Incorrect Captcha. Please try again.' });
      generateCaptcha();
      return false;
    }
    return true;
  };

  // Manual login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate captcha for manual login
    if (!validateCaptcha()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      // Save session
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (onLogin) onLogin(data.user);
      if (onNavigate) onNavigate('dashboard');

    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || 'Invalid email or password.' });
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Google login handler WITHOUT captcha requirement
  const handleGoogleLogin = async () => {
    setErrors({});
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(`${API_BASE}/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) throw new Error('Backend sync failed');
      const data = await response.json();

      // Save session
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (onLogin) onLogin(data.user);
      if (onNavigate) onNavigate('dashboard');
    } catch (err) {
      setErrors({ submit: 'Google sign-in failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Failed to send request');
      setSuccessMsg('Reset link sent! Please check your email inbox.');
    } catch (err) {
      setErrors({ submit: 'Could not send email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (password !== confirmPassword) {
        setErrors({ submit: "Passwords do not match!" });
        return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccessMsg('Password changed successfully! Redirecting to login...');
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setSuccessMsg('');
        setView('login');
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 3000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Render UI
  return (
    <AuthLayout 
      title={view === 'reset' ? "Reset Password" : (view === 'forgot' ? "Forgot Password" : "Welcome Back")}
      subtitle={view === 'reset' ? "Create a new secure password" : (view === 'forgot' ? "Enter email to receive link" : "Sign in to your account")}
    >
      <div className="mt-8">
        
        {/* Success notification */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{successMsg}</p>
          </div>
        )}

        {/* Error notification */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{errors.submit}</p>
          </div>
        )}

        {/* Login form view */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
            {/* Email input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="block w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none font-medium" 
                  placeholder="alex@company.com" 
                  autoComplete="email"
                  required 
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="block w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none font-medium" 
                  placeholder="Password" 
                  autoComplete="new-password"
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <span className="text-xs font-bold">HIDE</span> : <span className="text-xs font-bold">SHOW</span>}
                </button>
              </div>
            </div>

            {/* Math captcha for manual login */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                Security Check: What is {mathCaptcha.num1} + {mathCaptcha.num2}?
              </label>
              <div className="relative flex gap-2">
                <div className="relative group flex-1">
                  <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="number" 
                    value={mathCaptcha.userAnswer} 
                    onChange={e => setMathCaptcha({ ...mathCaptcha, userAnswer: e.target.value })} 
                    className="block w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none font-medium" 
                    placeholder="Enter sum" 
                    autoComplete="off"
                    required 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={generateCaptcha} 
                  className="p-3.5 rounded-xl bg-slate-100 border-2 border-transparent hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Refresh Captcha"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
                <span className="ml-2 text-sm text-slate-600 font-medium">Remember me</span>
              </label>
              <button type="button" onClick={() => { setView('forgot'); setErrors({}); setSuccessMsg(''); }} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </button>
            </div>

            {/* Manual login button */}
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              {isLoading ? "Verifying..." : <>Sign In <ArrowRight className="w-5 h-5" /></>}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/50 backdrop-blur-sm text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google login button (NO CAPTCHA REQUIRED) */}
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              disabled={isLoading} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-slate-200 rounded-xl bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
            </button>

            {/* Register link */}
            <div className="text-center pt-2">
                <p className="text-sm text-slate-600">Don't have an account? <button type="button" onClick={() => onNavigate('register')} className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">Create account</button></p>
            </div>
          </form>
        )}

        {/* Forgot password form view */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Registered Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none font-medium" placeholder="alex@company.com" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all">
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <button type="button" onClick={() => { setView('login'); setErrors({}); }} className="w-full py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </form>
        )}

        {/* Reset password form view */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">New Password</label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none font-medium" placeholder="New password" autoComplete="new-password" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="block w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none font-medium" placeholder="Confirm password" autoComplete="new-password" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all">
              {isLoading ? "Updating..." : "Change Password"}
            </button>
          </form>
        )}

      </div>
    </AuthLayout>
  );
};

export default LoginPage;