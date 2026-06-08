const mongoose = require('mongoose');

const PendingOrderFileSchema = new mongoose.Schema({
    name: String,
    type: String,
    url: String,
}, { _id: false });

const PendingOrderSampleSchema = new mongoose.Schema({
    id: String,
    docName: String,
    sampleTitle: String,
    fioLatin: String,
    sealText: String,
    stampText: String,
    computedPrice: Number,
}, { _id: false });

const PendingOrderSchema = new mongoose.Schema({
    orderReference: { type: String, required: true, unique: true },
    languagePair: String,
    tariff: String,
    totalValue: Number,
    selectedDate: String,
    samples: [PendingOrderSampleSchema],
    files: [PendingOrderFileSchema],
    status: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

PendingOrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('PendingOrder', PendingOrderSchema);
