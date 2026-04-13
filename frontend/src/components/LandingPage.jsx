import React, { useState } from 'react';
import { 
  BrainCircuit, Globe, ShieldCheck, TrendingUp, Search, Zap, 
  ArrowRight, X, Mail, MapPin, ChevronDown, 
  Layers, Sparkles, Building2
} from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  const [showModal, setShowModal] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const ModalContent = () => {
    if (showModal === 'privacy') {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Privacy Policy</h2>
          <div className="space-y-3 text-sm text-slate-600 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <p><strong>Last Updated:</strong> December 26, 2025</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">1. Information We Collect</h3>
            <p>We collect information you provide directly to us, including Name, Email, Organization details, and IP data.</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">2. Usage</h3>
            <p>To provide services, process filings, and improve AI models. We do not sell your data.</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">3. Security</h3>
            <p>We use banking-grade encryption (AES-256) for all stored data.</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">4. Contact</h3>
            <p>Email: <a href="mailto:bhuvananagarajan0728@gmail.com" className="text-indigo-600 hover:underline">bhuvananagarajan0728@gmail.com</a></p>
          </div>
        </div>
      );
    }
    if (showModal === 'terms') {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Terms of Service</h2>
          <div className="space-y-3 text-sm text-slate-600 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <p><strong>Last Updated:</strong> December 26, 2025</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">1. License</h3>
            <p>Permission granted to use the platform for IP management. Redistribution is prohibited.</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">2. Liability</h3>
            <p>This is an academic project. We are not liable for legal outcomes regarding your patents.</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">3. Contact</h3>
            <p>Email: <a href="mailto:bhuvananagarajan0728@gmail.com" className="text-indigo-600 hover:underline">bhuvananagarajan0728@gmail.com</a></p>
          </div>
        </div>
      );
    }
    if (showModal === 'contact') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Contact Support</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Email Support</h3>
                <a href="mailto:bhuvananagarajan0728@gmail.com" className="text-indigo-600 font-medium hover:underline block break-all">
                  bhuvananagarajan0728@gmail.com
                </a>
                <p className="text-xs text-slate-500 mt-1">Response time: ~24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">HQ Location</h3>
                <p className="text-slate-600 text-sm">Infosys Springboard Tech Hub</p>
                <p className="text-slate-600 text-sm">India</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-600" />
                <span className="font-bold text-slate-900 tracking-tight">Global IP</span>
              </div>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <ModalContent />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button onClick={() => setShowModal(null)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">Global IP <span className="text-indigo-600">Intelligence</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How it Works</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Testimonials</a>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('login')} className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                Log in
              </button>
              <button onClick={() => onNavigate('register')} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-600/20">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-50/80 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-50/80 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 fill-indigo-200" />
            <span>New: AI-Powered Infringement Detection 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Secure Your Genius <br />
            <span className="text-indigo-600">
              Global IP Intelligence
            </span>
          </h1>
          
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The world's most advanced platform for managing, protecting, and monetizing your intellectual property. 
            From patent filing to AI-driven infringement watch, we cover it all.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            {/* ✅ FIXED: Access Platform now goes to Login */}
            <button 
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Access Platform <ArrowRight className="w-5 h-5" />
            </button>
            
            {/* ✅ FIXED: Register Firm now goes to Register */}
            <button 
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl border-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
            >
              Register Firm
            </button>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 animate-in fade-in duration-1000 delay-500">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by Innovators at</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 text-slate-600">
               <div className="flex items-center gap-2 text-xl font-bold"><Building2 className="w-6 h-6"/> TechCorp</div>
               <div className="flex items-center gap-2 text-xl font-bold"><Globe className="w-6 h-6"/> GlobalNet</div>
               <div className="flex items-center gap-2 text-xl font-bold"><Zap className="w-6 h-6"/> FutureEnergy</div>
               <div className="flex items-center gap-2 text-xl font-bold"><ShieldCheck className="w-6 h-6"/> SecureIT</div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-3">Powerful Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900">Everything you need to manage IP</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-3">Smart Semantic Search</h4>
                <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
                  Don't just search for keywords. Our AI understands the *concept* of your invention and finds prior art, competing patents, and white spaces in the market with 99.9% accuracy.
                </p>
                <div className="mt-8 flex gap-3">
                  <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">Prior Art</div>
                  <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">Freedom to Operate</div>
                  <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">Invalidity Search</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group">
              <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-600/20">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">AI Analysis</h4>
              <p className="text-slate-600 leading-relaxed">
                Get instant predictions on patentability scores, potential infringement risks, and portfolio valuation using machine learning models.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Global Watch</h4>
              <p className="text-slate-600 leading-relaxed">
                Monitor filings in 150+ jurisdictions. Receive real-time alerts when competitors file patents similar to yours.
              </p>
            </div>

            <div className="md:col-span-2 p-8 rounded-3xl bg-indigo-900 text-white shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold mb-3">Portfolio Analytics</h4>
                  <p className="text-indigo-100 text-lg leading-relaxed">
                    Visualize your IP assets like never before. Track filing trends, grant rates, and geographic distribution with interactive dashboards exportable for board meetings.
                  </p>
                </div>
                <div className="w-full md:w-1/3 bg-white/10 rounded-xl border border-white/10 p-4 backdrop-blur-sm">
                   <div className="space-y-3">
                      <div className="h-2 bg-white/20 rounded w-3/4"></div>
                      <div className="h-2 bg-white/10 rounded w-1/2"></div>
                      <div className="h-2 bg-white/10 rounded w-full"></div>
                      <div className="h-32 bg-indigo-500/30 rounded mt-4 flex items-end justify-between p-2">
                         <div className="w-2 h-10 bg-indigo-300 rounded-t"></div>
                         <div className="w-2 h-16 bg-indigo-300 rounded-t"></div>
                         <div className="w-2 h-12 bg-indigo-300 rounded-t"></div>
                         <div className="w-2 h-20 bg-indigo-300 rounded-t"></div>
                         <div className="w-2 h-14 bg-indigo-300 rounded-t"></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="how-it-works" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-black text-slate-900">From Idea to Asset in 3 Steps</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 -z-10"></div>
            
            {[
              { icon: Search, title: "1. Search & Validate", desc: "Run a comprehensive search to ensure your idea is unique." },
              { icon: Layers, title: "2. Analyze & File", desc: "Use AI to draft claims and file directly through our secure portal." },
              { icon: ShieldCheck, title: "3. Monitor & Monetize", desc: "Track grant status and enforce your rights globally." }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-50 shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-slate-600 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100">
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Sparkles key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xl text-slate-700 font-medium italic mb-6">
                "Global IP Intelligence revolutionized our patent strategy. The AI analysis caught an infringement risk that traditional searches missed, saving us millions."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div>
                  <p className="font-bold text-slate-900">Dr. Sarah Chen</p>
                  <p className="text-sm text-slate-500">CTO, FutureEnergy</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100">
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Sparkles key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xl text-slate-700 font-medium italic mb-6">
                "The dashboard is incredible. I can see our entire global portfolio status at a glance. It's the command center every IP law firm needs."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div>
                  <p className="font-bold text-slate-900">James Sterling</p>
                  <p className="text-sm text-slate-500">Partner, Sterling & Co.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is my data secure?", a: "Absolutely. We use enterprise-grade encryption for data at rest and in transit. Your inventions are safe with us." },
              { q: "Can I file patents directly?", a: "Yes, our Filing Tracker allows you to prepare and submit applications to major patent offices (USPTO, EPO, WIPO)." },
              { q: "Do you offer a free trial?", a: "Yes! Sign up today for a 14-day free trial of our Pro plan features." },
              { q: "What is AI Analysis?", a: "Our AI reads your patent draft and compares it against millions of documents to predict success rates and suggest improvements." }
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 py-4 bg-white text-slate-600 animate-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-6">Ready to Transform Your IP Strategy?</h2>
          <p className="text-xl text-indigo-100 mb-10 font-medium">Join 12,000+ innovators protecting their ideas with Global IP Intelligence.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => onNavigate('register')}
              className="px-10 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-xl hover:bg-indigo-50 hover:scale-105 transition-all"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => setShowModal('contact')}
              className="px-10 py-4 bg-transparent border-2 border-indigo-300 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-slate-950 text-slate-400 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-900 pb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-6 w-6 text-indigo-500" />
              <span className="text-white font-bold text-xl">Global IP</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Empowering the world's innovators with intelligent, secure, and data-driven intellectual property management.
            </p>
            <div className="flex gap-4">
              <a href="mailto:bhuvananagarajan0728@gmail.com" className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer group" title="Email Us">
                <Mail size={16} className="text-slate-400 group-hover:text-white"/>
              </a>
              <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer"><Globe size={16}/></div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Patent Search</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Analytics Dashboard</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Filing Tracker</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Global Watch</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><button onClick={() => setShowModal('contact')} className="hover:text-indigo-400 transition-colors">Contact</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => setShowModal('privacy')} className="hover:text-indigo-400 transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => setShowModal('terms')} className="hover:text-indigo-400 transition-colors text-left">Terms of Service</button></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Security Standards</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Cookie Settings</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">&copy; 2026 Global IP Intelligence Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Systems Operational</span>
            </div>
            <span className="text-slate-700">|</span>
            <span>Version 2.4.0-stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;