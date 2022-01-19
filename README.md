# rSlash

This is a small weekend project I made that uses a variety of technologies to convert Reddit posts into short videos that can be posted on YouTube.

This project was built in JavaScript using Node.js.
It depends on FFMPEG for video encoding, Google Cloud’s Text to Speech API for narration, and Express w/ Handlebars accessed with Puppeteer (headless chromium browser library) for dynamic visual layout generation.

The bot consumes a submission ID and then processes user generated content using Reddit’s API. It then generates a layout using a set of template files I created in HTML/CSS. Using Puppeteer, the bot then “screenshots” the layout. Next, Google TTS generates an audio narration which is fed into FFMPEG along with the generated layouts to create a video.

Lastly, the video is then uploaded to YouTube. The bot uses a keyword finding algorithm to determine the video’s keywords.
