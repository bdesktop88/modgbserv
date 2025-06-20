const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/redirects';
mongoose.connect(mongoURI);

const redirectSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    destination: { type: String, required: true },
    token: { type: String, required: true },
}, { timestamps: true });

const Redirect = mongoose.model('Redirect', redirectSchema);

// Add a new redirect
async function addRedirect(key, destination, token) {
    const newRedirect = new Redirect({ key, destination, token });
    await newRedirect.save();
}

// Get a redirect by key
async function getRedirect(key) {
    return await Redirect.findOne({ key });
}

module.exports = {
    addRedirect,
    getRedirect
};
