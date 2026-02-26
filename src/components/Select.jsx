import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";

const CustomSelect = ({ id, label, options, value, onChange }) => (
  <>
    <label htmlFor="location" className="sr-only">
      {label}
    </label>
    <div className="grid grid-cols-1">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1 pl-3 pr-8 text-sm text-slate-900 outline outline-1 -outline-offset-1 outline-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-slate-800 dark:focus-visible:outline-indigo-500"
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            selected={opt.value === value}
          >
            {opt.label}
          </option>
        ))}
      </select>
      <FontAwesomeIcon
        icon={faChevronDown}
        aria-hidden="true"
        className="col-start-1 row-start-1 justify-self-end self-center mr-2 pointer-events-none text-slate-400 size-3 sm:size-2 dark:text-slate-500"
      />
    </div>
  </>
);

export default CustomSelect;
