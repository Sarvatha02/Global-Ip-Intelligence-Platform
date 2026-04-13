import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Added Hook
import { 
  Globe, Shield, Sparkles, Lock, Mail, User, Building2, 
  Eye, EyeOff, XCircle, ArrowRight, Scale
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// ✅ ENV Variable Setup
const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Modal Component (Original) ---
const Modal = ({ title, content, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col scale-100 animate-in zoom-in-95 duration-200">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
                {title.includes("Privacy") ? <Shield className="w-5 h-5 text-indigo-600"/> : <Scale className="w-5 h-5 text-indigo-600"/>}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="p-8 overflow-y-auto custom-scrollbar">
        <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed">
          {content}
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-2xl">
        <button 
          onClick={onClose} 
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-sm hover:shadow-md"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  </div>
);

// --- Expanded Terms of Service Content (Original) ---
const TermsContent = (
  <div className="space-y-6">
    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
        <p className="text-indigo-800 font-medium text-xs uppercase tracking-wider mb-1">Last Updated</p>
        <p className="text-indigo-900 font-bold">January 1, 2025</p>
    </div >
    <section>
        <h4 className="text-slate-900 font-bold text-lg mb-2">1. Acceptance of Terms</h4>
        <p>By registering for, accessing, or using the Global IP Intelligence Platform ("Service"), you agree to be bound by these Terms of Service.</p>
    </section>
    <section>
        <h4 className="text-slate-900 font-bold text-lg mb-2">2. Description of Service</h4>
        <p>The Service provides intellectual property analytics, patent monitoring, and infringement detection using artificial intelligence.</p>
    </section>
    <section>
        <h4 className="text-slate-900 font-bold text-lg mb-2">3. User Accounts</h4>
        <p>You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
    </section>
  </div >
);

// --- Expanded Privacy Policy Content (Original) ---
const PrivacyContent = (
  <div className="space-y-6">
    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
        <p className="text-emerald-800 font-medium text-xs uppercase tracking-wider mb-1">Effective Date</p>
        <p className="text-emerald-900 font-bold">January 1, 2025</p>
    </div >
    <section>
        <h4 className="text-slate-900 font-bold text-lg mb-2">1. Information We Collect</h4>
        <p>We collect information to provide better services to all our users including Personal Information and IP Data.</p>
    </section>
    <section>
        <h4 className="text-slate-900 font-bold text-lg mb-2">2. How We Use Information</h4>
        <p>We use the information we collect to operate, maintain, and improve our services, communicate with you, and comply with legal obligations.</p>
    </section>
  </div >
);

// --- Auth Layout Component (Original) ---
const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex relative overflow-hidden bg-slate-900">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-indigo-950"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1000ms'}}></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
    </div>

    {/* Left Side */}
    <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-12 xl:px-24 text-white h-screen sticky top-0">
      <div className="space-y-8 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <Globe className="w-8 h-8 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Global IP Intelligence</h1>
            <p className="text-indigo-200/70 text-sm font-medium">Secure Your Innovation</p>
          </div>
        </div>
        <div>
          <h2 className="text-5xl font-bold mb-6 leading-[1.1] bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-indigo-100/80 text-lg leading-relaxed font-light">
            {subtitle}
          </p>
        </div>
        <div className="space-y-4 pt-4">
          {[
            { icon: Shield, title: "Enterprise-Grade Security", desc: "Bank-level AES-256 encryption and SOC 2 Type II compliance.", color: "indigo" },
            { icon: Sparkles, title: "AI-Powered Intelligence", desc: "Automated prior art discovery and infringement detection.", color: "purple" },
            { icon: Globe, title: "Global Coverage", desc: "Real-time monitoring across 150+ patent offices worldwide.", color: "blue" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-default">
              <div className={`p-2.5 bg-${item.color}-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className={`w-5 h-5 text-${item.color}-300`} />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1 text-white">{item.title}</h3>
                <p className="text-indigo-200/70 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right Side */}
    <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-12 relative z-10 overflow-y-auto">
      <div className="w-full max-w-[480px]">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-80"></div>

          <div className="lg:hidden flex flex-col items-center justify-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Global IP Intelligence</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  </div>
);

// --- Main Register Component ---
const RegisterPage = ({ onLogin }) => {
  const navigate = useNavigate(); // ✅ Hook
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'Individual',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [touchedFields, setTouchedFields] = useState({});
  const [activeModal, setActiveModal] = useState(null);

  // --- Password Logic Preserved ---
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12;
    if (/[^a-zA-Z\d]/.test(password)) strength += 13;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthLabel = (s) => s === 0 ? '' : s < 40 ? 'Weak' : s < 70 ? 'Medium' : 'Strong';
  const getPasswordStrengthColor = (s) => s < 40 ? 'bg-red-500' : s < 70 ? 'bg-amber-400' : 'bg-emerald-500';

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'password') setPasswordStrength(calculatePasswordStrength(value));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (field) => setTouchedFields(prev => ({ ...prev, [field]: true }));

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    return newErrors;
  };

  // --- SUBMIT HANDLER (Updated for .ENV & Router) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouchedFields({ fullname: true, email: true, password: true, confirmPassword: true });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('🔵 Creating User in Firebase...');
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: formData.fullname });
      await user.reload();
      
      console.log('✅ Firebase User Created:', user.email);
      const idToken = await user.getIdToken(true);

      // --- ✅ FIXED: Direct Fetch with .env ---
      console.log('🔵 Sending to Backend via Direct Fetch...');
      const response = await fetch(`${API_URL}/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        throw new Error('Backend registration failed');
      }

      const data = await response.json();
      console.log('✅ Backend Registration Success:', data);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onLogin) onLogin(data.user);
      
      // ✅ Use navigate hook
      navigate('/overview');

    } catch (error) {
      console.error('❌ Registration Error:', error);
      let errorMessage = "Registration failed. Please try again.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "This email is already registered. Please login instead.";
      else if (error.code === 'auth/weak-password') errorMessage = "Password is too weak.";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // --- GOOGLE REGISTER (Updated for .ENV & Router) ---
  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      console.log('🔵 Starting Google Sign-In...');
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      console.log('✅ Firebase Sign-In Success');
      
      // --- ✅ FIXED: Direct Fetch with .env ---
      const response = await fetch(`${API_URL}/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        throw new Error('Backend registration failed');
      }

      const data = await response.json();
      console.log('✅ Backend Response:', data);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (onLogin) onLogin(data.user);
      
      // ✅ Use navigate hook
      navigate('/overview');
      
    } catch (error) {
      console.error('❌ Google Sign-Up Error:', error);
      setErrors({ submit: error.message || 'Google sign-up failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {activeModal === 'terms' && <Modal title="Terms of Service" content={TermsContent} onClose={() => setActiveModal(null)} />}
      {activeModal === 'privacy' && <Modal title="Privacy Policy" content={PrivacyContent} onClose={() => setActiveModal(null)} />}

      <AuthLayout title="Join the Future of IP Management" subtitle="Protect, monitor, and analyze your patents across 150+ countries with AI-powered intelligence.">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500">Join 12,000+ innovators protecting their IP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullname" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input id="fullname" type="text" value={formData.fullname} onChange={(e) => handleChange('fullname', e.target.value)} onBlur={() => handleBlur('fullname')} className={`block w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 ${touchedFields.fullname && errors.fullname ? 'border-red-500 bg-red-50' : 'border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white'} transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400`} placeholder="Alex Johnson" />
            </div>
            {touchedFields.fullname && errors.fullname && <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />{errors.fullname}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Work Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} className={`block w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 ${touchedFields.email && errors.email ? 'border-red-500 bg-red-50' : 'border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white'} transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400`} placeholder="alex@company.com" />
            </div>
            {touchedFields.email && errors.email && <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />{errors.email}</p>}
          </div>

          {/* Organization Type */}
          <div>
            <label htmlFor="userType" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Organization Type</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
              <select id="userType" value={formData.userType} onChange={(e) => handleChange('userType', e.target.value)} className="block w-full pl-12 pr-10 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white transition-all appearance-none outline-none cursor-pointer font-medium text-slate-700">
                <option value="Individual">Individual Inventor</option>
                <option value="Law Firm">Law Firm</option>
                <option value="Corporation">Corporation</option>
                <option value="Research Institution">Research Institution</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')} className={`block w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 border-2 ${touchedFields.password && errors.password ? 'border-red-500 bg-red-50' : 'border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white'} transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400`} placeholder="Create password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-3 px-1">
                <div className="flex gap-1 h-1.5 mb-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className={`h-full flex-1 rounded-full transition-all duration-500 ${passwordStrength >= step * 25 ? getPasswordStrengthColor(passwordStrength) : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-500 flex justify-between items-center font-medium">
                  <span>Must contain number & symbol</span>
                  <span className={`${passwordStrength < 40 ? 'text-red-500' : passwordStrength < 70 ? 'text-amber-500' : 'text-emerald-600'}`}>{getPasswordStrengthLabel(passwordStrength)}</span>
                </p>
              </div>
            )}
            {touchedFields.password && errors.password && <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} onBlur={() => handleBlur('confirmPassword')} className={`block w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 border-2 ${touchedFields.confirmPassword && errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white'} transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400`} placeholder="Confirm password" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {touchedFields.confirmPassword && errors.confirmPassword && <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input type="checkbox" checked={formData.agreeToTerms} onChange={(e) => handleChange('agreeToTerms', e.target.checked)} className="peer w-5 h-5 rounded-md border-2 border-slate-300 bg-slate-50 checked:bg-indigo-600 checked:border-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all cursor-pointer appearance-none" />
                <svg className="absolute w-3 h-3 text-white pointer-events-none hidden peer-checked:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm text-slate-600 leading-relaxed">
                I agree to the{' '} <button type="button" onClick={() => setActiveModal('terms')} className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Terms of Service</button> {' '}and{' '} <button type="button" onClick={() => setActiveModal('privacy')} className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Privacy Policy</button>
              </span>
            </label>
            {errors.agreeToTerms && <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5 ml-8"><XCircle className="w-3.5 h-3.5" />{errors.agreeToTerms}</p>}
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm font-medium text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />{errors.submit}
              </p>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group">
            {isLoading ? "Creating Account..." : <>Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
          </button>
          
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">Already have an account?{' '} <button type="button" onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Log in</button></p>
          </div>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white/50 backdrop-blur-sm text-slate-500 font-medium">Or sign up with</span></div>
        </div>

        <button type="button" onClick={handleGoogleRegister} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-slate-200 rounded-xl bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          {isLoading ? 'Signing up...' : 'Sign up with Google'}
        </button>
      </AuthLayout>
    </>
  );
};

export default RegisterPage;