import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Share2, 
  FileText, 
  CheckCircle, 
  Calendar, 
  Globe, 
  User, 
  Building, 
  Tag,
  Bookmark,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const PatentDetailsPage = ({ patent, onBack }) => {
  // --- 1. TRACKING STATE ---
  const [isTracked, setIsTracked] = useState(false);

  // --- 2. HANDLE MISSING DATA ---
  if (!patent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the details. Please go back and select a patent again.
          </p>
          <button 
            onClick={onBack} 
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  // ✅ MAPPING FIXES: Ensure data displays correctly from both Database and SerpApi
  const displayAbstract = patent.details || patent.abstractText || "No description available for this record.";
  const displayID = patent.patentNumber || patent.assetNumber || patent.id;
  const displayInventors = Array.isArray(patent.inventors) ? patent.inventors.join(", ") : (patent.inventors || patent.inventor || "Not Listed");
  const displayAssignee = Array.isArray(patent.owners) ? patent.owners.join(", ") : (patent.assignee || "Not Listed");

  // --- 3. ACTION HANDLERS ---

  const handleTrackToggle = () => {
    setIsTracked(!isTracked);
  };

  const handleDownload = () => {
    // Triggers the browser print dialog (which allows saving as PDF)
    window.print();
  };

  const handleCopy = () => {
    const textToCopy = `Title: ${patent.title}\nID: ${displayID}\nAbstract: ${displayAbstract}`;
    navigator.clipboard.writeText(textToCopy);
    alert('✅ Patent summary copied to clipboard!');
  };

  const handleShare = () => {
    const subject = encodeURIComponent(`Patent: ${patent.title}`);
    const body = encodeURIComponent(`Title: ${patent.title}\nID: ${displayID}\n\nAbstract:\n${displayAbstract}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleViewSource = () => {
    const cleanNumber = String(displayID).replace(/[^a-zA-Z0-9]/g, '');
    const url = `https://patents.google.com/patent/${cleanNumber}/en`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (['ACTIVE', 'GRANTED', 'REGISTERED'].includes(s)) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s === 'PENDING') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s === 'EXPIRED') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 animate-in fade-in duration-500 print:bg-white print:p-0">
      
      {/* Back Button (Hidden during print) */}
      <button 
        onClick={onBack} 
        className="group flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-colors font-medium print:hidden"
      >
        <div className="p-2 bg-white border border-gray-200 rounded-lg group-hover:border-indigo-200 transition-colors shadow-sm">
            <ArrowLeft size={18} />
        </div>
        Back to Results
      </button>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-5xl mx-auto print:shadow-none print:border-none">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden print:bg-none print:text-black">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 print:hidden"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusBadge(patent.status)} print:border-gray-300`}>
                    {patent.status || 'Active'}
                </span>
                <span className="text-slate-400 text-sm font-mono flex items-center gap-2 print:text-gray-500">
                    <FileText size={14}/> ID: {displayID}
                </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">{patent.title}</h1>

            <div className="flex flex-wrap gap-6 text-slate-300 text-sm print:text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-400 print:text-gray-400"/>
                    <span>Filed: <span className="text-white font-medium print:text-black">{patent.filingDate || 'N/A'}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe size={16} className="text-indigo-400 print:text-gray-400"/>
                    <span>Jurisdiction: <span className="text-white font-medium print:text-black">{patent.jurisdiction || 'Global'}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Tag size={16} className="text-indigo-400 print:text-gray-400"/>
                    <span>Type: <span className="text-white font-medium print:text-black">{patent.type || 'Patent'}</span></span>
                </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Hidden during print) */}
        <div className="border-b border-gray-100 px-8 py-4 bg-gray-50 flex flex-wrap justify-between items-center gap-4 print:hidden">
            <div className="flex flex-wrap gap-3">
                <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                    <Download size={16} /> Print PDF
                </button>
                <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                    <Copy size={16} /> Copy Text
                </button>
                <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                    <Share2 size={16} /> Share
                </button>
            </div>

            <button 
                onClick={handleTrackToggle} 
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md ${
                    isTracked 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
                <Bookmark size={16} fill={isTracked ? "currentColor" : "none"} />
                {isTracked ? 'Item Tracked' : 'Track Patent'}
            </button>
        </div>

        {/* Details Body */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10 print:block">
            
            <div className="lg:col-span-2 space-y-8">
                <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-indigo-600" size={20} /> Abstract / Description
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-gray-700 leading-relaxed text-justify whitespace-pre-wrap print:bg-white print:border-none print:p-0">
                        {displayAbstract}
                    </div>
                </section>

                <section className="print:hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-purple-600" size={20} /> Full Source Information
                    </h3>
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-sm text-amber-900 flex flex-col gap-3">
                        <p>Detailed legal claims, drawings, and full-text descriptions are hosted on official patent registries.</p>
                        <button 
                            onClick={handleViewSource}
                            className="flex items-center gap-2 font-bold underline hover:text-amber-700 w-fit"
                        >
                            View Full Patent on Google Patents <ExternalLink size={14} />
                        </button>
                    </div>
                </section>
            </div>

            <div className="space-y-6 print:mt-10">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm print:border-none print:p-0">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ownership</h3>
                    
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <User size={16} /> <span className="text-sm font-semibold">Inventors</span>
                        </div>
                        <p className="text-gray-900 font-medium text-sm pl-6">
                            {displayInventors}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <Building size={16} /> <span className="text-sm font-semibold">Current Assignee</span>
                        </div>
                        <p className="text-gray-900 font-medium text-sm pl-6">
                            {displayAssignee}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm print:border-none print:p-0">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Classification</h3>
                    <div className="mb-3">
                        <span className="text-xs text-gray-500 block mb-1">IPC / Classification Code</span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono font-bold">
                            {patent.ipcCode || patent.assetClass || "N/A"}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block mb-1">System Source</span>
                        <span className="text-sm font-medium text-gray-900 uppercase">
                          {patent.apiSource || "Database"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatentDetailsPage;