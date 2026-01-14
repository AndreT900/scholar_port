
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');


// Recupera tutti gli articoli
router.get('/', async (req, res) => {
    try {

        const articles = await Article.find().sort({ publicationDate: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Crea un nuovo articolo
router.post('/', async (req, res) => {

    const article = new Article({
        title: req.body.title,
        authors: req.body.authors,
        abstract: req.body.abstract,
        fullText: req.body.fullText,
        publicationDate: req.body.publicationDate,
        doi: req.body.doi,
        citations: req.body.citations || []
    });

    try {
        const newArticle = await article.save();
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// Aggiorna un articolo esistente
router.put('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Articolo non trovato' });


        article.title = req.body.title || article.title;
        article.authors = req.body.authors || article.authors;
        article.abstract = req.body.abstract || article.abstract;
        article.fullText = req.body.fullText || article.fullText;
        article.publicationDate = req.body.publicationDate || article.publicationDate;
        article.doi = req.body.doi || article.doi;


        if (req.body.citations) {
            article.citations = req.body.citations;
        }

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Elimina un articolo
router.delete('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' });
        }

        await article.deleteOne();
        res.json({ message: 'Articolo cancellato con successo' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Aggiunge una citazione a un articolo
router.post('/:id/citations', async (req, res) => {
    try {

        const article = await Article.findById(req.params.id);

        if (!article) return res.status(404).json({ message: 'Articolo non trovato' });

        const newCitation = req.body.citation;

        if (newCitation) {

            article.citations.push(newCitation);


            await article.save();
        }

        res.json(article);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;