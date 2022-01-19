const mkdirp = require('mkdirp');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const util = require('util');
const colors = require('colors');

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async function(submissionId, fragments) {

    const outputDirectory = await mkdirp(`${__dirname}/../output/${submissionId}/`);
    console.log('[VideoSplice] '.yellow + `Saving to ${__dirname}/../temp/${submissionId}/`.magenta.underline);

    // We need to write this file (mylist.txt) so that ffmpeg knows the locations
    // of the fragment video files.
    // Don't question it... Just accept it.... 
    let data = '';
    fragments.forEach((path, index) => {
        data += `file '${path}'\n`;
    });

    const writeFile = util.promisify(fs.writeFile);
    await writeFile(`${__dirname}/../temp/${submissionId}/mylist.txt`, data);
    
    const command = ffmpeg()
    .on('error', error => {
        console.log(error.message);
    })

    // It is unclear why I need to do this.
    // In theory the files should already be fully written
    // But, I suspect fluent-ffmpeg doesn't do a great job of
    // resolving promises at an appropiate time.
    // ---
    // So, I need to wait...
    // Or it could be the fs. Since it is being coerced 
    // into the form of a promise.
    console.log('[VideoSplice] '.yellow + `Waiting two seconds for dependant files to resolve`.magenta.underline);
    setTimeout(() => {
        command
            .input(`temp/${submissionId}/mylist.txt`)
            .inputOptions(['-f concat', '-safe 0'])
            //.audioCodec('copy')
            //.videoCodec('copy')
            .outputOption('-c copy')
            .output(`output/${submissionId}/final.mp4`)
            .outputOptions(['-movflags frag_keyframe+empty_moov'])
            .run();
    }, 2000);

    console.log('[VideoSplice] '.yellow + `Final video ${submissionId} saved`.magenta.underline);
}