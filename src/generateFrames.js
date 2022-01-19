// TODO: Add more customizability to allow for more complex combinations of frames.

const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');
const config = require('../config.json');

/**
 * This function generates the screen shots needed for the final video.
 * @param {string} submissionId 
 */
 module.exports = async function(submissionId) {
    
    console.log('[FrameGenerator] '.yellow + `Attempting to generate image frames for submission ${submissionId}`.red.underline);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36');
    await page.setViewport({
        width: parseInt(config.frame_width / config.scale_factor),
        height: parseInt(config.frame_height / config.scale_factor),
        deviceScaleFactor: config.scale_factor
    });

    // First go to the main post's page
    await page.goto(`${config.view_engine_host}:${config.view_engine_port}/post/${submissionId}`);
    await page.waitForNetworkIdle();

    const outputDirectory = await mkdirp(`${__dirname}/../temp/${submissionId}/`);
    console.log('[FrameGenerator] '.yellow + `Saving to ${__dirname}/../temp/${submissionId}/`.red.underline);
    
    await page.screenshot({ path: `${__dirname}/../temp/${submissionId}/original_post.png`, fullPage: false });

    // Now we need to get the top comments response...
    await page.goto(`${config.view_engine_host}:${config.view_engine_port}/thread/${submissionId}`);
    await page.waitForNetworkIdle();

    console.log('[FrameGenerator] '.yellow + `Saving to ${__dirname}/../temp/${submissionId}/`.red.underline);
    await page.screenshot({ path: `${__dirname}/../temp/${submissionId}/thread.png`, fullPage: false });

    await browser.close();

    console.log('[FrameGenerator] '.yellow + `Successfully generated image frames for submission ${submissionId}`.red.underline);
}