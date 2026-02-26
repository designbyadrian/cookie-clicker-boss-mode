/**
 * Displays prestige/legacy like the main game: "+N" and a progress bar
 * towards the next prestige level; when the bar passes full, the next level is shown.
 * Also shows run duration in days.
 */
function LegacyDisplay({ legacy }) {
  if (!legacy) return null;
  const earned = legacy.prestigeLevelsGainedThisRun;
  const hasEarned = typeof earned === "number";
  if (!hasEarned) return null;

  const progress = Math.min(1, Math.max(0, legacy.progressTowardsNext ?? 0));
  const runDays = legacy.runDays;
  const runDaysText =
    typeof runDays === "number"
      ? runDays < 0.01
        ? "< 0.01"
        : runDays < 1
          ? runDays.toFixed(2)
          : runDays.toFixed(1)
      : "—";

  return (
    <>
      <div className="flex gap-1 items-center">
        <label className="italic font-semibold text-slate-400">
          <span aria-hidden="true">+</span>
          <span className="sr-only">Prestige levels gained this run</span>
        </label>
        <div
          className="relative px-3 font-mono text-sm bg-white rounded-full border min-w-12 border-slate-300 text-slate-400"
          aria-label={`Prestige levels gained this run: +${earned}`}
        >
          {earned.toLocaleString()}

          <div className="absolute inset-x-2 top-full pt-0.5">
            <div className="overflow-hidden h-0.5 bg-slate-300">
              <div
                className="h-full bg-sky-500 transition-all duration-200 ease-out"
                style={{ width: `${progress * 100}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress to next prestige level"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-1 items-center">
        <label className="italic font-semibold text-slate-400">
          <span aria-hidden="true">D</span>
          <span className="sr-only">Run duration</span>
        </label>
        <div className="px-3 font-mono text-sm bg-white rounded-full border border-slate-300 text-slate-400">
          {runDaysText}
        </div>
      </div>
    </>
    // <div className="flex gap-4 items-center px-4 py-1.5 border-b bg-slate-100 border-slate-300 shrink-0">
    //   <div className="flex gap-2 items-center min-w-0">
    //     <span className="italic font-semibold tabular-nums text-slate-500">
    //       +
    //     </span>
    //     <span
    //       className="font-mono text-sm font-semibold tabular-nums text-slate-600"
    //       aria-label={`Prestige level: +${displayLevel}`}
    //     >
    //       {displayLevel.toLocaleString()}
    //     </span>
    //   </div>
    //   <div className="flex-1 min-w-0 max-w-xs" title="Progress to next prestige">
    //     <div className="overflow-hidden h-2 rounded-full bg-slate-300">
    //       <div
    //         className="h-full bg-amber-500 rounded-full transition-all duration-200 ease-out"
    //         style={{ width: `${progress * 100}%` }}
    //         role="progressbar"
    //         aria-valuenow={Math.round(progress * 100)}
    //         aria-valuemin={0}
    //         aria-valuemax={100}
    //         aria-label="Progress to next prestige level"
    //       />
    //     </div>
    //   </div>
    //   <div className="text-sm text-slate-500 shrink-0" title="Run duration">
    //     <span className="italic font-semibold text-slate-400">Run: </span>
    //     <span className="font-mono">{runDaysText}</span>
    //   </div>
    // </div>
  );
}

export default LegacyDisplay;
