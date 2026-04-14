import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, Shield, Sparkles, Lock, Mail, User, Building2, 
  Eye, EyeOff, XCircle, ArrowRight, Scale
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// ✅ ENV Variable Setup
const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Modal Component ---
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

// --- Expanded Terms of Service Content ---
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
  </div >
);

// --- Expanded Privacy Policy Content ---
const PrivacyContent = (
  <div className="space-y-6">
    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
        <p className="text-emerald-800 font-medium text-xs uppercase tracking-wider mb-1">Effective Date</p>
        <p className="text-emerald-900 font-bold">January 1, 2025</p>
    </div >
    <section>
        <h4 className="text-slate-900 font-bold text-lg mb-2">1. Information We Collect</h4>
        <p>We collect information to provide better services including Personal Information and IP Data.</p>
    </section>
  </div >
);

// --- Auth Layout Component ---
const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex relative overflow-hidden bg-slate-900">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-indigo-950"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
    </div>
    <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-12 xl:px-24 text-white h-screen sticky top-0">
      <div className="space-y-8 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <Globe className="w-8 h-8 text-indigo-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Global IP Intelligence</h1>
        </div>
        <h2 className="text-5xl font-bold mb-6 leading-[1.1] text-white">{title}</h2>
        <p className="text-indigo-100/80 text-lg leading-relaxed font-light">{subtitle}</p>
        <div className="space-y-4 pt-4">
          <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl"><Shield className="w-5 h-5 text-indigo-300" /></div>
            <div>
              <h3 className="font-semibold text-base mb-1 text-white">Security</h3>
              <p className="text-indigo-200/70 text-sm">Enterprise-grade security for your data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-12 relative z-10 overflow-y-auto">
      <div className="w-full max-w-[480px]">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-white/50 relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  </div>
);

// --- Main Register Component ---
const RegisterPage = ({ onLogin }) => {
  const navigate = useNavigate();
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

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'password') setPasswordStrength(calculatePasswordStrength(value));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.password) newErrors.password = 'Required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'No match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Agreement required';
    return newErrors;
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

      // --- ✅ STEP 3: Send real password to Backend ---
      console.log('🔵 Sending to Backend via Direct Fetch...');
      const response = await fetch(`${API_URL}/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken, 
          password: formData.password // ⬅️ IMPORTANT FIXED LINE
        })
      });

      if (!response.ok) throw new Error('Backend sync failed');

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onLogin) onLogin(data.user);
      navigate('/overview');

    } catch (error) {
      console.error('❌ Error:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {activeModal === 'terms' && <Modal title="Terms" content={TermsContent} onClose={() => setActiveModal(null)} />}
      <AuthLayout title="Create Account" subtitle="Join us today.">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" placeholder="Full Name" value={formData.fullname} onChange={(e) => handleChange('fullname', e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" />
          <input type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" />
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.agreeToTerms} onChange={(e) => handleChange('agreeToTerms', e.target.checked)} />
            <span className="text-sm">I agree to the <button type="button" onClick={() => setActiveModal('terms')} className="text-indigo-600 font-bold">Terms</button></span>
          </label>

          {errors.submit && <p className="text-red-500 text-sm font-bold">{errors.submit}</p>}

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </AuthLayout>
    </>
  );
};

export default RegisterPage;
