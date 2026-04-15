const movies = require('./movies');
const movie = require('./movie');
const genres = require('./genres');
const streaming = require('./streaming');
const aiSearch = require('./ai-search');

module.exports = async (req, res) => {
    const path = req.url.split('?')[0];
    
    if (path === '/movies') {
        return movies(req, res);
    }
    if (path === '/movie') {
        return movie(req, res);
    }
    if (path === '/genres') {
        return genres(req, res);
    }
    if (path === '/streaming') {
        return streaming(req, res);
    }
    if (path === '/ai-search') {
        return aiSearch(req, res);
    }
    
    res.status(404).json({ error: 'Endpoint não encontrado' });
};