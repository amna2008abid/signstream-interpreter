/**
 * Captures the sound of the shared browser tab and hands back complete WAV
 * files in fixed windows, so each upload is independently decodable.
 */

export type CaptureHandle = {
  stop: () => void;
  stream: MediaStream;
};

const TARGET_RATE = 16000;

function downsample(input: Float32Array, from: number, to: number): Float32Array {
  if (to >= from) return input;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

export function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let off = 0;
  for (const c of chunks) {
    merged.set(c, off);
    off += c.length;
  }
  const samples = downsample(merged, sampleRate, TARGET_RATE);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_RATE, true);
  view.setUint32(28, TARGET_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let p = 44;
  for (const s of samples) {
    const v = Math.max(-1, Math.min(1, s));
    view.setInt16(p, v < 0 ? v * 0x8000 : v * 0x7fff, true);
    p += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

/** Peak level of a window, used to skip silence. */
export function peak(chunks: Float32Array[]): number {
  let max = 0;
  for (const c of chunks) for (const s of c) max = Math.max(max, Math.abs(s));
  return max;
}

export async function captureTabAudio(opts: {
  windowMs: number;
  onWindow: (wav: Blob, level: number) => void;
  onEnded: () => void;
}): Promise<CaptureHandle> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });

  if (!stream.getAudioTracks().length) {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error("NO_AUDIO");
  }
  // We only need the sound, not the picture.
  stream.getVideoTracks().forEach((t) => t.stop());

  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const node = ctx.createScriptProcessor(4096, 1, 1);
  let chunks: Float32Array[] = [];
  let last = performance.now();
  let stopped = false;

  node.onaudioprocess = (e) => {
    if (stopped) return;
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    const now = performance.now();
    if (now - last >= opts.windowMs) {
      const level = peak(chunks);
      const wav = encodeWav(chunks, ctx.sampleRate);
      chunks = [];
      last = now;
      opts.onWindow(wav, level);
    }
  };

  source.connect(node);
  // Keep the graph alive without playing the audio back.
  const mute = ctx.createGain();
  mute.gain.value = 0;
  node.connect(mute);
  mute.connect(ctx.destination);

  const stop = () => {
    if (stopped) return;
    stopped = true;
    node.onaudioprocess = null;
    try {
      node.disconnect();
      source.disconnect();
      mute.disconnect();
    } catch {
      /* already torn down */
    }
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close();
  };

  stream.getAudioTracks()[0].addEventListener("ended", () => {
    stop();
    opts.onEnded();
  });

  return { stop, stream };
}
