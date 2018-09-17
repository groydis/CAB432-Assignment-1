const NewsAPI = require('newsapi');
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

// News API Key
const newsapi = new NewsAPI('bf12e04bc8c446c0862f63962dff0bad');

// IBM Watson Tone Analyzer API Key
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
			// First check see's if we get results
			if (response.totalResults !== 0) {
				// Shoot the response as the resolve for the promise
				resolve(response);
			// This handles what todo if no results are recieved
			} else if (response.articles.length === 0) {
				reject("We could not find any articles for: " + query);
			// This handles any other weird errors that occur by the API.
			} else {
				reject(response);
			}
		});
	});
}

// Retrives articles bacsed on query supplied
async function getAllArticles(query) {
	// Create a promise
	return new Promise((resolve, reject) => {
		// Call teh News API query to retrieve articles based on query
		//let clean_query = query.replace(/%20/g, " ");
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
			// Check that the results are all g
			// First check see's if we get results
			if (response.totalResults !== 0) {
				// Shoot the response as the resolve for the promise
				resolve(response);
			// This handles what todo if no results are recieved
			} else if (response.articles.length === 0) {
				reject("We could not find any articles for: " + query);
			// This handles any other weird errors that occur by the API.
			} else {
				reject(response);
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
		// Craete an empty array to hold the information sent to IBM
		let article_descriptions = '';

		// Loop through all the articles, grab the descriptions, and filter them
		for (let i = 0; i < articles.length; i++) {

			let title = articles[i].description;
			let text = title.replace(/\./g,'');
			text = text.replace(/\!/g,'');
			text = text.replace(/\?/g,'');
			text = text.replace(/\:/g,'');
			text = text.replace(/\-/g,'');
			text = text.replace(/\>/g,'');
			text = text.replace(/BuzzFeed News/g, '');
			article_descriptions += text + '. ';
		}
		// Paramaters foor running Tone Analyzer
		var toneParams = {
				'tone_input': { 'text': article_descriptions },
				'content_type': 'application/json',
		};

		// Runs the Tone Analyzer API
		toneAnalyzer.tone(toneParams, function (error, toneAnalysis) {
			// Handle any errors
			if (error) {
				if (err.code == 404) {
				    // Handle Not Found (404) error
				} else if (err.code == 413) {
				    // Handle Request Too Large (413) error
				} else {
				    console.log('Unexpected error: ', err.code);
				    console.log('error:', err);
				}
			} else if (toneAnalysis) {
				// Store the results from the API in results
				let results = toneAnalysis.sentences_tone;
				if (results === 'undefined') {
					console.log('1');
				} else if (results === undefined) {
					console.log('2');
					reject("No Tones found! Try Searching for something else!");
				}
				// Creat an empty array for the overall document tones
				let document_tones = [];
				// Store the document tones form the API
				let doc_tones = toneAnalysis.document_tone.tones;
				// Run through all the document tones and clean them for Google Charts
				for (let i = 0; i < doc_tones.length; i++) {
					document_tones[i] = "['" + doc_tones[i].tone_name + "', " + doc_tones[i].score + "]";
				}
				// Create an empty array to handle the art
				let articles_to_show = [];
				// Do a quick check to make sure the results have objects inside them
				if (results !== undefined) {
				// Do a quick check to make sure the volume of articles matches the volume of tones
					if (articles.length === results.length) {
						// Loop through the results and append the tones to the article objects
						for (let i = 0; i < results.length; i++) {
							// Only add tones to an article if tones exist
							if (results[i].tones.length > 0) {
								articles[i].tones = results[i].tones;
								articles_to_show.push(articles[i]);
							}
						}
						// Check to see that we do have some articles and tones
						if (articles_to_show.length === 0 || doc_tones === 0) {
							reject("Unable to find any tones for the articles requested.");
						} else {
							// Resolve a call back, passing the articles with tones, and the document tones
							resolve(callback(articles_to_show, document_tones));
						}
					} else {
						// If the results don't match the number of articles, generated an error
						reject("An error occured processing tones: Volume of tones did not match Volume of articles.")
					}
				} else {
					// If no objects found in results, produce an error
					reject("No Tones Found :( Try searching for something else!")
				}
			}
		});
	});
}

module.exports.getTopArticles = getTopArticles;
module.exports.getAllArticles = getAllArticles;
module.exports.buildArticles = buildArticles;
module.exports.getTones = getTones;
