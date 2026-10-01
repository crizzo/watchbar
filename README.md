# Watchbar

Safari companion for YouTube links. A 2026 take on [YouTube video downloader for Safari](https://github.com/crizzo/YouTube-video-downloader-for-Safari) 1.1.4, which added a Download Video button in Safari 5.

Paste a watch, Shorts, or youtu.be link. Watchbar looks the video up with YouTube’s oEmbed API, plays it with the official IFrame player, and opens the old **Download Video** / **Hide Download Links** control.

Those links are what current Safari and YouTube APIs still allow:

- Save the poster JPEG
- Share through the system share sheet
- Copy the watch link
- Open on YouTube, or in the YouTube app on iPhone and iPad
- Open YouTube Studio for the original file, if you uploaded it

YouTube no longer prints `fmt_url_map`. oEmbed and the player API do not return video files, and this app does not try to reconstruct them.

## Run

```bash
npm install
npm run dev
```

The dev server listens on port 8080.
