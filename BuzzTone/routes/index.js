const express = require('express');
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const NewsAPI = require('newsapi');

var router = express.Router();

const toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    iam_apikey: 'tB6fhVfrDNFJul8iZ65Hw2GxJldc_Zk8JyWEqGcaMTkC',
    url: 'https://gateway-syd.watsonplatform.net/tone-analyzer/api'
});

const newsapi = new NewsAPI('bf12e04bc8c446c0862f63962dff0bad');


function buildHeadlines(response) {
	let headlines = [];
	for (let i = 0; i < response.articles.length; i++) {
		let article = response.articles[i];
		let headline = {
			source: article.source.name,
			title: article.title,
			description: article.description.replace('View Entire Post ›', ''),
			url: article.url,
			image: article.urlToImage,
		}
		headlines[i] = headline;
	}
	return headlines;
}

function addTone(headlines, callback) {
	let headline_descriptions = '';

	for (let i = 0; i < headlines.length; i++) {

		let title = headlines[i].description;
		let text = title.replace(/\./g,'');
		text = text.replace(/\-/g,'');
		text = text.replace(/\>/g,'');
		text = text.replace(/BuzzFeed News/g, '');
		headline_descriptions += text + '. ';
	}

	var toneParams = {
			'tone_input': { 'text': headline_descriptions },
			'content_type': 'application/json',
	};

	toneAnalyzer.tone(toneParams, function (error, toneAnalysis) {
		if (error) {
			console.log(error);
		} else {
			let results = toneAnalysis.sentences_tone;
			let document_tones = [];
			let doc_tones = toneAnalysis.document_tone.tones;
			for (let i = 0; i < doc_tones.length; i++) {
				document_tones[i] = "['" + doc_tones[i].tone_name + "', " + doc_tones[i].score + "]";
			}
			let headlines_to_show = [];
			for (let i = 0; i < results.length; i++) {
				if (results[i].tones.length !== 0) {
					headlines[i].tones = results[i].tones;
					headlines_to_show.push(headlines[i]);
				}
			}
			callback(headlines_to_show, document_tones);
		}
	});
}

router.get('/', function(req, res, next) {
	const query = 'Trump';
	newsapi.v2.everything({
		q: query,
		sources: 'buzzfeed',
		language: 'en',
		sortBy: 'popularity',
		page: 1
	}).then(response => {
		let headlines = buildHeadlines(response);
		addTone(headlines, function(tone_headlines, doc_tones){
				res.render('index', { title: query, headlines: tone_headlines, document_tones: doc_tones });
				for (let i = 0; i < tone_headlines.length; i++) {
					console.log(tone_headlines[i].image);
					console.log('-----------------------------');
				}
			});
	});

});

router.post('/', function(req, res, next) {
	let query = req.body.query;
	newsapi.v2.everything({
		q: query,
		sources: 'buzzfeed',
		language: 'en',
		sortBy: 'popularity',
		page: 5
	}).then(response => {
		let headlines = buildHeadlines(response);
		addTone(headlines, function(tone_headlines, doc_tones){
				res.render('index', { title: query, headlines: tone_headlines, document_tones: doc_tones });
			});
	});
});

module.exports = router;
