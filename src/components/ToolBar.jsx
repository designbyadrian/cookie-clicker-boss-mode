import CustomSelect from "./Select.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import Checkbox from "./Checkbox.jsx";

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
    <div className="flex justify-start items-stretch px-1 py-1 bg-white border-b divide-x shrink-0 border-slate-300 divide-slate-200">
      <div className="flex flex-col gap-2 justify-start items-start px-4 py-1">
        <label className="text-xs font-semibold uppercase text-slate-400">
          Number Format
        </label>
        <CustomSelect
          name="numberFormat"
          options={numberFormats}
          value={numberFormat}
          onChange={setNumberFormat}
        />
      </div>
      <div className="flex flex-col gap-2 justify-start items-start px-4 py-1">
        <label className="text-xs font-semibold uppercase text-slate-400">
          Store Multiplier
        </label>
        <CustomSelect
          name="storeMultiplier"
          options={storeMultipliers}
          value={storeMultiplier}
          onChange={setStoreMultiplier}
        />
      </div>
      <div className="flex flex-col gap-2 justify-start items-start px-4 py-1">
        <label className="text-xs font-semibold uppercase text-slate-400">
          Agents
        </label>
        <Checkbox
          id="clippy"
          name="clippy"
          label="Clippy"
          checked={showClippy}
          onChange={setShowClippy}
        />
      </div>
    </div>
  );
};

export default ToolBar;
