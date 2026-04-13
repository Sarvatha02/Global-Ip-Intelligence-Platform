import React, { useState, useEffect } from 'react';
import client from "../api/client";
import { 
  Bell, Lock, Key, Shield, CreditCard, UserCog, 
  Download, Database, Check, RefreshCw, AlertTriangle, Save,
  Eye, EyeOff, HelpCircle, Globe, Clock, Calendar
} from 'lucide-react';

const SettingsPage = ({ user }) => {
  // Set 'account' as default instead of 'appearance'
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // State for "Why are we using this?" popups
  const [activeInfoPopup, setActiveInfoPopup] = useState(null);

  const [settings, setSettings] = useState({
    language: 'English (US)',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    criticalAlerts: true,
    marketingEmails: false,
    pushNotifications: true,
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true,
    publicProfile: true,
    dataSharing: false,
    geminiKey: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;
      try {
        const res = await client.get(`/settings/${user.id}`);
        if (res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchSettings();
  }, [user]);

  // Auto-hide success message
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleSettingChange = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Optimistic UI update - save in background
    if (user?.id) {
      try {
        await client.put(`/settings/${user.id}`, { [key]: value });
      } catch (error) {
        console.error(`Background save failed for ${key}`, error);
      }
    }
  };

  const handleGlobalSave = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      await client.put(`/settings/${user.id}`, settings);
      setSuccessMsg('All settings saved successfully!');
    } catch (error) {
      console.error("Save Failed:", error);
      alert("Failed to save settings.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 FUNCTION: Real Data Download
  const handleDownloadData = () => {
    setIsLoading(true);
    
    // 1. Create the data object
    const backupData = {
        userProfile: user,
        appSettings: settings,
        exportDate: new Date().toISOString(),
        version: "1.0"
    };

    // 2. Convert to JSON string
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    
    // 3. Create a temporary download link and click it
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `GlobalIP_Backup_${user?.name || 'User'}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg("Backup downloaded successfully!");
    }, 1000);
  };

  const TabButton = ({ id, icon: Icon, label, description }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all border text-left group ${
        activeTab === id 
          ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
          : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
      }`}
    >
      <div className={`p-2 rounded-lg ${activeTab === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className={`font-semibold ${activeTab === id ? 'text-indigo-900' : 'text-slate-700'}`}>{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{description}</p>
      </div>
    </button>
  );

  const ToggleSwitch = ({ label, settingKey, description, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-center gap-3">
        {Icon && <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500"><Icon size={18}/></div>}
        <div>
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => handleSettingChange(settingKey, !settings[settingKey])}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          settings[settingKey] ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
          settings[settingKey] ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );

  // Helper component for the "Why?" popup
  const InfoPopup = ({ id, title, text }) => (
    <div className="relative inline-block ml-2">
        <button 
            onClick={() => setActiveInfoPopup(activeInfoPopup === id ? null : id)}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
        >
            <HelpCircle size={16} />
        </button>
        {activeInfoPopup === id && (
            <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="font-bold mb-1 text-indigo-300">{title}</div>
                {text}
                <div className="absolute left-2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800"></div>
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="bg-white border-b border-slate-200 px-8 py-6 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
            <p className="text-slate-500 mt-1">Manage platform preferences and configurations.</p>
          </div>
          <button 
            onClick={handleGlobalSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:opacity-90 transition shadow-lg disabled:opacity-70"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3 space-y-2">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">General</p>
          {/* 🟢 CHANGED: Replaced Appearance with Account */}
          <TabButton id="account" icon={UserCog} label="Account" description="Language & Regional" />
          <TabButton id="notifications" icon={Bell} label="Notifications" description="Email & Push alerts" />
          <TabButton id="privacy" icon={Shield} label="Privacy & Data" description="Visibility settings" />
          
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">System</p>
          <TabButton id="security" icon={Lock} label="Security" description="2FA & Sessions" />
          <TabButton id="api" icon={Key} label="API Keys" description="Gemini Integration" />
          <TabButton id="billing" icon={CreditCard} label="Plan & Billing" description="Subscriptions" />
          <TabButton id="data" icon={Database} label="Data Management" description="Export & Deletion" />
        </div>

        <div className="col-span-12 lg:col-span-9">
          {successMsg && (
            <div className="fixed top-24 right-8 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right z-50">
              <Check size={20} />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
            
            {/* 🟢 NEW TAB: ACCOUNT PREFERENCES */}
            {activeTab === 'account' && (
              <div className="p-8 space-y-8 animate-in fade-in">
                <h3 className="text-xl font-bold text-slate-900">Regional Preferences</h3>
                <div className="grid grid-cols-1 gap-6 max-w-lg">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Globe size={16}/> Language
                        </label>
                        <select 
                            value={settings.language}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                        >
                            <option>English (US)</option>
                            <option>English (UK)</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Clock size={16}/> Timezone
                        </label>
                        <select 
                            value={settings.timezone}
                            onChange={(e) => handleSettingChange('timezone', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                        >
                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                            <option value="EST">EST (Eastern Standard Time)</option>
                            <option value="PST">PST (Pacific Standard Time)</option>
                            <option value="IST">IST (Indian Standard Time)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Calendar size={16}/> Date Format
                        </label>
                        <select 
                            value={settings.dateFormat}
                            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                        >
                            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
                        </select>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-8 space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Email Notifications</h3>
                  <div className="grid gap-4 mt-4">
                    <ToggleSwitch label="Essential Updates" settingKey="emailNotifications" description="Security alerts and account notifications." />
                    <ToggleSwitch label="Marketing Emails" settingKey="marketingEmails" description="Feature announcements and product tips." />
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Real-time Alerts</h3>
                  <div className="grid gap-4 mt-4">
                    <ToggleSwitch label="Critical Infringement Alerts" settingKey="criticalAlerts" icon={AlertTriangle} description="Instant SMS when high-risk IP infringement is detected." />
                    <ToggleSwitch label="Push Notifications" settingKey="pushNotifications" description="Browser notifications for dashboard updates." />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="p-8 space-y-6 animate-in fade-in">
                <h3 className="text-xl font-bold text-slate-900">Privacy Controls</h3>
                <ToggleSwitch label="Public Profile" settingKey="publicProfile" description="Allow other users on the platform to find your firm." />
                <ToggleSwitch label="Data Sharing for AI Training" settingKey="dataSharing" description="Allow anonymized data to improve our patent models." />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-8 space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Authentication</h3>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-full text-indigo-600 shadow-sm"><Shield size={24}/></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-indigo-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-indigo-700 mt-1 mb-4">Add an extra layer of security to your account.</p>
                      <button 
                        onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${settings.twoFactorAuth ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                      >
                        {settings.twoFactorAuth ? 'Disable 2FA' : 'Enable 2FA'}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Session Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Auto-Logout Timer (Minutes)</label>
                      <select 
                        value={settings.sessionTimeout} 
                        onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="never">Never (Not Recommended)</option>
                      </select>
                    </div>
                    <ToggleSwitch label="Login Alerts" settingKey="loginAlerts" description="Notify me of new login attempts." />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="p-8 space-y-8 animate-in fade-in">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">Gemini AI Configuration</h3>
                    {/* 🟢 ADDED INFO POPUP */}
                    <InfoPopup 
                        id="api-help" 
                        title="Why do we use this?" 
                        text="Connecting your Gemini API Key allows the platform to use Google's advanced AI to analyze patents, generate summaries, and predict infringement risks specifically for your data."
                    />
                  </div>
                  <div className="bg-slate-900 rounded-xl p-6 relative overflow-hidden group mt-4">
                    <div className="absolute top-0 right-0 p-32 bg-indigo-500 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secret Key</label>
                    <div className="mt-2 flex gap-3">
                      <div className="flex-1 bg-slate-800 rounded-lg flex items-center px-4 border border-slate-700">
                        <Key size={16} className="text-indigo-400 mr-3" />
                        <input 
                          type={showApiKey ? "text" : "password"} 
                          value={settings.geminiKey || ''}
                          onChange={(e) => setSettings(prev => ({...prev, geminiKey: e.target.value}))}
                          className="bg-transparent border-none text-slate-200 w-full outline-none font-mono text-sm"
                          placeholder="sk-..."
                        />
                      </div>
                      <button onClick={() => setShowApiKey(!showApiKey)} className="p-3 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition">
                        {showApiKey ? <EyeOff size={20}/> : <Eye size={20}/>}
                      </button>
                      <button onClick={handleGlobalSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition font-medium text-sm">Save Key</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="p-8 space-y-6 animate-in fade-in">
                <h3 className="text-xl font-bold text-slate-900">Current Subscription</h3>
                <div className="p-6 bg-slate-900 text-white rounded-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Plan</p>
                        <h4 className="text-3xl font-black">{user?.planType || 'STARTUP'}</h4>
                      </div>
                      <span className="px-4 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider">Active</span>
                    </div>
                    
                    <div className="space-y-3 pt-6 border-t border-slate-700/50">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Billing Cycle</span>
                        <span className="font-bold">{user?.billingCycle || 'Monthly'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Amount Paid</span>
                        <span className="font-bold text-emerald-400">₹{user?.amountPaid || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Next Renewal</span>
                        <span className="font-bold text-indigo-300">{user?.renewalDate || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-20 blur-3xl"></div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="p-8 space-y-8 animate-in fade-in">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Export & Backup</h3>
                    {/* 🟢 ADDED INFO POPUP */}
                    <InfoPopup 
                        id="data-help" 
                        title="Why export data?" 
                        text="Downloading a backup creates a local copy of your entire patent portfolio, settings, and user profile. This is useful for migrating to another system, offline analysis, or satisfying legal compliance requirements for data retention."
                    />
                  </div>
                  
                  <div className="p-6 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 text-green-700 rounded-lg"><Database size={24}/></div>
                      <div>
                        <h4 className="font-bold text-slate-900">Download Full Backup</h4>
                        <p className="text-sm text-slate-500">Includes all patent filings and settings.</p>
                      </div>
                    </div>
                    {/* 🟢 THIS BUTTON NOW DOWNLOADS REAL DATA */}
                    <button onClick={handleDownloadData} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition font-medium text-sm flex items-center gap-2">
                      <Download size={16} /> Download .JSON
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;