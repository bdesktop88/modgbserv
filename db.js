const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/redirects';
mongoose.connect(mongoURI);

const redirectSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    destination: { type: String, required: true },
    token: { type: String, required: true },
}, { timestamps: true });

const Redirect = mongoose.model('Redirect', redirectSchema);

// Add a new redirect using Promises
async function addRedirect(key, destination, token, callback) {
    try {
        const newRedirect = new Redirect({ key, destination, token });
        await newRedirect.save();
        callback(null); // success
    } catch (err) {
        callback(err); // pass error
    }
}

// Get a redirect by key (this is fine)
function getRedirect(key, callback) {
    Redirect.findOne({ key }, callback);
}

module.exports = {
    addRedirect,
    getRedirect
};
