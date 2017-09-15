var twit = require('twit');
var config = require('./config.js');
var request = require('request');
var BASE_URL = 'https://api.genius.com/';
var Twitter = new twit(config);
var geniusAccessToken = process.env.GENIUS_ACCESS_TOKEN;
var songName = "bla"
var songUrl = "bla"
var artists = ["1421", "56", "22", "105", "59", "12417", "21", "48147"] //kendrick, nas, biggie, outkast, 2pac, rakim, wu tang, rtj

var halfHour = 30*60*1000; // minutes*seconds*milliseconds


var getRandomSongFromArtist = function(artistId) {
	request({
	  url: "https://api.genius.com/artists/" + artistId + "/songs?per_page=50",
	  auth: {
	    'bearer': geniusAccessToken
	  }
	}, function(err, res) {
	  var obj = JSON.parse(res.body)
	  var songs = obj["response"]["songs"]
	  var i = Math.floor(Math.random() * songs.length)
	  var songId = songs[i]["id"]
	  songName = songs[i]["full_title"] 
	  console.log(songName)
	  songUrl = songs[i]["url"]
	  getRandomQuoteFromSong(songId)
	});
}

var getRandomQuoteFromSong = function(songId) {
	request({
	  url: "https://api.genius.com/referents?song_id=" + songId,
	  auth: {
	    'bearer': geniusAccessToken
	  }
	}, function(err, res) {
	  var obj = JSON.parse(res.body)
	  var quotes = obj["response"]["referents"]
	  if (quotes.length == 0) { 
	  	routine();
	    return;
	  }
	  var i = Math.floor(Math.random() * quotes.length)
	  var quote = quotes[i]["fragment"];
	  if (quote.length <= 138) {
	  	quote = "\"" + quote + "\""
	  	tweetQuote(quote)
 } else {
 	 routine()
 }
	});
}

var tweetQuote = function(quote) {
	Twitter.post('statuses/update', { status: quote}, function(err, data, response) {
  	console.log("tweetou " + quote)
  	Twitter.get('statuses/user_timeline', { screen_name: 'rapquotebot', count: 1}, function(err, data, response) {
		  var lastTweetId = data[0]["id_str"]
		  tweetQuoteInfo(lastTweetId)
		}) 
  	})
}

var tweetQuoteInfo = function(statusId) {
	quoteInfo = "@rapquotebot " + songName
	if (quoteInfo.length > 135) {
		quoteInfo = "@rapquotebot " + songName.substring(0, 130) + "..."
	}
	Twitter.post('statuses/update', { status: quoteInfo, in_reply_to_status_id: statusId}, function(err, data, response) {
  		console.log("tweetou " + quoteInfo) 
  	})
}


var tweetRandomQuoteFromArtists = function(artists) {
	var artistId = artists[Math.floor(Math.random() * artists.length)]
	getRandomSongFromArtist(artistId)
}

var routine = function() {
	tweetRandomQuoteFromArtists(artists)
}


tweetRandomQuoteFromArtists(artists)
setInterval(routine, halfHour); // 30 minutes interval




