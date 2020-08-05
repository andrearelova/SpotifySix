// packages
const express = require('express');
const cors = require('cors');
const Filter = require('bad-words');
const bodyParser = require('body-parser');
const Buffer = require('buffer/').Buffer;
const fetch = require('node-fetch');

const app = express();
app.use(cors());
const btoa = function(str){ return Buffer.from(str).toString('base64'); }

const jsonParser = bodyParser.json();
// const urlencodedParser = bodyParser.urlencoded({extended: false});
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
	degree = findDegree(result.artist1, result.artist2);
	result.deg = degree;

	res.json(result);
});

// where most of the degrees of separation work happens
function findDegree(artist1, artist2) {
	firstArtist = getArtistInfo(convertToURL(artist1), accessToken);
	secondArtist = getArtistInfo(convertToURL(artist2), accessToken);

	return 10;
}

function convertToURL(artist) {
	let artistURL = artist.replace(/ /g, '+');
	
	console.log(`artist url: ${artistURL}`);
	return artistURL;
}

function getArtistInfo(artist, token) {
	result = {}
	fetch(`https://api.spotify.com/v1/search?query=${artist}&type=artist&limit=1`, {
		method: 'GET',
		headers: { 'Authorization' : 'Bearer ' + token }
	}).then((response) => response.json())
	.then((data) => {
		result = data.artists.items[0];
		console.log(result);
	});

	return result;
}

// searches the spotify database
function getRelatedArtists(artistID, token){
	let relatedArtists = [];
	fetch(`https://api.spotify.com/v1/artists/${artistID}/albums`, {
		method: 'GET',
		headers: { 'Authorization' : 'Bearer ' + token }
	}).then((response) => response.json())
	.then((data) => {
		console.log(data);
	});
}

// gets the access token for the user
function getToken() {
	fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Authorization' : 'Basic ' + btoa(clientID + ':' + clientSecret)
		},
		body: 'grant_type=client_credentials'
	}).then((response) => response.json())
		.then((clientData) => {
			accessToken = clientData.access_token;
			console.log(clientData);
		  });
}

app.listen(5000, () => console.log('Server running on port 5000...'))