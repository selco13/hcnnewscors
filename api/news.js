export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const url = `https://raw.githubusercontent.com/selco13/hcn-news-data/main/${date}.json`;
        
        const response = await fetch(url);
        if (!response.ok) {
            // Try yesterday's news
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const fallbackUrl = `https://raw.githubusercontent.com/selco13/hcn-news-data/main/${yesterday}.json`;
            const fallbackResponse = await fetch(fallbackUrl);
            
            if (!fallbackResponse.ok) {
                throw new Error('No news data available');
            }
            
            const data = await fallbackResponse.json();
            return res.status(200).json(data);
        }
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('News API error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch news data',
            fallback: {
                headlines: [
                    {
                        title: "HCN Network Operational",
                        summary: "All systems functioning normally",
                        source: "HCN Operations"
                    }
                ]
            }
        });
    }
}