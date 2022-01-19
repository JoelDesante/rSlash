const { getAudioDurationInSeconds } = require('get-audio-duration');
const mkdirp = require('mkdirp');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async function(submissionId, fragmentId, imagePath, audioPath) {

    const duration = await getAudioDurationInSeconds(audioPath);

    const outputDirectory = await mkdirp(`${__dirname}/../temp/${submissionId}/`);
    console.log('[VideoFragment] '.yellow + `Saving to ${__dirname}/../temp/${submissionId}/`.white.underline);

    const command = ffmpeg();
    command
        .input(imagePath)
        .loop(1)
        .duration(duration + 2)
        .videoCodec('libx264')
        .videoFilter('fps=25,format=yuv420p')
        .input(audioPath)
        .output(`temp/${submissionId}/${fragmentId}.mp4`)
        .outputOptions(['-movflags frag_keyframe+empty_moov'])
        .outputFPS(30)
        .run();

    console.log('[VideoFragment] '.yellow + `Fragment ${submissionId}/${fragmentId} saved`.white.underline);
}