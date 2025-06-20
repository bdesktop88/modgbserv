const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const redirectSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  destination: { type: String, required: true },
  token: { type: String, required: true }
});

const Redirect = mongoose.model('Redirect', redirectSchema);

module.exports = {
  // ✅ Fix this function so server.js won't crash
  async getAllRedirects() {
    return await Redirect.find({});
  },

  getRedirect(key, cb) {
    Redirect.findOne({ key }, cb);
  },

  addRedirect(key, destination, token, cb) {
    const newRedirect = new Redirect({ key, destination, token });
    newRedirect.save(cb);
  },

  deleteRedirect(key, cb) {
    Redirect.deleteOne({ key }, cb);
  },

  updateRedirect(originalKey, newKey, newDestination, cb) {
    Redirect.findOneAndUpdate(
      { key: originalKey },
      { key: newKey, destination: newDestination },
      { new: true },
      cb
    );
  }
};
