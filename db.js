require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Define schema and model
const redirectSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    destination: { type: String, required: true },
    token: { type: String, required: true },
}, { timestamps: true });

const Redirect = mongoose.model('Redirect', redirectSchema);

// Add new redirect
function addRedirect(key, destination, token, callback) {
    const newRedirect = new Redirect({ key, destination, token });
    newRedirect.save(callback);
}

// Retrieve redirect
function getRedirect(key, callback) {
    Redirect.findOne({ key }, callback);
}

module.exports = {
    addRedirect,
    getRedirect
};
