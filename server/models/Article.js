
const mongoose = require('mongoose');


// Schema del database per gli articoli
const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    authors: {
        type: String,
        required: true
    },
    abstract: {
        type: String,
        required: false
    },
    fullText: {
        type: String,
        required: true
    },
    publicationDate: {
        type: Date,
        required: true
    },
    doi: {
        type: String,
        required: false
    },

    citations: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Article', ArticleSchema);