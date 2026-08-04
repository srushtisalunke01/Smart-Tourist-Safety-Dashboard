const https = require('https');

// Local fallback dictionary for SIH Presentation and Offline Capabilities
const fallbackData = {
  destinations: {
    goa: {
      theme: "Tropical Beaches, Historic Churches, and Water Sports",
      attractions: ["Baga Beach", "Basilica of Bom Jesus", "Dudhsagar Falls", "Fort Aguada", "Anjuna Flea Market"],
      hotels: [
        { name: "Taj Exotica Resort & Spa", type: "Luxury", cost: 15000 },
        { name: "Lemon Tree Amarante Beach Resort", type: "Mid-range", cost: 6000 },
        { name: "Zostel Goa", type: "Budget", cost: 1200 }
      ],
      restaurants: [
        { name: "Fisherman's Wharf", specialty: "Goan Fish Curry", cost: 800 },
        { name: "Curlies Beach Shack", specialty: "Seafood & Cocktails", cost: 500 },
        { name: "Mum's Kitchen", specialty: "Traditional Goan Cuisine", cost: 1000 }
      ],
      checklist: ["Sunscreen", "Swimwear", "Waterproof pouch", "Emergency numbers card", "Eco-friendly bottle"]
    },
    jaipur: {
      theme: "Royal Forts, Palaces, and Rich Rajasthani Heritage",
      attractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Chokhi Dhani"],
      hotels: [
        { name: "The Rambagh Palace", type: "Luxury", cost: 25000 },
        { name: "Shahpura House", type: "Mid-range", cost: 7000 },
        { name: "Moustache Hostel", type: "Budget", cost: 900 }
      ],
      restaurants: [
        { name: "Laxmi Mishthan Bhandar (LMB)", specialty: "Rajasthani Thali & Ghewar", cost: 600 },
        { name: "Tapri The Tea House", specialty: "Masala Chai & Snacks", cost: 300 },
        { name: "1135 AD (Amber Fort)", specialty: "Royal Mughlai", cost: 2000 }
      ],
      checklist: ["Sun Hat", "Comfortable walking shoes", "Cotton clothing", "Camera", "Hand sanitizer"]
    },
    delhi: {
      theme: "Historic Monuments, Bustling Bazaars, and Street Food",
      attractions: ["Red Fort", "Qutub Minar", "India Gate", "Lotus Temple", "Chandni Chowk"],
      hotels: [
        { name: "The Leela Palace New Delhi", type: "Luxury", cost: 20000 },
        { name: "Connaught Royale", type: "Mid-range", cost: 5500 },
        { name: "Smyle Inn", type: "Budget", cost: 1100 }
      ],
      restaurants: [
        { name: "Karim's (Old Delhi)", specialty: "Mutton Korma & Kebabs", cost: 700 },
        { name: "Paranthe Wali Gali", specialty: "Deep Fried Stuffed Paranthas", cost: 200 },
        { name: "Indian Accent", specialty: "Modern Indian Fine Dining", cost: 4000 }
      ],
      checklist: ["Anti-pollution mask", "Metro smartcard copy", "Scarf for temples", "Emergency contacts", "Offline map"]
    },
    mumbai: {
      theme: "Coastal Vistas, Colonial Architecture, and Bollywood Dreams",
      attractions: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Chhatrapati Shivaji Terminus", "Colaba Causeway"],
      hotels: [
        { name: "The Taj Mahal Palace", type: "Luxury", cost: 28000 },
        { name: "Fariyas Hotel", type: "Mid-range", cost: 8000 },
        { name: "Bed and Breakfast Colaba", type: "Budget", cost: 1500 }
      ],
      restaurants: [
        { name: "Leopold Cafe", specialty: "Keema Pav & Beer", cost: 600 },
        { name: "Bademiya", specialty: "Seekh Kebabs & Roti", cost: 400 },
        { name: "Trishna", specialty: "Butter Pepper Garlic Crab", cost: 2200 }
      ],
      checklist: ["Umbrella/Raincoat (Monsoon)", "Comfortable footwear", "Local train map", "Hand sanitizer", "Eco-bag"]
    }
  },
  generic: {
    theme: "Scenic Views, Local Exploration, and Cultural Exchange",
    attractions: ["Local Landmarks", "City Park", "Central Market", "Museum of Art", "Historical Monument"],
    hotels: [
      { name: "Grand Regent Inn", type: "Luxury", cost: 12000 },
      { name: "Comfort Suites", type: "Mid-range", cost: 5000 },
      { name: "Backpackers Shelter", type: "Budget", cost: 1000 }
    ],
    restaurants: [
      { name: "Royal Dine Restaurant", specialty: "Multi-cuisine platter", cost: 600 },
      { name: "Street Food Junction", specialty: "Local fast food delicacies", cost: 250 },
      { name: "Heritage Bistro", specialty: "Organic coffee & snacks", cost: 400 }
    ],
    checklist: ["Power bank", "Universal adapter", "First-aid kit", "Water bottle", "SafeTour SOS app active"]
  }
};

