import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from './App';

jest.mock('axios');



const mockArticles = [
    {
        _id: '1',
        title: 'Studio sulla Gravità',
        authors: 'Newton I.',
        abstract: 'La mela cade.',
        fullText: 'Testo completo...',
        publicationDate: '1687-07-05',
        doi: '10.1000/xyz123',
        citations: ['Galileo (1600)']
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
        axios.get.mockResolvedValue({ data: mockArticles });
        axios.delete.mockResolvedValue({});
        axios.put.mockResolvedValue({ data: {} });
        axios.post.mockResolvedValue({ data: {} });

        jest.spyOn(window, 'confirm').mockImplementation(() => true);
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
            expect(axios.get).toHaveBeenCalledWith('/api/articles');
        });

        test('Mostra i dettagli corretti per un articolo (Autore, Data)', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Newton I.'));
            expect(screen.getAllByText(/Autori:/).length).toBeGreaterThan(0);

            expect(screen.getByText(/Newton I./)).toBeVisible();
        });
    });

    describe('2. Funzionalità di Ricerca', () => {
        test('Filtra gli articoli in base al titolo', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const searchInput = screen.getByPlaceholderText(/Cerca per titolo o anno/i);
            userEvent.type(searchInput, 'Gravità');

            expect(screen.getByText('Studio sulla Gravità')).toBeInTheDocument();
            expect(screen.queryByText('Relatività Ristretta')).not.toBeInTheDocument();
        });

        test('Filtra gli articoli in base all\'anno', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const searchInput = screen.getByPlaceholderText(/Cerca per titolo o anno/i);
            userEvent.type(searchInput, '1905');

            expect(screen.getByText('Relatività Ristretta')).toBeInTheDocument();
            expect(screen.queryByText('Studio sulla Gravità')).not.toBeInTheDocument();
        });

        test('Mostra messaggio "Nessun articolo" se la ricerca non produce risultati', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));

            const searchInput = screen.getByPlaceholderText(/Cerca per titolo o anno/i);
            userEvent.type(searchInput, 'Zzzzzzzzz');

            expect(screen.getByText(/Nessun articolo trovato/i)).toBeInTheDocument();
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
            const newArticle = { ...mockArticles[0], _id: '3', title: 'Nuovo Paper' };
            axios.post.mockResolvedValue({ data: newArticle });

            render(<App />);


            fireEvent.click(screen.getByText(/\+ Inserisci nuovo/i));


            userEvent.type(screen.getByPlaceholderText(/Titolo dell'articolo/i), 'Nuovo Paper');
            userEvent.type(screen.getByPlaceholderText(/Autori/i), 'Me Medesimo');
            userEvent.type(screen.getByPlaceholderText(/Testo completo/i), 'Contenuto...');


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
            userEvent.clear(titleInput);
            userEvent.type(titleInput, 'Gravità Modificata');


            axios.put.mockResolvedValue({
                data: { ...mockArticles[0], title: 'Gravità Modificata' }
            });


            fireEvent.click(screen.getByText('Salva Articolo'));

            await waitFor(() => {
                expect(axios.put).toHaveBeenCalledWith('/api/articles/1', expect.objectContaining({
                    title: 'Gravità Modificata'
                }));
            });


            expect(await screen.findByText('Gravità Modificata')).toBeInTheDocument();
        });
    });

    describe('5. Eliminazione Articolo', () => {
        test('Mostra il menu di conferma e chiama DELETE', async () => {
            render(<App />);
            await waitFor(() => screen.getByText('Studio sulla Gravità'));


            const menuBtns = screen.getAllByText('⋮');
            fireEvent.click(menuBtns[0]);


            axios.delete.mockResolvedValue({});

            const deleteBtn = screen.getByText('Elimina');
            fireEvent.click(deleteBtn);


            expect(window.confirm).toHaveBeenCalled();


            expect(axios.delete).toHaveBeenCalledWith('/api/articles/1');


            await waitFor(() => {
                expect(screen.queryByText('Studio sulla Gravità')).not.toBeInTheDocument();
            });
        });
    });

});
