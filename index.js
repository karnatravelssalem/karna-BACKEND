const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())

let isConnected = false
async function connectDB() {
  if (isConnected) return
  await mongoose.connect(process.env.MONGO_URI)
  isConnected = true
}

const TripSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String, date: String, location: String,
  vehicle: String, description: String,
  tags: String, img: String, color: String,
}, { timestamps: true })

const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String, location: String, rating: Number,
  text: String, trip: String,
}, { timestamps: true })

const Trip   = mongoose.models.Trip   || mongoose.model('Trip',   TripSchema)
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema)

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'karna-secret-2026'

function adminOnly(req, res, next) {
  if (req.headers['x-admin-token'] !== ADMIN_SECRET)
    return res.status(401).json({ error: 'Unauthorised' })
  next()
}

app.get('/', (req, res) => res.json({ status: 'Karna Travels API running ✓' }))

app.get('/trips', async (req, res) => {
  await connectDB()
  res.json(await Trip.find().sort({ createdAt: -1 }))
})

app.post('/trips', adminOnly, async (req, res) => {
  await connectDB()
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected array' })
  await Trip.deleteMany({})
  if (req.body.length > 0) await Trip.insertMany(req.body)
  res.json({ success: true })
})

app.get('/reviews', async (req, res) => {
  await connectDB()
  res.json(await Review.find().sort({ createdAt: -1 }))
})

app.post('/reviews', adminOnly, async (req, res) => {
  await connectDB()
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected array' })
  await Review.deleteMany({})
  if (req.body.length > 0) await Review.insertMany(req.body)
  res.json({ success: true })
})

module.exports = app
