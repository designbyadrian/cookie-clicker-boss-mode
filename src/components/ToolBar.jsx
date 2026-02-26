import CustomSelect from "./Select.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import Checkbox from "./Checkbox.jsx";
import RadioGroup from "./RadioGroup.jsx";

const numberFormats = [
  {
    label: "Short",
    value: "suffix",
  },
  {
    label: "Long",
    value: "short",
  },
  {
    label: "Scientific",
    value: "sci",
  },
];

const storeMultipliers = [
  {
    label: "1x",
    value: 1,
  },
  {
    label: "10x",
    value: 10,
  },
  {
    label: "100x",
    value: 100,
  },
];

const ToolBar = () => {
  const {
    numberFormat,
    setNumberFormat,
    storeMultiplier,
    setStoreMultiplier,
    showClippy,
    setShowClippy,
  } = useSettings();
  return (
    <div className="flex justify-start items-stretch px-1 py-2 bg-white border-b divide-x shrink-0 border-slate-300 divide-slate-200">
      <fieldset className="flex flex-col gap-2 justify-start items-start px-4">
        <legend className="float-left p-0 m-0 text-xs font-semibold uppercase text-slate-400">
          Formatting
        </legend>
        <CustomSelect
          id="numberFormat"
          label="Number Format"
          options={numberFormats}
          value={numberFormat}
          onChange={setNumberFormat}
        />
      </fieldset>
      <fieldset className="flex flex-col gap-2 justify-start items-start px-4">
        <legend className="float-left p-0 m-0 text-xs font-semibold uppercase text-slate-400">
          Store
        </legend>
        <RadioGroup
          id="storeMultiplier"
          label="Store Multiplier"
          options={storeMultipliers}
          value={storeMultiplier}
          onChange={setStoreMultiplier}
        />
      </fieldset>
      <fieldset className="flex flex-col gap-2 justify-start items-start px-4">
        <legend className="float-left p-0 m-0 text-xs font-semibold uppercase text-slate-400">
          Agents
        </legend>
        <Checkbox
          id="clippy"
          label="Clippy"
          checked={showClippy}
          onChange={setShowClippy}
        />
      </fieldset>
    </div>
  );
};

export default ToolBar;
