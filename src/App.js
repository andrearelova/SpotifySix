import React, { Component } from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link
} from "react-router-dom";

// Main App component
function App() {
        return (
            <div>
            <Router>
                     <Switch>
                          <Route exact path="/" component={Landing}/>
                          <Route path="/about" component={About}/>
                          <Route path="/play" component={Play}/>
                      </Switch>
            </Router>
            </div>
        );
}

// Landing page component
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

// About page component
const About = () => (
    <div className="App">
        <h1 className="PagesHeader">about this website</h1>
        <span><Link className="HomeButton" to="/">home</Link> <Link className="PlayInAbout" to="/play">play</Link></span>
        <p></p>
        <p className="AboutText">welcome to <span className="Italic">six</span>, where you find out the music industry is not as vast as it may seem!
            simply type in the names of two musical artists, and this app will reveal how many degrees of separation exist between them. with the help of
            the spotify web api, the app implements breadth-first search algorithm on the two artists inputted, finds the shortest path between them,
            and returns a list of songs that take you from one artist to the other along with the degrees of separation between them. the goal of this app
            is for almost any path to be six degrees or less, so feel free to challenge us as much as you want!</p>
    </div>
);

// Play page component, where user inputs artists and requests results
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

	// Called when user clicks Submit button
	async formSubmitted(event) {
		var API_URL = 'http://localhost:5000/submissions';
		event.preventDefault();
    this.setState({
    renderText: "Calculating..."
    })

		const post = {
			artist1: this.state.artist1,
			artist2: this.state.artist2
		};

		// fetch() result from server.js
		let response = await fetch(API_URL, {
			method: 'POST',
			body: JSON.stringify(post),
			headers: {
				'content-type': 'application/json'
			}
		});

		let result = await response.json();
		this.setState({
			degree: result.deg,
		});
		this.setState({
			renderText: `${this.state.artist1} and ${this.state.artist2} are ${this.state.degree} degree(s) of separation apart!`
		});
	}

	// Repeatedly called while typing in text box
	artist1Changed(event) {
		this.setState({
			artist1: event.target.value
		});
	}

	// Repeatedly called while typing in text box
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
					<h2 className="ResultText">{this.state.renderText}</h2>
					<h2 className="AboutText">to play, simply type in two different artists and click submit!</h2>
					<Link className="HomeButtonPlay" to="/">home</Link>
					<br/>
				</div>
    </div>
	)}
}

export default App;
