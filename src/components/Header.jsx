import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCookie } from "@fortawesome/free-solid-svg-icons/faCookie";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";
import { faFaceMeh } from "@fortawesome/free-regular-svg-icons/faFaceMeh";
import { faFile } from "@fortawesome/free-solid-svg-icons/faFile";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import clsx from "clsx/lite";
import { faFaceLaugh } from "@fortawesome/free-regular-svg-icons";

const Header = ({ title, onClose, hasTempBuff, hasTempDebuff }) => {
  let moodIcon = faFaceMeh;
  if (hasTempBuff) {
    moodIcon = faFaceLaugh;
  } else if (hasTempDebuff) {
    moodIcon = faFaceDizzy;
  }

  let icon = faCookie;
  if (hasTempDebuff) {
    icon = faExclamationTriangle;
  }
  
  return (
    <nav className="flex gap-3 justify-start items-center px-4 py-2 border-b shrink-0 bg-slate-200 border-slate-300">
      <div>
        <FontAwesomeIcon
          className={clsx(
            "-ml-1 text-slate-400 size-9",
            hasTempBuff && "text-yellow-500",
            hasTempDebuff && "text-red-500",
          )}
          icon={icon}
          mask={faFile}
          transform="shrink-8 down-3"
          aria-hidden="true"
        />
      </div>
      <div className="leading-tight">
        <span className="font-bold whitespace-nowrap text-slate-700">
          {title}{" "}
          <FontAwesomeIcon
            icon={moodIcon}
            className="inline-block text-slate-400"
            aria-hidden="true"
          />
        </span>
        <br />
        <div className="inline-flex gap-4 text-sm text-slate-400">
          <span>File</span> <span>Edit</span> <span>Format</span>{" "}
          <span>View</span>
        </div>
      </div>

      <button
        className="ml-auto size-8 rounded-full -mr-2.5 hover:bg-blue-400 hover:text-white flex items-center justify-center text-slate-400 hover:text-slate-700"
        type="button"
        onClick={onClose}
        aria-label="Exit Boss Mode"
      >
        <FontAwesomeIcon icon={faTimes} aria-hidden="true" />
        <span className="sr-only">Exit Boss Mode</span>
      </button>
    </nav>
  );
};

export default Header;
