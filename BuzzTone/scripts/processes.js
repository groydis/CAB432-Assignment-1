const NewsAPI = require('newsapi');
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const newsapi = new NewsAPI('bf12e04bc8c446c0862f63962dff0bad');

const toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    iam_apikey: 'tB6fhVfrDNFJul8iZ65Hw2GxJldc_Zk8JyWEqGcaMTkC',
    url: 'https://gateway-syd.watsonplatform.net/tone-analyzer/api'
});

// Retrieves top articles
async function getTopArticles() {
	// Create a promise
	return new Promise((resolve, reject) => {
		// Call the News API query for top headlines
		newsapi.v2.topHeadlines({
			// Specify the Source
			sources: 'buzzfeed',
			// Request 50 queries
			pageSize: 50,
		}).then(response => {
			// Check that the results are all g
			if (response.status === 'ok') {
				// Shoot the response as the resolve for the promise
				resolve(response);
			} else {
				// Return an error
				reject("Fetching Articles: An Error Occured!")
			}
		});
	});
}

// Retrives articles bacsed on query supplied
async function getAllArticles(query) {
	// Create a promise
	return new Promise((resolve, reject) => {
		// Call teh News API query to retrieve articles based on query
		newsapi.v2.everything({
			// Pass the query to the paramters of the API
			q: query,
			// Specify the source
			sources: 'buzzfeed',
			// Better make sure the results are in english
			language: 'en',
			// Lets sort by popularity
			sortBy: 'popularity',
			// Request 50 queries
			pageSize: 50,
		}).then(response => {
			// Check that teh results are all g
			if (response.status === 'ok') {
				// Shoot the response as the resolve for the promise
				resolve(response);
			} else {
				// Return an error
				reject("Fetching Articles: An Error Occured!");
			}
		});
	});
}

// Cleaning the responses
function buildArticles(response) {
	// Craete an empty array to store the article objects once they are crated
	let articles = [];
	// looop through the articles in the response
	for (let i = 0; i < response.articles.length; i++) {
		// Store each response in a temporary variable to make code look cleanr (you're welcome)
		let response_item = response.articles[i];
		// Create an object
		let article = {
			// Store the source
			//source: response_item.source.name,
			// Store the title
			title: response_item.title,
			// Store the description, do a cheeky little clean to remove some excess
			//info sometimes placed on the end of the descriptions
			description: response_item.description.replace('View Entire Post ›', ''),
			// Store the article URL
			url: response_item.url,
			// Grab the associated image
			image: response_item.urlToImage,
			// Create a unique div element to display the chart in
			div: 'chart' + i,
		}
		// Stash the object into the array
		articles[i] = article;
	}
	// Return the created array full of article objects
	return articles;
}

function getTones(articles, callback) {
	return new Promise((resolve, reject) => {
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
				reject(error)
			} else {
				let results = toneAnalysis.sentences_tone;
				let document_tones = [];
				let doc_tones = toneAnalysis.document_tone.tones;
				for (let i = 0; i < doc_tones.length; i++) {
					document_tones[i] = "['" + doc_tones[i].tone_name + "', " + doc_tones[i].score + "]";
				}
				let articles_to_show = [];
				for (let i = 0; i < results.length; i++) {
					if (results[i].tones.length > 0) {
						articles[i].tones = results[i].tones;
						articles_to_show.push(articles[i]);
					}
				}
				resolve(callback(articles_to_show, document_tones));
			}
		});
	});
}

module.exports.getTopArticles = getTopArticles;
module.exports.getAllArticles = getAllArticles;
module.exports.buildArticles = buildArticles;
module.exports.getTones = getTones;
