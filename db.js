const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/redirectDB';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const redirectSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    destination: String,
    token: String,
    createdAt: { type: Date, default: Date.now }
});

const Redirect = mongoose.model('Redirect', redirectSchema);

module.exports = {
    addRedirect: async (key, destination, token, callback) => {
        try {
            const newRedirect = new Redirect({ key, destination, token });
            await newRedirect.save();
            callback(null);
        } catch (err) {
            callback(err);
        }
    },

    getRedirect: async (key, callback) => {
        try {
            const result = await Redirect.findOne({ key });
            callback(null, result);
        } catch (err) {
            callback(err, null);
        }
    }
};
