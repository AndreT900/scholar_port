# ScholarPort 🎓

Applicazione web MERN (MongoDB, Express, React, Node.js) per la gestione del portfolio accademico personale. Permette di archiviare pubblicazioni scientifiche con dettagli completi su autori, abstract, testo completo e citazioni.

## Tecnologie Utilizzate

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web per Node.js
- **MongoDB** - Database NoSQL
- **Mongoose** - ODM per MongoDB

### Frontend
- **React** - Libreria per interfacce utente
- **Axios** - Client HTTP per chiamate API

---

## Istruzioni per l'Installazione

### Prerequisiti
- Node.js (versione 14 o superiore) installato
- Account MongoDB Atlas (o MongoDB locale)

### Backend

1. Apri il terminale nella cartella `server`:
```bash
cd server
```

2. Installa le dipendenze:
```bash
npm install
```

3. Crea un file `.env` con le seguenti variabili:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
PORT=5000
```

4. Avvia il server:
```bash
npm start
```

### Frontend

1. Apri un nuovo terminale nella cartella `client`:
```bash
cd client
```

2. Installa le dipendenze:
```bash
npm install
```

3. Avvia l'applicazione:
```bash
npm start
```

Il browser si aprirà automaticamente all'indirizzo `http://localhost:3000`.

---

## Funzionalità Principali

### Gestione Articoli
- ✅ Visualizzazione lista pubblicazioni
- ✅ Aggiunta nuovi articoli
- ✅ Modifica articoli esistenti
- ✅ Eliminazione articoli

### Ricerca Avanzata (Lato Server)
- ✅ Ricerca per **titolo**
- ✅ Ricerca per **autore**
- ✅ Ricerca per **anno** di pubblicazione
- ✅ Ricerca combinata con un unico campo

### Gestione Citazioni (CRUD Completo)
- ✅ Aggiunta citazioni strutturate
- ✅ Modifica citazioni esistenti
- ✅ Eliminazione citazioni
- ✅ Citazioni come entità con campi strutturati (autore, titolo, anno, DOI, note)

### Interfaccia Utente
- ✅ Modali dedicati per conferme e notifiche (no alert/prompt browser)
- ✅ Design responsive per mobile e desktop
- ✅ Menu contestuale per azioni rapide

---

## Documentazione API

### Base URL
```
http://localhost:5000/api
```

### Articoli (`/api/articles`)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/articles` | Recupera tutti gli articoli |
| `GET` | `/articles?search=termine` | Ricerca articoli per titolo, autore o anno |
| `GET` | `/articles/:id` | Recupera un articolo specifico |
| `POST` | `/articles` | Crea un nuovo articolo |
| `PUT` | `/articles/:id` | Aggiorna un articolo esistente |
| `DELETE` | `/articles/:id` | Elimina un articolo e le sue citazioni |

#### Schema Articolo
```json
{
  "title": "string (obbligatorio)",
  "authors": "string (obbligatorio)",
  "abstract": "string (opzionale)",
  "fullText": "string (obbligatorio)",
  "publicationDate": "date (obbligatorio)",
  "doi": "string (opzionale)"
}
```

#### Esempio Richiesta POST
```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Studio sulla Machine Learning",
    "authors": "Rossi M., Bianchi L.",
    "abstract": "Questo studio analizza...",
    "fullText": "Contenuto completo dell articolo...",
    "publicationDate": "2024-01-15",
    "doi": "10.1234/example.2024"
  }'
```

#### Esempio Ricerca
```bash
# Ricerca per titolo
curl "http://localhost:5000/api/articles?search=machine"

# Ricerca per autore
curl "http://localhost:5000/api/articles?search=rossi"

# Ricerca per anno
curl "http://localhost:5000/api/articles?search=2024"
```

---

### Citazioni (`/api/citations`)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/citations/article/:articleId` | Recupera citazioni di un articolo |
| `POST` | `/citations` | Crea una nuova citazione |
| `PUT` | `/citations/:id` | Aggiorna una citazione esistente |
| `DELETE` | `/citations/:id` | Elimina una citazione |
| `DELETE` | `/citations/article/:articleId` | Elimina tutte le citazioni di un articolo |

#### Schema Citazione
```json
{
  "articleId": "ObjectId (obbligatorio)",
  "authors": "string (obbligatorio)",
  "title": "string (obbligatorio)",
  "year": "number (opzionale)",
  "doi": "string (opzionale)",
  "notes": "string (opzionale)"
}
```

#### Esempio Richiesta POST Citazione
```bash
curl -X POST http://localhost:5000/api/citations \
  -H "Content-Type: application/json" \
  -d '{
    "articleId": "64abc123def456",
    "authors": "Smith J., Johnson K.",
    "title": "Introduzione al Deep Learning",
    "year": 2023,
    "doi": "10.5678/deep.2023",
    "notes": "Riferimento principale per la metodologia"
  }'
```

#### Esempio Aggiornamento Citazione
```bash
curl -X PUT http://localhost:5000/api/citations/64xyz789 \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "notes": "Aggiornato: nuova edizione disponibile"
  }'
```

---

## Struttura del Progetto

```
scholarport/
├── client/                    # Frontend React
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── ArticleForm.js     # Form inserimento/modifica articoli
│       │   ├── CitationManager.js # Gestione CRUD citazioni
│       │   ├── CitationManager.css
│       │   ├── ConfirmModal.js    # Modali conferma/notifica
│       │   └── ConfirmModal.css
│       ├── App.js                 # Componente principale
│       ├── App.css                # Stili principali
│       └── index.js
│
├── server/                    # Backend Express
│   ├── models/
│   │   ├── Article.js         # Schema articoli
│   │   └── Citation.js        # Schema citazioni
│   ├── routes/
│   │   ├── articles.js        # Routes articoli (con ricerca server)
│   │   └── citations.js       # Routes citazioni (CRUD completo)
│   └── server.js              # Entry point del server
│
└── README.md                  # Documentazione
```

---

## Modello Dati

### Articolo (Article)
| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| title | String | ✅ | Titolo della pubblicazione |
| authors | String | ✅ | Autori (formato: "Cognome N., Cognome N.") |
| abstract | String | ❌ | Riassunto dell'articolo |
| fullText | String | ✅ | Testo completo della pubblicazione |
| publicationDate | Date | ✅ | Data di pubblicazione |
| doi | String | ❌ | Digital Object Identifier |
| createdAt | Date | Auto | Data di inserimento nel sistema |

### Citazione (Citation)
| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| articleId | ObjectId | ✅ | Riferimento all'articolo padre |
| authors | String | ✅ | Autori della citazione |
| title | String | ✅ | Titolo dell'opera citata |
| year | Number | ❌ | Anno di pubblicazione |
| doi | String | ❌ | DOI della citazione |
| notes | String | ❌ | Note aggiuntive |
| createdAt | Date | Auto | Data di inserimento |

---

## Test

Per eseguire i test del frontend:
```bash
cd client
npm test
```

---

## Licenza

Progetto sviluppato per scopi accademici.
