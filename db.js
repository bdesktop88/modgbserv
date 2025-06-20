// db.js
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Schema definition
const redirectSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    destination: { type: String, required: true },
    token: { type: String, required: true },
});

// Model
const Redirect = mongoose.model('Redirect', redirectSchema);

// Exported database operations
module.exports = {
    // Add a new redirect
    addRedirect: async (key, destination, token) => {
        const entry = new Redirect({ key, destination, token });
        await entry.save();
    },

    // Get a specific redirect
    getRedirect: async (key) => {
        return await Redirect.findOne({ key });
    },

    // Get all redirects (for admin view)
    getAllRedirects: async () => {
        return await Redirect.find({});
    },

    // Update a redirect's destination
    updateRedirect: async (key, newDestination) => {
        return await Redirect.findOneAndUpdate(
            { key },
            { destination: newDestination },
            { new: true } // Return the updated document
        );
    },

    // Delete a redirect
    deleteRedirect: async (key) => {
        return await Redirect.deleteOne({ key });
    },
};
