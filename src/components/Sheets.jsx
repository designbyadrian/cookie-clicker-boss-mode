import { useState, useRef, useMemo } from "react";
import { getRandomClickSound } from "../utils";
import { useSettings } from "../context/SettingsContext.jsx";

const Sheets = ({ activeSheet, actions, onChange, buildings, upgrades }) => {
  const { storeMultiplier } = useSettings();
  const tabs = useMemo(() => {
    const canBuyBuildings = buildings.some(
      (building) => building.canBuy[storeMultiplier],
    );

    const canBuyUpgrades = upgrades.some(
      (upgrade) =>
        ["cookie", "upgrade"].includes(upgrade.pool) && upgrade.canBuy,
    );

    const canBuyResearch = upgrades.some(
      (upgrade) => ["tech"].includes(upgrade.pool) && upgrade.canBuy,
    );

    return [
      { label: "Facilities", id: "buildings", canBuy: canBuyBuildings },
      {
        label: "Efficiency Investments",
        id: "upgrades",
        canBuy: canBuyUpgrades,
      },
      {
        label: "R & D",
        id: "research",
        canBuy: canBuyResearch,
      },
    ];
  }, [buildings, storeMultiplier]);

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
      className="flex gap-1 px-4 pb-2 border-t shadow-inner shrink-0 bg-slate-200 border-slate-300"
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
          className="flex items-center py-1 pr-2 pl-3 -mt-px text-sm rounded-b border aria-selected:shadow-sm aria-selected:bg-white text-slate-700 hover:bg-slate-100 border-slate-300 bg-slate-200 aria-selected:border-t-white focus:outline-none focus:ring"
          onClick={() => handleClick(idx)}
          onKeyDown={handleKeyDown}
        >
          {tab.label}
          {typeof tab.canBuy === "boolean" ? (
            tab.canBuy ? (
              <span className="inline-flex relative justify-center items-center ml-1 size-2">
                <span className="inline-block absolute -inset-1 bg-sky-500 rounded-full animate-ping" />
                <span className="inline-block bg-sky-500 rounded-full border border-sky-500 size-2" />
              </span>
            ) : (
              <span className="inline-block ml-1 rounded-full border size-2 border-slate-300" />
            )
          ) : null}
        </button>
      ))}
    </nav>
  );
};

export default Sheets;
