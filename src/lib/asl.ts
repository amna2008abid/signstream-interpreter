/**
 * A very small ASL model: hand shapes, a dictionary of common word signs, and
 * fingerspelling as a fallback. Signs are approximations meant to be readable,
 * not a replacement for a human interpreter.
 */

export type Vec3 = [number, number, number];

export type HandShape = {
  /** curl per finger: thumb, index, middle, ring, pinky (0 = straight, 1 = closed) */
  curls: [number, number, number, number, number];
  /** how far the fingers fan apart */
  spread: number;
};

export type ArmFrame = {
  /** hand target position in avatar space */
  t: Vec3;
  shape: HandShape;
  /** extra wrist rotation (euler, radians) */
  wrist?: Vec3;
};

export type Frame = {
  label: string;
  dur: number;
  right?: ArmFrame;
  left?: ArmFrame;
  /** eyebrow raise, -1..1 */
  brow?: number;
  /** mouth openness 0..1 */
  mouth?: number;
};

const shape = (
  curls: [number, number, number, number, number],
  spread = 0.25,
): HandShape => ({ curls, spread });

export const SHAPES: Record<string, HandShape> = {
  fist: shape([0.9, 1, 1, 1, 1], 0),
  flat: shape([0.6, 0, 0, 0, 0], 0.05),
  open: shape([0, 0, 0, 0, 0], 0.5),
  claw: shape([0.45, 0.45, 0.45, 0.45, 0.45], 0.4),
  point: shape([0.9, 0, 1, 1, 1], 0.1),
  two: shape([0.9, 0, 0, 1, 1], 0.55),
  three: shape([0, 0, 0, 1, 1], 0.5),
  pinch: shape([0.7, 0.7, 0.1, 0.05, 0.05], 0.35),
  ok: shape([0.8, 0.8, 0, 0, 0], 0.4),
  thumb: shape([0, 1, 1, 1, 1], 0),
  pinky: shape([1, 1, 1, 1, 0], 0.2),
  horns: shape([0, 1, 1, 1, 0], 0.3),
  cup: shape([0.35, 0.35, 0.35, 0.35, 0.35], 0.15),
  bent: shape([0.5, 0.55, 0.55, 0.55, 0.55], 0.1),
};

/** ASL manual alphabet, approximated with curls + wrist orientation. */
export const LETTERS: Record<string, ArmFrame["shape"] & { wrist?: Vec3 }> = {
  A: { ...shape([0, 1, 1, 1, 1], 0) },
  B: { ...shape([1, 0, 0, 0, 0], 0.02) },
  C: { ...shape([0.4, 0.4, 0.4, 0.4, 0.4], 0.12) },
  D: { ...shape([0.55, 0, 0.9, 0.95, 0.95], 0.05) },
  E: { ...shape([0.85, 0.8, 0.8, 0.8, 0.8], 0.02) },
  F: { ...shape([0.8, 0.8, 0, 0, 0], 0.35) },
  G: { ...shape([0.2, 0.15, 1, 1, 1], 0.05), wrist: [0, 0, -0.8] },
  H: { ...shape([1, 0, 0, 1, 1], 0.05), wrist: [0, 0, -0.8] },
  I: { ...shape([1, 1, 1, 1, 0], 0.1) },
  J: { ...shape([1, 1, 1, 1, 0], 0.1), wrist: [0, 0, 0.5] },
  K: { ...shape([0.15, 0, 0, 1, 1], 0.4) },
  L: { ...shape([0, 0, 1, 1, 1], 0.5) },
  M: { ...shape([1, 0.85, 0.85, 0.85, 1], 0.02) },
  N: { ...shape([1, 0.85, 0.85, 1, 1], 0.02) },
  O: { ...shape([0.7, 0.7, 0.7, 0.7, 0.7], 0.05) },
  P: { ...shape([0.15, 0, 0, 1, 1], 0.4), wrist: [0.9, 0, 0] },
  Q: { ...shape([0.2, 0.15, 1, 1, 1], 0.05), wrist: [0.9, 0, 0] },
  R: { ...shape([1, 0.1, 0.2, 1, 1], 0) },
  S: { ...shape([0.95, 1, 1, 1, 1], 0) },
  T: { ...shape([0.6, 0.9, 1, 1, 1], 0) },
  U: { ...shape([1, 0, 0, 1, 1], 0.02) },
  V: { ...shape([1, 0, 0, 1, 1], 0.55) },
  W: { ...shape([1, 0, 0, 0, 1], 0.5) },
  X: { ...shape([1, 0.6, 1, 1, 1], 0) },
  Y: { ...shape([0, 1, 1, 1, 0], 0.4) },
  Z: { ...shape([0.9, 0, 1, 1, 1], 0.1), wrist: [0, 0, -0.4] },
};

