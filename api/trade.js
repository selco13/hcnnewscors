// ===================================================================
// api/trade.js - Fixed CORS configuration
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
        const limit = req.query.limit || 20;
        const url = `https://api.uexcorp.space/2.0/commodities_routes?limit=${limit}`;
        
        console.log(`Fetching trade data from: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HCN-Radio/1.0',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch trade data`);
        }
        
        const rawData = await response.json();
        const transformedData = transformTradeData(rawData);
        res.status(200).json(transformedData);
        
    } catch (error) {
        console.error('Trade API error:', error);
        res.status(200).json([
            {
                name: "Trade API Error",
                price: "N/A",
                change: "0.0",
                route: "UEX Corp → Error",
                profit: `Connection Failed: ${error.message}`
            },
            {
                name: "Medical Supplies",
                price: "28.50",
                change: "+2.3",
                route: "Port Olisar → New Babbage",
                profit: "12500"
            },
            {
                name: "Processed Food",
                price: "1.45",
                change: "-0.8",
                route: "ArcCorp → Lorville",
                profit: "8750"
            },
            {
                name: "Titanium Ore",
                price: "8.20",
                change: "+5.2",
                route: "Daymar → Area18",
                profit: "15200"
            }
        ]);
    }
}

function transformTradeData(rawData) {
    let routes = [];
    
    if (Array.isArray(rawData)) {
        routes = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
        routes = rawData.data;
    } else if (rawData.routes && Array.isArray(rawData.routes)) {
        routes = rawData.routes;
    } else {
        routes = [rawData];
    }
    
    const transformedRoutes = routes.slice(0, 10).map((route, index) => {
        const originPrice = parseFloat(route.price_buy || route.buy_price || 0);
        const destPrice = parseFloat(route.price_sell || route.sell_price || 0);
        const profit = destPrice - originPrice;
        const profitPercent = originPrice > 0 ? ((profit / originPrice) * 100) : 0;
        
        return {
            name: route.commodity_name || route.name || route.commodity || `Commodity ${index + 1}`,
            price: (originPrice || Math.random() * 50 + 10).toFixed(2),
            change: profitPercent.toFixed(1),
            route: `${route.origin_planet || route.from || 'Origin'} → ${route.destination_planet || route.to || 'Destination'}`,
            profit: Math.abs(profit || Math.random() * 15000 + 5000).toFixed(0)
        };
    });
    
    return transformedRoutes;
}
