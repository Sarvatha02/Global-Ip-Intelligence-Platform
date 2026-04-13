import React, { useState, useEffect, useMemo } from "react";
import client from "../api/client";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import {
    Loader2, TrendingUp, BarChart2, PieChart as PieIcon, Activity, Globe, ArrowUpRight, Sparkles, Send, History
} from "lucide-react";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"];

const AnalysisPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiHistory, setAiHistory] = useState([]);
    const [showAI, setShowAI] = useState(false);

    const quickQuestions = [
        "Analyze my patent portfolio performance",
        "What are the filing trends?",
        "Show insights on top jurisdictions",
        "Compare assets by category"
    ];

    useEffect(() => {
        const fetchDB = async () => {
            try {
                // ✅ FIX: Removed extra '/api' prefix if present in other calls
                const res = await client.get("/search/analysis");
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setData(res.data);
                } else {
                    setData([]);
                }
            } catch (err) {
                console.error("Backend Analysis Error", err);
                setData([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchDB();
        loadAIHistory();
    }, []);

    const loadAIHistory = async () => {
        try {
            // ✅ FIX: Removed '/api' prefix and userId from URL. Now calls /ai/history
            const res = await client.get('/ai/history');
            setAiHistory(res.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAISubmit = async (e) => {
        e.preventDefault();
        if (!aiQuery.trim()) return;

        setAiLoading(true);
        try {
            // ✅ FIX: Removed '/api' prefix and userId from body. Now calls /ai/analyze
            const res = await client.post('/ai/analyze', {
                query: aiQuery
            });
            setAiResponse(res.data);
            setAiQuery('');
            loadAIHistory();
        } catch (error) {
            setAiResponse({ error: 'Failed to analyze' });
        } finally {
            setAiLoading(false);
        }
    };

    const stats = useMemo(() => {
        if (!data.length) return null;

        const typeCount = {};
        const regionCount = {};
        const yearCount = {};

        data.forEach(item => {
            const type = item.type || "Unknown";
            const region = item.jurisdiction || "Unknown";

            let year = "Unknown";
            if (item.year) year = item.year;
            else if (item.filingDate) year = new Date(item.filingDate).getFullYear();
            else if (item.createdDate) year = new Date(item.createdDate).getFullYear();

            typeCount[type] = (typeCount[type] || 0) + 1;
            regionCount[region] = (regionCount[region] || 0) + 1;
            yearCount[year] = (yearCount[year] || 0) + 1;
        });

        const pieData = Object.entries(typeCount).map(([k, v]) => ({ name: k, value: v }));
        const barData = Object.entries(regionCount).map(([k, v]) => ({ name: k, count: v }));
        const lineData = Object.entries(yearCount)
            .sort((a, b) => a[0] - b[0])
            .map(([year, count]) => ({ year, count }));

        const topType = pieData.sort((a, b) => b.value - a.value)[0];
        const topRegion = barData.sort((a, b) => b.count - a.count)[0];

        let growthRate = 0;
        if (lineData.length > 1) {
            const last = lineData[lineData.length - 1].count;
            const prev = lineData[lineData.length - 2].count;
            growthRate = (((last - prev) / prev) * 100).toFixed(1);
        }

        return { pieData, barData, lineData, topType, topRegion, growthRate };
    }, [data]);

    if (loading) return <LoaderUI />;

    if (!stats) return (
        <div className="flex h-screen items-center justify-center flex-col gap-3">
            <Activity className="w-12 h-12 text-slate-300" />
            <p className="text-lg text-slate-500">No portfolio data available for analysis.</p>
        </div>
    );

    return (
        <div className="p-10 bg-[#F8FAFC] space-y-10 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-4">
                    Portfolio Intelligence Dashboard
                    <Activity className="text-indigo-600" size={32} />
                </h1>
                <button
                    onClick={() => setShowAI(!showAI)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg"
                >
                    <Sparkles size={20} />
                    {showAI ? 'Hide AI Analysis' : 'AI Analysis'}
                </button>
            </div>

            {showAI && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <Sparkles className="text-purple-600" size={20} />
                                Quick Questions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {quickQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setAiQuery(q)}
                                        className="text-left p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-xl transition-all text-sm text-gray-700 border border-purple-100"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <form onSubmit={handleAISubmit}>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        placeholder="Ask AI anything about your patents..."
                                        className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={aiLoading || !aiQuery.trim()}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold shadow-lg"
                                    >
                                        {aiLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Ask AI
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {aiResponse && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="text-purple-600" size={24} />
                                    <h2 className="text-xl font-semibold text-gray-800">AI Analysis</h2>
                                </div>
                                
                                {aiResponse.error ? (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                                        {aiResponse.error}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                {aiResponse.response}
                                            </p>
                                        </div>
                                        {aiResponse.contextUsed && (
                                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Analysis based on live database data
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
                            <div className="flex items-center gap-2 mb-4">
                                <History className="text-purple-600" size={20} />
                                <h2 className="text-xl font-semibold text-gray-800">Recent Queries</h2>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {aiHistory.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-8">No queries yet</p>
                                ) : (
                                    aiHistory.slice(-10).reverse().map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-all border border-gray-100"
                                            onClick={() => setAiQuery(item.query)}
                                        >
                                            <p className="text-sm text-gray-700 font-medium mb-1">{item.query}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="Total Assets" value={data.length} icon={<TrendingUp size={28} />} color="indigo" />
                <KPICard title="Top Category" value={stats.topType?.name} icon={<PieIcon size={28} />} color="purple" />
                <KPICard title="Top Jurisdiction" value={stats.topRegion?.name} icon={<Globe size={28} />} color="emerald" />
                <KPICard title="Yearly Growth" value={`${stats.growthRate}%`} icon={<ArrowUpRight size={28} />} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ChartCard title="Portfolio Composition">
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={stats.pieData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                                {stats.pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                            </Pie>
                            <Tooltip /><Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Jurisdiction Distribution">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={stats.barData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4F46E5" radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <ChartCard title="Yearly Filing Trend">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
};

const LoaderUI = () => (
    <div className="flex h-screen items-center justify-center flex-col gap-3">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-lg text-gray-600">Loading insights...</p>
    </div>
);

const KPICard = ({ title, value, icon, color }) => {
    const colors = { indigo: "from-indigo-500 to-blue-500", emerald: "from-emerald-500 to-teal-500", purple: "from-purple-500 to-fuchsia-500", yellow: "from-yellow-400 to-amber-500" };
    return (
        <div className="p-6 bg-white rounded-3xl shadow-md border flex gap-5 hover:shadow-xl transition">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white`}>{icon}</div>
            <div><p className="text-sm font-semibold text-gray-500">{title}</p><h2 className="text-2xl font-bold text-gray-900">{value}</h2></div>
        </div>
    );
};

const ChartCard = ({ title, children }) => (
    <div className="bg-white shadow-lg rounded-3xl p-8 border"><h3 className="text-sm font-bold uppercase text-gray-500 mb-5">{title}</h3><div className="h-64">{children}</div></div>
);

export default AnalysisPage;