/* Named positions in avatar space (y up, z toward the viewer). */
const P = {
  rest: [0.26, 0.78, 0.06] as Vec3,
  restL: [-0.26, 0.78, 0.06] as Vec3,
  sign: [0.2, 1.14, 0.3] as Vec3,
  signL: [-0.2, 1.14, 0.3] as Vec3,
  low: [0.22, 0.95, 0.28] as Vec3,
  lowL: [-0.22, 0.95, 0.28] as Vec3,
  chest: [0.06, 1.12, 0.22] as Vec3,
  chestL: [-0.06, 1.12, 0.22] as Vec3,
  chin: [0.1, 1.34, 0.2] as Vec3,
  mouth: [0.06, 1.38, 0.2] as Vec3,
  cheek: [0.16, 1.4, 0.16] as Vec3,
  temple: [0.19, 1.52, 0.12] as Vec3,
  forehead: [0.1, 1.56, 0.16] as Vec3,
  outFwd: [0.24, 1.22, 0.46] as Vec3,
  outSide: [0.44, 1.28, 0.24] as Vec3,
  outSideL: [-0.44, 1.28, 0.24] as Vec3,
  high: [0.3, 1.56, 0.3] as Vec3,
  highL: [-0.3, 1.56, 0.3] as Vec3,
  spellPos: [0.24, 1.2, 0.34] as Vec3,
};

export const REST_FRAME: Frame = {
  label: "",
  dur: 0.5,
  right: { t: P.rest, shape: SHAPES.bent },
  left: { t: P.restL, shape: SHAPES.bent },
  brow: 0,
  mouth: 0,
};

type Key = keyof typeof P;
type Step = {
  r?: [Key, keyof typeof SHAPES] | [Key, keyof typeof SHAPES, Vec3];
  l?: [Key, keyof typeof SHAPES] | [Key, keyof typeof SHAPES, Vec3];
  d?: number;
  brow?: number;
  mouth?: number;
};

function build(label: string, steps: Step[]): Frame[] {
  return steps.map((s) => ({
    label,
    dur: s.d ?? 0.34,
    right: s.r ? { t: P[s.r[0]], shape: SHAPES[s.r[1]], wrist: s.r[2] } : undefined,
    left: s.l ? { t: P[s.l[0]], shape: SHAPES[s.l[1]], wrist: s.l[2] } : undefined,
    brow: s.brow,
    mouth: s.mouth,
  }));
}

