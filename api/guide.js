// /api/guide.js - Vercel serverless function
// or /routes/guide.js if using Express.js

const programmingGuide = {
  "metadata": {
    "version": "3.0.1",
    "lastUpdated": "2025-06-05T15:56:12.376154Z",
    "description": "HCN Radio Programming Guide - Galactic Broadcasting Schedule",
    "timezone": "UEE Standard Time",
    "updateFrequency": "weekly",
    "maintainer": "HCN Programming Department",
    "notes": "All times are in 24-hour format. Show duration is typically 2 hours unless specified."
  },
  "timeSlots": [
    "00:00", "02:00", "04:00", "06:00", "08:00", "10:00",
    "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"
  ],
  "days": ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  "channels": {
    "hcn-01": {
      "name": "Radio One",
      "description": "Voices of the Universe - News, Talk, and Current Affairs",
      "frequency": "305.5 AM",
      "programs": {
        // ... (include the full programs data from your JSON file)
      }
    },
    "hcn-02": {
      "name": "Radio Two", 
      "description": "Diverse Sounds of the Stars - Alternative and Independent Programming",
      "frequency": "315.0 AM",
      "programs": {
        // ... (include the full programs data)
      }
    },
    "hcn-03": {
      "name": "HCN Investigative",
      "description": "Uncovering the Truth - Investigative Journalism and Deep Dives", 
      "frequency": "319.7 AM",
      "programs": {
        // ... (include the full programs data)
      }
    },
    "hcn-04": {
      "name": "HCN Music",
      "description": "Galactic Groove - Music from Across the Universe",
      "frequency": "320.0 AM", 
      "programs": {
        // ... (include the full programs data)
      }
    }
  }
};

// For Vercel serverless function
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Optional: Add query parameter support for specific channels
    const { channel } = req.query;
    
    if (channel) {
      if (programmingGuide.channels[channel]) {
        res.status(200).json({
          metadata: programmingGuide.metadata,
          channel: programmingGuide.channels[channel],
          timeSlots: programmingGuide.timeSlots,
          days: programmingGuide.days
        });
      } else {
        res.status(404).json({ error: 'Channel not found' });
      }
    } else {
      // Return full programming guide
      res.status(200).json(programmingGuide);
    }

  } catch (error) {
    console.error('Programming guide API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch programming guide'
    });
  }
}

// Alternative: Express.js route version
/*
const express = require('express');
const router = express.Router();

// GET /api/guide
router.get('/', (req, res) => {
  try {
    const { channel } = req.query;
    
    if (channel) {
      if (programmingGuide.channels[channel]) {
        res.json({
          metadata: programmingGuide.metadata,
          channel: programmingGuide.channels[channel],
          timeSlots: programmingGuide.timeSlots,
          days: programmingGuide.days
        });
      } else {
        res.status(404).json({ error: 'Channel not found' });
      }
    } else {
      res.json(programmingGuide);
    }
  } catch (error) {
    console.error('Programming guide API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch programming guide'
    });
  }
});

module.exports = router;
*/
