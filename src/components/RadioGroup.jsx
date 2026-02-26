const RadioGroup = ({ id, label, options, value, onChange }) => (
  <div className="py-1 space-y-6 sm:flex sm:items-center sm:space-x-6 sm:space-y-0">
    {options.map((option) => (
      <div key={option.value} className="flex items-center">
        <input
          checked={option.value === value}
          id={id + "-" + option.value}
          name={id}
          type="radio"
          value={option.value}
          onChange={() => onChange(option.value)}
          className="relative size-4 appearance-none rounded-full border border-slate-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-sky-600 checked:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:border-slate-300 disabled:bg-slate-100 disabled:before:bg-slate-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-sky-500 dark:checked:bg-sky-500 dark:focus-visible:outline-sky-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
        />
        <label
          htmlFor={id + "-" + option.value}
          className="inline-block ml-2 font-medium text-slate-900 text-sm/6 dark:text-white"
        >
          {option.label}
        </label>
      </div>
    ))}
  </div>
);

export default RadioGroup;
