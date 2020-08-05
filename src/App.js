import React, { Component } from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link
} from "react-router-dom";

function App() {
        return (
            <div>
            <Router>
                     <Switch>
                          <Route exact path="/" component={Landing}/>
                          <Route path="/about" component={About}/>
                          <Route path="/play" component={Play}/>
                          <Route path="/results" component={Results}/>
                      </Switch>
            </Router>
            </div>
        );
}

const Landing = () => (
    <div className="App">
        <h2 className="LandingWelcome">welcome to</h2>
        <h1 className="LandingSix">six</h1>
        <h2 className="LandingText">a spotify project by joshua bautista, caleb o'malley <br></br>and andrea
            relova
        </h2>
        <Link className="PlayButton" to="/play">play</Link>
        <footer className="FooterBar">
            <div className="FooterElement">
                <Link className="FooterButton" to="/about">about this website</Link>
            </div>
        </footer>
    </div>
);

const About = () => (
    <div className="App">
        <h1 className="PagesHeader">about this website</h1>
        <span><Link className="HomeButton" to="/">home</Link> <Link className="PlayInAbout" to="/play">play</Link></span>
        <p></p>
        <p className="AboutText">welcome to <span className="Italic">six</span>, where you find out the music industry is not as vast as it may seem!
            simply type in the names of two musical artists, and this app will reveal how many degrees of separation exist between them. with the help of
            the spotify web api, the app implements dijkstra's shortest path algorithm on the two artists inputted, finds the shortest path between them,
            and returns a list of songs that take you from one artist to the other along with the degrees of separation between them. the goal of this app
            is for almost any path to be six degrees or less, so feel free to challenge us as much as you want!</p>
    </div>
);

class Play extends Component {
	constructor() {
		super();
		this.state = {
			degree: 0,
			artist1: '',
			artist2: '',
			renderText: ''
		};
	}

	formSubmitted(event) {
		var API_URL = 'http://localhost:5000/submissions';
		event.preventDefault();

		const post = {
			artist1: this.state.artist1,
			artist2: this.state.artist2
		};

		fetch(API_URL, {
				method: 'POST',
				body: JSON.stringify(post),
				headers: {
					'content-type': 'application/json'
				}
			}).then(response => response.json())
			.then((submittedArtists) => {
				console.log(submittedArtists);
				this.setState({
					degree: submittedArtists.deg,
				});

				this.setState({
					renderText: `${this.state.artist1} and ${this.state.artist2} are ${this.state.degree} degrees of separation apart!`
				});
			})
	}

	displayArtists(submittedArtists) {
		this.setState({
		degree: submittedArtists.deg
		});
	}



	artist1Changed(event) {
		this.setState({
			artist1: event.target.value
		});
	}

	artist2Changed(event) {
		this.setState({
		artist2: event.target.value
	});
	}

	// Render function for this component
	render() {
		return(
    <div className="App">
        <div className="PlayPage">
					<h2 className="PlayHeader">enter artists here:</h2>
  				<form onSubmit={(event) => this.formSubmitted(event)} action="" className="ArtistForm">
						<input onChange={(event) => this.artist1Changed(event)} className="ArtistEntry" type="text" id="artist1" name="artist1" placeholder="artist 1"/>
						<input onChange={(event) => this.artist2Changed(event)} className="ArtistEntry" type="text" id="artist2" name="artist2" placeholder="artist 2"/>
						<br/>
						<button className="SubmitBtn" type="submit" value="Submit" target="/results">submit</button>
					</form>
					<h2>{this.state.renderText}</h2>
					<h2 className="AboutText">to play, simply type in two different artists and click submit!</h2>
					<Link className="HomeButtonPlay" to="/">home</Link>
					<br/>
				</div>
    </div>
	)}
}

// This page is irrelevant currently
const Results = () => (
    <div className="App">
      <h1 className="PagesHeader">results</h1>
      <h1 className="AboutText">{this.state.artist1} and {this.state.artist2} are {this.state.degree} degrees of separation apart!</h1>
      <span><Link className="HomeButton" to="/">home</Link> <Link className="PlayInAbout" to="/play">play again</Link></span>
    </div>
)

// create a graph class
class Graph {
    // defining vertex array and
    // adjacent list
    constructor(noOfVertices)
    {
        this.noOfVertices = noOfVertices;
        this.AdjList = new Map(); 
    }

    // functions to be implemented

    // addVertex(v) r
    // addEdge(v, w)
    // printGraph()

    // bfs(v)
    // dfs(v)
}

function Dijsktras() {

}
export default App;
