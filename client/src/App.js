import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ArticleForm from './components/ArticleForm';


function App() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingArticle, setEditingArticle] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [citationVisibility, setCitationVisibility] = useState({});

  useEffect(() => {
    fetchArticles();
  }, []);

  // Recupera la lista degli articoli dal backend
  const fetchArticles = () => {
    axios.get('/api/articles')
      .then(response => setArticles(response.data))
      .catch(error => console.error("Errore:", error));
  };

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

  // Elimina un articolo dopo conferma dell'utente
  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler cancellare questo articolo?")) return;
    try {
      await axios.delete(`/api/articles/${id}`);
      setArticles(articles.filter(article => article._id !== id));
    } catch (error) {
      console.error("Errore cancellazione:", error);
    }
    setOpenMenuId(null);
  };

  // Mostra o nasconde le citazioni di un articolo
  const toggleCitations = (id) => {
    setCitationVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtra gli articoli per titolo o anno (ricerca unificata)
  const filteredArticles = articles.filter(article => {
    const search = searchTerm.toLowerCase().trim();
    if (search === "") return true;

    const titleMatch = article.title.toLowerCase().includes(search);
    const articleYear = new Date(article.publicationDate).getFullYear().toString();
    const yearMatch = articleYear.includes(search);

    return titleMatch || yearMatch;
  });

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
              placeholder="Cerca per titolo o anno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <p>Nessun articolo trovato corrispondente alla ricerca.</p>
        ) : (
          <ul>
            {filteredArticles.map(article => (
              <li key={article._id} style={{ position: 'relative' }}>

                <div className="menu-container">
                  <button className="menu-btn" onClick={() => setOpenMenuId(openMenuId === article._id ? null : article._id)}>
                    ⋮
                  </button>
                  {openMenuId === article._id && (
                    <div className="menu-dropdown">
                      <button onClick={() => openEditModal(article)}>Modifica</button>
                      <button className="delete-option" onClick={() => handleDelete(article._id)}>Elimina</button>
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

                {article.citations && article.citations.length > 0 && (
                  <div style={{ marginTop: '15px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                    <button
                      onClick={() => toggleCitations(article._id)}
                      style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      {citationVisibility[article._id] ? 'Nascondi citazioni' : `Mostra citazioni (${article.citations.length})`}
                    </button>

                    {citationVisibility[article._id] && (
                      <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        {article.citations.map((cit, idx) => (
                          <li key={idx} style={{ fontSize: '0.9em', color: '#555' }}>
                            {cit && typeof cit === 'object' ? `${cit.citedBy} (${cit.year}) - ${cit.comment}` : cit}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal}>&times;</button>
              <h2>{editingArticle ? "Modifica Articolo" : "Inserisci Nuovo Articolo"}</h2>

              <ArticleForm
                onArticleAdded={handleSaveArticle}
                initialData={editingArticle}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;