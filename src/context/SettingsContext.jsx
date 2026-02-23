import { createContext, useContext, useMemo, useState } from "react";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [storeMultiplier, setStoreMultiplier] = useState(1); // 1x, 10x, 100x, 1000x

  const value = useMemo(
    () => ({ storeMultiplier, setStoreMultiplier }),
    [storeMultiplier]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}