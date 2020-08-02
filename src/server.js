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
const clientID = 'put client ID here';
const clientSecret = 'put client secret here';
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
	search(convertToURL(artist1), accessToken);
	search(convertToURL(artist2), accessToken);

	return 999;
}

function convertToURL(artist) {
	let artistURL = artist.replace(/ /g, '+');
	
	console.log(`artist url: ${artistURL}`);
	return artistURL;
}

// searches the spotify database
function search(artist, token){
	fetch(`https://api.spotify.com/v1/search?query=${artist}&type=artist&limit=1`, {
		method: 'GET',
		headers: { 'Authorization' : 'Bearer ' + token }
	}).then((response) => response.json()).then((data) => {console.log(data)});
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