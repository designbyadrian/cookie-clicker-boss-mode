import { useState } from "react";
import Header from "./Header";
import Sheets from "./Sheets";
import StatusHeader from "./StatusHeader";
import LegacyDisplay from "./LegacyDisplay";
import ToolBar from "./ToolBar";
import Buildings from "../pages/buildings";
import Upgrades from "../pages/upgrades";
import Research from "../pages/research";
import { SettingsProvider } from "../context/SettingsContext.jsx";
import NewsTicker from "./NewsTicker";

export function BossModeApp({
  cps,
  cookies,
  newsTicker,
  hasTempBuff,
  hasTempDebuff,
  legacy,
  upgrades,
  buildings,
  numberFormat,
  title,
  actions,
}) {
  const [activeSheet, setActiveSheet] = useState("buildings");

  return (
    <div className="flex absolute inset-0 flex-col pointer-events-auto text-slate-600 bg-slate-950">
      <SettingsProvider numberFormat={numberFormat}>
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
          legacy={legacy}
          hasTempBuff={hasTempBuff}
          hasTempDebuff={hasTempDebuff}
        />
        <NewsTicker text={newsTicker} />
        <main className="overflow-auto flex-1 bg-white">
          {activeSheet === "buildings" && (
            <Buildings buildings={buildings} actions={actions} />
          )}
          {activeSheet === "upgrades" && (
            <Upgrades upgrades={upgrades} actions={actions} />
          )}
          {activeSheet === "research" && (
            <Research upgrades={upgrades} actions={actions} />
          )}
        </main>
        <Sheets
          activeSheet={activeSheet}
          onChange={setActiveSheet}
          buildings={buildings}
          upgrades={upgrades}
          actions={actions}
        />
      </SettingsProvider>
    </div>
  );
}
