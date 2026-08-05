require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { initEmailWorker } = require('./jobs/email.worker');

// Import Mongoose Models for Seeding
const User = require('./models/User');
const Alert = require('./models/Alert');
const Attraction = require('./models/Attraction');
const SafetyZone = require('./models/SafetyZone');
const ScamReport = require('./models/ScamReport');

// Connect to MongoDB Database
connectDB().then(() => {
  // Trigger database seeding on successful connection
  seedDatabase();
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io Server
initSocket(server);

// Boot background BullMQ worker
initEmailWorker();

// Global Security Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disabled for local assets / dev maps
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Incoming Request] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '******';
    console.log(`[Request Body]`, JSON.stringify(sanitizedBody));
  }
  next();
});

// Global Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { message: 'Too many requests from this IP. Please try again later.' }
});
app.use('/api/', apiLimiter);

// Route Setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/scams', require('./routes/scams'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/community', require('./routes/community'));
app.use('/api/attractions', require('./routes/attractions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/health', require('./routes/health'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dispatches', require('./routes/dispatches'));

app.get('/', (req, res) => {
  res.send('SafeTour AI Modular MERN Backend is Running!');
});

// Database Seeder
async function seedDatabase() {
  try {
    // 0. Seed Demo Users
    const demoUsers = [
      { name: "John Doe (Tourist)", email: "tourist@safetour.ai", role: "tourist" },
      { name: "Officer Smith (Police)", email: "police@safetour.ai", role: "police" },
      { name: "Dr. Adams (Hospital)", email: "hospital@safetour.ai", role: "hospital" },
      { name: "Rescue Team Alpha (Rescue)", email: "rescue@safetour.ai", role: "rescue" },
      { name: "SafeTour Admin (Admin)", email: "admin@safetour.ai", role: "admin" }
    ];

    for (const demoUser of demoUsers) {
      const existingUser = await User.findOne({ email: demoUser.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        await User.create({
          name: demoUser.name,
          email: demoUser.email,
          password: hashedPassword,
          role: demoUser.role
        });
        console.log(`[Seeder] Seeded demo user: ${demoUser.email}`);
      }
    }

    // 1. Seed Safety Zones
    const zoneCount = await SafetyZone.countDocuments();
    if (zoneCount === 0) {
      await SafetyZone.insertMany([
        { name: "Baga Beach", lat: 15.5562, lng: 73.7517, radius: 1000, safetyScore: 85, crimeIndex: "Low", crowdDensity: "Moderate", advisory: "Safe zone. Lifeguards present until 8 PM. Keep valuables secure.", riskLevel: "Safe" },
        { name: "Anjuna Beach Cliffs", lat: 15.5802, lng: 73.7431, radius: 800, safetyScore: 65, crimeIndex: "Medium", crowdDensity: "Low", advisory: "Slippery rocky cliffs. High tides can be dangerous. Avoid swimming.", riskLevel: "Moderate Risk" },
        { name: "Calangute Market Road", lat: 15.5451, lng: 73.7592, radius: 600, safetyScore: 78, crimeIndex: "Low", crowdDensity: "Dense", advisory: "Dense crowd. Watch out for petty pickpockets and fake tour guides.", riskLevel: "Safe" },
        { name: "Chapora Fort Ruins", lat: 15.6062, lng: 73.7364, radius: 500, safetyScore: 90, crimeIndex: "Low", crowdDensity: "Moderate", advisory: "Safe scenic monument. Stay on marked tracks.", riskLevel: "Safe" }
      ]);
      console.log('[Seeder] Seeded initial Safety Zones!');
    }

    // 2. Seed Attractions
    const attractionCount = await Attraction.countDocuments();
    if (attractionCount === 0) {
      await Attraction.insertMany([
        { name: "Gateway of India", description: "Historic stone arch monument overlooking Mumbai Harbour.", location: "Apollo Bandar, Colaba, Mumbai", lat: 18.9220, lng: 72.8347, category: "Historical", ecoScore: 88, qrCodeToken: "GATEWAY_MUMBAI_101" },
        { name: "Baga Beach Shoreline", description: "Popular golden sand shore with adventure water sports.", location: "Baga, Goa", lat: 15.5553, lng: 73.7517, category: "Beaches", ecoScore: 74, qrCodeToken: "BAGA_GOA_302" },
        { name: "Hawa Mahal", description: "Beautiful red and pink sandstone palace architecture.", location: "Jaipur, Rajasthan", lat: 26.9239, lng: 75.8267, category: "Historical", ecoScore: 92, qrCodeToken: "HAWA_JAIPUR_505" }
      ]);
      console.log('[Seeder] Seeded initial Attractions!');
    }

    // 3. Seed Emergency Alerts
    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
      await Alert.insertMany([
        { title: "High Tide Storm Warning", message: "Red alert for Calangute and Baga beaches. Severe wind gusts, swimming is strictly prohibited.", severity: "critical", category: "Weather", lat: 15.5553, lng: 73.7517, radius: 5000 },
        { title: "Festival Road Closures", message: "Traffic detour near Jaipur Pink City market due to local holiday processions. Use ring road bypass.", severity: "info", category: "Road Closure", lat: 26.9239, lng: 75.8267, radius: 1000 },
        { title: "Delhi Heat Advisory", message: "Severe temperature warning. Stay hydrated, avoid open sun exposure between 12 PM and 4 PM.", severity: "warning", category: "Weather", lat: 28.5245, lng: 77.1855, radius: 10000 }
      ]);
      console.log('[Seeder] Seeded initial Emergency Alerts!');
    }

    // 4. Seed Scam Reports
    const scamCount = await ScamReport.countDocuments();
    if (scamCount === 0) {
      let seedUser = await User.findOne({ email: "seeder@safetour.ai" });
      if (!seedUser) {
        const dummyPassword = await bcrypt.hash("seeder_pass_12345", 10);
        seedUser = new User({
          name: "SafeTour Seeder Bot",
          email: "seeder@safetour.ai",
          password: dummyPassword,
          role: "admin"
        });
        await seedUser.save();
      }

      await ScamReport.insertMany([
        { user: seedUser._id, category: "Fake Guide", description: "Unlicensed guide offering special temple shortcuts, demanding 2000 INR at exit.", address: "Qutub Minar outer exit, Delhi", lat: 28.5255, lng: 77.1865, status: "verified" },
        { user: seedUser._id, category: "Overcharging", description: "Local auto rickshaw demanding flat 800 INR for a 2km ride. Refusing to turn on meter.", address: "Gateway of India pier road, Mumbai", lat: 18.9230, lng: 72.8355, status: "verified" },
        { user: seedUser._id, category: "Fake Taxi", description: "Unregistered taxi service scamming tourists with fake airport shuttle coupons.", address: "Airport Arrival corridor, Delhi", lat: 28.5562, lng: 77.1001, status: "verified" },
        { user: seedUser._id, category: "Pickpocketing", description: "Active mobile and wallet picking group operating near the beach water sports deck.", address: "Baga beach deck, Goa", lat: 15.5565, lng: 73.7525, status: "verified" }
      ]);
      console.log('[Seeder] Seeded initial Scam Reports!');
    }
  } catch (err) {
    console.error('[Seeder] Database seeding failed:', err.message);
  }
}

// Validate critical environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`❌ [Startup Error] Missing critical environment variables: ${missingEnvVars.join(', ')}`);
  console.error(`👉 Please define them in your backend .env file.`);
  process.exit(1);
}

// Start Server listening
const PORT = parseInt(process.env.PORT || '5000', 10);
server.listen(PORT, () => {
  console.log(`[Server] SafeTour MERN backend running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ [Server Error] Port ${PORT} is already in use.`);
    console.error(`💡 Resolution:`);
    console.error(`   - On Windows: Run "netstat -ano | findstr :${PORT}" or "Get-NetTCPConnection -LocalPort ${PORT}" to find the process ID (PID), then terminate it.`);
    console.error(`   - On macOS/Linux: Run "lsof -i :${PORT}" to find the PID, then "kill -9 <PID>".`);
    console.error(`   - Alternatively, change the PORT environment variable in your backend .env file.\n`);
    process.exit(1);
  } else {
    console.error(`❌ [Server Error] Server failed to start: ${error.message}`);
    process.exit(1);
  }
});