/** Word -> sign keyframes. Synonyms map onto the same sign. */
export const SIGNS: Record<string, Frame[]> = {
  HELLO: build("HELLO", [
    { r: ["temple", "flat"] },
    { r: ["outSide", "flat"], d: 0.3 },
  ]),
  HI: build("HI", [{ r: ["temple", "flat"] }, { r: ["outSide", "flat"], d: 0.3 }]),
  WELCOME: build("WELCOME", [
    { r: ["outFwd", "flat"] },
    { r: ["chest", "flat"], d: 0.3 },
  ]),
  BYE: build("BYE", [{ r: ["high", "open"] }, { r: ["high", "flat"], d: 0.25 }]),
  YES: build("YES", [
    { r: ["sign", "fist"], d: 0.2 },
    { r: ["sign", "fist", [0.7, 0, 0]], d: 0.2 },
  ]),
  NO: build("NO", [
    { r: ["sign", "two"], d: 0.2 },
    { r: ["sign", "pinch"], d: 0.2, brow: -0.4 },
  ]),
  NOT: build("NOT", [{ r: ["chin", "thumb"] }, { r: ["outFwd", "thumb"], d: 0.25 }]),
  THANKS: build("THANK YOU", [
    { r: ["mouth", "flat"] },
    { r: ["outFwd", "flat"], d: 0.32 },
  ]),
  PLEASE: build("PLEASE", [
    { r: ["chest", "flat"], d: 0.3 },
    { r: ["low", "flat"], d: 0.3 },
  ]),
  SORRY: build("SORRY", [
    { r: ["chest", "fist"], d: 0.3 },
    { r: ["chest", "fist", [0, 0, 0.5]], d: 0.3 },
  ]),
  ME: build("ME", [{ r: ["chest", "point"], d: 0.3 }]),
  YOU: build("YOU", [{ r: ["outFwd", "point"], d: 0.3 }]),
  WE: build("WE", [{ r: ["chest", "point"] }, { r: ["outSide", "point"], d: 0.3 }]),
  THEY: build("THEY", [{ r: ["outSide", "point"], d: 0.3 }]),
  GOOD: build("GOOD", [
    { r: ["mouth", "flat"] },
    { r: ["chest", "flat"], l: ["chestL", "flat"], d: 0.3 },
  ]),
  BAD: build("BAD", [
    { r: ["mouth", "flat"] },
    { r: ["low", "flat", [0, 0, 2.6]], d: 0.3, brow: -0.5 },
  ]),
  LOVE: build("LOVE", [
    { r: ["chest", "fist"], l: ["chestL", "fist"], d: 0.5 },
  ]),
  LIKE: build("LIKE", [
    { r: ["chest", "three"] },
    { r: ["outFwd", "pinch"], d: 0.3 },
  ]),
  WANT: build("WANT", [
    { r: ["outFwd", "claw"], l: ["outSideL", "claw"] },
    { r: ["low", "claw"], l: ["lowL", "claw"], d: 0.3 },
  ]),
  NEED: build("NEED", [
    { r: ["sign", "point", [0.6, 0, 0]] },
    { r: ["low", "point", [1.2, 0, 0]], d: 0.28 },
  ]),
  HELP: build("HELP", [
    { r: ["low", "thumb"], l: ["lowL", "flat"] },
    { r: ["sign", "thumb"], l: ["signL", "flat"], d: 0.3 },
  ]),
  KNOW: build("KNOW", [{ r: ["forehead", "flat"], d: 0.35 }]),
  THINK: build("THINK", [{ r: ["forehead", "point"], d: 0.35 }]),
  SEE: build("SEE", [{ r: ["cheek", "two"] }, { r: ["outFwd", "two"], d: 0.3 }]),
  LOOK: build("LOOK", [{ r: ["cheek", "two"] }, { r: ["outFwd", "two"], d: 0.3 }]),
  HEAR: build("HEAR", [{ r: ["temple", "point"], d: 0.35 }]),
  DEAF: build("DEAF", [
    { r: ["temple", "point"], d: 0.28 },
    { r: ["chin", "point"], d: 0.28 },
  ]),
  SAY: build("SAY", [
    { r: ["mouth", "point"] },
    { r: ["outFwd", "point"], d: 0.28 },
  ]),
  TALK: build("TALK", [
    { r: ["mouth", "two"] },
    { r: ["outFwd", "two"], d: 0.28 },
  ]),
  SIGN: build("SIGN", [
    { r: ["sign", "point"], l: ["lowL", "point"] },
    { r: ["low", "point"], l: ["signL", "point"], d: 0.3 },
  ]),
  GO: build("GO", [{ r: ["sign", "point"] }, { r: ["outFwd", "point"], d: 0.3 }]),
  COME: build("COME", [{ r: ["outFwd", "point"] }, { r: ["chest", "point"], d: 0.3 }]),
  STOP: build("STOP", [
    { r: ["low", "flat", [0, 0, -1.4]], l: ["lowL", "flat"], d: 0.4 },
  ]),
  FINISH: build("FINISH", [
    { r: ["sign", "open", [0, 0, -1.2]], l: ["signL", "open", [0, 0, 1.2]] },
    { r: ["outSide", "open"], l: ["outSideL", "open"], d: 0.3 },
  ]),
  MORE: build("MORE", [
    { r: ["sign", "cup"], l: ["signL", "cup"], d: 0.24 },
    { r: ["chest", "cup"], l: ["chestL", "cup"], d: 0.24 },
  ]),
  AGAIN: build("AGAIN", [
    { r: ["outSide", "bent"], l: ["signL", "flat"] },
    { r: ["chest", "bent"], l: ["signL", "flat"], d: 0.3 },
  ]),
  EAT: build("EAT", [
    { r: ["mouth", "cup"], d: 0.25 },
    { r: ["chin", "cup"], d: 0.25 },
  ]),
  DRINK: build("DRINK", [
    { r: ["chin", "cup", [0.5, 0, 0]], d: 0.25 },
    { r: ["mouth", "cup", [1.1, 0, 0]], d: 0.25 },
  ]),
  WATER: build("WATER", [
    { r: ["chin", "three"], d: 0.22 },
    { r: ["mouth", "three"], d: 0.22 },
  ]),
  WORK: build("WORK", [
    { r: ["sign", "fist"], l: ["signL", "fist"], d: 0.22 },
    { r: ["low", "fist"], l: ["signL", "fist"], d: 0.22 },
  ]),
  HOME: build("HOME", [
    { r: ["chin", "pinch"], d: 0.26 },
    { r: ["cheek", "pinch"], d: 0.26 },
  ]),
  SCHOOL: build("SCHOOL", [
    { r: ["sign", "flat"], l: ["signL", "flat"], d: 0.22 },
    { r: ["low", "flat"], l: ["signL", "flat"], d: 0.22 },
  ]),
  LEARN: build("LEARN", [
    { r: ["lowL", "claw"], l: ["lowL", "flat"] },
    { r: ["forehead", "pinch"], l: ["lowL", "flat"], d: 0.32 },
  ]),
  TEACH: build("TEACH", [
    { r: ["temple", "pinch"], l: ["highL", "pinch"] },
    { r: ["outFwd", "pinch"], l: ["outSideL", "pinch"], d: 0.3 },
  ]),
  FRIEND: build("FRIEND", [
    { r: ["sign", "point", [1.2, 0, 0]], l: ["signL", "point", [-1.2, 0, 0]] },
    { r: ["sign", "point", [-1.2, 0, 0]], l: ["signL", "point", [1.2, 0, 0]], d: 0.3 },
  ]),
  FAMILY: build("FAMILY", [
    { r: ["sign", "fist"], l: ["signL", "fist"] },
    { r: ["outSide", "fist"], l: ["outSideL", "fist"], d: 0.3 },
  ]),
  MOTHER: build("MOTHER", [{ r: ["chin", "open"], d: 0.35 }]),
  FATHER: build("FATHER", [{ r: ["forehead", "open"], d: 0.35 }]),
  PEOPLE: build("PEOPLE", [
    { r: ["sign", "pinky"], l: ["signL", "pinky"], d: 0.22 },
    { r: ["low", "pinky"], l: ["lowL", "pinky"], d: 0.22 },
  ]),
  NAME: build("NAME", [
    { r: ["sign", "two", [0, 0, -1]], l: ["signL", "two"], d: 0.22 },
    { r: ["chest", "two", [0, 0, -1]], l: ["signL", "two"], d: 0.22 },
  ]),
  WHAT: build("WHAT", [
    { r: ["sign", "open", [0, 0, -1.4]], l: ["signL", "open", [0, 0, 1.4]], d: 0.4, brow: -0.6 },
  ]),
  WHERE: build("WHERE", [
    { r: ["sign", "point", [0, 0, 0.4]], d: 0.2, brow: -0.6 },
    { r: ["sign", "point", [0, 0, -0.4]], d: 0.2, brow: -0.6 },
  ]),
  WHO: build("WHO", [{ r: ["chin", "point"], d: 0.35, brow: -0.6 }]),
  WHY: build("WHY", [
    { r: ["forehead", "flat"], d: 0.24, brow: -0.6 },
    { r: ["cheek", "horns"], d: 0.24, brow: -0.6 },
  ]),
  HOW: build("HOW", [
    { r: ["chest", "bent"], l: ["chestL", "bent"], d: 0.4, brow: -0.6 },
  ]),
  WHEN: build("WHEN", [
    { r: ["outFwd", "point"], l: ["signL", "point"], d: 0.4, brow: -0.6 },
  ]),
  TIME: build("TIME", [
    { r: ["signL", "point"], l: ["signL", "fist"], d: 0.22 },
    { r: ["chestL", "point"], l: ["signL", "fist"], d: 0.22 },
  ]),
  NOW: build("NOW", [
    { r: ["sign", "horns"], l: ["signL", "horns"] },
    { r: ["low", "horns"], l: ["lowL", "horns"], d: 0.26 },
  ]),
  TODAY: build("TODAY", [
    { r: ["sign", "horns"], l: ["signL", "horns"] },
    { r: ["low", "horns"], l: ["lowL", "horns"], d: 0.26 },
  ]),
  DAY: build("DAY", [
    { r: ["high", "point"], l: ["signL", "flat"] },
    { r: ["signL", "point"], l: ["signL", "flat"], d: 0.34 },
  ]),
  NIGHT: build("NIGHT", [
    { r: ["low", "flat", [0, 0, -2.4]], l: ["lowL", "flat"], d: 0.4 },
  ]),
  HAPPY: build("HAPPY", [
    { r: ["chest", "flat"], d: 0.2, mouth: 0.6 },
    { r: ["sign", "flat"], d: 0.2, mouth: 0.6 },
  ]),
  SAD: build("SAD", [
    { r: ["forehead", "open"], d: 0.25, brow: -0.5 },
    { r: ["chin", "open"], d: 0.3, brow: -0.5 },
  ]),
  BIG: build("BIG", [
    { r: ["sign", "horns"], l: ["signL", "horns"] },
    { r: ["outSide", "horns"], l: ["outSideL", "horns"], d: 0.3 },
  ]),
  SMALL: build("SMALL", [
    { r: ["outSide", "flat"], l: ["outSideL", "flat"] },
    { r: ["sign", "flat"], l: ["signL", "flat"], d: 0.3 },
  ]),
  HOT: build("HOT", [{ r: ["mouth", "claw"] }, { r: ["outFwd", "claw"], d: 0.28 }]),
  COLD: build("COLD", [
    { r: ["sign", "fist"], l: ["signL", "fist"], d: 0.2, brow: -0.3 },
    { r: ["chest", "fist"], l: ["chestL", "fist"], d: 0.2, brow: -0.3 },
  ]),
  MONEY: build("MONEY", [
    { r: ["signL", "flat"], l: ["signL", "flat"], d: 0.22 },
    { r: ["chestL", "flat"], l: ["signL", "flat"], d: 0.22 },
  ]),
  PLAY: build("PLAY", [
    { r: ["sign", "horns", [0, 0, 0.6]], l: ["signL", "horns", [0, 0, -0.6]], d: 0.22 },
    { r: ["sign", "horns", [0, 0, -0.6]], l: ["signL", "horns", [0, 0, 0.6]], d: 0.22 },
  ]),
  MUSIC: build("MUSIC", [
    { r: ["signL", "flat"], l: ["signL", "flat"], d: 0.22 },
    { r: ["highL", "flat"], l: ["signL", "flat"], d: 0.22 },
  ]),
  VIDEO: build("VIDEO", [
    { r: ["sign", "three"], l: ["signL", "flat"], d: 0.22 },
    { r: ["high", "three"], l: ["signL", "flat"], d: 0.22 },
  ]),
  WORLD: build("WORLD", [
    { r: ["high", "horns"], l: ["signL", "horns"] },
    { r: ["signL", "horns"], l: ["signL", "horns"], d: 0.3 },
  ]),
  CAN: build("CAN", [
    { r: ["sign", "fist"], l: ["signL", "fist"] },
    { r: ["low", "fist"], l: ["lowL", "fist"], d: 0.28 },
  ]),
  WILL: build("WILL", [{ r: ["cheek", "flat"] }, { r: ["outFwd", "flat"], d: 0.3 }]),
  AND: build("AND", [{ r: ["sign", "open"] }, { r: ["outSide", "pinch"], d: 0.26 }]),
  BUT: build("BUT", [
    { r: ["sign", "point", [0, 0, 0.8]], l: ["signL", "point", [0, 0, -0.8]] },
    { r: ["outSide", "point"], l: ["outSideL", "point"], d: 0.3 },
  ]),
  UNDERSTAND: build("UNDERSTAND", [
    { r: ["forehead", "fist"], d: 0.22 },
    { r: ["forehead", "point"], d: 0.26 },
  ]),
};

