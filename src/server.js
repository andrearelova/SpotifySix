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
const clientID = config.CLIENT_ID;
const clientSecret = config.CLIENT_SECRET;
var accessToken = config.ACCESS_TOKEN;

getToken(); // get an access token when the server starts up

// POST request to submissions page
// entry point for the data coming from Play page
app.post('/submissions', jsonParser, async (req, res) => {
	console.log('received a new POST request to /submissions');
	var degree = 0;

	var result = {
		artist1: filter.clean(req.body.artist1.toString()),
		artist2: filter.clean(req.body.artist2.toString()),
		deg: degree
	}

	// algorithm starts here
	degree = await findDegree(result.artist1, result.artist2, accessToken);
	result.deg = degree;

	//Game(result.artist1, result.artist2);
	// let artist1 = filter.clean(req.body.artist1.toString());
	// let artist2 = filter.clean(req.body.artist2.toString());

	// let result = Game(artist1, artist2); // result can be a JSON with all the info + linking songs, or just a degree

	res.json(result); // result will be parsed by App.js
});

async function findDegree(artist1, artist2) {
	let degree = 0;

	if (artist1 == artist2) {
		return degree;
	}

	degree++; // at least one degree apart now

	let artists = await getRelatedArtists(artist1);

	console.log(`Artists related to ${artist1}: ` + artists);

	if (artists.indexOf(artist2) !== -1) {
		console.log(artist1 + " and " + artist2 + " are one degree apart!");
		return 1;
	} else {
		for (let i = 0; i < artists.length; ++i) {
			let artists2 = await getRelatedArtists(artists[i]);
			if (artists2.indexOf(artist2) !== -1) {
				console.log(artist1 + " and " + artist2 + " are two degrees apart!");
				return 2;
			}
		}
		// then if not search another degree and so on
	}

	return degree; // this is the number returned to the user
}

// returns an array of artist names
async function getRelatedArtists(artist) {
	let artists = [];
	let albums = [];
	let url1 = convertToURL(artist);

	// gets the artist's spotify ID
	let response = await fetch(`https://api.spotify.com/v1/search?query=${url1}&type=artist&limit=1`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	})

	let artistData = await response.json();
	let artistID = artistData.artists.items[0].id;
	//console.log("artist ID is: " + artistID);

	let albumsResponse = await fetch(`https://api.spotify.com/v1/artists/${artistID}/albums`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	});

	let albumData = await albumsResponse.json();
	// for every album in this list
	for (let i = 0; i < albumData.items.length; ++i) {
		let currentID = albumData.items[i].id;
		albums.push(currentID);

		// get the tracks on the album
		let tracksResponse = await fetch(`https://api.spotify.com/v1/albums/${currentID}/tracks`, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
		let trackData = await tracksResponse.json();
		// for every track on the album
		for (let j = 0; j < trackData.items.length; ++j) {
			// and for every artist on the track, add it
			for (let k = 0; k < trackData.items[j].artists.length; ++k) {
				// if the artist isn't already in the list of artists
				if (artists.indexOf(trackData.items[j].artists[k].name) === -1) {
					// add them to the artists array
					artists.push(trackData.items[j].artists[k].name);
					//console.log(trackData.items[j].artists[k].name);
				}
			}
		}
	}

	return artists;

	// old version
	// .then((response) => response.json())
	//     .then((data) => {
	//         artist = data.artists.items[0].id;

	//         // search the artist's albums
	//         fetch(`https://api.spotify.com/v1/artists/${artist}/albums`, {
	//             method: 'GET',
	//             headers: {
	//                 'Authorization': 'Bearer ' + accessToken
	//             }
	//         }).then((response) => response.json())
	//             .then((albumData) => {

	//                 // for every album by the artist
	//                 for (let i = 0; i < albumData.items.length; ++i) {
	//                     albums[i] = albumData.items[i].id;
	//                     let current = albums[i];

	//                     // get the tracks for the album
	//                     fetch(`https://api.spotify.com/v1/albums/${current}/tracks`, {
	//                         method: 'GET',
	//                         headers: {
	//                             'Authorization': 'Bearer ' + accessToken
	//                         }
	//                     }).then((response) => response.json())
	//                         .then((trackData) => {

	//                             // for every track on the album
	//                             for (let j = 0; j < trackData.items.length; ++j) {
	//                                 // for every artist on the track, add it
	//                                 for (let k = 0; k < trackData.items[j].artists.length; ++k) {
	//                                     if (artists.indexOf(trackData.items[j].artists[k].name) === -1) {
	//                                         artists.push(trackData.items[j].artists[k].name);
	//                                         //console.log(trackData.items[j].artists[k].name);
	//                                     }
	//                                 }
	//                             }
	//                         });
	//                 }
	//             });
	//     });
}

