
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const articlesRouter = require('./routes/articles');
const citationsRouter = require('./routes/citations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.use('/api/articles', articlesRouter);
app.use('/api/citations', citationsRouter);

const uri = process.env.MONGO_URI;


// Connessione al database MongoDB
mongoose.connect(uri)
    .then(() => {
        console.log("---------------------------------------");
        console.log("Connesso con successo a MongoDB!");
        console.log("---------------------------------------");
    })
    .catch((err) => {
        console.error("Errore di connessione al database:", err);
    });


app.get('/', (req, res) => {
    res.send('Benvenuto nel server di ScholarPort!');
});

// Avvia il server sulla porta specificata
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta: ${PORT}`);
});