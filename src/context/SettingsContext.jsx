import { createContext, useContext, useMemo, useState } from "react";

const SettingsContext = createContext(null);

export function SettingsProvider({
  children,
  numberFormat: initialNumberFormat,
}) {
  const [storeMultiplier, setStoreMultiplier] = useState(1); // 1x, 10x, 100x, 1000x
  const [numberFormat, setNumberFormat] = useState(
    initialNumberFormat || "short",
  );
  const [showClippy, setShowClippy] = useState(true);
  const value = useMemo(
    () => ({
      storeMultiplier,
      setStoreMultiplier,
      numberFormat,
      setNumberFormat,
      showClippy,
      setShowClippy,
    }),
    [storeMultiplier, numberFormat, showClippy],
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
