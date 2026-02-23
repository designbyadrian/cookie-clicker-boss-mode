import { useState } from "react";
import Header from "./Header";
import Sheets from "./Sheets";
import StatusHeader from "./StatusHeader";
import ToolBar from "./ToolBar";
import Buildings from "../pages/buildings";
import { SettingsProvider } from "../context/SettingsContext.jsx";

export function BossModeApp({
  cps,
  cookies,
  hasTempBuff,
  hasTempDebuff,
  upgrades,
  buildings,
  numberFormat,
  title,
  actions,
}) {
  const [activeSheet, setActiveSheet] = useState("buildings");

  return (
    <div className="flex absolute inset-0 flex-col pointer-events-auto bg-slate-950">
      <SettingsProvider>
        <Header
          title={title}
          onClose={actions.handleClose}
          hasTempBuff={hasTempBuff}
          hasTempDebuff={hasTempDebuff}
        />
        <ToolBar actions={actions} />
        <StatusHeader
          cookies={cookies}
          cps={cps}
          numberFormat={numberFormat}
          hasTempBuff={hasTempBuff}
          hasTempDebuff={hasTempDebuff}
        />
        <main className="overflow-auto flex-1 bg-white">
          {activeSheet === "buildings" && (
            <Buildings
              cookies={cookies}
              cps={cps}
              buildings={buildings}
              actions={actions}
            />
          )}
          {activeSheet === "upgrades" && <div>upgrades</div>}
        </main>
        <Sheets
          activeSheet={activeSheet}
          onChange={setActiveSheet}
          actions={actions}
        />
      </SettingsProvider>
    </div>
  );
}

/* <div className="boss-mode-header">
        <span>Boss Mode</span>
        <span className="boss-mode-close" onClick={actions.hide}>
          &times;
        </span>
      </div>

      <div className="boss-mode-tabs">
        <TabButton
          active={state.tab === 'buildings'}
          disabled={!state.hasBuildings}
          label="Buildings"
          onClick={() => actions.setTab('buildings')}
        />
        <TabButton
          active={state.tab === 'upgrades'}
          disabled={!state.hasUpgrades}
          label="Upgrades"
          onClick={() => actions.setTab('upgrades')}
        />
      </div>

      <div className="boss-mode-summary">
        Buildings: {bOwned} total / {bUnlocked} unlocked • Upgrades: {upOwned}{' '}
        owned / {upUnlocked} unlocked
      </div>

      {state.tab === 'buildings' ? (
        <BuildingsList
          buildings={state.buildings}
          onBuy={actions.buyBuilding}
          onSell={actions.sellBuilding}
        />
      ) : (
        <UpgradesList upgrades={state.upgrades} onBuy={actions.buyUpgrade} />
      )}
    </> */
