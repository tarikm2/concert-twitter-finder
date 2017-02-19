// this is our "main" js program
//dependancies
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var Twitter = require("twitter");
var path = require("path");
var request = require("request");
var geocoder = require("geocoder");
var async = require("async");

const CREDENTIALS = require(path.resolve(__dirname, "./credentials.json"));

const ticketUrl = "https://app.ticketmaster.com/discovery/v2/events.json?apikey="
	+ CREDENTIALS.TICKETMASTER.KEY;


var twitterClient = new Twitter({
	consumer_key: CREDENTIALS.TWITTER.CONSUMER_KEY,
	consumer_secret: CREDENTIALS.TWITTER.CONSUMER_SECRET,
	access_token_key: CREDENTIALS.TWITTER.ACCESS_TOKEN,
	access_token_secret: CREDENTIALS.TWITTER.ACCESS_TOKEN_SECRET
});


var app = express();

//middleware
app.use(bodyParser.urlencoded({extended: true}));

//routes
app.get("/hello", (req, res)=> {
	res.send({message: "hello world!"});
});

var getTweets = (band, city, callback)=> {
	
    var searchTerm = band + " " + city;
    console.log(searchTerm);
    var toReturn;
    twitterClient.get('search/tweets', {q: searchTerm}, (err, tweets, response) => {
	if(err) {
	    console.log("twitter issue");
	}

	callback(tweets);
    });
};

app.post("/search_events", (req, res) => {
    
    var resJSON = {};
    
    geocoder.geocode(req.body.city, (err, data) => {
	if(err) res.send(err);
	
	var requestURL = ticketUrl
	    + "&size=15"
	    + "&classificationId=KZFzniwnSyZfZ7v7nJ"
	    + "&latlong=" 
	    + data.results[0].geometry.location.lat + ","
	    + data.results[0].geometry.location.lng;
	
	request(requestURL, (err, response, body) => {
	    if(err) res.send(err);
	    
	    var eventsJSON = JSON.parse(body)._embedded.events;
	    async.each(eventsJSON, (event, callback) => {
		
		var band = event._embedded
		    .attractions[0]
		    .name;
		
		var eventName = event.name;
		getTweets(band, req.body.city, (twts) => {
		    resJSON[eventName] = {bandName: band, tweets: twts};
		    callback();
		})
	    }, (err) => {
		if(err) {
		    console.log("there was an async error");
		}
		res.send(resJSON);
	    });
	});
    });	
});


//connect to server
app.listen(5000, ()=>{
	console.log("app is running at localhost:5000");
});
