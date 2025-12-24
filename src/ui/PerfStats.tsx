import { useRef } from "react";
import { Stats } from "@react-three/drei";

type PerfStatsProps = {
  visible: boolean;
};

export const PerfStats = ({ visible }: PerfStatsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!visible) return null;

  return (
    <div className="perf-wrapper" aria-live="polite" ref={containerRef}>
      <Stats
        className="perf-stats"
        showPanel={0}
        parent={containerRef}
      />
    </div>
  );
};
