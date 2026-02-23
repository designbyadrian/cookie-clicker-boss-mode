import { createRoot } from "react-dom/client";
import throttle from "throttleit";

import { BossModeApp } from "./components/App.jsx";
import { formatLargeNumber, getFinancialQuarter } from "./utils/index.js";

import { MOD_VERSION } from "./info.js";

function createOverlayRoot(id) {
  let existing = document.getElementById(id);
  if (existing) return existing;
  const el = document.createElement("div");
  el.id = id;
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.zIndex = "1000000010"; // Cookie Clicker's main UI uses z-index up to 1000000001 🤦‍♀️.
  el.style.pointerEvents = "none";
  document.body.appendChild(el);
  return el;
}

const FILE_NAME = `Q${getFinancialQuarter()}_OptimisedDoughOutput_Dashboard_v${MOD_VERSION}.xlsx`;

const BossModeOverlay = {
  _state: {
    visible: false,
    numberFormat: "short",
    cps: 0,
    cookies: 0,
    upgrades: [],
    buildings: [],
    hasUpgrades: false,
    hasBuildings: false,
    hasTempBuff: false,
    hasTempDebuff: false,
  },
  _options: null,
  _root: null,
  _panelRoot: null,
  _originalTitle: null,
  _customTitle: FILE_NAME,
  _titleObserver: null,

  setCustomTitle(title) {
    this._customTitle = title;
    if (this._state.visible) {
      document.title = title;
    }
  },

  _startTitleLock() {
    if (this._titleObserver) return;
    const targetNode = document.querySelector("title");
    if (!targetNode) return;
    const config = { characterData: true, childList: true, subtree: true };
    this._titleObserver = new MutationObserver(() => {
      if (!document.title.includes(FILE_NAME)) {
        document.title = this._customTitle;
      }
    });
    this._titleObserver.observe(targetNode, config);
  },

  _stopTitleLock() {
    if (this._titleObserver) {
      this._titleObserver.disconnect();
      this._titleObserver = null;
    }
  },

  init(options) {
    this._options = options || {};

    this._root = createOverlayRoot(options.id || "boss-mode-overlay");
    this._root.style.display = "none";

    this._root.innerHTML = "";

    this._panelRoot = createRoot(this._root);

    const toggle = () => {
      this._setVisible(!this._state.visible);
    };

    if (typeof options.mountButton === "function") {
      options.mountButton(toggle);
    }
    if (typeof options.bindHotkey === "function") {
      options.bindHotkey(toggle);
    }

    const api = options.gameApi;

    // Throttled functions
    // Tick path: only cookies + render (no buildings/upgrades) so we don't re-render on every tick.
    this._throttledSetCookieData = throttle(() => this._setCookieData(), 200);
    this._throttledRender = throttle(() => {
      if (this._state.visible) this._render();
    }, 200);
    this._throttledRefreshTitle = throttle(() => this._refreshTitle(), 1000);

    if (api && typeof api.onTick === "function") {
      api.onTick(() => {
        if (!this._state.visible) return;
        this._throttledSetCookieData();
        this._throttledRender();
        this._throttledRefreshTitle();
      });
    } else {
      setInterval(() => {
        if (!this._state.visible) return;
        this._throttledSetCookieData();
        this._throttledRender();
        this._throttledRefreshTitle();
      }, 1000);
    }

    this._setCookieData();
    this._refreshData();
    this._render();
    this._throttledRefreshTitle();
  },

  _setVisible(visible) {
    this._state.visible = visible;
    if (visible) {
      // Save original title
      this._originalTitle = document.title;
      document.title = this._customTitle;
      this._startTitleLock();
    } else {
      this._stopTitleLock();
      // Restore original title
      if (this._originalTitle !== null) {
        document.title = this._originalTitle;
      }
    }
    this._render();
  },

  _setCookieData() {
    const api = this._options?.gameApi;

    if (api && typeof api.getCpS === "function") {
      const data = api.getCpS();
      this._state.cps = data.cps ?? 0;
      this._state.cookies = data.cookies ?? 0;
      this._state.hasTempBuff = !!data.hasTempBuff;
      this._state.hasTempDebuff = !!data.hasTempDebuff;
    }
  },

  _refreshTitle() {
    if (this._state.visible) {
      this.setCustomTitle(
        `${formatLargeNumber(this._state.cookies, "suffix")} consumables | ${FILE_NAME}`,
      );
    }
  },

  _refreshData() {
    const api = this._options?.gameApi;
    if (!api) return;
    this._state.hasUpgrades = typeof api.listUpgrades === "function";
    this._state.hasBuildings = typeof api.listBuildings === "function";

    if (this._state.hasUpgrades) this._state.upgrades = api.listUpgrades();
    if (this._state.hasBuildings) this._state.buildings = api.listBuildings();
  },

  /**
   * Called when cookies or buildings/upgrades change (purchase/sale).
   * Updates state and re-renders. Used by overlay actions and by game hooks in main.js.
   */
  onPurchase() {
    this._setCookieData();
    this._refreshData();
    this._render();
  },

  _render() {
    if (!this._root || !this._panelRoot) return;
    this._root.style.display = this._state.visible ? "block" : "none";
    if (!this._state.visible) return;

    const state = { ...this._state };

    const api = this._options?.gameApi;
    const actions = {
      hide: () => {
        this._setVisible(false);
      },
      buyUpgrade: (id) => {
        if (api && typeof api.buyUpgrade === "function") api.buyUpgrade(id);
        this.onPurchase();
      },
      buyBuilding: (id, amount) => {
        if (api && typeof api.buyBuilding === "function")
          api.buyBuilding(id, amount);
        this.onPurchase();
      },
      sellBuilding: (id, amount) => {
        if (api && typeof api.sellBuilding === "function")
          api.sellBuilding(id, amount);
        this.onPurchase();
      },
      handleClose: () => {
        this._setVisible(false);
      },
      playSound: (sound) => {
        if (api && typeof api.playSound === "function") api.playSound(sound);
      },
    };

    this._panelRoot.render(
      <BossModeApp
        title={FILE_NAME}
        cps={state.cps}
        cookies={state.cookies}
        hasTempBuff={state.hasTempBuff}
        hasTempDebuff={state.hasTempDebuff}
        upgrades={state.upgrades}
        buildings={state.buildings}
        numberFormat={state.numberFormat}
        actions={actions}
      />,
    );
  },
};

// Expose the same global name used previously so main.js and the
// test harness can keep using window.BossModeOverlay.init(...)
if (typeof window !== "undefined") {
  window.BossModeOverlay = BossModeOverlay;
}
