"use client";

import { PHASE_SECONDS } from "./particle-scene";
import styles from "./summit.module.css";
import { useParticleScene } from "./use-particle-scene";

export function SummitMotion() {
  const { canvasRef, phase, formationIds, goTo, onPointerMove, onPointerLeave } = useParticleScene();

  return (
    <div
      className="relative mx-auto hidden aspect-square w-full max-w-[34rem] lg:block"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div role="group" aria-label="Summit themes" className="absolute inset-x-0 bottom-0 flex justify-center gap-2">
        {formationIds.map((id, index) => (
          <button
            key={id}
            type="button"
            aria-pressed={index === phase}
            onClick={() => goTo(index)}
            className={`relative overflow-hidden rounded-full border px-3 py-1.5 font-mono text-xs backdrop-blur transition-colors ${
              index === phase
                ? "border-primary/40 bg-card/90 text-foreground"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {index === phase ? (
              <span
                key={phase}
                className={`${styles.chipProgress} absolute inset-0 bg-primary/15`}
                style={{ animationDuration: `${PHASE_SECONDS}s` }}
                aria-hidden="true"
              />
            ) : null}
            <span className="relative">{id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
