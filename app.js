// this is our "main" js program
//dependancies
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var Twitter = require("twitter");
var path = require("path");
var request = require("request");
var geocoder = require("geocoder");

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

app.post("/search_tweets", (req, res) => {
	var searchTerm = req.body.query;
	console.log(searchTerm);	
	twitterClient.get('search/tweets', {q: searchTerm}, (err, tweets, response) => {
		if(err) {
			res.send({error: err});
		}

		console.log(tweets);
		res.send({results: tweets});
	});
});

app.post("/search_events", (req, res) => {
	var requestURL = ticketUrl
	+ "&size=15"
	+ "&classificationId=KZFzniwnSyZfZ7v7nJ"
	+ "&city=" +req.body.city;

	geocoder.geocode("Seattle", (err, data) => {
		if(err) res.send(err);
		console.log(data.results[0].geometry.location);
		
			
	});
	request(requestURL, (err, response, body) => {
		if(err) res.send(err);
	
		res.send(JSON.parse(body));
	});
	
});

//connect to server
app.listen(5000, ()=>{
	console.log("app is running at localhost:5000");
});
