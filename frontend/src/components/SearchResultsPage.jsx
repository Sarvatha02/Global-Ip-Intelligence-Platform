import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Search, Filter, Grid, List, ChevronLeft, ChevronRight, 
    Check, Database, Globe, User, Calendar, MapPin, Loader2, 
    RefreshCcw, Zap, Cpu, Map as MapIcon, Layers, AlertCircle,
    ArrowUpRight, Lock, Crown, AlertTriangle, Info
} from 'lucide-react';
import client from '../api/client';
import { searchAPI } from '../api/searchAPI';
import MapViewPage from './MapViewPage';

const SearchResultsPage = ({ initialKeyword = '', onViewPatent, user: propUser }) => {
    
    const isInitialMount = useRef(true);
    const searchInProgress = useRef(false);
    const isSyncingRef = useRef(false);

    const getUserData = () => {
        if (propUser) return propUser;
        try {
            return JSON.parse(localStorage.getItem('user')) || {};
        } catch (e) { return {}; }
    };
    const currentUser = getUserData();

    const PLAN_LEVELS = { 'STARTUP': 1, 'PRO': 2, 'ENTERPRISE': 3 };
    const SEARCH_LIMITS = { 'STARTUP': 5, 'PRO': 10, 'ENTERPRISE': Infinity };
    const CYCLE_DAYS = 15;

    const userPlan = currentUser?.planType || 'STARTUP';
    const userLevel = PLAN_LEVELS[userPlan] || 1;
    const limitMax = SEARCH_LIMITS[userPlan] || 5;

    const hasAccess = (requiredLevel) => userLevel >= PLAN_LEVELS[requiredLevel];

    const [quotaInfo, setQuotaInfo] = useState({ count: 0, resetDate: null });

    const getStorageKey = () => `search_quota_${currentUser.id || 'guest'}`;

    const loadQuota = () => {
        try {
            const data = JSON.parse(localStorage.getItem(getStorageKey()));
            if (!data) return { count: 0, cycleStart: Date.now(), lastKeyword: '' };

            const now = Date.now();
            const cycleStart = new Date(data.cycleStart).getTime();
            const daysPassed = (now - cycleStart) / (1000 * 60 * 60 * 24);

            if (daysPassed >= CYCLE_DAYS) {
                const newCycle = { count: 0, cycleStart: now, lastKeyword: '' };
                localStorage.setItem(getStorageKey(), JSON.stringify(newCycle));
                return newCycle;
            }
            return data;
        } catch (e) {
            return { count: 0, cycleStart: Date.now(), lastKeyword: '' };
        }
    };

    useEffect(() => {
        const data = loadQuota();
        const resetDate = new Date(data.cycleStart);
        resetDate.setDate(resetDate.getDate() + CYCLE_DAYS);
        setQuotaInfo({ count: data.count, resetDate });
    }, [currentUser.id]);

    const consumeSearchQuota = (newKeyword) => {
        if (userPlan === 'ENTERPRISE') return true;

        const data = loadQuota();
        const cleanKeyword = newKeyword.trim().toLowerCase();

        if (data.lastKeyword === cleanKeyword) return true;

        if (data.count >= limitMax) {
            const resetStr = new Date(quotaInfo.resetDate).toLocaleDateString();
            alert(`🚫 Search Limit Reached!\n\nYou have used ${data.count}/${limitMax} keywords for your ${userPlan} plan.\n\nYour quota resets on ${resetStr}.\nUpgrade to Enterprise for unlimited access.`);
            return false;
        }

        data.count += 1;
        data.lastKeyword = cleanKeyword;
        localStorage.setItem(getStorageKey(), JSON.stringify(data));
        
        const resetDate = new Date(data.cycleStart);
        resetDate.setDate(resetDate.getDate() + CYCLE_DAYS);
        setQuotaInfo({ count: data.count, resetDate });
        
        return true;
    };

    const loadSavedState = () => {
        try {
            const saved = sessionStorage.getItem('searchPageParams');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    };

    const savedState = loadSavedState();
    const shouldRestore = savedState && (!initialKeyword || initialKeyword === savedState.filters.keyword);

    const [results, setResults] = useState(shouldRestore ? (savedState.results || []) : []);
    const [loading, setLoading] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(null);
    const [viewMode, setViewMode] = useState(shouldRestore ? savedState.viewMode : 'list'); 
    const [showFilters, setShowFilters] = useState(true);
    const [trackedIds, setTrackedIds] = useState(shouldRestore ? savedState.trackedIds : {});

    const [currentPage, setCurrentPage] = useState(shouldRestore ? savedState.currentPage : 1);
    const [itemsPerPage, setItemsPerPage] = useState(shouldRestore ? savedState.itemsPerPage : 10);
    const [totalResults, setTotalResults] = useState(shouldRestore ? savedState.totalResults : 0);
    const [totalPages, setTotalPages] = useState(shouldRestore ? savedState.totalPages : 0);
    
    const [keywordInput, setKeywordInput] = useState(shouldRestore ? savedState.filters.keyword : initialKeyword);
    const [searchTrigger, setSearchTrigger] = useState(0); 
    const [activeSource, setActiveSource] = useState(shouldRestore ? savedState.source : 'local');
    const [hasSearched, setHasSearched] = useState(shouldRestore || !!initialKeyword);

    const [filters, setFilters] = useState({
        keyword: shouldRestore ? savedState.filters.keyword : initialKeyword,
        jurisdictions: shouldRestore ? (savedState.filters.jurisdictions || []) : [],
        ipType: shouldRestore ? savedState.filters.ipType : 'both',
        statuses: shouldRestore ? (savedState.filters.statuses || []) : [],
    });

    useEffect(() => {
        const stateToSave = {
            results, filters, currentPage, itemsPerPage, totalResults, totalPages, 
            trackedIds, viewMode, source: activeSource, searchTrigger, hasSearched, keywordInput
        };
        sessionStorage.setItem('searchPageParams', JSON.stringify(stateToSave));
    }, [results, filters, currentPage, itemsPerPage, totalResults, totalPages, trackedIds, viewMode, activeSource, searchTrigger, hasSearched, keywordInput]);

    const fetchResults = useCallback(async () => {
        const query = filters.keyword ? filters.keyword.trim() : '';
        const hasActiveFilters = (filters.jurisdictions?.length > 0) || (filters.statuses?.length > 0);

        if (!query && !hasActiveFilters) return;
        
        if (query && !consumeSearchQuota(query)) return;

        if (searchInProgress.current) return;
        
        searchInProgress.current = true;
        setLoading(true);

        try {
            const params = {
                keyword: query || null,
                q: query || null,
                ipType: filters.ipType === 'both' ? null : filters.ipType.toUpperCase(),
                jurisdictions: filters.jurisdictions?.length > 0 ? filters.jurisdictions : null,
                statuses: filters.statuses?.length > 0 ? filters.statuses : null,
                page: currentPage - 1,
                size: itemsPerPage,
            };

            const localRes = await searchAPI.searchAll({ ...params, source: 'local' });
            
            let content = localRes?.content || [];
            let totalElements = localRes?.totalElements || 0;

            if (totalElements > 0) {
                setResults(content);
                setTotalResults(totalElements);
                setTotalPages(localRes?.totalPages || 0);
                setActiveSource('local');
            } else {
                const apiRes = await searchAPI.searchAll({ ...params, source: 'api' });
                const apiContent = apiRes?.content || [];
                
                if (apiContent.length > 0) {
                    setResults(apiContent);
                    setTotalResults(apiRes.totalElements || apiContent.length);
                    setTotalPages(apiRes.totalPages || 1);
                    setActiveSource('api');

                    if (!isSyncingRef.current) {
                        isSyncingRef.current = true;
                        client.post(`/ipassets/sync`, apiContent)
                            .then(res => console.log("Sync Response:", res.data))
                            .catch(e => console.error("Sync Error:", e))
                            .finally(() => { isSyncingRef.current = false; });
                    }
                } else {
                    setResults([]);
                    setTotalResults(0);
                    setTotalPages(0);
                    setActiveSource('local'); 
                }
            }
            setHasSearched(true);
        } catch (err) {
            console.error('Search Workflow Error:', err);
        } finally {
            setLoading(false);
            setTimeout(() => { searchInProgress.current = false; }, 500);
        }
    }, [filters, currentPage, itemsPerPage]); 

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (initialKeyword) setSearchTrigger(t => t + 1);
            return;
        }
    }, [initialKeyword]);

    useEffect(() => {
        if (searchTrigger > 0) fetchResults();
    }, [searchTrigger]);

    const handleManualSearch = () => {
        setFilters(prev => ({ ...prev, keyword: keywordInput }));
        setCurrentPage(1);
        setSearchTrigger(t => t + 1);
    };

    const handleCheckboxFilter = (type, value, checked) => {
        setFilters(prev => {
            const current = prev[type] || [];
            let next;
            if (checked) {
                next = current.includes(value) ? current : [...current, value];
            } else {
                next = current.filter(item => item !== value);
            }
            return { ...prev, [type]: next };
        });
        setCurrentPage(1);
        setSearchTrigger(t => t + 1);
    };

    const handleClearFilters = () => {
        setFilters({ keyword: '', jurisdictions: [], ipType: 'both', statuses: [] });
        setKeywordInput('');
        setResults([]);
        setTotalResults(0);
        setCurrentPage(1);
        setSearchTrigger(0);
        setHasSearched(false);
        sessionStorage.removeItem('searchPageParams');
    };

    const handleTrack = async (e, id) => {
        e.stopPropagation();
        
        if (!hasAccess('PRO')) {
            alert("🔒 Access Denied: Asset Tracking requires an IP Professional plan. Please upgrade.");
            return;
        }

        if (trackedIds[id]) return;

        setTrackingLoading(id);
        
        try {
            await client.post(`/tracker/add/${id}`, { email: currentUser.email });
            setTrackedIds(prev => ({ ...prev, [id]: true }));
        } catch (err) { 
            console.error("Tracking Error:", err);
            alert("Failed to sync asset.");
        } finally { 
            setTrackingLoading(null); 
        }
    };

    const toggleMapView = () => {
        if (!hasAccess('PRO')) {
            alert("🔒 Access Denied: Map Visualization requires an IP Professional plan or higher.");
            return;
        }
        setViewMode('map');
    };

    const getPageNumbers = () => {
        const pages = [];
        const max = 5; 
        let start = Math.max(1, currentPage - Math.floor(max / 2));
        let end = Math.min(totalPages, start + max - 1);
        if (end - start + 1 < max) start = Math.max(1, end - max + 1);
        for (let i = start; i <= end; i++) {
            if (i > 0 && i <= totalPages) pages.push(i);
        }
        return pages;
    };

    const getStatusColor = (s) => {
        const val = (s || '').toUpperCase();
        if (val.includes('ACTIVE') || val.includes('GRANTED')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        if (val.includes('PENDING') || val.includes('REVIEW')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        if (val.includes('EXPIRED') || val.includes('WITHDRAWN')) return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
        return 'bg-slate-100 text-slate-500 border-slate-200';
    };

    if (viewMode === 'map') return <MapViewPage results={results} filters={filters} onBack={() => setViewMode('list')} />;

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-600 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl" />
            </div>

            <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 group cursor-default">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                <Cpu size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Intelligence Node</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="relative flex h-2 w-2">
                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeSource === 'local' ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
                                      <span className={`relative inline-flex rounded-full h-2 w-2 ${activeSource === 'local' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                                    </span>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        {activeSource === 'local' ? 'Local Cluster Active' : 'Global Network Sync'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={toggleMapView}
                                className={`group flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg active:scale-95 ${
                                    hasAccess('PRO') 
                                    ? 'bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-900/20 hover:shadow-indigo-500/30' 
                                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                <div className="p-1 bg-white/10 rounded-md">
                                    {hasAccess('PRO') ? <MapIcon size={14} className="text-white" /> : <Lock size={14} />}
                                </div>
                                <span className="uppercase tracking-wide">Map View</span>
                            </button>
                            <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
                                <NavTab icon={<List size={16}/>} active={viewMode === 'list'} onClick={() => setViewMode('list')} />
                                <NavTab icon={<Grid size={16}/>} active={viewMode === 'grid'} onClick={() => setViewMode('grid')} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-8">
                
                <div className="max-w-4xl mx-auto mb-12">
                    
                    {userPlan !== 'ENTERPRISE' && (
                        <div className="mb-4 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Info size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Search Quota (15-Day Cycle)</p>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        Resets on: {quotaInfo.resetDate ? new Date(quotaInfo.resetDate).toLocaleDateString() : 'Calculating...'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xl font-black ${quotaInfo.count >= limitMax ? 'text-red-500' : 'text-indigo-600'}`}>
                                    {quotaInfo.count}
                                </span>
                                <span className="text-xs font-bold text-slate-400"> / {limitMax}</span>
                            </div>
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[2rem] opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                        <div className="relative flex items-center bg-white rounded-[1.8rem] shadow-xl shadow-indigo-500/10 ring-1 ring-slate-900/5">
                            <div className="relative flex-1 flex items-center pl-6 h-16">
                                <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
                                <input 
                                    type="text" 
                                    value={keywordInput} 
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                                    className="w-full h-full pl-4 pr-4 bg-transparent border-none focus:ring-0 text-slate-800 font-bold text-lg placeholder-slate-400 outline-none" 
                                    placeholder="Search Patent ID, Assignee, or Keywords..."
                                />
                            </div>
                            <div className="pr-2">
                                <button onClick={handleManualSearch} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.4rem] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2">
                                    {loading ? <RefreshCcw size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
                                    Explore
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
                        <div className="sticky top-28 space-y-8">
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <Filter size={14} className="text-indigo-600"/> Filters
                                    </h3>
                                    {hasSearched && (
                                        <button onClick={handleClearFilters} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wide">
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    <FilterGroup label="Jurisdiction">
                                        <div className="grid grid-cols-2 gap-2">
                                            {['US', 'EP', 'CN', 'IN', 'JP', 'KR', 'GB', 'DE'].map(code => (
                                                <Checkbox 
                                                    key={code} 
                                                    label={code} 
                                                    checked={filters.jurisdictions.includes(code)} 
                                                    onChange={(e) => handleCheckboxFilter('jurisdictions', code, e.target.checked)} 
                                                />
                                            ))}
                                        </div>
                                    </FilterGroup>
                                    <div className="h-px bg-slate-100" />
                                    <FilterGroup label="Asset Type">
                                        <div className="space-y-1">
                                            {['both', 'patent', 'trademark'].map(type => (
                                                <label key={type} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${filters.ipType === type ? 'border-indigo-600' : 'border-slate-300'}`}>
                                                        {filters.ipType === type && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                    </div>
                                                    <input type="radio" name="ipType" checked={filters.ipType === type} onChange={() => { setFilters(prev => ({...prev, ipType: type})); setSearchTrigger(prev => prev + 1); }} className="hidden" />
                                                    <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </FilterGroup>
                                    <div className="h-px bg-slate-100" />
                                    <FilterGroup label="Status">
                                        <div className="space-y-1">
                                            {['ACTIVE', 'PENDING', 'EXPIRED', 'GRANTED'].map(status => (
                                                <div key={status} className="flex items-center">
                                                    <Checkbox 
                                                        label={status} 
                                                        checked={filters.statuses.includes(status)} 
                                                        onChange={(e) => handleCheckboxFilter('statuses', status, e.target.checked)} 
                                                        fullWidth 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </FilterGroup>
                                </div>
                            </div>
                        </div>
                    </div>

                    <main className="flex-1 min-w-0">
                        {loading ? (
                            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl animate-pulse"></div>
                                    <Loader2 className="relative animate-spin text-indigo-600" size={48} />
                                </div>
                                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Syncing Intelligence Nodes</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-center px-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Layers size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No Data Found</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">Try adjusting your filters or search for a different keyword.</p>
                            </div>
                        ) : (
                            <>
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                                    {results.map((item, idx) => (
                                        <div 
                                            key={item.id || idx} 
                                            onClick={() => onViewPatent(item)}
                                            className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${
                                                        item.type === 'PATENT' 
                                                            ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600' 
                                                            : 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600'
                                                    }`}>
                                                        {item.type === 'PATENT' ? 'P' : 'T'}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-4 gap-4">
                                                        <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                            {item.title}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${getStatusColor(item.status)}`}>
                                                            {item.status || 'UNKNOWN'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                        <DataTag icon={<Database size={12}/>} label="ID" value={item.patentNumber || item.id} />
                                                        <DataTag icon={<Globe size={12}/>} label="Jurisdiction" value={item.jurisdiction} />
                                                        <DataTag icon={<User size={12}/>} label="Assignee" value={item.assignee} truncate />
                                                        <DataTag icon={<Calendar size={12}/>} label="Date" value={item.filingDate} />
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${activeSource === 'local' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeSource}</span>
                                                        </div>
                                                        
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={(e) => handleTrack(e, item.id)}
                                                                disabled={trackingLoading === item.id || trackedIds[item.id]}
                                                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border flex items-center gap-2 ${
                                                                    trackedIds[item.id] 
                                                                        ? 'bg-emerald-55 text-emerald-600 border-emerald-100' 
                                                                        : hasAccess('PRO') 
                                                                            ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100'
                                                                }`}
                                                            >
                                                                {trackingLoading === item.id ? <Loader2 className="animate-spin" size={12}/> : 
                                                                 trackedIds[item.id] ? <Check size={12} strokeWidth={3}/> : 
                                                                 hasAccess('PRO') ? <RefreshCcw size={12}/> : <Lock size={12}/>}
                                                                
                                                                {trackedIds[item.id] ? 'Synced' : hasAccess('PRO') ? 'Sync' : 'Locked'}
                                                            </button>
                                                            
                                                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shadow-lg">
                                                                <ArrowUpRight size={14} strokeWidth={2.5} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 bg-white rounded-2xl p-4 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Show</span>
                                            <select 
                                                value={itemsPerPage} 
                                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setSearchTrigger(prev => prev + 1); }} 
                                                className="bg-transparent border-none p-0 text-indigo-600 font-bold text-xs focus:ring-0 cursor-pointer"
                                            >
                                                {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Page <span className="text-slate-900">{currentPage}</span> of {totalPages || 1}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <PageNav onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} icon={<ChevronLeft size={16}/>} />
                                        <div className="flex gap-1">
                                            {getPageNumbers().map(p => (
                                                <button 
                                                    key={p} 
                                                    onClick={() => { setCurrentPage(p); setSearchTrigger(prev => prev + 1); }} 
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                                        currentPage === p 
                                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                                            : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                        <PageNav onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} icon={<ChevronRight size={16}/>} />
                                    </div>
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

const NavTab = ({ icon, active, onClick }) => (
    <button 
        onClick={onClick} 
        className={`p-2 rounded-md transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {icon}
    </button>
);

const FilterGroup = ({ label, children }) => (
    <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{label}</label>
        {children}
    </div>
);

const Checkbox = ({ label, checked, onChange, fullWidth }) => (
    <label className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50 ${fullWidth ? 'w-full' : ''}`}>
        <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
            checked ? 'bg-indigo-600 border-indigo-600 shadow-sm' : 'bg-white border-slate-300'
        }`}>
            {checked && <Check size={10} className="text-white" strokeWidth={4}/>}
        </div>
        <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
        <span className={`text-[13px] font-medium transition-colors ${checked ? 'text-indigo-700' : 'text-slate-600'}`}>
            {label}
        </span>
    </label>
);

const DataTag = ({ icon, label, value, truncate = false }) => (
    <div className="flex flex-col gap-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            {icon} {label}
        </p>
        <p className={`text-xs font-semibold text-slate-700 ${truncate ? 'truncate' : ''}`} title={value}>
            {value || '-'}
        </p>
    </div>
);

const PageNav = ({ onClick, disabled, icon }) => (
    <button 
        onClick={onClick} 
        disabled={disabled} 
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
    >
        {icon}
    </button>
);

export default SearchResultsPage;