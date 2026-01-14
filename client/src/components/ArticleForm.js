import React, { useState } from 'react';
import axios from 'axios';

/**
 * Form per la creazione e modifica di articoli
 * Utilizza modali dedicati invece di alert del browser
 */
function ArticleForm({ onArticleAdded, initialData, onShowModal }) {

    const [formData, setFormData] = useState({
        title: '',
        authors: '',
        abstract: '',
        fullText: '',
        publicationDate: '',
        doi: ''
    });

    // Inizializza il form con i dati esistenti in caso di modifica
    React.useEffect(() => {
        if (initialData) {
            const formattedDate = initialData.publicationDate
                ? new Date(initialData.publicationDate).toISOString().split('T')[0]
                : '';

            setFormData({
                title: initialData.title || '',
                authors: initialData.authors || '',
                abstract: initialData.abstract || '',
                fullText: initialData.fullText || '',
                publicationDate: formattedDate,
                doi: initialData.doi || ''
            });
        }
    }, [initialData]);


    // Gestisce i cambiamenti nei campi del form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    // Invia i dati del form al backend (creazione o modifica)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validazione campi obbligatori
        if (!formData.title.trim() || !formData.authors.trim() || !formData.fullText.trim()) {
            onShowModal({
                type: 'error',
                title: 'Campi obbligatori',
                message: 'Titolo, autori e testo completo sono campi obbligatori.'
            });
            return;
        }

        try {
            const payload = { ...formData };
            let response;

            if (initialData && initialData._id) {
                // Modifica articolo esistente
                response = await axios.put(`/api/articles/${initialData._id}`, payload);
                onShowModal({
                    type: 'success',
                    title: 'Modificato',
                    message: 'Articolo modificato con successo!'
                });
            } else {
                // Crea nuovo articolo
                response = await axios.post('/api/articles', payload);
                onShowModal({
                    type: 'success',
                    title: 'Aggiunto',
                    message: 'Articolo aggiunto con successo!'
                });
            }

            onArticleAdded(response.data);

            // Reset form solo se è un nuovo articolo
            if (!initialData) {
                setFormData({
                    title: '',
                    authors: '',
                    abstract: '',
                    fullText: '',
                    publicationDate: '',
                    doi: ''
                });
            }
        } catch (error) {
            console.error('Errore nell\'invio:', error);
            onShowModal({
                type: 'error',
                title: 'Errore',
                message: 'Si è verificato un errore durante il salvataggio. Riprova.'
            });
        }
    };

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ccc' }}>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Titolo dell'articolo *"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <textarea
                        name="fullText"
                        placeholder="Testo completo dell'articolo *"
                        value={formData.fullText}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', height: '100px' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        name="authors"
                        placeholder="Autori (es. Rossi M., Bianchi L.) *"
                        value={formData.authors}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <textarea
                        name="abstract"
                        placeholder="Abstract (riassunto)"
                        value={formData.abstract}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', height: '60px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>
                        Data Pubblicazione: *
                        <input
                            type="date"
                            name="publicationDate"
                            value={formData.publicationDate}
                            onChange={handleChange}
                            required
                            style={{ padding: '8px', marginLeft: '10px' }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        name="doi"
                        placeholder="DOI (opzionale)"
                        value={formData.doi}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                    * Campi obbligatori. Le citazioni possono essere gestite dalla scheda dell'articolo dopo il salvataggio.
                </p>

                <button
                    type="submit"
                    style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        borderRadius: '5px'
                    }}
                >
                    Salva Articolo
                </button>
            </form>
        </div>
    );
}

export default ArticleForm;