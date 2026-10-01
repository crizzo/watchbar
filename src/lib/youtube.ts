const ID = /^[a-zA-Z0-9_-]{11}$/;

const PATTERNS = [
  /[?&]v=([a-zA-Z0-9_-]{11})/,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/,
];

export function parseYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (ID.test(trimmed)) return trimmed;
  for (const pattern of PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function embedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}

export function appUrl(id: string): string {
  return `youtube://watch?v=${id}`;
}

export function studioUrl(id: string): string {
  return `https://studio.youtube.com/video/${id}/edit`;
}

export type VideoMeta = {
  id: string;
  title: string;
  authorName: string;
  authorUrl: string;
};

export type RecentVideo = VideoMeta & { at: number };

const RECENT_KEY = "watchbar.recent";

export function readRecent(): RecentVideo[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecent).slice(0, 8);
  } catch {
    return [];
  }
}

export function writeRecent(video: VideoMeta): RecentVideo[] {
  const next: RecentVideo[] = [
    { ...video, at: Date.now() },
    ...readRecent().filter((item) => item.id !== video.id),
  ].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

function isRecent(value: unknown): value is RecentVideo {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    ID.test(row.id) &&
    typeof row.title === "string" &&
    typeof row.authorName === "string" &&
    typeof row.authorUrl === "string" &&
    typeof row.at === "number"
  );
}
