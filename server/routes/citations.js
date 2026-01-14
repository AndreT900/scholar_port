
const express = require('express');
const router = express.Router();
const Citation = require('../models/Citation');
const Article = require('../models/Article');

// Recupera tutte le citazioni di un articolo specifico
router.get('/article/:articleId', async (req, res) => {
    try {
        const citations = await Citation.find({ articleId: req.params.articleId })
            .sort({ createdAt: -1 });
        res.json(citations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Crea una nuova citazione per un articolo
router.post('/', async (req, res) => {
    try {
        // Verifica che l'articolo esista
        const article = await Article.findById(req.body.articleId);
        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' });
        }

        const citation = new Citation({
            articleId: req.body.articleId,
            authors: req.body.authors,
            title: req.body.title,
            year: req.body.year,
            doi: req.body.doi,
            notes: req.body.notes
        });

        const newCitation = await citation.save();
        res.status(201).json(newCitation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Aggiorna una citazione esistente
router.put('/:id', async (req, res) => {
    try {
        const citation = await Citation.findById(req.params.id);
        if (!citation) {
            return res.status(404).json({ message: 'Citazione non trovata' });
        }

        // Aggiorna solo i campi forniti
        citation.authors = req.body.authors || citation.authors;
        citation.title = req.body.title || citation.title;
        citation.year = req.body.year !== undefined ? req.body.year : citation.year;
        citation.doi = req.body.doi !== undefined ? req.body.doi : citation.doi;
        citation.notes = req.body.notes !== undefined ? req.body.notes : citation.notes;

        const updatedCitation = await citation.save();
        res.json(updatedCitation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Elimina una citazione
router.delete('/:id', async (req, res) => {
    try {
        const citation = await Citation.findById(req.params.id);
        if (!citation) {
            return res.status(404).json({ message: 'Citazione non trovata' });
        }

        await citation.deleteOne();
        res.json({ message: 'Citazione eliminata con successo' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Elimina tutte le citazioni di un articolo (usato quando si elimina un articolo)
router.delete('/article/:articleId', async (req, res) => {
    try {
        const result = await Citation.deleteMany({ articleId: req.params.articleId });
        res.json({
            message: 'Citazioni eliminate con successo',
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
