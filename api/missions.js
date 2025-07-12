// ===================================================================
// api/missions.js - Fixed CORS configuration
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
        const url = 'https://raw.githubusercontent.com/selco13/hcn-news-data/main/bounty/list.json';
        console.log(`Fetching missions from: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch missions data`);
        }
        
        const rawData = await response.json();
        const transformedData = transformMissionsData(rawData);
        res.status(200).json(transformedData);
        
    } catch (error) {
        console.error('Missions API error:', error);
        res.status(200).json([
            {
                title: "Contract Database Error",
                description: `Unable to connect to missions database: ${error.message}`,
                reward: "N/A",
                location: "System Error",
                difficulty: "HIGH",
                status: "Connection Failed"
            },
            {
                title: "Bounty System Status",
                description: "Checking GitHub repository for bounty data availability",
                reward: "Diagnostic",
                location: "HCN Network",
                difficulty: "MEDIUM", 
                status: "Investigating"
            },
            {
                title: "Sample Mission Alpha",
                description: "Eliminate pirate threats in Crusader space - high value target confirmed",
                reward: "45000 aUEC",
                location: "Crusader System",
                difficulty: "HIGH",
                status: "Available"
            }
        ]);
    }
}

function transformMissionsData(rawData) {
    let missions = [];
    
    if (Array.isArray(rawData)) {
        missions = rawData;
    } else if (rawData.bounties && Array.isArray(rawData.bounties)) {
        missions = rawData.bounties;
    } else if (rawData.missions && Array.isArray(rawData.missions)) {
        missions = rawData.missions;
    } else if (rawData.contracts && Array.isArray(rawData.contracts)) {
        missions = rawData.contracts;
    } else if (rawData.data && Array.isArray(rawData.data)) {
        missions = rawData.data;
    } else {
        missions = [rawData];
    }
    
    const transformedMissions = missions.slice(0, 8).map((mission, index) => ({
        title: mission.title || mission.name || mission.contract_name || mission.target || `Mission ${index + 1}`,
        description: mission.description || mission.details || mission.summary || mission.objective || mission.notes || "Mission details available upon acceptance",
        reward: mission.reward || mission.payout || mission.bounty || mission.payment || `${(Math.random() * 75000 + 25000).toFixed(0)} aUEC`,
        location: mission.location || mission.system || mission.area || mission.planet || mission.sector || "Location classified",
        difficulty: mission.difficulty || mission.threat_level || mission.risk_level || mission.danger || getDifficultyLevel(),
        status: mission.status || mission.state || (mission.active ? "Active" : "Available")
    }));
    
    return transformedMissions;
}

function getDifficultyLevel() {
    const levels = ["LOW", "MEDIUM", "HIGH", "EXTREME"];
    return levels[Math.floor(Math.random() * levels.length)];
}
