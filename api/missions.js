export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const url = 'https://raw.githubusercontent.com/selco13/hcn-news-data/main/bounty/list.json';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch missions data');
        }
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Missions API error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch missions data',
            fallback: []
        });
    }
}