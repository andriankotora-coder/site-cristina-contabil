const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // ex: "hero_title"
    value: { type: String, required: true }             // ex: "Expert Contabil..."
});

module.exports = mongoose.model('Settings', settingsSchema);