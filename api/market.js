// ===================================================================
// api/market.js - Fixed CORS configuration
// ===================================================================

export default async function handler(req, res) {
    // Comprehensive CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const limit = req.query.limit || 30;
        const url = `https://api.uexcorp.space/2.0/commodities_prices?limit=${limit}`;
        
        console.log(`Fetching market data from: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HCN-Radio/1.0',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch market data`);
        }
        
        const rawData = await response.json();
        const transformedData = transformMarketData(rawData);
        res.status(200).json(transformedData);
        
    } catch (error) {
        console.error('Market API error:', error);
        res.status(200).json([
            {
                name: "Market API Error",
                price: "N/A",
                change: "0.0",
                demand: "Unknown",
                locations: [`UEX Corp API Error: ${error.message}`]
            },
            {
                name: "Quantum Fuel",
                price: "1.50",
                change: "+0.05",
                demand: "High",
                locations: ["Port Olisar", "Grim HEX", "Levski"]
            },
            {
                name: "Ship Components",
                price: "125.00",
                change: "-2.1",
                demand: "Very High",
                locations: ["Area18", "New Babbage"]
            },
            {
                name: "Agricultural Supplies",
                price: "0.85",
                change: "+1.2",
                demand: "Moderate",
                locations: ["Lorville", "Tressler"]
            }
        ]);
    }
}

function transformMarketData(rawData) {
    let commodities = [];
    
    if (Array.isArray(rawData)) {
        commodities = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
        commodities = rawData.data;
    } else if (rawData.commodities && Array.isArray(rawData.commodities)) {
        commodities = rawData.commodities;
    } else {
        commodities = [rawData];
    }
    
    const commodityMap = new Map();
    
    commodities.forEach(item => {
        const name = item.commodity_name || item.name || item.commodity || 'Unknown';
        const location = item.planet_name || item.station_name || item.location || 'Unknown';
        const price = parseFloat(item.price_buy || item.price || item.buy_price || 0);
        
        if (!commodityMap.has(name)) {
            commodityMap.set(name, {
                name: name,
                price: price.toFixed(2),
                change: (Math.random() * 12 - 6).toFixed(1),
                demand: getDemandLevel(),
                locations: [location],
                totalPrice: price,
                count: 1
            });
        } else {
            const existing = commodityMap.get(name);
            if (!existing.locations.includes(location)) {
                existing.locations.push(location);
            }
            existing.totalPrice += price;
            existing.count += 1;
            existing.price = (existing.totalPrice / existing.count).toFixed(2);
        }
    });
    
    const transformedMarket = Array.from(commodityMap.values()).slice(0, 12);
    
    return transformedMarket;
}

function getDemandLevel() {
    const levels = ["Low", "Moderate", "High", "Very High", "Critical"];
    return levels[Math.floor(Math.random() * levels.length)];
}
