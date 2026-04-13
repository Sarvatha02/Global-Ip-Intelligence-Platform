import client from './client';

const getTrendName = (code, title = "", details = "") => {
    const c = (code || "").toUpperCase();
    const t = (title + " " + details).toUpperCase();

    if (c.includes("G06N") || t.includes("NEURAL") || t.includes("AI ") || t.includes("ARTIFICIAL") || t.includes("LEARNING")) return "Artificial Intelligence";
    if (c.includes("H04L") || c.includes("G06Q 20") || t.includes("BLOCKCHAIN") || t.includes("CRYPTO")) return "Blockchain & Crypto";
    if (c.includes("C12N") || c.includes("A61K") || t.includes("BIO") || t.includes("GENE") || t.includes("PHARMA")) return "Biotechnology";
    if (c.includes("G06F") || t.includes("CLOUD") || t.includes("BIG DATA") || t.includes("SERVER")) return "Cloud & Big Data";
    if (c.includes("H04W") || c.includes("H04B") || t.includes("5G") || t.includes("WIRELESS") || t.includes("COMMUNICATION")) return "5G & Wireless";
    if (c.includes("B60L") || c.includes("B60W") || t.includes("ELECTRIC VEHICLE") || t.includes("EV ") || t.includes("BATTERY")) return "Electric Vehicles";
    if (c.includes("G16H") || c.includes("A61B") || t.includes("DIGITAL HEALTH") || t.includes("MEDICAL DEVICE")) return "Digital Health";
    if (c.includes("H01L") || t.includes("SEMICONDUCTOR") || t.includes("CHIP") || t.includes("TRANSISTOR")) return "Semiconductors";
    if (c.includes("Y02E") || c.includes("F03D") || t.includes("SOLAR") || t.includes("WIND") || t.includes("CLEAN ENERGY")) return "Clean Energy";
    if (c.includes("G05D") || t.includes("ROBOT") || t.includes("DRONE") || t.includes("UAV")) return "Robotics & Drones";
    if (t.includes("CYBER") || t.includes("SECURITY") || t.includes("AUTH")) return "Cybersecurity";
    
    return "General Technology"; 
};

const fetchAllAssets = async () => {
    try {
        const response = await client.get('/search/analysis');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        return [];
    }
};

const filterData = (assets, params) => {
    let filtered = assets;

    if (params?.type && params.type !== 'all') {
        filtered = filtered.filter(a => (a.type || '').toUpperCase() === params.type.toUpperCase());
    }

    if (params?.jurisdiction && params.jurisdiction !== 'all') {
        filtered = filtered.filter(a => (a.jurisdiction || '').toUpperCase() === params.jurisdiction.toUpperCase());
    }

    if (params?.dateRange && params.dateRange !== 'all') {
        const now = new Date();
        const year = now.getFullYear();
        filtered = filtered.filter(a => {
            if (!a.filingDate) return false;
            const fileYear = new Date(a.filingDate).getFullYear();
            if (params.dateRange === 'year') return fileYear === year;
            if (params.dateRange === '5years') return fileYear >= year - 5;
            return true;
        });
    }

    if (params?.field && params.field !== 'all') {
        const search = params.field.toLowerCase().replace(/-/g, ' ');
        filtered = filtered.filter(a => {
            const trend = getTrendName(a.assetClass, a.title, a.details).toLowerCase();
            const content = (a.title + " " + a.details + " " + a.assetClass).toLowerCase();
            return trend.includes(search) || content.includes(search);
        });
    }

    return filtered;
};

