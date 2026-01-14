
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Citation = require('../models/Citation');


// Recupera tutti gli articoli (con ricerca opzionale lato server)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        // Se c'è un termine di ricerca, applica il filtro su titolo, autore e anno
        if (search && search.trim() !== '') {
            const searchTerm = search.trim();

            // Crea un array di condizioni OR per la ricerca
            const searchConditions = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { authors: { $regex: searchTerm, $options: 'i' } }
            ];

            // Se il termine di ricerca è un numero (potenziale anno)
            const yearNumber = parseInt(searchTerm);
            if (!isNaN(yearNumber) && yearNumber >= 1900 && yearNumber <= 2100) {
                // Cerca articoli pubblicati in quell'anno
                const startOfYear = new Date(yearNumber, 0, 1);
                const endOfYear = new Date(yearNumber + 1, 0, 1);
                searchConditions.push({
                    publicationDate: {
                        $gte: startOfYear,
                        $lt: endOfYear
                    }
                });
            }

            query = { $or: searchConditions };
        }

        const articles = await Article.find(query).sort({ publicationDate: -1 });

        // Per ogni articolo, recupera le citazioni associate
        const articlesWithCitations = await Promise.all(
            articles.map(async (article) => {
                const citations = await Citation.find({ articleId: article._id });
                return {
                    ...article.toObject(),
                    citations: citations
                };
            })
        );

        res.json(articlesWithCitations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Recupera un singolo articolo con le sue citazioni
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' });
        }

        const citations = await Citation.find({ articleId: article._id });
        res.json({
            ...article.toObject(),
            citations: citations
        });
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
        doi: req.body.doi
    });

    try {
        const newArticle = await article.save();

        // Se ci sono citazioni, le salva come entità separate
        if (req.body.citations && req.body.citations.length > 0) {
            const citationsToSave = req.body.citations.map(cit => ({
                articleId: newArticle._id,
                authors: cit.authors || '',
                title: cit.title || '',
                year: cit.year,
                doi: cit.doi,
                notes: cit.notes
            }));

            const savedCitations = await Citation.insertMany(citationsToSave);

            res.status(201).json({
                ...newArticle.toObject(),
                citations: savedCitations
            });
        } else {
            res.status(201).json({
                ...newArticle.toObject(),
                citations: []
            });
        }
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

        const updatedArticle = await article.save();

        // Recupera le citazioni associate
        const citations = await Citation.find({ articleId: updatedArticle._id });

        res.json({
            ...updatedArticle.toObject(),
            citations: citations
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Elimina un articolo e tutte le sue citazioni
router.delete('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Articolo non trovato' });
        }

        // Elimina prima tutte le citazioni associate
        await Citation.deleteMany({ articleId: article._id });

        // Poi elimina l'articolo
        await article.deleteOne();
        res.json({ message: 'Articolo e citazioni associate cancellati con successo' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;