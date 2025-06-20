const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const redirectSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  destination: { type: String, required: true },
  token: { type: String, required: true }
});

const Redirect = mongoose.model('Redirect', redirectSchema);

module.exports = {
  // Get all redirects
  async getAllRedirects() {
    return await Redirect.find({});
  },

  // Get a single redirect by key
  getRedirect(key, cb) {
    Redirect.findOne({ key }, cb);
  },

  // Add a new redirect
  addRedirect(key, destination, token, cb) {
    const newRedirect = new Redirect({ key, destination, token });
    newRedirect.save(cb);
  },

  // Delete a redirect by key
  deleteRedirect(key, cb) {
    Redirect.deleteOne({ key }, cb);
  },

  // Update redirect (key or destination)
  updateRedirect(originalKey, newKey, newDestination, cb) {
    Redirect.findOneAndUpdate(
      { key: originalKey },
      { key: newKey, destination: newDestination },
      { new: true },
      cb
    );
  }
};
