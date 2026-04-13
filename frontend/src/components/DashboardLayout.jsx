import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Shield,
  Activity,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Menu,
  BarChart3,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Clock,
  X,
  Lock,
  Globe,
  Calendar,
  MessageSquare,
  LifeBuoy,
  BookOpen,
  Video,
  ChevronLeft
} from 'lucide-react';

const DashboardLayout = ({ user, onLogout, currentPage, onNavigate, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const isSuperAdmin = user?.role === 'ADMIN' || user?.email === ADMIN_EMAIL;

  const PLAN_LEVELS = {
    'STARTUP': 1,
    'PRO': 2,
    'ENTERPRISE': 3
  };

  const userPlan = user?.planType || 'STARTUP';
  const userLevel = PLAN_LEVELS[userPlan] || 1;

  const hasAccess = (requiredLevel) => {
    return userLevel >= PLAN_LEVELS[requiredLevel];
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    }).format(date);
  };

  const handleFeatureComingSoon = () => {
    alert("🚀 This resource will be added in the next update!");
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
        q: "How do I file a new patent?",
        a: "Navigate to 'New Filing' in the sidebar, fill out the application form with your invention details, and click Submit. You can track its status in the 'Filing Tracker'."
    },
    {
        q: "How to upgrade my subscription?",
        a: "Go to 'Settings' > 'Billing' to view available plans. Click 'Upgrade' on the plan that suits your needs to unlock Pro or Enterprise features."
    },
    {
        q: "Exporting reports to PDF",
        a: "In the 'Legal Dashboard' or 'Landscape View', look for the 'Export' button at the top right. Select PDF format to download your report."
    },
    {
        q: "Managing team permissions",
        a: "This feature is available for Enterprise plans. Go to Settings to manage user roles."
    }
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, required: 'STARTUP' },
    { id: 'patents', label: 'Total Patents', icon: FileText, required: 'STARTUP' },
    { id: 'search', label: 'Search IP Analysis', icon: Search, required: 'STARTUP' },
    { id: 'filing-tracker', label: 'Filing Tracker', icon: Clock, required: 'PRO' },
    { id: 'new-filing', label: 'New Filing', icon: Shield, required: 'PRO' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Activity, required: 'PRO' }, 
    { id: 'landscape', label: 'Landscape View', icon: TrendingUp, required: 'ENTERPRISE' },
    { id: 'legal-dashboard', label: 'Legal Dashboard', icon: BarChart3, required: 'ENTERPRISE' },
    
    ...(isSuperAdmin ? [
      { id: 'admin-monitoring', label: 'Admin Dashboard', icon: Globe, required: 'STARTUP', isAdmin: true }
    ] : []),

    { id: 'help', label: 'Help Center', icon: LifeBuoy, required: 'STARTUP' },
    { id: 'feedback', label: 'Give Feedback', icon: MessageSquare, required: 'STARTUP' },
    
    { id: 'settings', label: 'Settings', icon: SettingsIcon, required: 'STARTUP' },
  ];

  const handleNavigation = (id, requiredPlan) => {
    if (id === 'feedback') {
        window.open("https://mail.google.com/mail/?view=cm&fs=1&to=tripathiabhinav042@gmail.com&su=Platform%20Feedback%20-%20Global%20IP", "_blank");
        return;
    }

    if (id === 'help') {
        setIsHelpOpen(true);
        setIsSidebarOpen(false);
        return;
    }

    if (hasAccess(requiredPlan)) {
      onNavigate(id);
      setIsSidebarOpen(false);
    } else {
      alert(`🔒 Access Denied\n\nPlease upgrade to the ${requiredPlan} plan to access ${id.replace('-', ' ')}.`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) onNavigate('search', searchTerm);
  };

  const quotes = [
    "Innovation distinguishes between a leader and a follower.",
    "The best way to predict the future is to create it.",
    "Protecting today's ideas for tomorrow's world."
  ];
  const activeQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);
  const userNameDisplay = user?.name || 'Authorized User';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-left font-sans selection:bg-indigo-100">
      
      {isHelpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <LifeBuoy size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Help Center</h3>
                  <p className="text-sm text-slate-500">How can we help you today?</p>
                </div>
              </div>
              <button onClick={() => setIsHelpOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={handleFeatureComingSoon}
                    className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-200 transition-all text-left group"
                >
                  <BookOpen className="w-6 h-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-slate-900 text-sm">User Guides</h4>
                  <p className="text-xs text-slate-500">Learn platform basics</p>
                </button>
                <button 
                    onClick={handleFeatureComingSoon}
                    className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-200 transition-all text-left group"
                >
                  <Video className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-slate-900 text-sm">Video Tutorials</h4>
                  <p className="text-xs text-slate-500">Watch & learn</p>
                </button>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Frequently Asked</h4>
                <div className="space-y-2">
                  {faqData.map((faq, i) => (
                    <div key={i} className="border border-slate-100 rounded-lg overflow-hidden transition-all duration-200 bg-slate-50">
                      <button 
                        onClick={() => toggleFaq(i)}
                        className="w-full flex justify-between items-center p-3 hover:bg-indigo-50 transition-colors text-left"
                      >
                        <span className="text-sm text-slate-700 font-bold">{faq.q}</span>
                        {openFaqIndex === i ? 
                            <ChevronDown size={16} className="text-indigo-500" /> : 
                            <ChevronRight size={16} className="text-slate-400" />
                        }
                      </button>
                      
                      {openFaqIndex === i && (
                        <div className="p-3 pt-0 text-xs text-slate-600 bg-indigo-50/30 leading-relaxed border-t border-indigo-100/50 animate-in fade-in slide-in-from-top-1">
                            {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        ${isSidebarCollapsed ? 'w-20' : 'w-72'} 
        bg-[#0F172A] text-white fixed h-full z-[70] transition-all duration-300 border-r border-white/5 shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col
      `}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tighter uppercase leading-none">Global IP</h2>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1.5">Intelligence</p>
              </div>
            </div>
          )}
          
          <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
          
          <button 
            className="hidden md:block text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {navItems.map(item => {
            const isLocked = !hasAccess(item.required);
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.preventDefault(); 
                  handleNavigation(item.id, item.required);
                }}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group 
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <div className={`flex items-center gap-4 ${isLocked ? 'opacity-50' : 'opacity-100'}`}>
                  <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} />
                  {!isSidebarCollapsed && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                </div>
                
                {!isSidebarCollapsed && (
                  <>
                    {isActive ? (
                      <ChevronRight size={14} className="animate-in slide-in-from-left-2" />
                    ) : isLocked ? (
                      <Lock size={14} className="text-slate-600 group-hover:text-rose-400 transition-colors" />
                    ) : null}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 bg-slate-900/50 shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group"
            title={isSidebarCollapsed ? "Logout" : ''}
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            {!isSidebarCollapsed && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      <div className={`flex-1 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'} transition-all duration-300 flex flex-col min-h-screen relative`}>
        <header className="h-20 px-6 md:px-10 flex justify-between items-center border-b border-slate-200 bg-white/70 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden lg:block border-l-4 border-indigo-500 pl-4 py-1 max-w-sm">
              <p className="text-slate-500 italic font-medium text-xs leading-relaxed">"{activeQuote}"</p>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs ml-4 hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search assets..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all" />
            </form>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            
            <div className="hidden md:flex flex-col items-end mr-2">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar size={12} />
                <span className="text-xs font-bold uppercase tracking-wide">{formatDate(currentTime)}</span>
              </div>
              <span className="text-sm font-black text-slate-800 tabular-nums leading-tight">
                {formatTime(currentTime)}
              </span>
            </div>

            <button onClick={() => onNavigate('profile')} className="flex items-center gap-3 md:gap-4 hover:bg-slate-50 p-1.5 rounded-2xl transition-all group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-black shadow-md group-hover:scale-105 transition-transform">
                {userNameDisplay.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left pr-2">
                <p className="text-sm font-black text-slate-900 tracking-tight leading-none capitalize">{userNameDisplay}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                   <Shield size={10} className="text-indigo-500" /> Verified Analyst
                </p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 bg-[#F8FAFC] animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </main>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default DashboardLayout;