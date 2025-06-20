const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/redirects';
mongoose.connect(mongoURI);

const redirectSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  destination: { type: String, required: true },
  token: { type: String, required: true },
}, { timestamps: true });

const Redirect = mongoose.model('Redirect', redirectSchema);

// Add new redirect
async function addRedirect(key, destination, token) {
  const newRedirect = new Redirect({ key, destination, token });
  return await newRedirect.save();
}

// Get redirect by key
async function getRedirect(key) {
  return await Redirect.findOne({ key });
}

// Update destination
async function updateRedirect(key, newDestination) {
  return await Redirect.findOneAndUpdate({ key }, { destination: newDestination }, { new: true });
}

// Delete redirect
async function deleteRedirect(key) {
  return await Redirect.findOneAndDelete({ key });
}

// Get all redirects
async function getAllRedirects() {
  return await Redirect.find({});
}

module.exports = {
  addRedirect,
  getRedirect,
  updateRedirect,
  deleteRedirect,
  getAllRedirects,
};