const SYNONYMS: Record<string, string> = {
  HEY: "HI",
  HELLOS: "HELLO",
  THANK: "THANKS",
  "THANK-YOU": "THANKS",
  THANKYOU: "THANKS",
  I: "ME",
  MY: "ME",
  MINE: "ME",
  YOUR: "YOU",
  YOURS: "YOU",
  US: "WE",
  OUR: "WE",
  THEM: "THEY",
  THEIR: "THEY",
  HIS: "THEY",
  HER: "THEY",
  HIM: "THEY",
  SHE: "THEY",
  HE: "THEY",
  GREAT: "GOOD",
  NICE: "GOOD",
  FINE: "GOOD",
  WELL: "GOOD",
  AWFUL: "BAD",
  TERRIBLE: "BAD",
  WRONG: "BAD",
  LOVES: "LOVE",
  LOVED: "LOVE",
  LIKES: "LIKE",
  LIKED: "LIKE",
  WANTS: "WANT",
  WANTED: "WANT",
  NEEDS: "NEED",
  HELPS: "HELP",
  HELPED: "HELP",
  HELPING: "HELP",
  KNOWS: "KNOW",
  KNEW: "KNOW",
  THINKS: "THINK",
  THOUGHT: "THINK",
  SAW: "SEE",
  SEEN: "SEE",
  SEES: "SEE",
  WATCH: "LOOK",
  LOOKING: "LOOK",
  LISTEN: "HEAR",
  HEARD: "HEAR",
  SAID: "SAY",
  SAYS: "SAY",
  TELL: "SAY",
  SPEAK: "TALK",
  TALKING: "TALK",
  SIGNS: "SIGN",
  SIGNING: "SIGN",
  SIGNED: "SIGN",
  GOES: "GO",
  WENT: "GO",
  GOING: "GO",
  COMES: "COME",
  CAME: "COME",
  STOPPED: "STOP",
  DONE: "FINISH",
  FINISHED: "FINISH",
  OVER: "FINISH",
  ANOTHER: "AGAIN",
  REPEAT: "AGAIN",
  EATING: "EAT",
  ATE: "EAT",
  FOOD: "EAT",
  DRINKING: "DRINK",
  WORKING: "WORK",
  JOB: "WORK",
  HOUSE: "HOME",
  CLASS: "SCHOOL",
  LEARNING: "LEARN",
  STUDY: "LEARN",
  TEACHER: "TEACH",
  TEACHING: "TEACH",
  FRIENDS: "FRIEND",
  MOM: "MOTHER",
  MAMA: "MOTHER",
  DAD: "FATHER",
  PAPA: "FATHER",
  PERSON: "PEOPLE",
  EVERYONE: "PEOPLE",
  NAMED: "NAME",
  HUGE: "BIG",
  LARGE: "BIG",
  LITTLE: "SMALL",
  TINY: "SMALL",
  WARM: "HOT",
  FREEZING: "COLD",
  CASH: "MONEY",
  PLAYING: "PLAY",
  PLAYED: "PLAY",
  SONG: "MUSIC",
  MOVIE: "VIDEO",
  FILM: "VIDEO",
  EARTH: "WORLD",
  COULD: "CAN",
  ABLE: "CAN",
  GONNA: "WILL",
  YEAH: "YES",
  YEP: "YES",
  OK: "YES",
  OKAY: "YES",
  NOPE: "NO",
  NAH: "NO",
  DONT: "NOT",
  "DON'T": "NOT",
  CANT: "NOT",
  "CAN'T": "NOT",
  NEVER: "NOT",
  UNDERSTOOD: "UNDERSTAND",
  KNOWN: "KNOW",
  HAPPINESS: "HAPPY",
  GLAD: "HAPPY",
  UNHAPPY: "SAD",
  TONIGHT: "NIGHT",
  TIMES: "TIME",
  MOMENT: "TIME",
};

