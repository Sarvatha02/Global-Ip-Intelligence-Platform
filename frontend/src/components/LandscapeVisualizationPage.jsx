import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, XAxis, YAxis
} from 'recharts';
import {
  Zap, Users, Award, Lightbulb, GitBranch, Download, RefreshCw, 
  X, Layers, Target, ChevronDown, ChevronUp
} from 'lucide-react';

import analyticsAPI from '../api/analytics';
import {
  CHART_COLORS, FIELD_COLORS, formatNumber, formatPercent,
  getGrowthIndicator, customTooltipFormatter, CHART_MARGIN,
  CARTESIAN_GRID_CONFIG, TOOLTIP_CONFIG, LEGEND_CONFIG, TECH_FIELDS
} from '../utils/chartHelpers';
import { exportToCSV, exportToJSON } from '../utils/exportHelpers';

const NetworkGraph = ({ data, onNodeClick }) => {
  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 140;

  const nodes = useMemo(() => {
    const uniqueFields = new Set();
    data.forEach(d => { uniqueFields.add(d.field1); uniqueFields.add(d.field2); });
    const nodeList = Array.from(uniqueFields);
    
    return nodeList.map((node, i) => {
      const angle = (i / nodeList.length) * 2 * Math.PI;
      return {
        id: node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        color: FIELD_COLORS[i % FIELD_COLORS.length]
      };
    });
  }, [data]);

  const links = useMemo(() => {
    return data.map(d => {
      const source = nodes.find(n => n.id === d.field1);
      const target = nodes.find(n => n.id === d.field2);
      return { ...d, x1: source.x, y1: source.y, x2: target.x, y2: target.y };
    });
  }, [data, nodes]);

  if (nodes.length === 0) return <div className="text-center text-gray-400 mt-10">No convergence data available to graph.</div>;

  return (
    <div className="flex justify-center items-center overflow-hidden">
      <svg width="100%" height="400" viewBox={`0 0 ${width} ${height}`} className="max-w-2xl">
        {links.map((link, i) => (
          <line
            key={i}
            x1={link.x1} y1={link.y1}
            x2={link.x2} y2={link.y2}
            stroke="#94a3b8"
            strokeWidth={Math.max(1, link.strength / 20)} 
            opacity={0.5}
          />
        ))}
        
        {nodes.map((node, i) => (
          <g key={i} onClick={() => onNodeClick(node.id)} className="cursor-pointer hover:opacity-80 transition-opacity">
            <circle cx={node.x} cy={node.y} r={25} fill="white" stroke={node.color} strokeWidth={3} />
            <circle cx={node.x} cy={node.y} r={20} fill={node.color} opacity={0.1} />
            <text x={node.x} y={node.y} dy={4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">
              {node.id.split(' ')[0]} 
            </text>
            <title>{node.id}</title>
          </g>
        ))}
      </svg>
    </div>
  );
};

const LandscapeVisualizationPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('technology');

  const [selectedField, setSelectedField] = useState('all');
  const [topN, setTopN] = useState(10);

  const [landscapeData, setLandscapeData] = useState({
    classificationTrends: [],
    competitorAnalysis: [],
    innovationTrends: [],
    convergenceMap: [],
    lifecycleAnalysis: {},
    topInventors: []
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [drillDownData, setDrillDownData] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [expandedAssetId, setExpandedAssetId] = useState(null);

  const fetchLandscapeData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);

    try {
      const params = { field: selectedField, topN: topN };

      const [classTrends, compTrends, innovTrends, convergence, lifecycle, topInv] = await Promise.all([
        analyticsAPI.getClassificationTrends(params),
        analyticsAPI.getCompetitorAnalysis(params),
        analyticsAPI.getInnovationTrends(params),
        analyticsAPI.getTechnologyConvergence(params),
        analyticsAPI.getLifecycleAnalysis(params),
        analyticsAPI.getTopInventors(params)
      ]);

      setLandscapeData({
        classificationTrends: classTrends?.data || [],
        competitorAnalysis: compTrends?.data || [],
        innovationTrends: innovTrends?.data || [],
        convergenceMap: convergence?.data || [],
        lifecycleAnalysis: lifecycle || {},
        topInventors: topInv?.data || []
      });
    } catch (err) {
      console.error('Error fetching landscape data:', err);
      setError('Failed to load landscape visualization data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLandscapeData();
  }, [selectedField, topN]);

  const handleDrillDown = async (identifier) => {
    if (!identifier) return;
    
    const searchTerm = identifier.toString();
    setSelectedCategory(searchTerm);
    setLoadingModal(true);
    setDrillDownData([]);
    setExpandedAssetId(null);

    try {
      const response = await analyticsAPI.getAssetsByCategory(searchTerm);
      setDrillDownData(response?.data || []);
    } catch (error) {
      console.error("Drill down failed", error);
      setDrillDownData([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleChartClick = (data) => {
    if (!data || !data.activePayload || !data.activePayload[0]) return;
    const payload = data.activePayload[0].payload;
    const key = payload.code || payload.assignee || payload.year;
    handleDrillDown(key);
  };

  const toggleAssetDetails = (id) => {
    setExpandedAssetId(expandedAssetId === id ? null : id);
  };

  const handleExportCompetitors = () => {
    exportToCSV(landscapeData.competitorAnalysis, 'competitor-analysis', ['Assignee', 'Patent Count', 'Active Count', 'Growth (%)']);
  };

  const handleExportAllData = () => {
    exportToJSON(landscapeData, 'landscape-visualization-complete');
  };

  if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  const { classificationTrends, competitorAnalysis, innovationTrends, convergenceMap, lifecycleAnalysis, topInventors } = landscapeData;

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">IP Landscape Visualization</h1>
            <p className="text-gray-600">Advanced analytics - Click any chart element to view patent details</p>
          </div>
          <button onClick={() => fetchLandscapeData(true)} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-400" />
            <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              {TECH_FIELDS.map(field => <option key={field.value} value={field.value}>{field.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-400" />
            <select value={topN} onChange={(e) => setTopN(Number(e.target.value))} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={handleExportCompetitors} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={handleExportAllData} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Download className="w-4 h-4" /> JSON
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'technology', label: 'Technology Map', icon: Zap },
            { id: 'competitors', label: 'Competitors', icon: Users },
            { id: 'innovation', label: 'Innovation', icon: Lightbulb },
            { id: 'convergence', label: 'Convergence', icon: GitBranch }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'technology' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Classification Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={classificationTrends} layout="vertical" margin={{ ...CHART_MARGIN, left: 20 }} onClick={handleChartClick} cursor="pointer">
                <CartesianGrid {...CARTESIAN_GRID_CONFIG} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="code" type="category" width={150} tick={{ fontSize: 10 }} />
                <Tooltip {...TOOLTIP_CONFIG} formatter={customTooltipFormatter} />
                <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 8, 8, 0]} name="Patent Count">
                  {classificationTrends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FIELD_COLORS[index % FIELD_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {classificationTrends.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleDrillDown(item.code)}>
                  <div className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: FIELD_COLORS[index % FIELD_COLORS.length] }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{item.code}</span>
                      <span className="text-sm font-semibold text-indigo-600">{formatNumber(item.count)}</span>
                    </div>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Competitors Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={competitorAnalysis} margin={CHART_MARGIN} onClick={handleChartClick} cursor="pointer">
                <CartesianGrid {...CARTESIAN_GRID_CONFIG} />
                <XAxis dataKey="assignee" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip {...TOOLTIP_CONFIG} formatter={customTooltipFormatter} />
                <Legend {...LEGEND_CONFIG} />
                <Bar dataKey="patentCount" fill={CHART_COLORS.primary} name="Total Patents" radius={[8, 8, 0, 0]} />
                <Bar dataKey="activeCount" fill={CHART_COLORS.secondary} name="Active Patents" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Competitor Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assignee</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Active</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorAnalysis.map((comp, index) => {
                    const indicator = getGrowthIndicator(comp.growth);
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleDrillDown(comp.assignee)}>
                        <td className="py-3 px-4">
                          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">{index + 1}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{comp.assignee}</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">{formatNumber(comp.patentCount)}</td>
                        <td className="text-right py-3 px-4 text-emerald-600 font-semibold">{formatNumber(comp.activeCount)}</td>
                        <td className={`text-right py-3 px-4 font-semibold ${indicator.color}`}>{formatPercent(comp.growth)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Inventors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topInventors.slice(0, 9).map((inventor, index) => (
                <div key={index} onClick={() => handleDrillDown(inventor.name)} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-600">#{index + 1}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{inventor.name}</h4>
                  <p className="text-sm text-gray-600">{formatNumber(inventor.patentCount)} patents</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'innovation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Innovation Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={innovationTrends} margin={CHART_MARGIN} onClick={handleChartClick}>
                <CartesianGrid {...CARTESIAN_GRID_CONFIG} />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip {...TOOLTIP_CONFIG} />
                <Legend {...LEGEND_CONFIG} />
                <Line yAxisId="left" type="monotone" dataKey="innovations" stroke={CHART_COLORS.primary} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8, cursor: 'pointer' }} name="Innovations" />
                <Line yAxisId="right" type="monotone" dataKey="growthRate" stroke={CHART_COLORS.secondary} strokeWidth={3} dot={{ r: 5 }} name="Growth Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patent Lifecycle Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average Lifespan</p>
                <p className="text-3xl font-bold text-indigo-600">{lifecycleAnalysis.avgLifespan || 12} yrs</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Phase</p>
                <p className="text-3xl font-bold text-emerald-600">{lifecycleAnalysis.activePhase || 8} yrs</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Maturity Rate</p>
                <p className="text-3xl font-bold text-amber-600">{Math.round(lifecycleAnalysis.maturityRate || 75)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'convergence' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Convergence Network</h3>
            
            <div className="mb-8 border-b border-gray-100 pb-6">
              <NetworkGraph data={convergenceMap} onNodeClick={handleDrillDown} />
            </div>

            <h4 className="text-md font-semibold text-gray-700 mb-3">Convergence Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {convergenceMap.slice(0, 8).map((conv, index) => (
                <div key={index} onClick={() => handleDrillDown(conv.field1 + ' & ' + conv.field2)} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <GitBranch className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-semibold text-gray-500">Strength: {Math.round(conv.strength)}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{conv.field1}</span>
                    <span className="text-gray-400">↔</span>
                    <span className="font-semibold text-gray-900">{conv.field2}</span>
                  </div>
                  <p className="text-sm text-gray-600">{formatNumber(conv.overlapCount)} overlapping patents</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-start gap-4">
              <Lightbulb className="w-8 h-8 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Technology Convergence Insights</h3>
                <ul className="space-y-2 text-white/90">
                  <li>• High overlap observed in recent AI and Automotive patents</li>
                  <li>• <strong>{convergenceMap.length}</strong> significant technology overlaps identified</li>
                  <li>• Emerging opportunities in interdisciplinary innovation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Drill Down: {selectedCategory}</h2>
                <p className="text-sm text-gray-500">{loadingModal ? 'Searching database...' : `Found ${drillDownData.length} records`}</p>
              </div>
              <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex-1 bg-gray-50/50">
              {loadingModal ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : drillDownData.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white border border-dashed rounded-lg">
                  No assets found for this category
                </div>
              ) : (
                <div className="grid gap-3">
                  {drillDownData.map((asset) => (
                    <div 
                      key={asset.id} 
                      onClick={() => toggleAssetDetails(asset.id)}
                      className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${asset.type === 'PATENT' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'}`}>
                              {asset.type}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">{asset.assetNumber}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">{asset.title}</h4>
                          <p className="text-xs text-gray-500">
                            <Users className="w-3 h-3 inline mr-1"/> 
                            {asset.assignee || 'Unknown Assignee'} | Filed: {new Date(asset.filingDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right ml-4 flex flex-col items-end">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium mb-1 ${asset.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            {asset.status}
                          </span>
                          {expandedAssetId === asset.id ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                        </div>
                      </div>
                      
                      {expandedAssetId === asset.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg animate-in slide-in-from-top-1">
                          <div className="mb-2"><strong>Abstract:</strong> {asset.details || "No abstract available."}</div>
                          {asset.inventor && <div className="text-xs text-gray-500"><strong>Inventor:</strong> {asset.inventor}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandscapeVisualizationPage;