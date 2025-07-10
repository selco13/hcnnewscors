export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const limit = req.query.limit || 30;
        const url = `https://api.uexcorp.space/2.0/commodities_prices?limit=${limit}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HCN-Radio/1.0',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch market data');
        }
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Market API error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch market data',
            fallback: []
        });
    }
}