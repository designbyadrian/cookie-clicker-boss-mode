import { useCallback } from "react";
import CountUp from "react-countup";
import { formatLargeNumber } from "../utils/index.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons/faStar";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";
import { useSettings } from "../context/SettingsContext.jsx";
import LegacyDisplay from "./LegacyDisplay.jsx";

const StatusHeader = ({ cookies, cps, legacy, hasTempBuff, hasTempDebuff }) => {
  const { numberFormat } = useSettings();
  const formatCookies = useCallback(
    (value) => formatLargeNumber(value, numberFormat),
    [numberFormat],
  );

  return (
    <nav className="flex gap-6 justify-start items-center px-4 py-1 border-b bg-slate-200 shrink-0 border-slate-300">
      <div className="flex gap-1 items-center">
        <label className="italic font-semibold text-slate-400">
          <span aria-hidden="true">Cx</span>
          <span className="sr-only">Consumables</span>
        </label>
        <div className="px-3 font-mono text-sm bg-white rounded-full border border-slate-300 min-w-42 text-slate-400">
          <CountUp
            end={cookies}
            duration={0.2}
            preserveValue
            formattingFn={formatCookies}
            useEasing={false}
          />
        </div>
      </div>
      <div className="flex gap-1 items-center">
        {hasTempBuff && (
          <span className="text-slate-400">
            <FontAwesomeIcon icon={faStar} spin />
          </span>
        )}
        {hasTempDebuff && (
          <span className="text-slate-400">
            <FontAwesomeIcon icon={faExclamationTriangle} beat />
          </span>
        )}
        <label className="italic font-semibold text-slate-400">
          <abbr title="Consumables per Second">CpS</abbr>
        </label>
        <div className="px-3 font-mono text-sm bg-white rounded-full border border-slate-300 min-w-42 text-slate-400">
          {formatLargeNumber(cps, numberFormat)}
        </div>
      </div>
      {legacy && (
        <>
          <div className="ml-auto" />
          <LegacyDisplay legacy={legacy} />
        </>
      )}
    </nav>
  );
};

export default StatusHeader;
