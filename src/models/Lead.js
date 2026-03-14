const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    nume: { type: String, required: true },
    email: { type: String, required: true },
    serviciu: String,
    mesaj: String,
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);