const config = require('../config.json');
const path = require('path');
var colors = require('colors');
require('dotenv').config();

/**
 * This mini server is in charge of generating the video's views
 * 
 * Endpoints:
 * /post/:submissionId - Generates a video friendly reddit page 
 * with the original post's content.
 * 
 * /thread/:submissionId - Generates a video friendly reddit page 
 * with the original post's top comment.
 */
const ViewEngine = require('./server');

/**
 * This component handles the generation of the reddit post's images.
 * It is an async function and requires one argument:
 * submissionId - The id of the post you are generating the frames for. 
 */
const GenerateAssets = require('./generateFrames');

/**
 * This component generates fragemnts of the final video given a set of assets.
 * These fragments will later be spliced together into one final video and then
 * uploaded.
 */
const GenerateFragment = require('./generateVideoFragment');
const MergeFragments = require('./mergeFragments');

(async () => {
    const submissionId = 'rjxzyy';
    await GenerateAssets(submissionId);
    await GenerateFragment(submissionId, 'original_post', `temp/${submissionId}/original_post.png`, `temp/${submissionId}/original_post.mp3`);
    await GenerateFragment(submissionId, 'thread', `temp/${submissionId}/thread.png`, `temp/${submissionId}/thread.mp3`);
    await MergeFragments(submissionId, [ `${__dirname}/../temp/${submissionId}/original_post.mp4`, `${__dirname}/../temp/${submissionId}/thread.mp4` ]);
})();