import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  FileText, TrendingUp, Shield, AlertCircle, Globe, Clock,
  CheckCircle, Calendar, Plus, Loader2, Search, Database, 
  Activity, Crown, Bell, BellRing, Lock, Zap,
  ArrowRight, Sparkles
} from 'lucide-react';

const DashboardHome = ({ onNavigate, user }) => {
  const currentYear = new Date().getFullYear();

  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [dbStats, setDbStats] = useState({
    totalPatents: 0, activeFilings: 0, protectedAssets: 0,
    criticalAlerts: 0
  });
  const [activities, setActivities] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  const userPlan = user?.planType || 'STARTUP';

  const getPlanDisplayName = (plan) => {
    switch(plan) {
      case 'ENTERPRISE': return 'ENTERPRISE';
      case 'PRO': return 'PROFESSIONAL';
      case 'STARTUP': default: return 'STARTER';
    }
  };

  const checkAccess = (minPlan) => {
    if (minPlan === 'STARTUP') return true;
    if (minPlan === 'PRO' && (userPlan === 'PRO' || userPlan === 'ENTERPRISE')) return true;
    if (minPlan === 'ENTERPRISE' && userPlan === 'ENTERPRISE') return true;
    return false;
  };

  useEffect(() => {
    const fetchDashboardContext = async () => {
      setLoading(true);
      
      try {
        const [filingsRes, activityRes, tasksRes, notifsRes] = await Promise.all([
          client.get('/filings').catch(() => ({ data: [] })),
          client.get('/dashboard/recent-activity').catch(() => ({ data: [] })),
          client.get('/dashboard/upcoming-deadlines').catch(() => ({ data: [] })),
          user?.id ? client.get(`/notifications/user/${user.id}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
        ]);

        const filings = Array.isArray(filingsRes.data) ? filingsRes.data : [];
        
        const calculatedStats = {
            totalPatents: filings.length,
            activeFilings: filings.filter(f => ['PENDING', 'Pending', 'SUBMITTED', 'In Progress'].includes(f.status)).length,
            protectedAssets: filings.filter(f => ['GRANTED', 'Granted', 'ACTIVE', 'Registered'].includes(f.status)).length,
            criticalAlerts: 0 
        };

        setDbStats(calculatedStats);
        setActivities(Array.isArray(activityRes.data) ? activityRes.data : []);
        setDeadlines(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setNotifications(Array.isArray(notifsRes.data) ? notifsRes.data : []);
        setUnreadCount((Array.isArray(notifsRes.data) ? notifsRes.data : []).filter(n => !n.isRead).length);

      } catch (err) {
        console.error("Dashboard Sync Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardContext();
  }, [user]);

  const handleNotificationClick = async (id) => {
    const updatedNotifs = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updatedNotifs);
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    try {
      await client.put(`/notifications/read/${id}`);
    } catch (e) { 
      console.error(e); 
    }
  };

  const isPremium = userPlan === 'PRO' || userPlan === 'ENTERPRISE';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <Globe className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600" />
        </div>
        <p className="mt-6 text-indigo-200 font-bold uppercase tracking-widest text-sm">Loading Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50">
      
      {/* 🔴 FIX: Removed 'overflow-hidden' from this main container so dropdowns can pop out */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-12 px-6 rounded-3xl mb-8 shadow-2xl">
        
        {/* Background Effects (Moved overflow-hidden here to keep bg neat) */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>
            </div>
            <Globe className="absolute -right-20 -bottom-20 w-96 h-96 text-white opacity-10" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Welcome back, {user?.name || 'User'}
                </h1>
                <p className="text-indigo-100 text-sm mt-1">
                  Your IP Intelligence Dashboard • {currentYear}
                </p>
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl hover:bg-white/30 transition-all border border-white/30"
              >
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                // 🟢 FIX: Added 'z-50', improved shadow, fixed width for mobile
                <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b flex justify-between items-center rounded-t-2xl">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-indigo-600"/> Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  
                  {/* 🟢 FIX: Added max-height and overflow-y-auto specifically here */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n.id)}
                          className={`p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-indigo-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>}
                            <div className="flex-1">
                              <p className={`text-xs mb-1 ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                {n.message}
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(n.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <button 
              onClick={() => checkAccess('PRO') ? onNavigate('filing-tracker') : onNavigate('pricing')}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                checkAccess('PRO')
                  ? 'bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30'
                  : 'bg-white/10 border border-white/20 cursor-not-allowed'
              }`}
            >
              {checkAccess('PRO') ? (
                <>
                  <Activity className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Filing Tracker</p>
                    <p className="text-xs text-indigo-100">Manage your filings</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white ml-auto" />
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-white/60" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white/60">Filing Tracker</p>
                    <p className="text-xs text-white/40">Upgrade to unlock</p>
                  </div>
                </>
              )}
            </button>

            <button 
              onClick={() => checkAccess('PRO') ? onNavigate('new-filing') : onNavigate('pricing')}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                checkAccess('PRO')
                  ? 'bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30'
                  : 'bg-white/10 border border-white/20 cursor-not-allowed'
              }`}
            >
              {checkAccess('PRO') ? (
                <>
                  <Plus className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">New Filing</p>
                    <p className="text-xs text-indigo-100">Submit application</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white ml-auto" />
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-white/60" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white/60">New Filing</p>
                    <p className="text-xs text-white/40">Pro feature</p>
                  </div>
                </>
              )}
            </button>

            <button 
              onClick={() => onNavigate('pricing')}
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg"
            >
              <Crown className="w-5 h-5 text-white" />
              <div className="text-left">
                <p className="text-sm font-bold text-white">
                  {isPremium ? 'Premium Active' : 'Upgrade Plan'}
                </p>
                <p className="text-xs text-white/90">
                  {isPremium ? getPlanDisplayName(userPlan) : 'Unlock all features'}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white ml-auto" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            label: 'Total Patents', 
            value: dbStats.totalPatents || 0, 
            icon: FileText, 
            gradient: 'from-blue-500 to-cyan-500',
            bg: 'from-blue-50 to-cyan-50'
          },
          { 
            label: 'Active Filings', 
            value: dbStats.activeFilings || 0, 
            icon: TrendingUp, 
            gradient: 'from-green-500 to-emerald-500',
            bg: 'from-green-50 to-emerald-50'
          },
          { 
            label: 'Protected Assets', 
            value: dbStats.protectedAssets || 0, 
            icon: Shield, 
            gradient: 'from-purple-500 to-pink-500',
            bg: 'from-purple-50 to-pink-50'
          },
          { 
            label: 'Critical Alerts', 
            value: dbStats.criticalAlerts || 0, 
            icon: AlertCircle, 
            gradient: 'from-orange-500 to-red-500',
            bg: 'from-orange-50 to-red-50'
          }
        ].map((stat, i) => (
          <div key={i} className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl blur-xl`}></div>
            <div className={`relative bg-gradient-to-br ${stat.bg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white transform hover:scale-105 duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-5 h-5 text-slate-300" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {activities.length > 0 ? activities.slice(0, 5).map((a, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{a.title}</p>
                  <p className="text-xs text-slate-500 truncate">{a.description}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{a.time}</span>
              </div>
            )) : (
              <div className="py-12 text-center">
                <Database className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Deadlines
          </h3>
          <div className="space-y-3">
            {deadlines.length > 0 ? deadlines.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-start justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">{d.task}</p>
                  <p className="text-xs text-slate-500">{d.date}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap ${
                  d.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {d.priority}
                </span>
              </div>
            )) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-400">All clear!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;