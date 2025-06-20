const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/redirects';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const redirectSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    destination: { type: String, required: true },
    token: { type: String, required: true },
}, { timestamps: true });

const Redirect = mongoose.model('Redirect', redirectSchema);

// Add a new redirect
function addRedirect(key, destination, token, callback) {
    const newRedirect = new Redirect({ key, destination, token });
    newRedirect.save(callback);
}

// Get a redirect by key
function getRedirect(key, callback) {
    Redirect.findOne({ key }, callback);
}

module.exports = {
    addRedirect,
    getRedirect
};
