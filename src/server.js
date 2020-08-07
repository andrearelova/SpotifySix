/* This server file handles the requests that come from the client-side React app.
 * It's primary purpose is to interface with the Spotify Web API, and determine the
 * degrees of separation between the two artists input by the user. */

// packages
const express = require('express');
const cors = require('cors');
const Filter = require('bad-words');
const bodyParser = require('body-parser');
const Buffer = require('buffer/').Buffer;
const fetch = require('node-fetch');
const keys = require('./apikeys');

const jsonParser = bodyParser.json();
const filter = new Filter();
const app = express();
app.use(cors());

var accessToken = '';
var apiCallsMade = 0;
// This function is needed for OAuth token encoding
const btoa = function (str) {
	return Buffer.from(str).toString('base64');
}

// Retrieve an access token from the Spotify API upon entry.
getToken();

// POST request to submissions page
// Entry point for the data coming from React app
app.post('/submissions', jsonParser, async (req, res) => {
	console.log('received a new POST request to /submissions');
	var degree = 0;

	var result = {
		artist1: filter.clean(req.body.artist1.toString()),
		artist2: filter.clean(req.body.artist2.toString()),
		deg: degree
	}

	// Beginning of algorithm to determine the degree of separation
	degree = await findDegree(result.artist1, result.artist2, accessToken);
	result.deg = degree;

	console.log("Total Spotify API Calls: " + apiCallsMade);
	apiCallsMade = 0;
	
	res.json(result); // Result will be parsed by client
});

// Overarching function to compute separation between artists
// Returns an integer (the degree of separation)
async function findDegree(artist1, artist2) {
	let degree = 0;

	// If the user entered the same artists, the degree is 0
	if (artist1 === artist2) {
		return degree;
	} else {
		// At least one degree apart now
		degree++;
	}

	// Get array of collaborating artists
	let artists = await getRelatedArtists(artist1);

	console.log(`Artists related to ${artist1}: ` + artists);

	// If the second artist is in the array of related artists, they are 1 degree apart.
	if (artists.indexOf(artist2) !== -1) {
		console.log(artist1 + " and " + artist2 + " are one degree apart!");
		return 1;
	} else {
		// If not, we iterate through the array and look at all related artists in a BFS.
		for (let i = 0; i < artists.length; ++i) {
			let artists2 = await getRelatedArtists(artists[i]);
			if (artists2.indexOf(artist2) !== -1) {
				console.log(artist1 + " and " + artist2 + " are two degrees apart!");
				return 2;
			}
		}
		// Here, the algorithm would continue. However, Spotify's API has a rate limit which
		// is exceeded when going more than 2 degrees of separation apart.
	}
	return degree;
}

// Returns an array of artists who have collaborated with the input artist
async function getRelatedArtists(artist) {
	let artists = [];
	let albums = [];
	let url1 = convertToURL(artist);

	// Gets the artist's Spotify ID
	let response = await fetch(`https://api.spotify.com/v1/search?query=${url1}&type=artist&limit=1`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	})
	apiCallsMade++;

	let artistData = await response.json();
	let artistID = artistData.artists.items[0].id;

	let albumsResponse = await fetch(`https://api.spotify.com/v1/artists/${artistID}/albums`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	});
	apiCallsMade++;

	let albumData = await albumsResponse.json();
	// For every album in this list
	for (let i = 0; i < albumData.items.length; ++i) {
		let currentID = albumData.items[i].id;
		albums.push(currentID);

		// Get the tracks on the album
		let tracksResponse = await fetch(`https://api.spotify.com/v1/albums/${currentID}/tracks`, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
		apiCallsMade++;
		let trackData = await tracksResponse.json();
		// For every track on this album...
		for (let j = 0; j < trackData.items.length; ++j) {
			// And for every artist on this track...
			for (let k = 0; k < trackData.items[j].artists.length; ++k) {
				// If the artist isn't already in the list of artists...
				if (artists.indexOf(trackData.items[j].artists[k].name) === -1) {
					// Add them to the artists array
					artists.push(trackData.items[j].artists[k].name);
				}
			}
		}
	}
	return artists;
}

// Converts user-input string to a usable value for the Spotify API
function convertToURL(artist) {
	let artistURL = artist.replace(/ /g, '+');
	return artistURL;
}

// converts string of text from user to a Spotify Artist ID
async function getArtistID(artist) {
	let url = convertToURL(artist);

	let response = await fetch(`https://api.spotify.com/v1/search?query=${url}&type=artist&limit=1`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	});
	apiCallsMade++;
	let artistData = await response.json();
	return artistData.artists.items[0].id;
}

// converts string of text from user to a Spotify Artist ID
async function getArtistName(artist) {
	let url = convertToURL(artist);

	let response = await fetch(`https://api.spotify.com/v1/search?query=${url}&type=artist&limit=1`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	})
	apiCallsMade++;
	let artistData = await response.json();
	return artistData.artists.items[0].name;
}

// Gets the access token for the application
async function getToken() {
	let response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + btoa(keys.clientID + ':' + keys.clientSecret)
		},
		body: 'grant_type=client_credentials'
	});
	apiCallsMade++;
	let data = await response.json();
	accessToken = data.access_token;
}

// Listen for requests to the server
app.listen(5000, () => console.log('Server running on port 5000...'))