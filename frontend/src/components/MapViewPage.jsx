import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { 
  Globe, ArrowLeft, Loader2, TrendingUp, ShieldCheck, 
  Clock, Database, ChevronRight, MapPin, Layout, Layers, Maximize, 
  Moon, Sun, Compass, Filter, Search, Download, BarChart3
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const jurisdictionCoords = {
  US: { lat: 39.8283, lng: -98.5795, name: 'United States', flag: '🇺🇸' },
  TW: { lat: 23.6978, lng: 120.9605, name: 'Taiwan', flag: '🇹🇼' },
  CA: { lat: 62.0000, lng: -110.3468, name: 'Canada', flag: '🇨🇦' },
  RU: { lat: 64.0000, lng: 100.0000, name: 'Russia', flag: '🇷🇺' },
  SE: { lat: 62.1282, lng: 18.6435, name: 'Sweden', flag: '🇸🇪' },
  GB: { lat: 55.3781, lng: -3.4360, name: 'United Kingdom', flag: '🇬🇧' },
  JP: { lat: 36.2048, lng: 138.2529, name: 'Japan', flag: '🇯🇵' },
  CN: { lat: 35.8617, lng: 104.1954, name: 'China', flag: '🇨🇳' },
  IN: { lat: 20.5937, lng: 78.9629, name: 'India', flag: '🇮🇳' },
  EP: { lat: 50.8503, lng: 4.3517, name: 'European Union', flag: '🇪🇺' },
  KR: { lat: 35.9078, lng: 127.7669, name: 'South Korea', flag: '🇰🇷' },
  DE: { lat: 51.1657, lng: 10.4515, name: 'Germany', flag: '🇩🇪' },
  FR: { lat: 46.2276, lng: 2.2137, name: 'France', flag: '🇫🇷' },
  AU: { lat: -25.2744, lng: 133.7751, name: 'Australia', flag: '🇦🇺' },
  BR: { lat: -14.2350, lng: -51.9253, name: 'Brazil', flag: '🇧🇷' },
  IT: { lat: 41.8719, lng: 12.5674, name: 'Italy', flag: '🇮🇹' },
  ES: { lat: 40.4637, lng: -3.7492, name: 'Spain', flag: '🇪🇸' },
  SG: { lat: 1.3521, lng: 103.8198, name: 'Singapore', flag: '🇸🇬' },
  WO: { lat: 46.2044, lng: 6.1432, name: 'WIPO', flag: '🌐' }
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (count) => {
  return L.divIcon({
    className: 'custom-marker-node',
    html: `
      <div style="
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        width: 54px; height: 54px; border-radius: 50%; border: 3px solid #ffffff;
        display: flex; align-items: center; justify-content: center;
        font-weight: 900; color: #ffffff; 
        box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
        font-size: 16px; transition: transform 0.3s ease;
      ">
        ${count}
      </div>`,
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  });
};

const MapController = ({ selectedPos, allPoints }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedPos) {
      map.flyTo([selectedPos.lat, selectedPos.lng], 5, { duration: 1.5 });
    } else if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 3 });
    }
  }, [selectedPos, allPoints, map]);
  return null;
};

