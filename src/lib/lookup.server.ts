import type { VideoMeta } from "./youtube";

export async function lookupOEmbed(id: string): Promise<VideoMeta> {
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("YouTube didn't answer. Try that link again.");
  }

  if (!response.ok) {
    throw new Error("YouTube doesn't have that video, or it isn't public.");
  }

  const body = (await response.json()) as {
    title?: unknown;
    author_name?: unknown;
    author_url?: unknown;
  };

  if (typeof body.title !== "string" || typeof body.author_name !== "string") {
    throw new Error("YouTube sent back a video we couldn't read.");
  }

  const authorUrl =
    typeof body.author_url === "string" && body.author_url.startsWith("https://www.youtube.com/")
      ? body.author_url
      : "https://www.youtube.com/";

  return {
    id,
    title: body.title,
    authorName: body.author_name,
    authorUrl,
  };
}
