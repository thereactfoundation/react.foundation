"use client";

import styles from "./summit.module.css";
import { useParticleScene } from "./use-particle-scene";

export function SummitMotion() {
  const { canvasRef, timelineRef, phase, formationIds, goTo, onPointerMove, onPointerLeave } = useParticleScene();

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-md lg:max-w-[34rem]"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div ref={timelineRef} role="group" aria-label="Summit themes" className="absolute inset-x-[6%] bottom-0">
        <div className="absolute inset-x-0 top-3 h-px bg-border" aria-hidden="true" />
        <div className={`${styles.timelineFill} absolute inset-x-0 top-3 h-px bg-primary`} aria-hidden="true" />
        <div className="relative grid grid-cols-4">
          {formationIds.map((id, index) => (
            <button
              key={id}
              type="button"
              aria-pressed={index === phase}
              onClick={() => goTo(index)}
              className="group flex flex-col items-center gap-2.5 pt-[0.4375rem] font-mono text-xs"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                  index === phase ? "border-primary bg-primary/25" : "border-border bg-background group-hover:border-primary/60"
                }`}
                aria-hidden="true"
              />
              <span
                className={`transition-colors ${
                  index === phase ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {id}
              </span>
            </button>
          ))}
        </div>
        <div className={`${styles.timelineBall} pointer-events-none absolute inset-x-0 top-3`} aria-hidden="true">
          <span className="absolute left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.18),0_0_14px_hsl(var(--primary)/0.55)]" />
        </div>
      </div>
    </div>
  );
}
