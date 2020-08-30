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
    var degree = 0;

    var result = {
        artist1: filter.clean(req.body.artist1.toString()),
        artist2: filter.clean(req.body.artist2.toString()),
        deg: degree
    };

    console.log("");
    console.log("Calculating path between " + result.artist1 + " and " + result.artist2 + "...");
    console.log("");

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
    let totalArtists = [];
    let match = false;

    // If the user entered the same artists, the degree is 0
    if (artist1 === artist2) {
        console.log(artist1 + " is " + artist2);
        return degree;
    } else {
        // If not, they are at least 1 degree apart
        degree++;
    }

    // Get array of collaborating artists
    let artists = await getRelatedArtists(artist1);

    // If the second artist is in the array of related artists, they are 1 degree apart.
    if (artists.indexOf(artist2) !== -1) {
        console.log(artist2 + " collaborated with " + artist1 + " on " + artists[artists.indexOf(artist2) + 1]);
        match = true;
        return degree;
    } else {
        // If not, we iterate through every even index of the array (artists only) and look at all related artists in a BFS to search for two degrees
        degree++;
        for (let i = 0; i < artists.length; i += 2) {
            let artists2 = await getRelatedArtists(artists[i]);
            // Combine every artist and song from the two-degree artists into a single array
            for (let j = 0; j < artists2.length; ++j) {
                totalArtists.push(artists2[j]);
            }
            if (artists2.indexOf(artist2) !== -1) {
                // Find the artist and song where the match was found
                console.log(artist2 + " collaborated with " + artists[i] + " on " + artists2[artists2.indexOf(artist2) + 1]);
                match = true;
                degree++;
                // Recursively find the relationship between the connecting artist and the original artist
                await findDegree(artist1, artists[i]);
                return degree;
            }
        }
    }
    // If still not found, search further for three degrees using the array of all two-degree artists and songs
    if (!match) {
        degree++;
        for (let i = 0; i < totalArtists.length; i += 2) {
            let artists3 = await getRelatedArtists(totalArtists[i]);
            if (artists3.indexOf(artist2) !== -1) {
                console.log(artist2 + " collaborated with " + totalArtists[i] + " on " + artists3[artists3.indexOf(artist2) + 1]);
                match = true;
                await findDegree(artist1, totalArtists[i]);
                return degree;
            }
        }
    }
    return "more than 3";
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
    });
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
                    artists.push(trackData.items[j].artists[k].name); // Artist at every even index
                    artists.push(trackData.items[j].name); // Song at every odd index
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
