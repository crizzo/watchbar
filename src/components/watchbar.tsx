import { useEffect, useId, useState } from "react";
import {
  ArrowDownToLine,
  Clapperboard,
  Copy,
  ExternalLink,
  Share,
  Smartphone,
} from "lucide-react";
import { lookupVideo } from "@/lib/lookup.functions";
import {
  appUrl,
  parseYouTubeId,
  readRecent,
  studioUrl,
  watchUrl,
  writeRecent,
  type RecentVideo,
  type VideoMeta,
} from "@/lib/youtube";

const SAMPLE = "https://www.youtube.com/watch?v=jNQXAC9IVRw";

export function Watchbar() {
  const fieldId = useId();
  const [draft, setDraft] = useState("");
  const [video, setVideo] = useState<VideoMeta | null>(null);
  const [linksOpen, setLinksOpen] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [recent, setRecent] = useState<RecentVideo[]>([]);
  const [canShare, setCanShare] = useState(false);
  const [appleTouch, setAppleTouch] = useState(false);

  useEffect(() => {
    setRecent(readRecent());
    setCanShare(typeof navigator.share === "function");
    const touchMac =
      navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    setAppleTouch(/iPad|iPhone|iPod/.test(navigator.userAgent) || touchMac);
  }, []);

  async function lookup(raw: string) {
    const id = parseYouTubeId(raw);
    if (!id) {
      setError("Paste a YouTube link — watch, Shorts, or youtu.be.");
      setStatus("");
      return;
    }
    setPending(true);
    setError("");
    setStatus("");
    try {
      const meta = await lookupVideo({ data: { id } });
      setVideo(meta);
      setLinksOpen(true);
      setDraft(watchUrl(meta.id));
      setRecent(writeRecent(meta));
    } catch (err) {
      setVideo(null);
      setError(err instanceof Error ? err.message : "YouTube didn't answer.");
    } finally {
      setPending(false);
    }
  }

  async function share() {
    if (!video) return;
    const payload = { title: video.title, url: watchUrl(video.id) };
    if (!navigator.share) {
      await copyLink();
      setStatus("Sharing isn't in this browser, so the link was copied.");
      return;
    }
    try {
      await navigator.share(payload);
      setStatus("Shared from Safari.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatus("Share sheet didn't open.");
    }
  }

  async function copyLink() {
    if (!video) return;
    try {
      await navigator.clipboard.writeText(watchUrl(video.id));
      setStatus("Link copied.");
    } catch {
      setStatus("Clipboard is blocked in this browser.");
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line">
        <div className="safe-pad mx-auto flex max-w-6xl flex-col gap-3 pt-6 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-widest text-muted uppercase">
              Safari companion
            </p>
            <h1 className="font-display text-4xl leading-none font-medium text-fg italic sm:text-5xl">
              Watchbar
            </h1>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted sm:text-right">
            The download button from the Safari 5 extension, on the APIs that
            still exist.
          </p>
        </div>
      </header>

      <main className="safe-pad mx-auto grid max-w-6xl gap-8 pt-6 lg:grid-cols-12 lg:gap-10">
        <section className="lg:col-span-5">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void lookup(draft);
            }}
          >
            <label htmlFor={fieldId} className="text-sm font-medium text-fg">
              YouTube link
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={fieldId}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="https://youtu.be/…"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="min-h-11 w-full rounded-full border border-line bg-raised px-4 text-base text-fg placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={pending}
                className="min-h-11 shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-bg disabled:opacity-60"
              >
                {pending ? "Looking up…" : "Look up"}
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={() => void lookup(SAMPLE)}
            className="mt-3 min-h-11 text-left text-sm text-muted underline decoration-line underline-offset-4"
          >
            Try the first video on YouTube
          </button>

          <p className="mt-4 min-h-5 text-sm text-accent" role="alert">
            {error}
          </p>

          <div className="mt-6 border-t border-line pt-5">
            <h2 className="text-xs font-medium tracking-widest text-muted uppercase">
              Recent
            </h2>
            {recent.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Lookups stay on this device.
              </p>
            ) : (
              <ul className="mt-2">
                {recent.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => void lookup(item.id)}
                      className="flex min-h-11 w-full items-baseline justify-between gap-3 py-2 text-left"
                    >
                      <span className="truncate text-sm text-fg">{item.title}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {item.authorName}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <details className="mt-6 border-t border-line pt-5">
            <summary className="min-h-11 cursor-pointer text-sm font-medium text-fg">
              What changed since Safari 5
            </summary>
            <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted">
              <p>
                Version 1.1.4 injected a Download Video button and read{" "}
                <span className="text-fg">fmt_url_map</span> out of the watch
                page. Option-click saved the itag — 18 for 360p MP4, 22 for
                720p, 37 for 1080p. YouTube no longer prints those file URLs.
              </p>
              <p>
                Current Safari only loads Web Extensions that ship inside a
                signed Mac or iOS app. A page can't install itself. This
                companion uses the three surfaces that are still public:
              </p>
              <ul className="flex flex-col gap-2">
                <li>
                  <span className="text-fg">oEmbed</span> — title, channel, and
                  the poster. No key.
                </li>
                <li>
                  <span className="text-fg">IFrame Player</span> — playback.
                  Not a file.
                </li>
                <li>
                  <span className="text-fg">Web Share</span>
                  {canShare ? " is available here." : " appears when Safari has it."}{" "}
                  The poster saves through a same-origin image request to
                  i.ytimg.com.
                </li>
              </ul>
              <p>
                There is no YouTube API that returns someone else's video file.
                If you uploaded it, Studio still has the original.
              </p>
            </div>
          </details>
        </section>

        <section className="lg:col-span-7" aria-live="polite">
          {video ? (
            <article className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                <iframe
                  key={video.id}
                  className="aspect-video w-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              </div>

              <div>
                <h2 className="font-display text-2xl leading-snug font-medium text-fg sm:text-3xl">
                  {video.title}
                </h2>
                <a
                  href={video.authorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex min-h-11 items-center text-sm text-muted underline decoration-line underline-offset-4"
                >
                  {video.authorName}
                </a>
              </div>

              <button
                type="button"
                onClick={() => setLinksOpen((open) => !open)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-raised px-4 text-sm font-semibold text-fg"
              >
                <Clapperboard className="size-4" aria-hidden="true" />
                {linksOpen ? "Hide Download Links" : "Download Video"}
              </button>

              {linksOpen ? (
                <div className="rounded-2xl border border-line bg-surface">
                  <p className="border-b border-line px-4 py-3 text-sm leading-relaxed text-muted">
                    Public APIs don't include the video file. These are the
                    links Safari can still make.
                  </p>
                  <ul className="divide-y divide-line">
                    <li>
                      <a
                        href={`/api/poster/${video.id}`}
                        download={`watchbar-${video.id}.jpg`}
                        className="flex min-h-12 items-center gap-3 px-4 py-3"
                      >
                        <ArrowDownToLine className="size-4 shrink-0 text-accent" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-fg">
                            Save poster
                          </span>
                          <span className="block text-xs text-muted">
                            JPEG from YouTube's image host
                          </span>
                        </span>
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => void share()}
                        className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left"
                      >
                        <Share className="size-4 shrink-0 text-accent" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-fg">
                            Share
                          </span>
                          <span className="block text-xs text-muted">
                            {canShare
                              ? "Opens the Safari share sheet"
                              : "Copies the link if there's no share sheet"}
                          </span>
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => void copyLink()}
                        className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left"
                      >
                        <Copy className="size-4 shrink-0 text-accent" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-fg">
                            Copy link
                          </span>
                          <span className="block text-xs text-muted">
                            youtube.com/watch
                          </span>
                        </span>
                      </button>
                    </li>
                    <li>
                      <a
                        href={watchUrl(video.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-h-12 items-center gap-3 px-4 py-3"
                      >
                        <ExternalLink className="size-4 shrink-0 text-accent" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-fg">
                            Open on YouTube
                          </span>
                          <span className="block text-xs text-muted">
                            Hands off to the app on iPad when it's installed
                          </span>
                        </span>
                      </a>
                    </li>
                    {appleTouch ? (
                      <li>
                        <a
                          href={appUrl(video.id)}
                          className="flex min-h-12 items-center gap-3 px-4 py-3"
                        >
                          <Smartphone className="size-4 shrink-0 text-accent" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-fg">
                              Open in the YouTube app
                            </span>
                            <span className="block text-xs text-muted">
                              youtube:// URL scheme
                            </span>
                          </span>
                        </a>
                      </li>
                    ) : null}
                    <li>
                      <a
                        href={studioUrl(video.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-h-12 items-center gap-3 px-4 py-3"
                      >
                        <ArrowDownToLine className="size-4 shrink-0 text-accent" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-fg">
                            Original file in Studio
                          </span>
                          <span className="block text-xs text-muted">
                            Only if you uploaded this video
                          </span>
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
              ) : null}

              <p className="min-h-5 text-sm text-muted">{status}</p>
            </article>
          ) : (
            <div className="flex min-h-80 flex-col justify-end rounded-2xl border border-dashed border-line bg-surface p-6">
              <p className="font-display text-3xl leading-tight font-medium text-fg italic">
                Paste a link. Play it here. Share it from Safari.
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                The old button listed FLV and MP4 itags. YouTube's oEmbed and
                player APIs don't publish those files anymore, so Watchbar
                doesn't pretend they still exist.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
