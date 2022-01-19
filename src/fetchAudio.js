const textToSpeech = require('@google-cloud/text-to-speech');
const snoowrap = require('snoowrap');
const config = require('../config.json');
const fs = require('fs');
const util = require('util');
const mkdirp = require('mkdirp');
const client = new textToSpeech.TextToSpeechClient();

const reddit = new snoowrap({
    userAgent: 'rSlash',
    clientId: config.reddit_client_id,
    clientSecret: config.reddit_client_secret,
    refreshToken: config.reddit_refresh_token
});

module.exports = async function fetchAudio(submissionId, text, fileName) {

    console.log('[GoogleTTS] '.yellow + `Recieved request to sythesise ${text.split(" ").length} words`.blue.underline);

    const request = {
        input: {text: text},
        voice: {languageCode: 'en-GB', ssmlGender: 'MALE'},
        audioConfig: {audioEncoding: 'MP3'},
    };

    const [ response ] = await client.synthesizeSpeech(request);

    const outputDirectory = await mkdirp(`${__dirname}/../temp/${submissionId}/`);
    console.log('[GoogleTTS] '.yellow + `Saving to ${__dirname}/../temp/${submissionId}/`.blue.underline);
  
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(`${__dirname}/../temp/${submissionId}/${fileName}.mp3`, response.audioContent, 'binary');
    
    console.log('[GoogleTTS] '.yellow + `Audio content written to file: ${__dirname}/../temp/${submissionId}/${fileName}.mp3`.blue.underline);
}