// converts user-input string to a usable value for the Spotify API
function convertToURL(artist) {
	let artistURL = artist.replace(/ /g, '+');
	//console.log(`artist url: ${artistURL}`);
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

// converts string of text from user to a Spotify Artist ID
function getArtistName(artist) {
	let url = convertToURL(artist);
	fetch(`https://api.spotify.com/v1/search?query=${url}&type=artist&limit=1`, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		}).then((response) => response.json())
		.then((data) => {
			return data.artists.items[0].name;
		});
}

// searches the spotify database
function getSongID(artistID) {
	// not sure exactly what is required of this function/how it will be used
}

// gets the access token for the user
async function getToken() {
	let response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + btoa(clientID + ':' + clientSecret)
		},
		body: 'grant_type=client_credentials'
	});

	let data = await response.json();
	accessToken = data.access_token;
	//console.log(data);
}

// ========================== GRAPH CREATION ================================

//perform the "game"
function Game(artist1, artist2) {
	let g = new Graph();
	//add artist 1

	g.addVertex(artist1);
	//loop:
	//  get array of artists and add those artists and an edge from first artist to each in the array
	//  check if any of those artists are artist 2. if so, stop loop
	//  if not, get array of artists for each artists, add those artists, check again
	//once you have added artist 2 to the list, perform BFS and maybe print out "___ collaborated with ___ on ____" for each degree
	//the size of the queue from the BFS minus 1 is the number of degrees
}

// create a graph class
class Graph {
	// defining vertex array and
	// adjacent list
	constructor() {
		this.nodes = [];
		this.AdjList = new Map();
	}

	// functions to be implemented

	addVertex(node) {
		// initialize the adjacent list with a
		// null array
		this.nodes.push(node);
		this.AdjList.set(node, []);
	}

	addEdge(v, w, songID) {
		// get the list for vertex v and put the
		// vertex w denoting edge between v and w
		this.AdjList.get(v).push(w, songID);

		// Since graph is undirected,
		// add an edge from w to v also
		this.AdjList.get(w).push(v, songID);
	}

	BreadthFirst(startingNode, endNode) {
		// create a visited array
		var visited = [];
		for (var i = 0; i < this.nodes.length; i++)
			visited[i] = false;

		// Create an object for queue
		var q = new Queue();

		// add the starting node to the queue
		visited[startingNode] = true;
		q.enqueue(startingNode);

		// loop until queue is element
		while (!visited[endNode]) {
			// get the element from the queue
			var getQueueElement = q.dequeue();

			// passing the current vertex to callback funtion
			console.log(getQueueElement);

			// get the adjacent list for current vertex
			var get_List = this.AdjList.get(getQueueElement);

			// loop through the list and add the element to the
			// queue if it is not processed yet
			for (var i in get_List) {
				var neigh = get_List[i];

				if (!visited[neigh]) {
					visited[neigh] = true;
					q.enqueue(neigh);
				}
			}

			return q;
		}
	}
}

class Queue {
	//Array is used to implement a Queue
	constructor() {
		this.items = [];
	}

	// enqueue function
	enqueue(element) {
		// adding element to the queue
		this.items.push(element);
	}

	// dequeue function
	dequeue() {
		// removing element from the queue
		// returns underflow when called
		// on empty queue
		if (this.isEmpty())
			return "Underflow";
		return this.items.shift();
	}

	sizeof() {
		return this.items.length;
	}
}

app.listen(5000, () => console.log('Server running on port 5000...'))
