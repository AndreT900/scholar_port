import React, { useState } from 'react';
import axios from 'axios';

function ArticleForm({ onArticleAdded, initialData }) {

    const [formData, setFormData] = useState({
        title: '',
        authors: '',
        abstract: '',
        fullText: '',
        publicationDate: '',
        doi: '',
        citations: []
    });


    React.useEffect(() => {
        if (initialData) {

            const formattedDate = initialData.publicationDate
                ? new Date(initialData.publicationDate).toISOString().split('T')[0]
                : '';

            setFormData({
                ...initialData,
                publicationDate: formattedDate
            });
        }
    }, [initialData]);


    const [tempCitation, setTempCitation] = useState("");


    // Gestisce i cambiamenti nei campi del form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    // Invia i dati del form al backend (creazione o modifica)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            let response;

            if (initialData && initialData._id) {

                response = await axios.put(`/api/articles/${initialData._id}`, payload);
            } else {

                response = await axios.post('/api/articles', payload);
            }


            onArticleAdded(response.data);


            if (!initialData) {
                setFormData({
                    title: '',
                    authors: '',
                    abstract: '',
                    fullText: '',
                    publicationDate: '',
                    doi: '',
                    citations: []
                });
                alert('Articolo aggiunto con successo!');
            } else {
                alert('Articolo modificato con successo!');
            }
        } catch (error) {
            console.error('Errore nell\'invio:', error);
            alert('Errore!');
        }
    };


    // Aggiunge una citazione alla lista
    const addCitation = () => {
        if (!tempCitation.trim()) return;
        setFormData({
            ...formData,
            citations: [...formData.citations, tempCitation]
        });
        setTempCitation("");
    };


    // Rimuove una citazione specifica dalla lista
    const removeCitation = (index) => {
        const newCitations = formData.citations.filter((_, i) => i !== index);
        setFormData({ ...formData, citations: newCitations });
    };

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ccc' }}>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text" name="title" placeholder="Titolo dell'articolo (Obbligatorio)"
                        value={formData.title} onChange={handleChange} required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <textarea
                        name="fullText" placeholder="Testo completo dell'articolo (Obbligatorio)"
                        value={formData.fullText} onChange={handleChange} required
                        style={{ width: '100%', padding: '8px', height: '100px' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text" name="authors" placeholder="Autori (es. Rossi M., Bianchi L.)"
                        value={formData.authors} onChange={handleChange} required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <textarea
                        name="abstract" placeholder="Abstract (riassunto)"
                        value={formData.abstract} onChange={handleChange}
                        style={{ width: '100%', padding: '8px', height: '60px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>
                        Data Pubblicazione:
                        <input
                            type="date" name="publicationDate"
                            value={formData.publicationDate} onChange={handleChange} required
                            style={{ padding: '8px', marginLeft: '10px' }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text" name="doi" placeholder="DOI (opzionale)"
                        value={formData.doi} onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>


                <div style={{ marginBottom: '10px', border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
                    <label>Citazioni:</label>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                        <input
                            type="text"
                            placeholder="Inserisci citazione..."
                            value={tempCitation}
                            onChange={(e) => setTempCitation(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCitation();
                                }
                            }}
                            style={{ flex: 1, padding: '8px' }}
                        />
                        <button type="button" onClick={addCitation} style={{ background: '#007bff', color: 'white', border: 'none', padding: '0 15px', cursor: 'pointer' }}>
                            Aggiungi
                        </button>
                    </div>
                    <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                        {formData.citations.map((cit, index) => (
                            <li key={index} style={{ marginBottom: '5px' }}>
                                {cit && typeof cit === 'object' ? `${cit.citedBy} (${cit.year}) - ${cit.comment}` : cit}
                                <button type="button" onClick={() => removeCitation(index)} style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✖</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <button type="submit" style={{ background: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    Salva Articolo
                </button>
            </form>
        </div>
    );
}

export default ArticleForm;