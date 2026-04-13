import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Shield, FileText, Clock, AlertCircle, 
    Database, Loader2, X, Edit3, Lock, CheckCircle2, 
    Trash2, CheckSquare, BellRing, Mail, Send, Globe,
    ChevronRight, Crown
} from 'lucide-react';
import client from '../api/client';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const FilingTrackerPage = ({ user, onNavigate }) => {
    
    const [currentUser, setCurrentUser] = useState(user || null);
    
    useEffect(() => {
        if (!currentUser) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    setCurrentUser(JSON.parse(storedUser));
                } catch (e) { console.error("User Parse Error", e); }
            }
        }
    }, [currentUser]);

    const userPlan = currentUser?.planType || 'STARTUP';
    const isSuperAdmin = currentUser?.email === ADMIN_EMAIL;
    
    const hasAccess = userPlan === 'PRO' || userPlan === 'ENTERPRISE' || isSuperAdmin;

    const [filings, setFilings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [selectedFiling, setSelectedFiling] = useState(null); 
    const [statusFiling, setStatusFiling] = useState(null);      
    const [detailsFiling, setDetailsFiling] = useState(null);    
    const [alertFiling, setAlertFiling] = useState(null);        
    const [remarksFiling, setRemarksFiling] = useState(null);    

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [itemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({ total: 0, granted: 0, pending: 0, expired: 0 });

    const normalizeData = (item) => {
        const rawType = item.filingType || item.type || 'PATENT';
        const type = rawType.toUpperCase(); 

        return {
            id: item.id,
            ownerId: item.userId || 0, 
            title: item.title || 'Untitled Asset',
            displayId: item.patentNumber || item.assetNumber || `ID-${item.id}`,
            applicationNumber: item.applicationNumber || 'Pending', 
            jurisdiction: item.jurisdiction || 'Global',
            status: item.status || 'PENDING',
            patentStatus: item.patentStatus || 'Pending',
            filingDate: item.filingDate ? new Date(item.filingDate).toISOString().split('T')[0] : '',
            expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : '', 
            assignee: item.assignee || 'Unknown Entity',
            contactEmail: item.email || 'N/A', 
            type: type, 
            description: item.description || item.details || 'No detailed description available.',
            sourceLink: `https://patents.google.com/patent/${(item.patentNumber || '').replace(/\s/g,'')}/en`,
            isSynced: item.source === 'API' || (item.patentNumber && item.patentNumber.length > 8 && /[A-Z]/.test(item.patentNumber))
        };
    };

    const fetchData = useCallback(async () => {
        if (!hasAccess) return;

        setLoading(true);
        try {
            const dataRes = await client.get('/tracker/all');
            const rawData = Array.isArray(dataRes.data) ? dataRes.data : [];
            const cleanData = rawData.map(normalizeData);

            setFilings(cleanData);

            setStats({
                total: cleanData.length,
                granted: cleanData.filter(f => f.status?.toUpperCase().includes('GRANTED')).length,
                pending: cleanData.filter(f => ['PENDING', 'FILED', 'UNDER EXAMINATION'].some(s => f.status?.toUpperCase().includes(s))).length,
                expired: cleanData.filter(f => ['EXPIRED', 'ABANDONED'].some(s => f.status?.toUpperCase().includes(s))).length
            });

        } catch (err) {
            console.error("Fetch Error:", err);
            setFilings([]); 
        } finally {
            setLoading(false);
        }
    }, [hasAccess]);

    useEffect(() => { if (hasAccess) fetchData(); }, [fetchData, hasAccess]);

    const handleStatusUpdate = async (newStatus) => {
        if(!statusFiling || actionLoading) return;
        
        setActionLoading(true);
        try {
            await client.put(`/tracker/update/${statusFiling.id}`, { 
                status: newStatus,
                remarks: "" 
            });
            setStatusFiling(null);
            fetchData(); 
            alert(`Status updated to ${newStatus}. Notification sent to user.`);
        } catch (e) {
            console.error(e);
            alert("Update Failed: " + (e.response?.data || "Server Error"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDetailsUpdate = async (formData) => {
        if(!detailsFiling) return;
        try {
            await client.put(`/tracker/update/${detailsFiling.id}`, formData);
            setDetailsFiling(null);
            fetchData();
            alert("Details updated successfully.");
        } catch (e) {
            alert("Update Details Failed");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); 
        if (!isSuperAdmin) {
            alert("Only Administrators can delete filings.");
            return;
        }
        if (!window.confirm("⚠️ ADMIN ACTION: Permanently delete this filing?")) return;

        try {
            await client.delete(`/tracker/delete/${id}`);
            fetchData(); 
            alert("Filing deleted successfully.");
        } catch (err) {
            alert("Failed to delete filing.");
        }
    };

    const handleSendRemarks = async (remarks) => {
        if(!remarksFiling || actionLoading) return;
        
        setActionLoading(true);
        try {
            await client.put(`/tracker/update/${remarksFiling.id}`, { 
                status: remarksFiling.status,
                remarks: remarks
            });
            
            alert(`Email successfully sent to owner (${remarksFiling.contactEmail})`);
            setRemarksFiling(null);
        } catch (error) {
            alert("Failed to send remarks.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveAlerts = async (types) => {
        if(!alertFiling || actionLoading) return;
        
        setActionLoading(true);
        try {
            const payload = {
                userEmail: currentUser.email,
                userName: currentUser.name,
                filingId: alertFiling.displayId,
                filingTitle: alertFiling.title,
                triggers: types,
                timestamp: new Date().toISOString()
            };
            
            await client.post('/notifications/notify-admin', payload);
            
            alert(`Alerts configured! Request sent to Admin for ${alertFiling.displayId}.`);
            setAlertFiling(null);

        } catch (error) {
            console.error("Alert Trigger Failed", error);
            alert("Failed to configure alerts. Please check connection.");
        } finally {
            setActionLoading(false);
        }
    };

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} className="text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Feature Locked</h2>
                    <p className="text-slate-500 mb-8">
                        The Filing Tracker is available exclusively for <strong>Pro</strong> and <strong>Enterprise</strong> plans.
                    </p>
                    <button 
                        onClick={() => onNavigate('pricing')}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md"
                    >
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        );
    }

    const getStatusStyle = (s) => {
        const val = (s || '').toUpperCase();
        if (val.includes('GRANTED')) return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };
        if (val.includes('PENDING')) return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' };
        if (val.includes('EXPIRED')) return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' };
        return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
    };

    const filteredData = filings.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return (item.title?.toLowerCase().includes(searchLower) || item.displayId?.toLowerCase().includes(searchLower)) &&
               (statusFilter === 'ALL' || item.status?.toUpperCase().includes(statusFilter));
    });
    
    const paginatedDisplay = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-left">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                        <Shield size={32} className="text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Filing Tracker</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Global IP Intelligence • {filings.length} Assets</p>
                    </div>
                </div>

                {currentUser && (
                    <div className="flex items-center gap-4 bg-white pl-2 pr-6 py-2 rounded-full border border-slate-200 shadow-sm">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isSuperAdmin ? 'bg-rose-500' : 'bg-indigo-600'}`}>
                            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-xs font-bold uppercase tracking-wide ${isSuperAdmin ? 'text-rose-600' : 'text-indigo-600'}`}>
                                {isSuperAdmin ? "Super Admin" : "User Account"}
                            </span>
                            <span className="text-xs text-slate-600">{currentUser.email}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard label="Total Tracked" value={stats.total} icon={FileText} color="blue" onClick={() => setStatusFilter('ALL')} active={statusFilter === 'ALL'} />
                <StatCard label="Granted" value={stats.granted} icon={CheckCircle2} color="emerald" onClick={() => setStatusFilter('GRANTED')} active={statusFilter === 'GRANTED'} />
                <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" onClick={() => setStatusFilter('PENDING')} active={statusFilter === 'PENDING'} />
                <StatCard label="Expired" value={stats.expired} icon={AlertCircle} color="rose" onClick={() => setStatusFilter('EXPIRED')} active={statusFilter === 'EXPIRED'} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden min-h-[600px]">
                
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <Database size={20} className="text-slate-400"/> Portfolio Assets
                    </h2>
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search patents, application IDs..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="py-32 text-center flex flex-col items-center">
                            <Loader2 className="animate-spin text-indigo-600 w-10 h-10 mb-4" />
                            <p className="text-sm font-medium text-slate-500">Syncing Intelligence...</p>
                        </div>
                    ) : paginatedDisplay.length === 0 ? (
                        <div className="py-32 text-center opacity-75 flex flex-col items-center">
                            <div className="p-4 bg-slate-100 rounded-full mb-4"><Database size={32} className="text-slate-400" /></div>
                            <p className="text-slate-500 font-medium">No filings found matching your criteria.</p>
                        </div>
                    ) : (
                        paginatedDisplay.map((item) => {
                            const isOwner = currentUser && (item.ownerId === currentUser.id);
                            const style = getStatusStyle(item.status);
                            
                            const canDelete = isSuperAdmin; 
                            const canEditStatus = isSuperAdmin;
                            const canSendRemarks = isSuperAdmin;
                            const canEditDetails = isOwner && !item.isSynced && !isSuperAdmin; 
                            const canSetAlert = isOwner; 

                            const isPatent = item.type === 'PATENT';

                            return (
                                <div key={item.id} className="group flex flex-col md:flex-row items-center justify-between p-5 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setSelectedFiling(item)}>
                                    
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-sm ${isPatent ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'}`}>
                                            <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">{isPatent ? 'PAT' : 'TM'}</span>
                                            {isPatent ? <Shield size={16} /> : <Globe size={16} />}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-bold text-slate-900 text-base line-clamp-1">{item.title}</h4>
                                                {isOwner ? (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase tracking-wide">Owner</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">Synced</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200 font-mono text-slate-600">{item.displayId}</span>
                                                <span className="flex items-center gap-1"><Globe size={12}/> {item.jurisdiction}</span>
                                                <span className="hidden md:inline text-slate-300">|</span>
                                                <span className="hidden md:inline">{item.filingDate || 'No Date'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                        
                                        <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border ${style.bg} ${style.text} border-transparent`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`}></div>
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{item.status}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            
                                            {canSetAlert && (
                                                <ActionButton icon={BellRing} onClick={(e) => { e.stopPropagation(); setAlertFiling(item); }} color="amber" tooltip="Configure Alerts" />
                                            )}

                                            {canSendRemarks && (
                                                <ActionButton icon={Mail} onClick={(e) => { e.stopPropagation(); setRemarksFiling(item); }} color="blue" tooltip="Send Remarks" />
                                            )}

                                            {canEditStatus && (
                                                <ActionButton icon={CheckSquare} onClick={(e) => { e.stopPropagation(); setStatusFiling(item); }} color="indigo" tooltip="Update Status" />
                                            )}

                                            {canEditDetails && (
                                                <ActionButton icon={Edit3} onClick={(e) => { e.stopPropagation(); setDetailsFiling(item); }} color="emerald" tooltip="Edit Details" />
                                            )}

                                            {canDelete ? (
                                                <button 
                                                    onClick={(e) => handleDelete(e, item.id)}
                                                    className="p-2 rounded-lg transition-all text-rose-600 bg-rose-50 hover:bg-rose-100 border border-transparent hover:border-rose-200 hover:shadow-sm"
                                                    title="Delete Asset"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            ) : (
                                                <div className="p-2 text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed border border-transparent" title="Delete Locked"><Lock size={16}/></div>
                                            )}
                                            
                                            <ChevronRight size={16} className="text-slate-300 ml-2" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {selectedFiling && (
                <Modal onClose={() => setSelectedFiling(null)} title={selectedFiling.title} subtitle={selectedFiling.displayId}>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <InfoItem label="Status" value={selectedFiling.status} />
                        <InfoItem label="Application No." value={selectedFiling.applicationNumber} />
                        <InfoItem label="Filing Date" value={selectedFiling.filingDate} />
                        <InfoItem label="Expiration Date" value={selectedFiling.expirationDate} />
                        <InfoItem label="Assignee" value={selectedFiling.assignee} />
                        <InfoItem label="Contact Email" value={selectedFiling.contactEmail} />
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 max-h-60 overflow-y-auto">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{selectedFiling.description}</p>
                    </div>
                    <a href={selectedFiling.sourceLink} target="_blank" rel="noreferrer" className="block w-full py-3 bg-slate-900 text-white text-center rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors">View Official Source</a>
                </Modal>
            )}

            {statusFiling && (
                <Modal onClose={() => setStatusFiling(null)} title="Update Status" subtitle={`Target: ${statusFiling.displayId}`} small>
                    <div className="space-y-3 mb-8">
                        {['GRANTED', 'PENDING', 'UNDER EXAMINATION', 'EXPIRED'].map(status => (
                            <button 
                                key={status} 
                                onClick={() => handleStatusUpdate(status)} 
                                disabled={actionLoading} 
                                className="w-full py-3 text-sm font-bold rounded-xl border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : status}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setStatusFiling(null)} className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                </Modal>
            )}

            {remarksFiling && (
                <Modal onClose={() => setRemarksFiling(null)} title="Send Remarks" subtitle={`To: ${remarksFiling.contactEmail}`} small>
                    <form onSubmit={(e) => { e.preventDefault(); handleSendRemarks(e.target.remarks.value); }}>
                        <textarea name="remarks" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white outline-none h-32 resize-none transition-all placeholder:text-slate-400" placeholder="Type instructions..." required></textarea>
                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={() => setRemarksFiling(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" disabled={actionLoading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16}/> Send</>}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {detailsFiling && (
                <EditDetailsModal filing={detailsFiling} onClose={() => setDetailsFiling(null)} onSave={handleDetailsUpdate} />
            )}

            {alertFiling && (
                <AlertConfigModal filing={alertFiling} onClose={() => setAlertFiling(null)} onSave={handleSaveAlerts} loading={actionLoading} />
            )}
        </div>
    );
};

const Modal = ({ children, onClose, title, subtitle, small }) => (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
        <div className={`bg-white rounded-2xl ${small ? 'w-[450px]' : 'max-w-2xl w-full'} p-8 shadow-2xl border border-white/20`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
                </div>
                <button onClick={onClose} className="p-2 bg-slate-100 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"><X size={20} /></button>
            </div>
            {children}
        </div>
    </div>
);

const ActionButton = ({ icon: Icon, onClick, color, tooltip }) => (
    <button 
        onClick={onClick}
        className={`p-2 rounded-lg transition-all text-slate-400 hover:text-${color}-600 hover:bg-${color}-50 border border-transparent hover:border-${color}-100 hover:shadow-sm`}
        title={tooltip}
    >
        <Icon size={18} />
    </button>
);

const StatCard = ({ label, value, icon: Icon, onClick, active, color }) => (
    <div onClick={onClick} className={`p-6 rounded-2xl border flex justify-between items-center cursor-pointer transition-all duration-200 hover:-translate-y-1 ${active ? `bg-${color}-600 border-${color}-600 shadow-xl shadow-${color}-200` : 'bg-white border-slate-200 hover:shadow-md hover:border-indigo-200'}`}>
        <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${active ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
            <p className={`text-3xl font-bold ${active ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${active ? 'bg-white/20 text-white' : `bg-${color}-50 text-${color}-500`}`}>
            <Icon className="size-6" />
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="border border-slate-100 p-4 rounded-xl bg-slate-50 hover:bg-white hover:shadow-sm transition-all hover:border-indigo-100">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-900 truncate">{value || 'N/A'}</p>
    </div>
);

const EditDetailsModal = ({ filing, onClose, onSave }) => {
    const [form, setForm] = useState({ title: filing.title, applicationNumber: filing.applicationNumber, filingDate: filing.filingDate });
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    return (
        <Modal onClose={onClose} title="Edit Details" small>
            <div className="space-y-4">
                {['title', 'applicationNumber', 'filingDate'].map(field => (
                    <div key={field}>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <input type={field.includes('Date') ? 'date' : 'text'} name={field} value={form[field]} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all" />
                    </div>
                ))}
            </div>
            <div className="flex gap-4 mt-8">
                <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={() => onSave(form)} className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Save Changes</button>
            </div>
        </Modal>
    );
};

const AlertConfigModal = ({ filing, onClose, onSave, loading }) => {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const toggleType = (type) => {
        if(selectedTypes.includes(type)) setSelectedTypes(prev => prev.filter(t => t !== type));
        else setSelectedTypes(prev => [...prev, type]);
    };
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in zoom-in-95">
            <div className="bg-white rounded-2xl w-96 shadow-2xl transform transition-all scale-100 overflow-hidden">
                <div className="bg-indigo-600 p-6 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Configure Alerts</h3>
                    <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors"><X size={20}/></button>
                </div>
                <div className="p-6">
                    <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-wide border-b border-slate-100 pb-4">Target: <br/><span className="text-slate-900 text-sm block mt-1">{filing.displayId}</span></p>
                    <div className="space-y-3 mb-6">
                        {[{ id: 'RENEWAL', label: 'Renewal Due' }, { id: 'APPROVAL', label: 'Get Approval / Grant' }, { id: 'STATUS_CHANGE', label: 'Any Status Change' }].map((opt) => {
                            const isSelected = selectedTypes.includes(opt.id);
                            return (
                                <div key={opt.id} onClick={() => toggleType(opt.id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                        {isSelected && <CheckSquare size={12} className="text-white"/>}
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wide ${isSelected ? 'text-indigo-900' : 'text-slate-500'}`}>{opt.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    <button 
                        onClick={() => onSave(selectedTypes)} 
                        disabled={selectedTypes.length === 0 || loading} 
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Save Alerts"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilingTrackerPage;