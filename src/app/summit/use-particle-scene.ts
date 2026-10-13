"use client";

import { useCallback, useState, useSyncExternalStore, type PointerEvent } from "react";

import { ParticleScene } from "./particle-scene";

export function useParticleScene() {
  const [scene] = useState(() => new ParticleScene());
  const phase = useSyncExternalStore(scene.subscribe, scene.getPhase, () => 0);
  const canvasRef = useCallback((canvas: HTMLCanvasElement) => scene.attach(canvas), [scene]);

  return {
    canvasRef,
    phase,
    formationIds: scene.formations.map((formation) => formation.id),
    goTo: scene.goTo,
    onPointerMove: (event: PointerEvent) => scene.setPointer(event.clientX, event.clientY),
    onPointerLeave: () => scene.setPointer(null, null),
  };
}
