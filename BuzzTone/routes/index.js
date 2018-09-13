const express = require('express');
const processor = require('../scripts/processes')
const NewsAPI = require('newsapi');

var router = express.Router();


const newsapi = new NewsAPI('bf12e04bc8c446c0862f63962dff0bad');


router.get('/', function(req, res, next) {
	const title = 'Top Articles from BuzzFeed'
	// Retrieve the top headlines from Buzzfeed
	processor.getTopArticles().then((response) => {
		// Filter the responses and create objects to be displayed
		let articles = processor.buildArticles(response);
		// Apply tones to the objects
		processor.getTones(articles, function(toned_articles, doc_tones){
			// Render the page
			res.render('index', { title: title, articles: toned_articles, document_tones: doc_tones });
		})
		.catch((err) => {
			res.render('error', { message: 'An error occured retriving tones', error: err });
		});
	}).catch((err) => {
	  res.render('error', { message: "An Error Occured Fetching Articles", error: err });
	});
});

router.post('/', function(req, res, next) {
	// Grab the query from the POST request
	let query = req.body.query;
	if (query == '') {
		res.render('error', { message: "No query entered, please use a query. eg 'Trump'", error: query});
	}
	let title = 'Articles from BuzzFeed about: ' + query;
	// Search Articles based on the query
	processor.getAllArticles(query).then(response => {
		// Filter the response and create objects to be displayed
		let articles = processor.buildArticles(response);
		// Apply tones to the objects
		processor.getTones(articles, function(toned_articles, doc_tones) {
			// Render the page
			res.render('index', { title: title, articles: toned_articles, document_tones: doc_tones });
		})
		.catch((err) => {
			res.render('error', { message: 'An error occured retriving tones', error: err });
		});
	})
	.catch((err) => {
		res.render('error', { message: "An Error Occured Fetching Articles", error: err });
	});
});

module.exports = router;