// Main AI Assistant responses for local fallback
const fallbackChat = [
  { keywords: ["sos", "emergency", "police", "hospital", "doctor"], response: "⚠️ If you are in immediate danger, press the RED **SOS button** on the dashboard. This will sound a local alarm, flash your strobe light, and instantly broadcast your live GPS coordinates to nearby emergency responders and your saved emergency contacts. The nearest police station and hospital locations are automatically marked on your map." },
  { keywords: ["scam", "cheat", "fraud", "fake guide", "overcharge"], response: "🚨 Report scams via the **Scam Radar** tab. Avoid unverified guides asking for upfront payments. Always check if a taxi driver uses the official meter or pre-booked apps. If a shop owner forces you to visit a particular tourist handicraft showroom, it is likely a commission scam." },
  { keywords: ["women", "night", "safe route", "escort"], response: "👩 SafeTour's **Women Safety Mode** features 'Safe Night Routes', 'Trusted Circles Tracking', and silent distress triggers. We recommend sticking to well-lit main avenues, sharing your live trip tracking URL with family, and utilizing designated tourist police checkpoints." },
  { keywords: ["goa", "beach", "water sports"], response: "🌴 Goa is generally very safe! Avoid remote beach stretches after midnight. Use registered shacks, wear life jackets for all water activities, and check safety alerts regarding swimming high tides." },
  { keywords: ["jaipur", "fort", "ticket"], response: "🏰 When visiting forts in Jaipur (like Amber or Jaigarh), buy composite tickets at official government counters. Do not hire guides without an official ID card issued by the Ministry of Tourism." },
  { keywords: ["weather", "rain", "monsoon", "disaster"], response: "🌧️ SafeTour monitors live weather warnings. In case of heavy rains or flash floods, avoid driving through waterlogged underpasses, stay away from high tension poles, and check active alerts in the Dashboard." }
];

