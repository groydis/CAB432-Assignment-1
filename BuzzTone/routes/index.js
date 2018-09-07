const express = require('express');
const processor = require('../scripts/processes')
const NewsAPI = require('newsapi');

var router = express.Router();


const newsapi = new NewsAPI('bf12e04bc8c446c0862f63962dff0bad');


router.get('/', function(req, res, next) {
	const query = 'OMG'
	processor.getTopArticles().then((response) => {
		let headlines = processor.buildHeadlines(response);
		processor.getTones(headlines, function(tone_headlines, doc_tones){
			res.render('index', { title: query, headlines: tone_headlines, document_tones: doc_tones });
		});
	}).catch((err) => {
	  throw err;
	});
});

router.post('/', function(req, res, next) {
	let query = req.body.query;
	processor.getAllArticles(query).then(response => {
		let headlines = processor.buildHeadlines(response);
		processor.getTones(headlines, function(tone_headlines, doc_tones){
			res.render('index', { title: query, headlines: tone_headlines, document_tones: doc_tones });
		});
	});
});

module.exports = router;