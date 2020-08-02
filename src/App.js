import React from 'react';
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

const Play = () => (
    <div className="App">
        <div className="PlayPage">
					<h2 className="PlayHeader">Enter artists here:</h2>
  				<form action="" className="ArtistForm">
						<input className="ArtistEntry" type="text" id="artist1" name="artist1" placeholder="Artist 1"/>
						<input className="ArtistEntry" type="text" id="artist2" name="artist2" placeholder="Artist 2"/>
						<br/>
						<input className="SubmitBtn" type="submit" value="Submit" target="/results"/>
					</form>
					<Link className="HomeButtonPlay" to="/">home</Link>
					<br/>
     			{/*<Link className="ResultsButton" to="/results">get results</Link>*/}
				</div>        
    </div>
);

const Results = () => (
    <div className="App">
      <h1 className="PagesHeader">results</h1>
      <h1>lol idk how to do this -andrea</h1>
      <span><Link className="HomeButton" to="/">home</Link> <Link className="PlayInAbout" to="/play">play again</Link></span>
    </div>
);
export default App;