const MapViewPage = ({ results = [], onBack }) => {
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapStyle, setMapStyle] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');

  const tileLayers = {
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  };

  const displayData = useMemo(() => {
    const aggregation = results.reduce((acc, item) => {
      let rawJur = (item.jurisdiction || '').toUpperCase();
      let title = (item.title || '').toUpperCase();
      let code = 'US';

      if (title.includes('UNITED STATES')) code = 'US';
      else if (rawJur === 'TW' || title.includes('TAIWAN')) code = 'TW';
      else if (rawJur.includes('US')) code = 'US';
      else if (rawJur.includes('CA') || title.includes('CANADA')) code = 'CA';
      else if (rawJur.includes('CN') || title.includes('CHINA')) code = 'CN';
      else if (rawJur.includes('RU') || title.includes('RUSSIA')) code = 'RU';
      else if (rawJur.includes('SE') || title.includes('SWEDEN')) code = 'SE';
      else if (rawJur.includes('GB') || title.includes('KINGDOM')) code = 'GB';
      else if (rawJur.includes('JP') || title.includes('JAPAN')) code = 'JP';
      else if (rawJur.includes('IN') || title.includes('INDIA')) code = 'IN';
      else code = rawJur.split(' ')[0].substring(0, 2) || 'US';

      if (!acc[code]) {
        const coords = jurisdictionCoords[code] || jurisdictionCoords['US'];
        acc[code] = { ...coords, code, total: 0, patents: 0, trademarks: 0, active: 0 };
      }

      acc[code].total++;
      const type = (item.type || '').toUpperCase();
      const status = (item.status || '').toUpperCase();
      if (type.includes('PATENT')) acc[code].patents++;
      if (type.includes('TRADEMARK')) acc[code].trademarks++;
      if (['ACTIVE', 'GRANTED', 'REGISTERED'].includes(status)) acc[code].active++;
      
      return acc;
    }, {});
    
    return Object.values(aggregation).sort((a, b) => b.total - a.total);
  }, [results]);

  const filteredData = displayData.filter(data => 
    data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    data.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [results]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 text-left font-sans overflow-hidden">
      
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center z-[1000] shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-slate-700 font-semibold hover:text-indigo-600 transition-all px-4 py-2 rounded-xl hover:bg-indigo-50 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="hidden sm:block h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900">Global IP Map</h1>
              <p className="hidden md:block text-xs text-slate-600">Geographic distribution of IP assets</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl">
            <Database size={16} />
            <span className="font-semibold text-sm">{results.length} Assets</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Layout size={20} className={sidebarOpen ? "text-indigo-600" : "text-slate-600"} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {sidebarOpen && (
          <div className="w-full lg:w-[420px] bg-white border-r border-slate-200 overflow-y-auto p-6 z-[999] shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-600" /> 
                Regional Breakdown
              </h2>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <BarChart3 size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search regions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredData.map((data) => (
                <div 
                  key={data.code} 
                  onClick={() => setSelectedRegion(data)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                    selectedRegion?.code === data.code 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                    : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{data.flag}</span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{data.name}</h3>
                        <p className="text-xs text-slate-500">{data.code}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
                      {data.total}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Patents</p>
                      <p className="text-xl font-bold text-slate-900">{data.patents}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                      <p className="text-xs text-purple-600 font-semibold mb-1">Trademarks</p>
                      <p className="text-xl font-bold text-slate-900">{data.trademarks}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 relative h-full bg-slate-200">
          {loading ? (
            <div className="absolute inset-0 bg-white/95 z-[1001] flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
              <p className="text-lg font-semibold text-slate-900">Loading map data...</p>
            </div>
          ) : (
            <>
              <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2 flex flex-col gap-2">
                  <button 
                    onClick={() => setMapStyle('light')} 
                    className={`p-3 rounded-xl transition-all ${mapStyle === 'light' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`} 
                    title="Light"
                  >
                    <Sun size={20}/>
                  </button>
                  <button 
                    onClick={() => setMapStyle('dark')} 
                    className={`p-3 rounded-xl transition-all ${mapStyle === 'dark' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`} 
                    title="Dark"
                  >
                    <Moon size={20}/>
                  </button>
                  <button 
                    onClick={() => setMapStyle('satellite')} 
                    className={`p-3 rounded-xl transition-all ${mapStyle === 'satellite' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`} 
                    title="Satellite"
                  >
                    <Compass size={20}/>
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedRegion(null)} 
                  className="p-4 bg-white rounded-2xl shadow-lg border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                  title="Reset View"
                >
                  <Maximize size={20}/>
                </button>
              </div>

              <MapContainer center={[20, 10]} zoom={3} className="h-full w-full" zoomControl={false} scrollWheelZoom={true} attributionControl={false}>
                <TileLayer url={tileLayers[mapStyle]} />
                
                <MapController selectedPos={selectedRegion} allPoints={displayData} />

                {displayData.map((data) => (
                  <Marker 
                    key={data.code} 
                    position={[data.lat, data.lng]} 
                    icon={createCustomIcon(data.total)}
                    eventHandlers={{ click: () => setSelectedRegion(data) }}
                  >
                    <Popup className="premium-map-popup">
                      <div className="p-6 min-w-[300px] bg-white rounded-2xl">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                          <span className="text-5xl">{data.flag}</span>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">{data.name}</h4>
                            <p className="text-xs text-indigo-600 font-semibold">{data.code}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                            <span className="text-xs font-semibold text-green-800 flex items-center gap-2">
                              <ShieldCheck size={14}/> Active
                            </span>
                            <span className="font-bold text-lg text-green-700">{data.active}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <span className="text-xs font-semibold text-amber-800 flex items-center gap-2">
                              <Clock size={14}/> Pending
                            </span>
                            <span className="font-bold text-lg text-amber-700">{data.total - data.active}</span>
                          </div>
                        </div>
                        <button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl text-xs font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                          View Details <ChevronRight size={14}/>
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <ZoomControl position="bottomright" />
              </MapContainer>
            </>
          )}
        </div>
      </div>

      <style>{`
        .leaflet-container { background: #e2e8f0 !important; }
        .premium-map-popup .leaflet-popup-content-wrapper { 
          border-radius: 1rem; 
          padding: 0; 
          overflow: hidden; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .premium-map-popup .leaflet-popup-content { margin: 0; width: auto !important; }
        .custom-marker-node:hover { 
          filter: brightness(1.1); 
          transform: scale(1.15) !important; 
          z-index: 1000 !important; 
        }
        .custom-marker-node { cursor: pointer !important; }
        .leaflet-popup-tip { display: none; }
      `}</style>
    </div>
  );
};

export default MapViewPage;