// Helper to query Gemini API via HTTP POST (Native Node.js)
const queryGemini = (promptText) => {
  return new Promise((resolve, reject) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return reject(new Error("No Gemini API key specified"));

    const data = JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    });

    const options = {
      hostname: 'generativelink.googleapis.com', // fallback google api domains or direct generativeai
      port: 443,
      path: `/v1beta/models/gemini-pro:generateContent?key=${key}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    // Try normal api domain or let's use direct endpoints
    options.hostname = 'generativelanguage.googleapis.com';

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts[0]) {
            resolve(parsed.candidates[0].content.parts[0].text);
          } else {
            reject(new Error("Unexpected Gemini response structure: " + body));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
};

// API Services object
const AIService = {
  // 1. AI Trip Planner
  generateTripPlan: async ({ destination, budget, days, interests, travelStyle, groupType, transportation }) => {
    const prompt = `You are SafeTour AI, a smart trip planner. Create a detailed, premium travel itinerary for a tourist visiting ${destination}. 
    Details: Budget is ${budget} INR, duration is ${days} days, interests include ${interests.join(', ')}, travel style is ${travelStyle}, group type is ${groupType}, preferred transport is ${transportation}.
    Provide the response strictly in JSON format matching the following schema:
    {
      "destination": "Name of destination",
      "theme": "Travel catchphrase or theme",
      "itinerary": [
        {
          "day": 1,
          "theme": "Day theme",
          "activities": [
            { "time": "09:00 AM", "activity": "Activity name", "location": "Exact spot", "description": "Short explanation", "cost": 150 }
          ]
        }
      ],
      "budgetBreakdown": { "accommodation": 2000, "activities": 1000, "food": 1000, "transport": 500, "emergency": 500 },
      "bestVisitingTime": "Recommended months",
      "checklist": ["Item 1", "Item 2"],
      "estimatedTravelTime": "e.g., 4 hours from transit hub",
      "carbonFootprint": "Estimated CO2 offset score (1-10 scale, e.g. 7.5)"
    }`;

    try {
      if (process.env.GEMINI_API_KEY) {
        const aiResponse = await queryGemini(prompt);
        // Find JSON block if it exists
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse json from Gemini response");
      }
    } catch (error) {
      console.warn("Using SafeTour AI Local Heuristics engine: ", error.message);
    }

    // Heuristics local engine fallback
    const key = destination.toLowerCase().trim();
    const city = fallbackData.destinations[key] || fallbackData.generic;
    
    // Distribute budget
    const budgetNum = Number(budget) || 10000;
    const accommodation = Math.round(budgetNum * 0.4);
    const activities = Math.round(budgetNum * 0.2);
    const food = Math.round(budgetNum * 0.2);
    const transport = Math.round(budgetNum * 0.1);
    const emergency = Math.round(budgetNum * 0.1);

    const itinerary = [];
    const loopDays = Math.min(Number(days) || 3, 7);
    
    for (let d = 1; d <= loopDays; d++) {
      const act1 = city.attractions[(d - 1) % city.attractions.length];
      const act2 = city.attractions[d % city.attractions.length];
      const restaurant = city.restaurants[(d - 1) % city.restaurants.length];
      
      itinerary.push({
        day: d,
        theme: `Explore local heritage and ${interests[0] || 'scenic sights'}`,
        activities: [
          {
            time: "09:00 AM",
            activity: `Visit ${act1}`,
            location: act1,
            description: `Explore the beautiful surroundings, learn historical context, and interact with certified guides.`,
            cost: Math.round(activities * 0.4)
          },
          {
            time: "01:30 PM",
            activity: `Lunch at ${restaurant.name}`,
            location: restaurant.name,
            description: `Enjoy local specialities like ${restaurant.specialty}. Safe and hygienic certified vendor.`,
            cost: Math.round(food * 0.5)
          },
          {
            time: "04:30 PM",
            activity: `Stroll through ${act2}`,
            location: act2,
            description: `Guided walk with maps, exploring regional crafts, artifacts, and local architecture.`,
            cost: Math.round(activities * 0.3)
          }
        ]
      });
    }

    // Determine eco rating based on transportation
    const carbonFootprint = transportation === 'Public Transport' || transportation === 'Walking' ? 9.2 : 6.5;

    return {
      destination: destination.charAt(0).toUpperCase() + destination.slice(1),
      theme: city.theme || "Scenic Wonders & Local Explorations",
      itinerary,
      budgetBreakdown: { accommodation, activities, food, transport, emergency },
      bestVisitingTime: "October to March (Pleasant weather)",
      checklist: city.checklist,
      estimatedTravelTime: "2-3 hours from the nearest railway station/airport",
      carbonFootprint: carbonFootprint.toString()
    };
  },

  // 2. AI Live Safety Score Engine
  calculateSafetyScore: (crimeLevel, density, weatherCode, timeOfDay) => {
    // Basic score starts at 100
    let score = 100;

    // Crime factor
    if (crimeLevel === 'High') score -= 35;
    else if (crimeLevel === 'Medium') score -= 15;

    // Crowd Density factor
    if (density === 'Dense') score -= 10; // High crowd density slightly lowers score due to pickpocket risk
    
    // Time of day factor
    if (timeOfDay === 'Night' || timeOfDay === 'Late Night') {
      score -= 15;
    }

    // Weather condition
    if (weatherCode === 'Severe') score -= 20;
    else if (weatherCode === 'Warning') score -= 8;

    score = Math.max(10, score); // score cannot be lower than 10
    
    let riskLevel = 'Safe';
    if (score < 55) riskLevel = 'High Risk';
    else if (score < 80) riskLevel = 'Moderate Risk';

    return {
      score,
      riskLevel,
      breakdown: {
        crimeFactor: crimeLevel === 'High' ? -35 : crimeLevel === 'Medium' ? -15 : 0,
        crowdFactor: density === 'Dense' ? -10 : 0,
        timeFactor: (timeOfDay === 'Night' || timeOfDay === 'Late Night') ? -15 : 0,
        weatherFactor: weatherCode === 'Severe' ? -20 : weatherCode === 'Warning' ? -8 : 0
      }
    };
  },

  // 3. AI Chat Assistant
  getChatResponse: async (message) => {
    const prompt = `You are SafeTour AI, an intelligent tourist safety and local travel companion. A user asks: "${message}". 
    Answer concisely, emphasizing safety tips, local rules, and emergency guidelines. Write in beautiful, short markdown with bullet points.`;

    try {
      if (process.env.GEMINI_API_KEY) {
        return await queryGemini(prompt);
      }
    } catch (e) {
      // Proceed to fallback
    }

    const msgLower = message.toLowerCase();
    for (const entry of fallbackChat) {
      if (entry.keywords.some(kw => msgLower.includes(kw))) {
        return entry.response;
      }
    }

    return `👋 Hello! I am your **SafeTour AI Assistant**. 
    
I can guide you on:
* **Emergency procedures** (type "emergency" or "SOS")
* **Common tourist scams** (type "scams" or "overcharging")
* **Safety tips & zones** (type "safety" or "safe night routes")
* **Specific city inquiries** (try "Goa", "Jaipur", "Delhi", or "Mumbai")

Please let me know how I can make your journey safer and more comfortable!`;
  },

  // 4. AI Scam hotspot scanner
  detectScamHotspots: (reports) => {
    // Cluster reports by lat/lng proximity to detect repeated scam hotspots
    const hotspots = [];
    const thresholdKm = 0.5; // Radius of 500m for a cluster

    // Helper to calculate distance in km between two lat/lng
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const visited = new Set();

    for (let i = 0; i < reports.length; i++) {
      if (visited.has(i)) continue;
      const cluster = [reports[i]];
      visited.add(i);

      for (let j = i + 1; j < reports.length; j++) {
        if (visited.has(j)) continue;
        const dist = getDistance(reports[i].lat, reports[i].lng, reports[j].lat, reports[j].lng);
        if (dist <= thresholdKm) {
          cluster.push(reports[j]);
          visited.add(j);
        }
      }

      if (cluster.length >= 2) {
        // Hotspot detected!
        // Calculate center lat/lng
        const avgLat = cluster.reduce((sum, r) => sum + r.lat, 0) / cluster.length;
        const avgLng = cluster.reduce((sum, r) => sum + r.lng, 0) / cluster.length;
        const categories = cluster.map(r => r.category);
        const mostCommonCategory = categories.sort((a,b) =>
          categories.filter(v => v===a).length - categories.filter(v => v===b).length
        ).pop();

        hotspots.push({
          lat: avgLat,
          lng: avgLng,
          reportCount: cluster.length,
          primaryThreat: mostCommonCategory,
          radius: 300, // Display radius in map
          advisory: `⚠️ Warning: AI detected ${cluster.length} recent scam reports of '${mostCommonCategory}' within 300m.`
        });
      }
    }

    return hotspots;
  }
};

module.exports = AIService;
