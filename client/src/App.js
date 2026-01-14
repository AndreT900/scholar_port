import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import ArticleForm from './components/ArticleForm';
import ConfirmModal from './components/ConfirmModal';
import CitationManager from './components/CitationManager';


function App() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [citationVisibility, setCitationVisibility] = useState({});

  // Stato per il modale di conferma/notifica
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null
  });

  // Funzione per mostrare modali di conferma/notifica
  const showModal = useCallback(({ type, title, message, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm
    });
  }, []);

  // Chiude il modale di conferma
  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Recupera la lista degli articoli dal backend (con ricerca lato server)
  const fetchArticles = useCallback((searchQuery = '') => {
    const params = searchQuery.trim() ? { search: searchQuery.trim() } : {};
    axios.get('/api/articles', { params })
      .then(response => setArticles(response.data))
      .catch(error => console.error("Errore:", error));
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Gestisce la ricerca con debounce (lato server)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchArticles(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchArticles]);

  // Salva un articolo (nuovo o modificato) nello stato locale
  const handleSaveArticle = (savedArticle) => {
    const exists = articles.find(a => a._id === savedArticle._id);
    if (exists) {
      setArticles(articles.map(a => a._id === savedArticle._id ? savedArticle : a));
    } else {
      setArticles([savedArticle, ...articles]);
    }
    closeModal();
  };

  // Chiude il modale di inserimento/modifica
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
  };

  // Apre il modale per creare un nuovo articolo
  const openNewArticleModal = () => {
    setEditingArticle(null);
    setIsModalOpen(true);
  };

  // Apre il modale per modificare un articolo esistente
  const openEditModal = (article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  // Elimina un articolo dopo conferma dell'utente (con modale dedicato)
  const handleDelete = (id, title) => {
    showModal({
      type: 'confirm',
      title: 'Conferma eliminazione',
      message: `Sei sicuro di voler eliminare l'articolo "${title}"? Questa azione eliminerà anche tutte le citazioni associate.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/articles/${id}`);
          setArticles(articles.filter(article => article._id !== id));
          showModal({
            type: 'success',
            title: 'Eliminato',
            message: 'Articolo eliminato con successo!'
          });
        } catch (error) {
          console.error("Errore cancellazione:", error);
          showModal({
            type: 'error',
            title: 'Errore',
            message: 'Si è verificato un errore durante l\'eliminazione.'
          });
        }
      }
    });
    setOpenMenuId(null);
  };

  // Mostra o nasconde le citazioni di un articolo
  const toggleCitations = (id) => {
    setCitationVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Aggiorna le citazioni di un articolo nello stato locale
  const handleCitationsChange = (articleId, newCitations) => {
    setArticles(articles.map(article =>
      article._id === articleId
        ? { ...article, citations: newCitations }
        : article
    ));
  };

  return (
    <div className="App">
      <header>
        <h1>🎓 ScholarPort</h1>
        <p>Il mio Portfolio Accademico</p>
      </header>

      <main>
        <div className="controls-container">
          <h2>Le mie Pubblicazioni</h2>
          <div className="filters-container">
            <button className="add-btn" onClick={openNewArticleModal}>
              + Inserisci nuovo
            </button>
            <input
              type="text"
              placeholder="Cerca per titolo, autore o anno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
          </div>
        </div>

        {articles.length === 0 ? (
          <p className="no-results">
            {searchTerm.trim()
              ? "Nessun articolo trovato corrispondente alla ricerca."
              : "Nessun articolo presente. Inizia aggiungendo una nuova pubblicazione!"}
          </p>
        ) : (
          <ul>
            {articles.map(article => (
              <li key={article._id} style={{ position: 'relative' }}>

                <div className="menu-container">
                  <button className="menu-btn" onClick={() => setOpenMenuId(openMenuId === article._id ? null : article._id)}>
                    ⋮
                  </button>
                  {openMenuId === article._id && (
                    <div className="menu-dropdown">
                      <button onClick={() => openEditModal(article)}>Modifica</button>
                      <button className="delete-option" onClick={() => handleDelete(article._id, article.title)}>Elimina</button>
                    </div>
                  )}
                </div>

                <h3 style={{ paddingRight: '40px', marginTop: 0 }}><strong>Titolo:</strong> {article.title}</h3>
                <p><strong>Autori:</strong> {article.authors}</p>
                {article.abstract && <p><strong>Abstract:</strong> <em>"{article.abstract}"</em></p>}

                {article.fullText && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f9f9f9', borderLeft: '4px solid #4CAF50' }}>
                    <strong>Testo Completo:</strong>
                    <p style={{ whiteSpace: 'pre-line' }}>{article.fullText}</p>
                  </div>
                )}

                <p>📅 {new Date(article.publicationDate).toLocaleDateString()}</p>
                {article.doi && <p>🔗 <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noreferrer">{article.doi}</a></p>}

                {/* Sezione citazioni con gestione completa */}
                <div style={{ marginTop: '15px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                  <button
                    onClick={() => toggleCitations(article._id)}
                    style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    {citationVisibility[article._id]
                      ? 'Nascondi citazioni'
                      : `Gestisci citazioni (${article.citations?.length || 0})`}
                  </button>

                  {citationVisibility[article._id] && (
                    <CitationManager
                      articleId={article._id}
                      citations={article.citations || []}
                      onCitationsChange={(newCitations) => handleCitationsChange(article._id, newCitations)}
                      onShowModal={showModal}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Modale per inserimento/modifica articolo */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal}>&times;</button>
              <h2>{editingArticle ? "Modifica Articolo" : "Inserisci Nuovo Articolo"}</h2>

              <ArticleForm
                onArticleAdded={handleSaveArticle}
                initialData={editingArticle}
                onShowModal={showModal}
              />
            </div>
          </div>
        )}

        {/* Modale di conferma/notifica */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
        />
      </main>
    </div>
  );
}

export default App;