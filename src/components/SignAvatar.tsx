import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { REST_FRAME, SHAPES, type Frame, type Vec3 } from "@/lib/asl";
import { signQueue } from "@/lib/sign-queue";

const UPPER = 0.28;
const FORE = 0.26;
const SHOULDER_Y = 1.2;
const SHOULDER_X = 0.22;
const DOWN = new THREE.Vector3(0, -1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

const SKIN = "#e9b48f";
const SKIN_DARK = "#d69b74";
const SHIRT = "#12303a";
const SHIRT_LIGHT = "#1b4553";

type ArmState = {
  target: THREE.Vector3;
  curls: number[];
  spread: number;
  wrist: THREE.Euler;
};

type Refs = {
  shoulder: THREE.Group | null;
  elbow: THREE.Group | null;
  hand: THREE.Group | null;
  fingers: (THREE.Group | null)[];
  tips: (THREE.Group | null)[];
};

function makeArmState(t: Vec3): ArmState {
  return {
    target: new THREE.Vector3(...t),
    curls: [0.5, 0.55, 0.55, 0.55, 0.55],
    spread: 0.1,
    wrist: new THREE.Euler(0, 0, 0),
  };
}

/** Two-bone IK: aim the arm so the hand lands on `target`. */
function solveArm(refs: Refs, shoulderPos: THREE.Vector3, state: ArmState, mirror: number) {
  const { shoulder, elbow, hand } = refs;
  if (!shoulder || !elbow || !hand) return;

  const delta = state.target.clone().sub(shoulderPos);
  const d = THREE.MathUtils.clamp(delta.length(), 0.1, UPPER + FORE - 0.015);
  const dir = delta.normalize();

  const cosElbow = (UPPER * UPPER + FORE * FORE - d * d) / (2 * UPPER * FORE);
  const bend = Math.PI - Math.acos(THREE.MathUtils.clamp(cosElbow, -1, 1));
  const tilt = Math.asin(
    THREE.MathUtils.clamp((FORE * Math.sin(bend)) / d, -1, 1),
  );

  const q = new THREE.Quaternion().setFromUnitVectors(DOWN, dir);
  q.multiply(new THREE.Quaternion().setFromAxisAngle(X_AXIS, -tilt));
  shoulder.quaternion.copy(q);
  elbow.rotation.set(bend, 0, 0);

  hand.rotation.set(
    state.wrist.x,
    state.wrist.y * mirror,
    state.wrist.z * mirror,
  );

  refs.fingers.forEach((f, i) => {
    if (!f) return;
    const curl = state.curls[i] ?? 0;
    if (i === 0) {
      f.rotation.set(-0.5, mirror * (0.5 - curl * 0.6), mirror * (0.9 - curl * 1.5));
    } else {
      const fan = (i - 2.5) * state.spread * mirror;
      f.rotation.set(curl * 1.45, fan * 0.4, fan);
    }
    const tip = refs.tips[i];
    if (tip) tip.rotation.set(curl * (i === 0 ? 1.0 : 1.6), 0, 0);
  });
}

function Finger({
  refs,
  index,
  position,
  length,
  radius,
}: {
  refs: Refs;
  index: number;
  position: Vec3;
  length: number;
  radius: number;
}) {
  return (
    <group
      position={position}
      ref={(g) => {
        refs.fingers[index] = g;
      }}
    >
      <mesh position={[0, length / 2, 0]} castShadow>
        <capsuleGeometry args={[radius, length * 0.7, 3, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.75} />
      </mesh>
      <group
        position={[0, length, 0]}
        ref={(g) => {
          refs.tips[index] = g;
        }}
      >
        <mesh position={[0, length / 2.4, 0]} castShadow>
          <capsuleGeometry args={[radius * 0.9, length * 0.5, 3, 8]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
      </group>
    </group>
  );
}

function Arm({ refs, side }: { refs: Refs; side: -1 | 1 }) {
  return (
    <group
      position={[SHOULDER_X * side, SHOULDER_Y, 0]}
      ref={(g) => {
        refs.shoulder = g;
      }}
    >
      <mesh position={[0, -UPPER / 2, 0]} castShadow>
        <capsuleGeometry args={[0.048, UPPER * 0.72, 4, 12]} />
        <meshStandardMaterial color={SHIRT_LIGHT} roughness={0.85} />
      </mesh>
      <group
        position={[0, -UPPER, 0]}
        ref={(g) => {
          refs.elbow = g;
        }}
      >
        <mesh position={[0, -FORE / 2, 0]} castShadow>
          <capsuleGeometry args={[0.042, FORE * 0.7, 4, 12]} />
          <meshStandardMaterial color={SKIN_DARK} roughness={0.8} />
        </mesh>
        {/* hand */}
        <group
          position={[0, -FORE, 0]}
          ref={(g) => {
            refs.hand = g;
          }}
        >
          <group rotation={[Math.PI, 0, 0]}>
            <mesh position={[0, 0.035, 0]} castShadow>
              <boxGeometry args={[0.072, 0.075, 0.03]} />
              <meshStandardMaterial color={SKIN} roughness={0.75} />
            </mesh>
            <Finger refs={refs} index={0} position={[side * 0.038, 0.02, 0.008]} length={0.032} radius={0.014} />
            <Finger refs={refs} index={1} position={[side * 0.026, 0.072, 0]} length={0.036} radius={0.011} />
            <Finger refs={refs} index={2} position={[side * 0.009, 0.075, 0]} length={0.039} radius={0.011} />
            <Finger refs={refs} index={3} position={[side * -0.009, 0.073, 0]} length={0.036} radius={0.0105} />
            <Finger refs={refs} index={4} position={[side * -0.026, 0.068, 0]} length={0.03} radius={0.0095} />
          </group>
        </group>
      </group>
    </group>
  );
}

function Signer() {
  const rightRefs = useRef<Refs>({ shoulder: null, elbow: null, hand: null, fingers: [], tips: [] });
  const leftRefs = useRef<Refs>({ shoulder: null, elbow: null, hand: null, fingers: [], tips: [] });
  const browL = useRef<THREE.Group>(null);
  const browR = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const right = useMemo(() => makeArmState(REST_FRAME.right!.t), []);
  const left = useMemo(() => makeArmState(REST_FRAME.left!.t), []);
  const face = useRef({ brow: 0, mouth: 0 });
  const hold = useRef(0);
  const current = useRef<Frame>(REST_FRAME);
  const idleTimer = useRef(0);

  const rShoulder = useMemo(() => new THREE.Vector3(SHOULDER_X, SHOULDER_Y, 0), []);
  const lShoulder = useMemo(() => new THREE.Vector3(-SHOULDER_X, SHOULDER_Y, 0), []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    hold.current -= dt;

    if (hold.current <= 0) {
      const next = signQueue.next();
      if (next) {
        current.current = next;
        hold.current = next.dur;
        idleTimer.current = 0;
      } else {
        idleTimer.current += dt;
        if (idleTimer.current > 0.6) current.current = REST_FRAME;
        hold.current = 0.15;
      }
    }

    const frame = current.current;
    const k = 1 - Math.exp(-14 * dt);

    const applyTarget = (state: ArmState, arm: Frame["right"], fallback: Vec3) => {
      const t = arm?.t ?? fallback;
      state.target.lerp(new THREE.Vector3(...t), k);
      const s = arm?.shape ?? SHAPES["bent"];
      for (let i = 0; i < 5; i++) {
        const target = s.curls[i] ?? 0;
        state.curls[i] = THREE.MathUtils.lerp(state.curls[i] ?? 0, target, k);
      }
      state.spread = THREE.MathUtils.lerp(state.spread, s.spread, k);
      const w = arm?.wrist ?? [0, 0, 0];
      state.wrist.x = THREE.MathUtils.lerp(state.wrist.x, w[0], k);
      state.wrist.y = THREE.MathUtils.lerp(state.wrist.y, w[1], k);
      state.wrist.z = THREE.MathUtils.lerp(state.wrist.z, w[2], k);
    };

    applyTarget(right, frame.right, REST_FRAME.right!.t);
    applyTarget(left, frame.left, REST_FRAME.left!.t);

    face.current.brow = THREE.MathUtils.lerp(face.current.brow, frame.brow ?? 0, k);
    face.current.mouth = THREE.MathUtils.lerp(face.current.mouth, frame.mouth ?? 0, k);

    solveArm(rightRefs.current, rShoulder, right, 1);
    solveArm(leftRefs.current, lShoulder, left, -1);

    const b = face.current.brow;
    if (browL.current) browL.current.position.y = 1.47 + b * 0.022;
    if (browR.current) browR.current.position.y = 1.47 + b * 0.022;
    if (mouthRef.current) {
      mouthRef.current.scale.y = 1 + face.current.mouth * 2.2;
      mouthRef.current.scale.x = 1 + face.current.mouth * 0.25;
    }

    if (bodyRef.current) {
      const t = performance.now() / 1000;
      bodyRef.current.rotation.y = Math.sin(t * 0.5) * 0.045;
      bodyRef.current.position.y = Math.sin(t * 1.1) * 0.006;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* torso */}
      <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.185, 0.36, 6, 24]} />
        <meshStandardMaterial color={SHIRT} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.19, 0.02]} castShadow>
        <sphereGeometry args={[0.2, 24, 16]} />
        <meshStandardMaterial color={SHIRT_LIGHT} roughness={0.9} />
      </mesh>
      {/* neck + head */}
      <mesh position={[0, 1.32, 0.01]} castShadow>
        <cylinderGeometry args={[0.048, 0.055, 0.09, 16]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.45, 0.01]} castShadow>
        <sphereGeometry args={[0.125, 32, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      {/* hair */}
      <mesh position={[0, 1.5, -0.005]} castShadow>
        <sphereGeometry args={[0.128, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial color="#2a2118" roughness={0.95} />
      </mesh>
      {/* eyes */}
      {[-0.045, 0.045].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.455, 0.113]}>
            <sphereGeometry args={[0.018, 16, 12]} />
            <meshStandardMaterial color="#fdfdfb" roughness={0.35} />
          </mesh>
          <mesh position={[x, 1.455, 0.126]}>
            <sphereGeometry args={[0.009, 12, 10]} />
            <meshStandardMaterial color="#1c1a17" roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* brows */}
      <group ref={browL} position={[0, 1.47, 0]}>
        <mesh position={[-0.045, 0.018, 0.115]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.042, 0.008, 0.012]} />
          <meshStandardMaterial color="#2a2118" roughness={0.9} />
        </mesh>
      </group>
      <group ref={browR} position={[0, 1.47, 0]}>
        <mesh position={[0.045, 0.018, 0.115]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.042, 0.008, 0.012]} />
          <meshStandardMaterial color="#2a2118" roughness={0.9} />
        </mesh>
      </group>
      {/* mouth */}
      <mesh ref={mouthRef} position={[0, 1.398, 0.115]}>
        <boxGeometry args={[0.042, 0.009, 0.012]} />
        <meshStandardMaterial color="#8d4a48" roughness={0.6} />
      </mesh>
      <Arm refs={rightRefs.current} side={1} />
      <Arm refs={leftRefs.current} side={-1} />
    </group>
  );
}

export default function SignAvatar() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.24, 1.35], fov: 34 }}
      onCreated={({ camera }) => camera.lookAt(0, 1.2, 0)}
    >
      <color attach="background" args={["#0a1418"]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[1.4, 2.6, 2.2]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-2, 1.2, 1]} intensity={0.5} color="#7fd8c8" />
      <Environment>
        <Lightformer intensity={1.6} position={[0, 3, 1.5]} scale={[6, 6, 1]} />
        <Lightformer
          intensity={0.7}
          color="#5fc7d6"
          position={[-3, 1, 1]}
          rotation-y={Math.PI / 2}
          scale={[8, 3, 1]}
        />
      </Environment>
      <Signer />
    </Canvas>
  );
}