/** Words we skip because ASL does not sign them. */
const SKIP = new Set([
  "A",
  "AN",
  "THE",
  "IS",
  "ARE",
  "AM",
  "BE",
  "BEEN",
  "WAS",
  "WERE",
  "OF",
  "TO",
  "DO",
  "DOES",
  "DID",
  "SO",
  "UH",
  "UM",
  "AH",
  "OH",
]);

const clean = (w: string) => w.toUpperCase().replace(/[^A-Z'-]/g, "");

/** Turn spoken text into a queue of sign keyframes. */
export function textToFrames(text: string): Frame[] {
  const out: Frame[] = [];
  for (const raw of text.split(/\s+/)) {
    const w = clean(raw);
    if (!w || SKIP.has(w)) continue;
    const key = SIGNS[w] ? w : SYNONYMS[w] && SIGNS[SYNONYMS[w]] ? SYNONYMS[w] : null;
    if (key) {
      out.push(...SIGNS[key].map((f) => ({ ...f })));
      continue;
    }
    // Fingerspell anything we do not have a sign for.
    const letters = w.replace(/[^A-Z]/g, "").slice(0, 12);
    if (!letters) continue;
    for (const ch of letters) {
      const l = LETTERS[ch];
      if (!l) continue;
      const { wrist, ...s } = l;
      out.push({
        label: `${w} · ${ch}`,
        dur: 0.28,
        right: { t: P.spellPos, shape: s as HandShape, wrist },
      });
    }
  }
  return out;
}

export const DICTIONARY_SIZE = Object.keys(SIGNS).length;
