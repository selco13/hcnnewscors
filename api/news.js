// ===================================================================
// api/news.js - Fixed CORS configuration
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
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const url = `https://raw.githubusercontent.com/selco13/hcn-news-data/main/${date}.json`;
        
        console.log(`Fetching news from: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            // Try yesterday's news
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const fallbackUrl = `https://raw.githubusercontent.com/selco13/hcn-news-data/main/${yesterday}.json`;
            console.log(`Trying fallback: ${fallbackUrl}`);
            
            const fallbackResponse = await fetch(fallbackUrl);
            
            if (!fallbackResponse.ok) {
                throw new Error('No news data available');
            }
            
            const rawData = await fallbackResponse.json();
            const transformedData = transformNewsData(rawData);
            return res.status(200).json(transformedData);
        }
        
        const rawData = await response.json();
        const transformedData = transformNewsData(rawData);
        res.status(200).json(transformedData);
        
    } catch (error) {
        console.error('News API error:', error);
        res.status(200).json({ 
            headlines: [
                {
                    title: "HCN Network Operational",
                    summary: "All systems functioning normally - live data feed active",
                    source: "HCN Operations",
                    priority: "NORMAL"
                },
                {
                    title: "News Feed Status",
                    summary: "External news sources temporarily unavailable, checking GitHub repository",
                    source: "System Monitor",
                    priority: "HIGH"
                },
                {
                    title: "API Connection Notice",
                    summary: `Error: ${error.message}`,
                    source: "Debug System",
                    priority: "HIGH"
                }
            ]
        });
    }
}

function transformNewsData(rawData) {
    let headlines = [];
    
    if (Array.isArray(rawData)) {
        headlines = rawData;
    } else if (rawData.headlines && Array.isArray(rawData.headlines)) {
        headlines = rawData.headlines;
    } else if (rawData.news && Array.isArray(rawData.news)) {
        headlines = rawData.news;
    } else if (rawData.articles && Array.isArray(rawData.articles)) {
        headlines = rawData.articles;
    } else {
        headlines = [rawData];
    }
    
    const transformedHeadlines = headlines.map((item, index) => ({
        title: item.title || item.headline || item.text || `News Story ${index + 1}`,
        summary: item.summary || item.content || item.body || item.description || "Full story available on request",
        source: item.source || item.author || item.publisher || "HCN Correspondent",
        priority: item.priority || item.urgency || (index === 0 ? "BREAKING" : index < 3 ? "HIGH" : "NORMAL")
    }));
    
    return {
        headlines: transformedHeadlines
    };
}
