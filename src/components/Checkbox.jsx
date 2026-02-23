const Checkbox = ({ id, name, label, checked, onChange }) => (
  <div className="flex gap-3">
    <div className="flex items-center h-6 shrink-0">
      <div className="grid grid-cols-1 group size-4">
        <input
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          id={id}
          name={name}
          type="checkbox"
          className="col-start-1 row-start-1 bg-white rounded border border-gray-300 appearance-none checked:border-sky-600 checked:bg-sky-600 indeterminate:border-sky-600 indeterminate:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:checked:border-sky-500 dark:checked:bg-sky-500 dark:indeterminate:border-sky-500 dark:indeterminate:bg-sky-500 dark:focus-visible:outline-sky-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:checked:bg-white/10 forced-colors:appearance-auto"
        />
        <svg
          fill="none"
          viewBox="0 0 14 14"
          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25 dark:group-has-[:disabled]:stroke-white/25"
        >
          <path
            d="M3 8L6 11L11 3.5"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-0 group-has-[:checked]:opacity-100"
          />
          <path
            d="M3 7H11"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-0 group-has-[:indeterminate]:opacity-100"
          />
        </svg>
      </div>
    </div>
    <div className="text-sm/6">
      <label htmlFor={id} className="font-medium text-gray-900 dark:text-white">
        {label}
      </label>
    </div>
  </div>
);

export default Checkbox;
