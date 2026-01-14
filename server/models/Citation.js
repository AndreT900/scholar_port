
const mongoose = require('mongoose');

// Schema per le citazioni come entità separate
const CitationSchema = new mongoose.Schema({
    // L'articolo a cui appartiene questa citazione
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    // Autore/i della citazione
    authors: {
        type: String,
        required: true
    },
    // Titolo dell'opera citata
    title: {
        type: String,
        required: true
    },
    // Anno di pubblicazione della citazione
    year: {
        type: Number,
        required: false
    },
    // DOI della citazione (opzionale)
    doi: {
        type: String,
        required: false
    },
    // Note aggiuntive (opzionale)
    notes: {
        type: String,
        required: false
    },
    // Data di creazione della citazione
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Citation', CitationSchema);
