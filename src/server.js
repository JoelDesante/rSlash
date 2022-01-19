/**
 * This web server handles the generation of the video layouts
 * Instead of trying to muck around with reddit's layout
 * (which is very complex) we are using musch simpler custom
 * layouts that show the same data, but, in a more convient form.
 * 
 * Users dont need to see all the extra calls to action and such.
 * 
 * This server uses snoowrap to fetch the required data for the templates.
 */

const express = require('express');
const snoowrap = require('snoowrap');
const config = require('../config.json');
const path = require('path');
const colors = require('colors');

/**
 * This component sythesises text to audio.
 * It's only argument is the post submission id.
 */
 const GoogleTTS = require('./fetchAudio');
const { title } = require('process');

const app = express();
const reddit = new snoowrap({
    userAgent: 'rSlash',
    clientId: config.reddit_client_id,
    clientSecret: config.reddit_client_secret,
    refreshToken: config.reddit_refresh_token
});

// The handlebars view engine is what we will use to dynamically populate the views 
// with content from reddit.
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'))


// This is a status page. Hit this page to get details about the bots current status
// Returns JSON so that the information can be used in a variety of ways.
app.get('/', async (req, res) => {
    console.log('[ViewEngine] '.yellow + `Recieved request for /`.green.underline);
    res.render('home');
});

// This layout is good for the initial post. It highlights the main question and
// shows some basic post data.
app.get('/post/:submissionId', async (req, res) => {

    const submissionId = req.params.submissionId;

    console.log('[ViewEngine] '.yellow + `Recieved request for /post/${submissionId}/`.green.underline);
    
    const submission = await reddit.getSubmission(submissionId).fetch();

    // This may be an odd place to put this but this is a perfect oppertunity to
    // kill two birds with one stone.
    const selftext = submission.selftext ? submission.selftext : '';
    const text = `${submission.title}. ${selftext}`;
    GoogleTTS(submissionId, text, 'original_post');    // Generate the audio snippets while your at it!

    res.render('originalPost', {
        subreddit: await submission.subreddit.title,
        author: submission.author.name,
        title: submission.title,
        body: submission.selftext_html,
        num_comments: submission.num_comments
    });
});

// This layout is intended for the comment threads below
// You can provide a depth attribute to show more than just
// the top level comment.
//
// `depth=2` will show the top level comment and the 
// first response to that comment.
app.get('/thread/:submissionId', async (req, res) => {

    const submissionId = req.params.submissionId;

    console.log('[ViewEngine] '.yellow + `Recieved request for /thread/${submissionId}/`.green.underline);
    
    const submission = await reddit.getSubmission(submissionId);
    const comments = await submission.comments;
    const topComment = await comments[0].fetch();

    // This may be an odd place to put this but this is a perfect oppertunity to
    // kill two birds with one stone.
    GoogleTTS(submissionId, topComment.body, 'thread');    // Generate the audio snippets while your at it!

    res.render('commentThread', {
        title: await submission.title,
        op: await submission.author.name,
        subreddit: await topComment.subreddit.title,
        comment_author: topComment.author.name,
        body: topComment.body_html,
    });
});

app.listen(config.view_engine_port);
console.log('[ViewEngine] '.yellow + `Hosting View Engine at ${config.view_engine_host}:${config.view_engine_port}/`.green.underline);

module.exports = app;