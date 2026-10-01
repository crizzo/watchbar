import { createFileRoute } from "@tanstack/react-router";

const ID = /^[a-zA-Z0-9_-]{11}$/;

const sourcesFor = (id: string) => [
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
];

export const Route = createFileRoute("/api/poster/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!ID.test(params.id)) {
          return new Response("Bad id", { status: 400 });
        }

        for (const src of sourcesFor(params.id)) {
          try {
            const res = await fetch(src, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) continue;
            const bytes = new Uint8Array(await res.arrayBuffer());
            if (bytes.byteLength < 4000) continue;
            return new Response(bytes, {
              headers: {
                "Content-Type": "image/jpeg",
                "Content-Disposition": `attachment; filename="watchbar-${params.id}.jpg"`,
                "Cache-Control": "public, max-age=86400",
              },
            });
          } catch {
            continue;
          }
        }

        return new Response("No poster", { status: 404 });
      },
    },
  },
});
