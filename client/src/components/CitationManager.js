import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CitationManager.css';

/**
 * Componente per la gestione completa delle citazioni (CRUD)
 * Le citazioni sono gestite come entità con campi strutturati
 */
function CitationManager({ articleId, citations = [], onCitationsChange, onShowModal }) {
    const [editingCitation, setEditingCitation] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        authors: '',
        title: '',
        year: '',
        doi: '',
        notes: ''
    });

    // Reset form quando si chiude
    const resetForm = () => {
        setFormData({
            authors: '',
            title: '',
            year: '',
            doi: '',
            notes: ''
        });
        setEditingCitation(null);
        setIsFormVisible(false);
    };

    // Apre il form per aggiungere una nuova citazione
    const handleAddNew = () => {
        resetForm();
        setIsFormVisible(true);
    };

    // Apre il form per modificare una citazione esistente
    const handleEdit = (citation) => {
        setFormData({
            authors: citation.authors || '',
            title: citation.title || '',
            year: citation.year || '',
            doi: citation.doi || '',
            notes: citation.notes || ''
        });
        setEditingCitation(citation);
        setIsFormVisible(true);
    };

    // Salva la citazione (crea o aggiorna)
    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.authors.trim() || !formData.title.trim()) {
            onShowModal({
                type: 'error',
                title: 'Errore',
                message: 'Autore e titolo sono campi obbligatori.'
            });
            return;
        }

        try {
            const payload = {
                ...formData,
                year: formData.year ? parseInt(formData.year) : null,
                articleId
            };

            let response;
            if (editingCitation && editingCitation._id) {
                // Aggiorna citazione esistente
                response = await axios.put(`/api/citations/${editingCitation._id}`, payload);
                const updatedCitations = citations.map(c =>
                    c._id === editingCitation._id ? response.data : c
                );
                onCitationsChange(updatedCitations);
                onShowModal({
                    type: 'success',
                    title: 'Successo',
                    message: 'Citazione aggiornata con successo!'
                });
            } else {
                // Crea nuova citazione
                response = await axios.post('/api/citations', payload);
                onCitationsChange([...citations, response.data]);
                onShowModal({
                    type: 'success',
                    title: 'Successo',
                    message: 'Citazione aggiunta con successo!'
                });
            }

            resetForm();
        } catch (error) {
            console.error('Errore salvataggio citazione:', error);
            onShowModal({
                type: 'error',
                title: 'Errore',
                message: 'Si è verificato un errore durante il salvataggio.'
            });
        }
    };

    // Elimina una citazione
    const handleDelete = (citation) => {
        onShowModal({
            type: 'confirm',
            title: 'Conferma eliminazione',
            message: `Sei sicuro di voler eliminare la citazione "${citation.title}"?`,
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/citations/${citation._id}`);
                    const updatedCitations = citations.filter(c => c._id !== citation._id);
                    onCitationsChange(updatedCitations);
                    onShowModal({
                        type: 'success',
                        title: 'Successo',
                        message: 'Citazione eliminata con successo!'
                    });
                } catch (error) {
                    console.error('Errore eliminazione citazione:', error);
                    onShowModal({
                        type: 'error',
                        title: 'Errore',
                        message: 'Si è verificato un errore durante l\'eliminazione.'
                    });
                }
            }
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="citation-manager">
            <div className="citation-header">
                <h4>📚 Citazioni ({citations.length})</h4>
                <button
                    type="button"
                    className="add-citation-btn"
                    onClick={handleAddNew}
                >
                    + Aggiungi citazione
                </button>
            </div>

            {/* Form per aggiungere/modificare citazione */}
            {isFormVisible && (
                <div className="citation-form">
                    <h5>{editingCitation ? 'Modifica citazione' : 'Nuova citazione'}</h5>
                    <form onSubmit={handleSave}>
                        <div className="form-row">
                            <input
                                type="text"
                                name="authors"
                                placeholder="Autore/i (es. Rossi M., Bianchi L.) *"
                                value={formData.authors}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <input
                                type="text"
                                name="title"
                                placeholder="Titolo dell'opera citata *"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-row two-columns">
                            <input
                                type="number"
                                name="year"
                                placeholder="Anno"
                                value={formData.year}
                                onChange={handleChange}
                                min="1800"
                                max="2100"
                            />
                            <input
                                type="text"
                                name="doi"
                                placeholder="DOI (opzionale)"
                                value={formData.doi}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-row">
                            <textarea
                                name="notes"
                                placeholder="Note aggiuntive (opzionale)"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="2"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={resetForm}>
                                Annulla
                            </button>
                            <button type="submit" className="save-btn">
                                {editingCitation ? 'Aggiorna' : 'Salva'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista delle citazioni */}
            {citations.length > 0 ? (
                <ul className="citation-list">
                    {citations.map((citation) => (
                        <li key={citation._id} className="citation-item">
                            <div className="citation-content">
                                <strong>{citation.authors}</strong>
                                {citation.year && <span className="citation-year">({citation.year})</span>}
                                <br />
                                <em>{citation.title}</em>
                                {citation.doi && (
                                    <span className="citation-doi">
                                        <br />
                                        🔗 <a href={`https://doi.org/${citation.doi}`} target="_blank" rel="noreferrer">
                                            {citation.doi}
                                        </a>
                                    </span>
                                )}
                                {citation.notes && (
                                    <p className="citation-notes">📝 {citation.notes}</p>
                                )}
                            </div>
                            <div className="citation-actions">
                                <button
                                    type="button"
                                    className="edit-btn"
                                    onClick={() => handleEdit(citation)}
                                    title="Modifica"
                                >
                                    ✏️
                                </button>
                                <button
                                    type="button"
                                    className="delete-btn"
                                    onClick={() => handleDelete(citation)}
                                    title="Elimina"
                                >
                                    🗑️
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-citations">Nessuna citazione presente.</p>
            )}
        </div>
    );
}

export default CitationManager;
