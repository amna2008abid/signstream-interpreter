import { textToFrames, type Frame } from "./asl";

/**
 * Tiny queue shared between the page (which pushes transcribed text) and the
 * 3D interpreter (which pulls keyframes inside its animation loop).
 */
type Listener = (label: string, pending: number) => void;

const queue: Frame[] = [];
let listeners: Listener[] = [];
let label = "";

function emit() {
  for (const l of listeners) l(label, queue.length);
}

export const signQueue = {
  push(text: string) {
    const frames = textToFrames(text);
    if (!frames.length) return 0;
    queue.push(...frames);
    emit();
    return frames.length;
  },
  next(): Frame | null {
    const f = queue.shift() ?? null;
    if (f && f.label && f.label !== label) {
      label = f.label;
      emit();
    } else if (f) {
      emit();
    }
    return f;
  },
  clear() {
    queue.length = 0;
    label = "";
    emit();
  },
  get size() {
    return queue.length;
  },
  subscribe(l: Listener) {
    listeners.push(l);
    l(label, queue.length);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  },
};
