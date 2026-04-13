import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, FileText, CheckCircle, Clock, RefreshCw, AlertTriangle, 
  Activity, Globe, Calendar, X, Users, Download
} from 'lucide-react';
import analyticsAPI from '../api/analytics';
import {
  STATUS_COLORS, formatNumber
} from '../utils/chartHelpers';
import { exportToJSON } from '../utils/exportHelpers';

const LegalDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [dateRange, setDateRange] = useState('all'); 
  const [selectedType, setSelectedType] = useState('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');

  const [dashboardData, setDashboardData] = useState({
    summary: { totalFilings: 0, activePatents: 0, pendingApplications: 0, expiringSoon: 0 },
    statusDistribution: [],
    filingsTrend: [],
    fieldWiseTrends: [],
    jurisdictionBreakdown: [],
    statusTimeline: []
  });

  const [modalTitle, setModalTitle] = useState(null);
  const [drillDownData, setDrillDownData] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    
    try {
      const params = { 
        dateRange: dateRange, 
        type: selectedType, 
        jurisdiction: selectedJurisdiction,
        t: new Date().getTime() 
      };
      
      const [summary, statusDist, filingsTrend, fieldTrends, jurisdictionData, timeline] = await Promise.all([
        analyticsAPI.getDashboardSummary(params),
        analyticsAPI.getStatusDistribution(params),
        analyticsAPI.getFilingsTrend(params),
        analyticsAPI.getFieldWiseTrends(params),
        analyticsAPI.getJurisdictionBreakdown(params),
        analyticsAPI.getStatusTimeline(params)
      ]);
      
      setDashboardData({ 
        summary: summary || { totalFilings: 0, activePatents: 0, pendingApplications: 0, expiringSoon: 0 }, 
        statusDistribution: statusDist?.data || [], 
        filingsTrend: filingsTrend?.data || [], 
        fieldWiseTrends: fieldTrends?.data || [], 
        jurisdictionBreakdown: jurisdictionData?.data || [], 
        statusTimeline: timeline?.data || [] 
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchDashboardData(); 

    const interval = setInterval(() => {
        fetchDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [dateRange, selectedType, selectedJurisdiction]); 

  const handleCardClick = async (type, statusFilter) => {
    setModalTitle(type);
    setLoadingModal(true);
    setDrillDownData([]);

    try {
      const response = await analyticsAPI.getAssetsByCategory(
        statusFilter, 
        dateRange, 
        selectedType, 
        selectedJurisdiction
      );
      setDrillDownData(response?.data || []);
    } catch (error) {
      console.error(error);
      setDrillDownData([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleChartClick = (data) => {
    if (!data || !data.activePayload || !data.activePayload[0]) return;
    const payload = data.activePayload[0].payload;
    const key = payload.name || payload.jurisdiction || payload.quarter;
    handleCardClick(`Category: ${key}`, key);
  };

  if (loading) return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
      <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      <span className="text-gray-500 font-medium">Loading Analytics...</span>
    </div>
  );

  const { summary, statusDistribution, filingsTrend, jurisdictionBreakdown, statusTimeline } = dashboardData;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Legal Analytics</h1>
           <p className="text-sm text-gray-500 mt-1">Real-time IP portfolio performance</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)} 
                    className="text-sm bg-transparent outline-none text-gray-700 font-medium cursor-pointer"
                >
                    <option value="all">All Time</option>
                    <option value="year">This Year (2026)</option>
                    <option value="last_year">Last Year (2025)</option>
                    <option value="last_3_years">Last 3 Years</option>
                    <option value="last_5_years">Last 5 Years</option>
                </select>
            </div>

            <button onClick={() => exportToJSON(dashboardData, 'legal_report')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm">
                <Download className="w-4 h-4" /> Export
            </button>
            
            <button onClick={() => fetchDashboardData(true)} disabled={refreshing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-blue-200 disabled:opacity-70">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
                {refreshing ? 'Syncing...' : 'Sync Data'}
            </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div onClick={() => handleCardClick('Total Filings', '')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Total Filings</p>
            <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{formatNumber(summary.totalFilings)}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div onClick={() => handleCardClick('Active Patents', 'ACTIVE')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Active Patents</p>
            <p className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{formatNumber(summary.activePatents)}</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div onClick={() => handleCardClick('Pending Applications', 'PENDING')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Pending</p>
            <p className="text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{formatNumber(summary.pendingApplications)}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <div onClick={() => handleCardClick('Expiring Soon', 'EXPIRING')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Critical Alerts</p>
            <p className="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">{formatNumber(summary.expiringSoon)}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 group-hover:bg-red-100 transition-colors">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Status Distribution</h3>
            <Activity className="text-gray-400 w-5 h-5"/>
          </div>
          <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie 
                    data={statusDistribution} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    innerRadius={60}
                    paddingAngle={5}
                    onClick={handleChartClick}
                    cursor="pointer"
                >
                    {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-gray-900">Filing Trends</h3>
             <TrendingUp className="text-green-500 w-5 h-5"/>
           </div>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={filingsTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorPatents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="patents" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPatents)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
           <h3 className="font-bold text-gray-900 mb-6">Jurisdiction Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jurisdictionBreakdown} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} onClick={handleChartClick} cursor="pointer">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="jurisdiction" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="patents" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
           <h3 className="font-bold text-gray-900 mb-6">Grant Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={statusTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorGranted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="granted" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGranted)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {modalTitle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{modalTitle}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {loadingModal ? 'Syncing...' : `Showing ${drillDownData.length} records`}
                </p>
              </div>
              <button onClick={() => setModalTitle(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1 bg-gray-50">
              {loadingModal ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-500 font-medium text-sm">Fetching assets...</p>
                </div>
              ) : drillDownData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No records found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {drillDownData.map((asset) => (
                    <div key={asset.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${asset.type === 'PATENT' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{asset.type}</span>
                        </div>
                        <h4 className="font-bold text-base text-gray-900 mb-1">{asset.title}</h4>
                        <p className="text-xs text-gray-500">Status: {asset.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
               <button onClick={() => setModalTitle(null)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
                 Close View
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LegalDashboardPage;