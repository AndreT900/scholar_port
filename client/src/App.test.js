import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from './App';

jest.mock('axios');

// Mock delle citazioni come entità strutturate
const mockCitations = [
    {
        _id: 'cit1',
        articleId: '1',
        authors: 'Galileo G.',
        title: 'Dialogo sopra i due massimi sistemi',
        year: 1632,
        doi: null,
        notes: 'Riferimento storico'
    }
];

const mockArticles = [
    {
        _id: '1',
        title: 'Studio sulla Gravità',
        authors: 'Newton I.',
        abstract: 'La mela cade.',
        fullText: 'Testo completo...',
        publicationDate: '1687-07-05',
        doi: '10.1000/xyz123',
        citations: mockCitations
    },
    {
        _id: '2',
        title: 'Relatività Ristretta',
        authors: 'Einstein A.',
        abstract: 'E=mc^2',
        fullText: 'Tutto è relativo.',
        publicationDate: '1905-06-30',
        doi: '10.1000/abc456',
        citations: []
    }
];

describe('ScholarPort Functional Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // La ricerca ora avviene lato server con parametro search
        axios.get.mockImplementation((url, config) => {
            if (url === '/api/articles') {
                const search = config?.params?.search?.toLowerCase() || '';
                if (!search) {
                    return Promise.resolve({ data: mockArticles });
                }
                // Simula la ricerca lato server
                const filtered = mockArticles.filter(article =>
                    article.title.toLowerCase().includes(search) ||
                    article.authors.toLowerCase().includes(search) ||
                    new Date(article.publicationDate).getFullYear().toString().includes(search)
                );
                return Promise.resolve({ data: filtered });
            }
            return Promise.resolve({ data: [] });
        });
        axios.delete.mockResolvedValue({});
        axios.put.mockResolvedValue({ data: {} });
        axios.post.mockResolvedValue({ data: {} });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('1. Navigazione e Visualizzazione (Rendering)', () => {
        test('Mostra il titolo dell\'applicazione', async () => {
            render(<App />);
            expect(screen.getByText(/ScholarPort/i)).toBeInTheDocument();
            await waitFor(() => expect(screen.getByText('Newton I.')).toBeInTheDocument());
        });

        test('Carica e mostra la lista degli articoli all\'avvio', async () => {
            render(<App />);
            await waitFor(() => {
                expect(screen.getByText('Studio sulla Gravità')).toBeInTheDocument();
                expect(screen.getByText('Relatività Ristretta')).toBeInTheDocument();
            });
            expect(axios.get).toHaveBeenCalledWith('/api/articles', expect.anything());
        });

        test('Mostra i dettagli corretti per un articolo (Autore, Data)', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Newton I.'));
            expect(screen.getAllByText(/Autori:/).length).toBeGreaterThan(0);
            expect(screen.getByText(/Newton I./)).toBeVisible();
        });
    });

    describe('2. Funzionalità di Ricerca (Lato Server)', () => {
        test('Effettua ricerca lato server per titolo', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const searchInput = screen.getByPlaceholderText(/Cerca per titolo, autore o anno/i);
            await userEvent.type(searchInput, 'Gravità');

            // Verifica che la chiamata API includa il parametro di ricerca
            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/articles', {
                    params: { search: 'Gravità' }
                });
            });
        });

        test('Effettua ricerca lato server per autore', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const searchInput = screen.getByPlaceholderText(/Cerca per titolo, autore o anno/i);
            await userEvent.type(searchInput, 'Einstein');

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/articles', {
                    params: { search: 'Einstein' }
                });
            });
        });

        test('Effettua ricerca lato server per anno', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const searchInput = screen.getByPlaceholderText(/Cerca per titolo, autore o anno/i);
            await userEvent.type(searchInput, '1905');

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/articles', {
                    params: { search: '1905' }
                });
            });
        });

        test('Mostra messaggio quando non ci sono articoli', async () => {
            axios.get.mockResolvedValue({ data: [] });
            render(<App />);

            await waitFor(() => {
                expect(screen.getByText(/Nessun articolo presente/i)).toBeInTheDocument();
            });
        });
    });

    describe('3. Inserimento Nuovo Articolo', () => {
        test('Apre il modale di inserimento quando si clicca il bottone', async () => {
            render(<App />);
            const addBtn = screen.getByText(/\+ Inserisci nuovo/i);
            fireEvent.click(addBtn);

            expect(screen.getByText('Inserisci Nuovo Articolo')).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Titolo dell'articolo/i)).toBeInTheDocument();
        });

        test('Invia i dati corretti al backend quando si crea un articolo', async () => {
            const newArticle = { ...mockArticles[0], _id: '3', title: 'Nuovo Paper', citations: [] };
            axios.post.mockResolvedValue({ data: newArticle });

            render(<App />);

            fireEvent.click(screen.getByText(/\+ Inserisci nuovo/i));

            await userEvent.type(screen.getByPlaceholderText(/Titolo dell'articolo/i), 'Nuovo Paper');
            await userEvent.type(screen.getByPlaceholderText(/Autori/i), 'Me Medesimo');
            await userEvent.type(screen.getByPlaceholderText(/Testo completo/i), 'Contenuto...');

            const dateInput = screen.getByLabelText(/Data Pubblicazione:/i);
            fireEvent.change(dateInput, { target: { value: '2023-01-01' } });

            const saveBtn = screen.getByText('Salva Articolo');
            fireEvent.click(saveBtn);

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledTimes(1);
            });

            expect(axios.post).toHaveBeenCalledWith('/api/articles', expect.objectContaining({
                title: 'Nuovo Paper',
                authors: 'Me Medesimo'
            }));
        });
    });

    describe('4. Modifica Articolo', () => {
        test('Apre il form precompilato quando si clicca modifica', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const menuBtns = screen.getAllByText('⋮');
            fireEvent.click(menuBtns[0]);

            const editBtn = screen.getByText('Modifica');
            fireEvent.click(editBtn);

            expect(screen.getByDisplayValue('Studio sulla Gravità')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Newton I.')).toBeInTheDocument();
        });

        test('Effettua la chiamata PUT con i dati aggiornati', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const menuBtns = screen.getAllByText('⋮');
            fireEvent.click(menuBtns[0]);
            fireEvent.click(screen.getByText('Modifica'));

            const titleInput = screen.getByDisplayValue('Studio sulla Gravità');
            await userEvent.clear(titleInput);
            await userEvent.type(titleInput, 'Gravità Modificata');

            axios.put.mockResolvedValue({
                data: { ...mockArticles[0], title: 'Gravità Modificata' }
            });

            fireEvent.click(screen.getByText('Salva Articolo'));

            await waitFor(() => {
                expect(axios.put).toHaveBeenCalledWith('/api/articles/1', expect.objectContaining({
                    title: 'Gravità Modificata'
                }));
            });
        });
    });

    describe('5. Eliminazione Articolo (con Modale Dedicato)', () => {
        test('Mostra il modale di conferma quando si clicca Elimina', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const menuBtns = screen.getAllByText('⋮');
            fireEvent.click(menuBtns[0]);

            const deleteBtn = screen.getByText('Elimina');
            fireEvent.click(deleteBtn);

            // Verifica che il modale di conferma sia visibile (non window.confirm)
            await waitFor(() => {
                expect(screen.getByText('Conferma eliminazione')).toBeInTheDocument();
            });
        });

        test('Elimina l\'articolo quando si conferma nel modale', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const menuBtns = screen.getAllByText('⋮');
            fireEvent.click(menuBtns[0]);

            axios.delete.mockResolvedValue({});

            const deleteBtn = screen.getByText('Elimina');
            fireEvent.click(deleteBtn);

            // Attende il modale e clicca Conferma
            await waitFor(() => {
                expect(screen.getByText('Conferma eliminazione')).toBeInTheDocument();
            });

            const confirmBtn = screen.getByText('Conferma');
            fireEvent.click(confirmBtn);

            await waitFor(() => {
                expect(axios.delete).toHaveBeenCalledWith('/api/articles/1');
            });
        });
    });

    describe('6. Gestione Citazioni', () => {
        test('Mostra il pulsante per gestire le citazioni', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const citationButton = screen.getByText(/Gestisci citazioni \(1\)/i);
            expect(citationButton).toBeInTheDocument();
        });

        test('Espande la sezione citazioni quando cliccato', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const citationButton = screen.getByText(/Gestisci citazioni \(1\)/i);
            fireEvent.click(citationButton);

            await waitFor(() => {
                expect(screen.getByText('📚 Citazioni (1)')).toBeInTheDocument();
                expect(screen.getByText('+ Aggiungi citazione')).toBeInTheDocument();
            });
        });

        test('Mostra citazioni strutturate con autore e titolo', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const citationButton = screen.getByText(/Gestisci citazioni \(1\)/i);
            fireEvent.click(citationButton);

            await waitFor(() => {
                expect(screen.getByText('Galileo G.')).toBeInTheDocument();
                expect(screen.getByText('Dialogo sopra i due massimi sistemi')).toBeInTheDocument();
            });
        });
    });

});
