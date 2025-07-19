// ===================================================================
// api/news.js - Fixed to preserve HCN data structure
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
            // Try fallback dates
            const fallbackDates = [
                '2025-07-18',
                '2025-07-15', 
                new Date(Date.now() - 86400000).toISOString().split('T')[0] // yesterday
            ];
            
            for (const fallbackDate of fallbackDates) {
                const fallbackUrl = `https://raw.githubusercontent.com/selco13/hcn-news-data/main/${fallbackDate}.json`;
                console.log(`Trying fallback: ${fallbackUrl}`);
                
                const fallbackResponse = await fetch(fallbackUrl);
                
                if (fallbackResponse.ok) {
                    const rawData = await fallbackResponse.json();
                    
                    // Return HCN data as-is (don't transform!)
                    if (isHCNFormat(rawData)) {
                        console.log('✅ Found HCN format data, returning as-is');
                        return res.status(200).json(rawData);
                    }
                }
            }
            
            throw new Error('No news data available');
        }
        
        const rawData = await response.json();
        
        // Check if this is proper HCN format
        if (isHCNFormat(rawData)) {
            console.log('✅ HCN format detected, returning original structure');
            // Return the HCN data exactly as it is - don't transform!
            res.status(200).json(rawData);
        } else {
            console.log('⚠️ Generic format detected, applying transformation');
            // Only transform if it's not HCN format
            const transformedData = transformNewsData(rawData);
            res.status(200).json(transformedData);
        }
        
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

/**
 * Check if the data follows HCN news format
 */
function isHCNFormat(data) {
    return data && (
        data.mainStory || 
        data.secondaryStories || 
        data.quickUpdates || 
        data.marketWatch ||
        data.breaking
    );
}

/**
 * Transform generic news data (only used for non-HCN formats)
 */
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
