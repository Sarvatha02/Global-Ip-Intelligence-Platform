import React, { useState, useEffect } from 'react';
import client from "../api/client"; 
import { 
  Camera, User, Mail, Briefcase, MapPin, Phone, 
  Building, Save, CheckCircle, AlertCircle, Shield,
  Globe, Linkedin, CreditCard, Calendar, Trash2 
} from 'lucide-react';

const ProfilePage = ({ user, onUpdateUser, onBack }) => {
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    location: '',
    bio: '',
    linkedin: '',
    website: ''
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        company: user.company || '',
        location: user.location || '',
        bio: user.bio || '',
        linkedin: user.linkedin || '',
        website: user.website || ''
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { 
      setErrorMsg('Image size must be less than 2MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('userId', user.id);

    try {
      setIsLoading(true);
      const res = await client.post('/users/upload-avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onUpdateUser({ ...user, avatar: res.data.avatarUrl });
      setSuccessMsg('Avatar updated successfully!');
    } catch (err) {
      console.error("Avatar Upload Error:", err);
      setErrorMsg('Failed to upload avatar.');
      setAvatarPreview(user.avatar); 
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;

    try {
      setIsLoading(true);
      await client.delete(`/users/${user.id}/avatar`);
      
      setAvatarPreview(null);
      onUpdateUser({ ...user, avatar: null }); 
      setSuccessMsg('Profile picture removed.');
    } catch (err) {
      console.error("Remove Avatar Error:", err);
      setErrorMsg('Failed to remove avatar. Ensure backend is restarted.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await client.put(`/users/${user.id}`, formData);
      onUpdateUser(res.data);
      setSuccessMsg('Profile details saved successfully.');
    } catch (err) {
      console.error("Update Error:", err);
      setErrorMsg('Failed to save profile changes.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      
      <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900 relative w-full rounded-b-[2.5rem] shadow-lg">
        <button onClick={onBack} className="absolute top-6 left-6 text-white/80 hover:text-white text-sm font-bold uppercase tracking-widest bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm transition-all hover:bg-black/40">
          ← Back to Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-slate-100 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          
          <div className="relative group">
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center overflow-hidden relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User size={48} className="text-slate-300" />
              )}
            </div>
            
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all duration-200 z-10">
              <div className="flex flex-col items-center gap-1">
                <Camera className="w-6 h-6 drop-shadow-md" />
                <span className="text-[10px] font-bold uppercase">Change</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>

            <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md border border-slate-100 text-indigo-600 z-20">
               <Camera size={14} />
            </div>

            {avatarPreview && (
                <button 
                    onClick={handleRemoveAvatar}
                    className="absolute top-0 right-0 bg-rose-50 p-1.5 rounded-full shadow-md border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors z-30 transform hover:scale-110"
                    title="Remove Avatar"
                >
                    <Trash2 size={14} />
                </button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left mb-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{formData.name || 'User Name'}</h1>
            <p className="text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-2 mt-1">
              {formData.jobTitle || 'No Job Title'} 
              <span className="text-slate-300">•</span>
              {formData.company || 'No Company'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
               <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-100 uppercase tracking-wider flex items-center gap-1">
                 <Shield size={10} /> {user.userType || 'MEMBER'}
               </span>
               <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                 {user.email}
               </span>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 shadow-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 shadow-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-lg">Edit Personal Information</h3>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700"
                      placeholder="Your Full Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="jobTitle" 
                      value={formData.jobTitle} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="e.g. Patent Attorney"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Company</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="company" 
                      value={formData.company} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="Company Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email (Read Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="email" 
                      value={formData.email} 
                      readOnly
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="location" 
                      value={formData.location} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="linkedin" 
                      value={formData.linkedin} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="Linkedin Profile URL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      name="website" 
                      value={formData.website} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bio</label>
                  <textarea 
                    name="bio"
                    rows="4" 
                    value={formData.bio} 
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium leading-relaxed resize-none"
                    placeholder="Tell us a bit about yourself..."
                  ></textarea>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
               <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
               
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <CreditCard size={24} className="text-indigo-300" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Current Plan</p>
                        <h3 className="text-xl font-black tracking-tight">{user.planType || 'STARTUP'}</h3>
                    </div>
                 </div>

                 <div className="space-y-4 border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                            <Calendar size={12}/> Renewing On
                        </span>
                        <span className="text-sm font-bold text-white">{user.renewalDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-300">Billing Cycle</span>
                        <span className="text-sm font-bold text-white capitalize">{user.billingCycle || 'Monthly'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-300">Amount Paid</span>
                        <span className="text-sm font-bold text-emerald-400">₹{user.amountPaid || '0'}</span>
                    </div>
                 </div>

                 <button className="w-full mt-8 py-3 bg-white text-indigo-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
                   Upgrade Plan
                 </button>
               </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
               <h4 className="text-sm font-bold text-slate-900 mb-4">Account Status</h4>
               <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <CheckCircle size={18} />
                  <div>
                      <p className="text-xs font-black uppercase tracking-wide">Active</p>
                      <p className="text--[10px] opacity-80">Your account is in good standing.</p>
                  </div>
               </div>
               <div className="mt-4 text-xs text-slate-400 text-center">
                  {/* 🟢 FIX: Shows Year if date exists, otherwise defaults to current year */}
                  Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;