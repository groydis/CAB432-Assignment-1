const promise = require('promise');

const NewsAPI = require('newsapi');
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const newsapi = new NewsAPI('bf12e04bc8c446c0862f63962dff0bad');

const toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    iam_apikey: 'tB6fhVfrDNFJul8iZ65Hw2GxJldc_Zk8JyWEqGcaMTkC',
    url: 'https://gateway-syd.watsonplatform.net/tone-analyzer/api'
});

// Get's the top articles from Buzzfeed
async function getTopArticles() {
	// Create a promise
	return new Promise(resolve => {
		// Call the News API to retrieve the Top Headlines
		newsapi.v2.topHeadlines({
			sources: 'buzzfeed',
			pageSize: 50,
		}).then(response => {
			// Check that response is acceptable
			if (response.status === 'ok') {
				// Resolve promise with response
				resolve(response);
			} else {
				// Else generate an error;
				console.log("Fetching Articles: An Error Occured!")
			}
		});
	});
}

// Gets Articles from Buzzfeed based on the passed query sorted by popularity
async function getAllArticles(query) {
	return new Promise(resolve => {
		// Call the News API to search entire Buzzfeed article DB for articles based on query provided
		newsapi.v2.everything({
			q: query,
			sources: 'buzzfeed',
			language: 'en',
			sortBy: 'popularity',
			pageSize: 50,
		}).then(response => {
			// Check that response is acceptable
			if (response.status === 'ok') {
				// Resolve promise with response
				resolve(response);
			} else {
				// Else generate an error;
				console.log("Fetching Articles: An Error Occured!")
			}
		});
	});
}

// Creates an Array of Article Objects, filtering unncessary inforamtion.
function buildArticles(response) {
	let articles = [];
	for (let i = 0; i < response.articles.length; i++) {
		let article = response.articles[i];
		let new_object = {
			// Source of the Article
			source: article.source.name,
			// Headline of the article
			title: article.title,
			// Article Description (Removes 'View Entire Post >' if it's appended to description)
			description: article.description.replace('View Entire Post ›', ''),
			// URL of the article
			url: article.url,
			// Accompanied Image
			image: article.urlToImage,
			// Creates a DIV element that the graph will be displayed within
			div: 'chart' + i,
		}
		// Places the generated object into the array
		articles[i] = new_object;
	}
	return articles;
}

function getTones(articles, callback) {
	let article_descriptions = '';

	for (let i = 0; i < articles.length; i++) {

		let title = articles[i].description;
		let text = title.replace(/\./g,'');
		text = text.replace(/\-/g,'');
		text = text.replace(/\>/g,'');
		text = text.replace(/BuzzFeed News/g, '');
		article_descriptions += text + '. ';
	}

	var toneParams = {
			'tone_input': { 'text': article_descriptions },
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
			let articles_to_show = [];
			for (let i = 0; i < articles.length; i++) {
				if (results[i].tones.length !== 0) {
					articles[i].tones = results[i].tones;
					articles_to_show.push(articles[i]);
				}
			}
			callback(articles_to_show, document_tones);
		}
	});
}

module.exports.getTopArticles = getTopArticles;
module.exports.getAllArticles = getAllArticles;
module.exports.buildArticles = buildArticles;
module.exports.getTones = getTones;
