const express = require('express');
// Included the processes.js from the /scripts/ folder
const processor = require('../scripts/processes')

var router = express.Router();


router.get('/', function(req, res, next) {
	const query = 'OMG'
	// Get Top Articles
	processor.getTopArticles().then((response) => {
		// Processe the Articles
		let articles = processor.buildArticles(response);
		// Apply Tones
		processor.getTones(articles, function(tone_articles, doc_tones){
			// Render data to the index page
			res.render('index', { title: query, articles: tone_articles, document_tones: doc_tones });
		});
	}).catch((err) => {
	  throw err;
	});
});

router.post('/', function(req, res, next) {
	// Grab the query from the POST request and assign it to query variable
	let query = req.body.query;
	// Pass variable and search for articles based on query
	processor.getAllArticles(query).then(response => {
		// Process the Articles
		let articles = processor.buildArticles(response);
		// Apply Tones
		processor.getTones(articles, function(tone_articles, doc_tones){
			// Render data to the index page
			res.render('index', { title: query, articles: tone_articles, document_tones: doc_tones });
		});
	});
});

module.exports = router;