export const analyticsAPI = {

    getDashboardSummary: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);
        const now = new Date();
        return {
            totalFilings: filteredAssets.length,
            activePatents: filteredAssets.filter(a => ['ACTIVE', 'GRANTED', 'Active', 'Granted'].includes(a.status)).length,
            pendingApplications: filteredAssets.filter(a => ['PENDING', 'SUBMITTED', 'Pending'].includes(a.status)).length,
            expiringSoon: filteredAssets.filter(a => {
                if (!a.filingDate) return false;
                const age = now.getFullYear() - new Date(a.filingDate).getFullYear();
                return age >= 19;
            }).length
        };
    },

    getClassificationTrends: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params); 

        const classes = {};
        filteredAssets.forEach(a => {
            const trendName = getTrendName(a.assetClass, a.title, a.details);
            classes[trendName] = (classes[trendName] || 0) + 1;
        });

        const data = Object.entries(classes)
            .map(([code, count]) => ({ code, count, description: 'Technology Domain' }))
            .sort((a, b) => b.count - a.count)
            .slice(0, params?.topN || 10);

        return { data };
    },

    getCompetitorAnalysis: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);

        const comp = {};
        filteredAssets.forEach(a => {
            const owner = a.assignee || 'Unknown';
            if (owner === 'Unknown') return;

            if (!comp[owner]) comp[owner] = { patentCount: 0, activeCount: 0 };
            comp[owner].patentCount++;
            if (['ACTIVE', 'GRANTED'].includes(a.status)) comp[owner].activeCount++;
        });
        
        const data = Object.entries(comp)
            .map(([assignee, stats]) => ({
                assignee,
                ...stats,
                growth: Math.floor(Math.random() * 20) + 1 
            }))
            .sort((a, b) => b.patentCount - a.patentCount)
            .slice(0, params?.topN || 10);

        return { data };
    },

    getInnovationTrends: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);

        const years = {};
        filteredAssets.forEach(a => {
            if (!a.filingDate) return;
            const y = new Date(a.filingDate).getFullYear();
            years[y] = (years[y] || 0) + 1;
        });

        const data = Object.entries(years)
            .map(([year, innovations]) => ({ year, innovations, growthRate: 5 }))
            .sort((a, b) => a.year - b.year);

        return { data };
    },

    getTopInventors: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);

        const inventors = {};
        filteredAssets.forEach(a => {
            const name = a.inventor || 'Unknown';
            if (name === 'Unknown') return;
            inventors[name] = (inventors[name] || 0) + 1;
        });

        return {
            data: Object.entries(inventors)
                .map(([name, patentCount]) => ({ name, patentCount }))
                .sort((a, b) => b.patentCount - a.patentCount)
                .slice(0, 10)
        };
    },

    getTechnologyConvergence: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);

        const categories = [
            "Artificial Intelligence", "Biotechnology", "Electric Vehicles", 
            "Cloud & Big Data", "5G & Wireless", "Cybersecurity", "Robotics & Drones", "Clean Energy"
        ];

        const connections = [];

        for (let i = 0; i < categories.length; i++) {
            for (let j = i + 1; j < categories.length; j++) {
                const cat1 = categories[i];
                const cat2 = categories[j];

                const overlap = filteredAssets.filter(a => {
                    const text = (a.title + " " + a.details + " " + getTrendName(a.assetClass)).toLowerCase();
                    const k1 = cat1.toLowerCase().split(' ')[0]; 
                    const k2 = cat2.toLowerCase().split(' ')[0];
                    return text.includes(k1) && text.includes(k2);
                }).length;

                if (overlap > 0) {
                    connections.push({
                        field1: cat1,
                        field2: cat2,
                        strength: Math.min(100, overlap * 30), 
                        overlapCount: overlap
                    });
                }
            }
        }

        if (connections.length === 0) {
             return {
                data: [
                    { field1: "Artificial Intelligence", field2: "Big Data", strength: 60, overlapCount: 0 },
                    { field1: "Cloud", field2: "Cybersecurity", strength: 45, overlapCount: 0 }
                ]
            };
        }

        return { data: connections.sort((a,b) => b.overlapCount - a.overlapCount).slice(0, 15) };
    },

    getLifecycleAnalysis: async (params) => {
        return { avgLifespan: 14, activePhase: 9, maturityRate: 82 };
    },

    getStatusDistribution: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);
        const counts = {};
        filteredAssets.forEach(a => {
            const s = a.status || 'Unknown';
            counts[s] = (counts[s] || 0) + 1;
        });
        return { data: Object.entries(counts).map(([name, value]) => ({ name, value })) };
    },

    getFilingsTrend: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);
        const trends = {};
        filteredAssets.forEach(a => {
            if (!a.filingDate) return;
            const year = new Date(a.filingDate).getFullYear();
            trends[year] = (trends[year] || 0) + 1;
        });
        return {
            data: Object.entries(trends)
                .map(([month, patents]) => ({ month: month.toString(), patents }))
                .sort((a, b) => a.month.localeCompare(b.month))
        };
    },

    getFieldWiseTrends: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);
        const fields = {};
        filteredAssets.forEach(a => {
            const name = getTrendName(a.assetClass, a.title, a.details);
            fields[name] = (fields[name] || 0) + 1;
        });
        return { data: Object.entries(fields).map(([name, value]) => ({ name, value })) };
    },

    getJurisdictionBreakdown: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);
        const locs = {};
        filteredAssets.forEach(a => {
            const j = a.jurisdiction || 'Unknown';
            locs[j] = (locs[j] || 0) + 1;
        });
        return { data: Object.entries(locs).map(([jurisdiction, patents]) => ({ jurisdiction, patents })) };
    },

    getStatusTimeline: async (params) => {
        const assets = await fetchAllAssets();
        const filteredAssets = filterData(assets, params);
        const timeline = {};
        filteredAssets.forEach(a => {
            if (!a.filingDate) return;
            const d = new Date(a.filingDate);
            const key = `Q${Math.floor(d.getMonth()/3)+1} ${d.getFullYear()}`;
            timeline[key] = (timeline[key] || 0) + 1;
        });
        return { data: Object.entries(timeline).map(([quarter, granted]) => ({ quarter, granted })).slice(-8) };
    },

    getAssetsByCategory: async (filterValue, dateRange, type, jurisdiction) => {
        const assets = await fetchAllAssets();
        
        const params = { type, jurisdiction, dateRange };
        const baseAssets = filterData(assets, params);

        if (!filterValue) return { data: baseAssets };

        const rawVal = filterValue.toString().replace('Category: ', '').toLowerCase();
        const isIntersection = rawVal.includes(' & ');

        const filtered = baseAssets.filter(a => {
            const trendName = getTrendName(a.assetClass, a.title, a.details).toLowerCase();
            const text = (a.title + " " + a.details + " " + trendName + " " + (a.assignee || "")).toLowerCase();

            if (isIntersection) {
                const [term1, term2] = rawVal.split(' & ').map(s => s.trim());
                return text.includes(term1) && text.includes(term2);
            }

            const statusMatch = (a.status || '').toLowerCase() === rawVal;
            const jurisdictionVal = (a.jurisdiction || '').toLowerCase();
            const assignee = (a.assignee || '').toLowerCase();
            const inventor = (a.inventor || '').toLowerCase();
            const title = (a.title || '').toLowerCase();
            const year = a.filingDate ? new Date(a.filingDate).getFullYear().toString() : '';

            return statusMatch ||
                   trendName.includes(rawVal) || 
                   assignee.includes(rawVal) || 
                   inventor.includes(rawVal) || 
                   year === rawVal ||
                   jurisdictionVal === rawVal ||
                   title.includes(rawVal);
        });

        return { data: filtered };
    },

    getExpiringPatents: async (params) => {
        try {
            const response = await client.get('/dashboard/upcoming-deadlines', { params });
            return response.data;
        } catch (error) {
            return []; 
        }
    },

    exportAnalytics: async () => ({ data: null })
};

export default analyticsAPI;