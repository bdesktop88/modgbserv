const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const redirectSchema = new mongoose.Schema({
    key: String,
    destination: String,
    token: String,
});

const Redirect = mongoose.model('Redirect', redirectSchema);

module.exports = {
    addRedirect: async (key, destination, token) => {
        const entry = new Redirect({ key, destination, token });
        await entry.save();
    },
    getRedirect: async (key) => {
        return await Redirect.findOne({ key });
    },
};
