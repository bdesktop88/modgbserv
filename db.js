const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/redirects';
mongoose.connect(mongoURI, {
    // No need for these options anymore in mongoose 6+
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
});

const redirectSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    destination: { type: String, required: true },
    token: { type: String, required: true },
}, { timestamps: true });

const Redirect = mongoose.model('Redirect', redirectSchema);

// Add a new redirect
async function addRedirect(key, destination, token, callback) {
    try {
        const newRedirect = new Redirect({ key, destination, token });
        await newRedirect.save();
        callback(null);
    } catch (err) {
        callback(err);
    }
}

// Get a redirect by key
async function getRedirect(key, callback) {
    try {
        const redirect = await Redirect.findOne({ key }).exec();
        callback(null, redirect);
    } catch (err) {
        callback(err);
    }
}

// Get all redirects
async function getAllRedirects() {
    return Redirect.find().exec();
}

// Update a redirect's destination by key
async function updateRedirect(key, destination) {
    return Redirect.findOneAndUpdate(
        { key },
        { destination },
        { new: true }
    ).exec();
}

// Delete a redirect by key
async function deleteRedirect(key) {
    return Redirect.findOneAndDelete({ key }).exec();
}

module.exports = {
    addRedirect,
    getRedirect,
    getAllRedirects,
    updateRedirect,
    deleteRedirect,
};
