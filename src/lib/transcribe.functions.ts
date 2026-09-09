import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  /** base64-encoded 16 kHz mono WAV file */
  audio: z.string().min(64),
});

export const transcribeWindow = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Transcription is not configured.");

    const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
    if (bytes.byteLength < 2048) return { text: "" };
    if (bytes.byteLength > 20 * 1024 * 1024) {
      throw new Error("That audio clip is too large.");
    }

    const form = new FormData();
    form.append("model", "google/gemini-3.5-transcribe");
    form.append("file", new Blob([bytes], { type: "audio/wav" }), "window.wav");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`Transcription failed [${res.status}]: ${body}`);
      throw new Error(
        res.status === 429
          ? "Too many requests right now — pause the video for a moment."
          : `Transcription failed (${res.status}). ${body.slice(0, 200)}`,
      );
    }

    const json = (await res.json()) as { text?: string };
    return { text: (json.text ?? "").trim() };
  });
