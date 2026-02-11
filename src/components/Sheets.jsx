import { useState, useRef } from "react";
import { getRandomClickSound } from "../utils";

const tabs = [
  { label: "Facilities", id: "buildings" },
  { label: "Efficiency Investments", id: "upgrades" },
  { label: "Milestones", id: "achievements" },
];

const Sheets = ({ activeSheet, actions, onChange }) => {
  const [selected, setSelected] = useState(
    tabs.findIndex((tab) => tab.id === activeSheet) || 0,
  );
  const tabRefs = useRef([]);

  const handleClick = (idx) => {
    setSelected(idx);

    const snd = getRandomClickSound();
    if (actions && typeof actions.playSound === "function") {
      actions.playSound(snd);
    }

    if (onChange) onChange(tabs[idx].id);
  };

  const handleKeyDown = (e) => {
    let idx = selected;
    if (e.key === "ArrowRight") {
      idx = (selected + 1) % tabs.length;
      tabRefs.current[idx].focus();
    } else if (e.key === "ArrowLeft") {
      idx = (selected - 1 + tabs.length) % tabs.length;
      tabRefs.current[idx].focus();
    } else if (e.key === "Home") {
      idx = 0;
      tabRefs.current[idx].focus();
    } else if (e.key === "End") {
      idx = tabs.length - 1;
      tabRefs.current[idx].focus();
    }
    if (idx !== selected) {
      setSelected(idx);
      if (onChange) onChange(tabs[idx].id);
    }
  };

  return (
    <nav
      className="shrink-0 px-4 pb-2 flex gap-1 bg-slate-200 border-t border-slate-300 shadow-inner"
      role="tablist"
      aria-label="Sheets"
    >
      {tabs.map((tab, idx) => (
        <button
          key={tab.id}
          ref={(el) => (tabRefs.current[idx] = el)}
          role="tab"
          aria-selected={selected === idx}
          aria-controls={`${tab.id}`}
          tabIndex={selected === idx ? 0 : -1}
          className="px-3 text-sm py-1 aria-selected:shadow-sm aria-selected:bg-white text-slate-700 rounded-b hover:bg-slate-100 -mt-px border border-slate-300 bg-slate-200 aria-selected:border-t-white focus:outline-none focus:ring"
          onClick={() => handleClick(idx)}
          onKeyDown={handleKeyDown}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Sheets;
