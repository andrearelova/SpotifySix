// packages
const express = require('express');
const cors = require('cors');
const Filter = require('bad-words');
const bodyParser = require('body-parser');
const Buffer = require('buffer/').Buffer;
const fetch = require('node-fetch');

const app = express();
app.use(cors());
const btoa = function (str) {
	return Buffer.from(str).toString('base64');
}

const jsonParser = bodyParser.json();
const filter = new Filter();

// application parameters (gotta make these secret somehow)
const clientID = '8f2d826b76df44be84cb145b8286b701';
const clientSecret = '37330adb659145a8893b1c2adba216a0';
var accessToken = '';

getToken(); // get an access token when the server starts up

// GET request to home page
app.get('/', (req, res) => {
	res.send('Hello user!');
});

// GET request to submissions page (not useful, but here anyways)
app.get('/submissions', (req, res) => {
	res.send('nothing useful when submitting a GET request here...');
});

// POST request to submissions page
app.post('/submissions', jsonParser, (req, res) => {
	console.log('received a new POST request to /submissions');
	var degree = 0;

	var result = {
		artist1: filter.clean(req.body.artist1.toString()),
		artist2: filter.clean(req.body.artist2.toString()),
		deg: degree
	}

	// algorithm starts here
	degree = findDegree(result.artist1, result.artist2, accessToken);
	result.deg = degree;

	res.json(result);
});

// where most of the degrees of separation work happens
function findDegree(artist1, artist2) {
	console.log("doing first artist");

	let artist = '';
	let albums = [];
	let url1 = convertToURL(artist1);
	let artists = new Set();

	let target = '';
	let targetURL = convertToURL(artist2);
	// gets the ID of the second artist that we will be looking to match
	fetch(`https://api.spotify.com/v1/search?query=${targetURL}&type=artist&limit=1`, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		}).then((response) => response.json())
		.then((data) => {
			target = data.artists.items[0].id;
			console.log("fetched target artist id: " + target);
		});

	// gets the first artist's artist ID
	fetch(`https://api.spotify.com/v1/search?query=${url1}&type=artist&limit=1`, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		}).then((response) => response.json())
		.then((data) => {
			artist = data.artists.items[0].id;
			console.log("fetched first artist id: " + artist);

			// search the artist's albums
			fetch(`https://api.spotify.com/v1/artists/${artist}/albums`, {
					method: 'GET',
					headers: {
						'Authorization': 'Bearer ' + accessToken
					}
				}).then((response) => response.json())
				.then((albumData) => {

					// for every album by the artist
					for (let i = 0; i < albumData.items.length; ++i) {
						albums[i] = albumData.items[i].id;
						console.log(albumData.items[i].name);
						let current = albums[i];

						// get the tracks for the album
						fetch(`https://api.spotify.com/v1/albums/${current}/tracks`, {
								method: 'GET',
								headers: {
									'Authorization': 'Bearer ' + accessToken
								}
							}).then((response) => response.json())
							.then((trackData) => {
								console.log("tracks: " + trackData.items.length);

								// for every track on the album
								for (let j = 0; j < trackData.items.length; ++j) {
									// for every artist on the track, add it
									for (let k = 0; k < trackData.items[j].artists.length; ++k) {
										artists.add(trackData.items[j].artists[k].id);
									}
									console.log(artists);
								}
							});
					}
				});
		});

	return 10; // this is the number returned to the user
}

function convertToURL(artist) {
	let artistURL = artist.replace(/ /g, '+');
	console.log(`artist url: ${artistURL}`);
	return artistURL;
}

// converts string of text from user to a Spotify Artist ID
function getArtistID(artist) {
	let url = convertToURL(artist);
	fetch(`https://api.spotify.com/v1/search?query=${url}&type=artist&limit=1`, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		}).then((response) => response.json())
		.then((data) => {
			return data.artists.items[0].id;
		});
}

// searches the spotify database
function getSongID(artistID) {

}

function getRelatedArtists(artist) {

	let artists = new Set();
	// search the artist's albums
	fetch(`https://api.spotify.com/v1/artists/${artist}/albums`, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		}).then((response) => response.json())
		.then((albumData) => {

			// for every album by the artist
			for (let i = 0; i < albumData.items.length; ++i) {
				albums[i] = albumData.items[i].id;
				console.log(albumData.items[i].name);
				let current = albums[i];

				// get the tracks for the album
				fetch(`https://api.spotify.com/v1/albums/${current}/tracks`, {
						method: 'GET',
						headers: {
							'Authorization': 'Bearer ' + accessToken
						}
					}).then((response) => response.json())
					.then((trackData) => {
						console.log("tracks: " + trackData.items.length);

						// for every track on the album
						for (let j = 0; j < trackData.items.length; ++j) {
							// for every artist on the track, add it
							for (let k = 0; k < trackData.items[j].artists.length; ++k) {
								artists.add(trackData.items[j].artists[k].id);
							}
						}
					});
			}
		});
}

return 10; // this is the number returned to the user
}

// gets the access token for the user
function getToken() {
	fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + btoa(clientID + ':' + clientSecret)
			},
			body: 'grant_type=client_credentials'
		}).then((response) => response.json())
		.then((clientData) => {
			accessToken = clientData.access_token;
			console.log(clientData);
		});
}

app.listen(5000, () => console.log('Server running on port 5000...'))