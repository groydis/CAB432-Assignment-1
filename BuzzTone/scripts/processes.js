const promise = require('promise');

const NewsAPI = require('newsapi');
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const newsapi = new NewsAPI('bf12e04bc8c446c0862f63962dff0bad');

const toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    iam_apikey: 'tB6fhVfrDNFJul8iZ65Hw2GxJldc_Zk8JyWEqGcaMTkC',
    url: 'https://gateway-syd.watsonplatform.net/tone-analyzer/api'
});

async function getTopArticles() {
	return new Promise(resolve => {
		newsapi.v2.topHeadlines({
			sources: 'buzzfeed',
			pageSize: 50,
		}).then(response => {
			if (response.status === 'ok') {
				console.log(response.totalResults);
				resolve(response);
			} else {
				console.log("Fetching Articles: An Error Occured!")
			}
		});
	});
}

async function getAllArticles(query) {
	return new Promise(resolve => {
		newsapi.v2.everything({
			q: query,
			sources: 'buzzfeed',
			language: 'en',
			sortBy: 'popularity',
			pageSize: 50,
		}).then(response => {
			if (response.status === 'ok') {
				console.log(response.totalResults);
				resolve(response);
			} else {
				console.log("Fetching Articles: An Error Occured!")
			}
		});
	});
}

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
			div: 'chart' + i,
		}
		headlines[i] = headline;
	}
	return headlines;
}

function getTones(headlines, callback) {
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
			for (let i = 0; i < headlines.length; i++) {
				if (results[i].tones.length !== 0) {
					console.log(headlines[i]);
					console.log('-----------------------------');
					headlines[i].tones = results[i].tones;
					headlines_to_show.push(headlines[i]);
				}
			}
			callback(headlines_to_show, document_tones);
		}
	});
}

module.exports.getTopArticles = getTopArticles;
module.exports.getAllArticles = getAllArticles;
module.exports.buildHeadlines = buildHeadlines;
module.exports.getTones = getTones;
