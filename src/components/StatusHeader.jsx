import { useCallback } from "react";
import CountUp from "react-countup";
import { formatLargeNumber } from "../utils/index.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons/faStar";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";

const StatusHeader = ({
  cookies,
  cps,
  numberFormat,
  hasTempBuff,
  hasTempDebuff,
}) => {
  const formatCookies = useCallback(
    (value) => formatLargeNumber(value, numberFormat),
    [numberFormat],
  );

  return (
    <nav className="flex gap-6 justify-between px-4 py-1 bg-white border-b shrink-0 border-slate-200">
      <div>
        <span className="text-slate-400">Consumables: </span>
        <span className="inline-flex gap-1 items-center font-mono text-slate-700">
          <CountUp
            end={cookies}
            duration={0.2}
            preserveValue
            formattingFn={formatCookies}
            useEasing={false}
          />
          {hasTempBuff && (
            <span className="text-yellow-500">
              <FontAwesomeIcon icon={faStar} />
            </span>
          )}
          {hasTempDebuff && (
            <span className="text-red-500">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </span>
          )}
        </span>
      </div>
      <div>
        <span className="text-slate-400">
          <abbr title="Consumables per Second">CpS</abbr>:{" "}
        </span>
        <span className="font-mono text-slate-700">
          {formatLargeNumber(cps, numberFormat)}
        </span>
      </div>
    </nav>
  );
};

export default StatusHeader;
