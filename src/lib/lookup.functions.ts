import { createServerFn } from "@tanstack/react-start";
import { lookupOEmbed } from "./lookup.server";

const ID = /^[a-zA-Z0-9_-]{11}$/;

export const lookupVideo = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => {
    if (!data || typeof data.id !== "string" || !ID.test(data.id)) {
      throw new Error("Paste a YouTube link.");
    }
    return { id: data.id };
  })
  .handler(async ({ data }) => lookupOEmbed(data.id));
