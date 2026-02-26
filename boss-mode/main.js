/* Boss Mode - Cookie Clicker Steam mod
 *
 * Folder layout (for Steam):
 *   Cookie Clicker/resources/app/mods/local/BossMode/
 *     - info.txt
 *     - main.js
 *     - overlay.js
 *     - style.css
 *     - thumbnail.png
 *
 * This file wires the Boss Mode overlay into the live Game instance.
 */

(function () {
  "use strict";

  /**
   * Percentage and synergy calculations adapted from:
   *
   *   "Percentage Graph Mod" for Cookie Clicker
   *   Author: NewtonGR
   *   Workshop page: https://steamcommunity.com/sharedfiles/filedetails/?id=2686203614
   *   (Logic adapted from the mod as shipped in version 5.1 / GameVersion 2.053.)
   *
   * Boss Mode reuses the core formulas from:
   *   - PercentageMod.getTotalPercentage(me)
   *   - PercentageMod.getSynergyPercentage(me)
   *
   * to enrich building data with:
   *   - percentageOfTotal: share of total CpS
   *   - synergyPercentage: additional CpS share from synergies
   *
   * Logic is lightly adapted for structure and naming, but the
   * underlying math is preserved so results should closely match
   * NewtonGR's mod.
   */
  function bossModeGetTotalPercentage(me) {
    // Mirrors PercentageMod.getTotalPercentage
    if (typeof Game === "undefined" || !Game.cookiesPs) return 0;
    var percCPS =
      Game.cookiesPs > 0
        ? me.amount > 0
          ? ((me.storedTotalCps * Game.globalCpsMult) / Game.cookiesPs) * 100
          : 0
        : 0;
    return percCPS || 0;
  }

  function bossModeGetSynergyPercentage(me) {
    // Mirrors PercentageMod.getSynergyPercentage
    if (typeof Game === "undefined" || !Game.cookiesPs) return 0;

    var synergyBoost = 0;

    if (me.amount > 0) {
      var synergiesWith = {};

      if (me.name == "Grandma") {
        for (var i in Game.GrandmaSynergies) {
          if (!Game.GrandmaSynergies.hasOwnProperty(i)) continue;
          if (Game.Has(Game.GrandmaSynergies[i])) {
            var other = Game.Upgrades[Game.GrandmaSynergies[i]].buildingTie;
            var mult = me.amount * 0.01 * (1 / (other.id - 1));
            var before = other.storedTotalCps * Game.globalCpsMult;
            var after = before / (1 + mult);
            var boost = before - after;
            synergyBoost += boost;
            if (!synergiesWith[other.plural]) synergiesWith[other.plural] = 0;
            synergiesWith[other.plural] += mult;
          }
        }
      } else if (me.name == "Portal" && Game.Has("Elder Pact")) {
        var otherG = Game.Objects["Grandma"];
        var boostG = me.amount * 0.05 * otherG.amount * Game.globalCpsMult;
        synergyBoost += boostG;
        if (!synergiesWith[otherG.plural]) synergiesWith[otherG.plural] = 0;
        synergiesWith[otherG.plural] +=
          boostG / (otherG.storedTotalCps * Game.globalCpsMult);
      }

      for (var j in me.synergies) {
        if (!me.synergies.hasOwnProperty(j)) continue;
        var it = me.synergies[j];
        if (Game.Has(it.name)) {
          var weight = 0.05;
          var other = it.buildingTie1;
          if (me == it.buildingTie1) {
            weight = 0.001;
            other = it.buildingTie2;
          }
          var beforeS = other.storedTotalCps * Game.globalCpsMult;
          var afterS = beforeS / (1 + me.amount * weight);
          var boostS = beforeS - afterS;
          synergyBoost += boostS;
          if (!synergiesWith[other.plural]) synergiesWith[other.plural] = 0;
          synergiesWith[other.plural] += me.amount * weight;
        }
      }
    }

    if (!Game.cookiesPs || Game.cookiesPs <= 0) return 0;
    return (synergyBoost / Game.cookiesPs) * 100 || 0;
  }

  // Defensive: only register when Game is present.
  if (typeof Game === "undefined" || !Game.registerMod) {
    console.error("[Boss Mode] Game.registerMod not available.");
    return;
  }

  Game.registerMod("BossMode", {
    init: function () {
      const mod = this;

      // In Steam, this.dir is set to the mod directory; keep a fallback.
      if (!mod.dir && Game.GetModPath) {
        try {
          mod.dir = Game.GetModPath(mod.id || "BossMode");
        } catch (e) {
          console.error("[Boss Mode] Failed to resolve mod.dir", e);
        }
      }

      const script = document.createElement("script");
      script.src = (mod.dir || "") + "/overlay.js";
      script.onload = function () {
        if (!window.BossModeOverlay) {
          console.error(
            "[Boss Mode] overlay.js loaded but BossModeOverlay missing.",
          );
          return;
        }
        mod._setupOverlay();
        mod._loadCSS("style.css");
      };
      script.onerror = function () {
        console.error("[Boss Mode] Failed to load overlay.js from", script.src);
      };
      document.head.appendChild(script);

      // Defer notification until the game loop has run and the notification UI exists.
      (function () {
        var notified = false;
        Game.registerHook("logic", function () {
          if (notified) return;
          notified = true;
          Game.Notify("Boss Mode loaded", "Press Ctrl+B to toggle", "", 1, 1);
        });
      })();
    },

    _loadCSS: function (filename) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";

      link.href = this.dir + "/" + filename;

      document.head.appendChild(link);
    },

    _reloadCSS: function (filename) {
      const existing = document.querySelectorAll(`link[href*="${filename}"]`);
      existing.forEach((el) => el.remove());

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";

      link.href = `${this.dir}/${filename}?v=${Date.now()}`;

      document.head.appendChild(link);
    },

    /**
     * Wire overlay module to the real Game API and controls.
     */
    _setupOverlay: function () {
      const mod = this;
      const overlay = window.BossModeOverlay;

      // Adapter that the overlay can use; keeps logic testable.
      const gameApi = {
        listUpgrades: function () {
          const list = [];

          // Cookie Clicker groups upgrades by:
          // - pool: which "store" they appear in
          //   - "cookie" = cookie-themed CpS upgrades (Plain cookie, Sugar cookie, etc.)
          //   - "upgrade" = standard upgrades (building tiers, synergies, kittens, etc.)
          //   - "tech" = Research (Bingo Center / Research Facility)
          //   - "toggle" = toggleable (e.g. Golden Switch)
          //   - others possible: "prestige", "dragon", "debug", etc.
          // - type: internal category (often aligns with pool but can be more specific)
          for (const id in Game.UpgradesById) {
            const u = Game.UpgradesById[id];

            list.push({
              id: u.id,
              name: u.name,
              desc: u.desc,
              basePrice: u.basePrice,
              price:
                typeof u.getPrice === "function"
                  ? u.getPrice()
                  : u.getPrice
                    ? u.getPrice
                    : u.basePrice,
              bought: !!u.bought,
              locked: !!!u.unlocked,
              type: u.type,
              pool: u.pool || "upgrade",
              icon: u.icon,
            });
          }

          // canBuy: affordable and purchasable (not bought, unlocked)
          var cookies = typeof Game.cookies === "number" ? Game.cookies : 0;
          for (var j = 0; j < list.length; j++) {
            var item = list[j];
            item.canBuy =
              !item.bought &&
              !item.locked &&
              item.price != null &&
              cookies >= item.price;
          }

          return list;
        },
        buyUpgrade: function (id) {
          var u = Game.UpgradesById[id];
          if (u && typeof u.buy === "function") u.buy();
        },
        listBuildings: function () {
          const list = [];
          const objs = Game.ObjectsById || [];

          const importantProps = [
            "id",
            "name",
            "displayName",
            "desc",
            "basePrice",
            "price",
            "amount",
            "icon",
            // "buy",
            // "sell",
            "locked",
            "level",
          ];

          for (var i = 0; i < objs.length; i++) {
            const o = objs[i];
            if (!o) continue;

            const item = {};
            importantProps.forEach(function (prop) {
              if (typeof o[prop] !== "undefined") item[prop] = o[prop];
            });
            if (typeof item.id === "undefined") item.id = i;

            var perBuildingCps = 0;
            try {
              perBuildingCps =
                typeof o.cps === "function"
                  ? o.cps(o)
                  : typeof o.cps === "number"
                    ? o.cps
                    : 0;
            } catch (e) {
              perBuildingCps = 0;
              console.warn("[Boss Mode] Failed to get cps for building", o, e);
            }

            var amountOwned =
              typeof o.amount === "number"
                ? o.amount
                : typeof item.amount === "number"
                  ? item.amount
                  : 0;

            // Prefer the engine's own notion of this building's current
            // total CpS contribution if available; otherwise fall back to
            // a simple estimate of cps-per-building * amount owned.
            var currentCps = 0;
            if (typeof o.storedTotalCps === "number") {
              currentCps = o.storedTotalCps;
            } else if (typeof o.storedCps === "number" && amountOwned > 0) {
              // Some versions expose per-building CpS as storedCps.
              currentCps = o.storedCps * amountOwned;
            } else if (amountOwned > 0) {
              currentCps = perBuildingCps * amountOwned;
            } else {
              currentCps = perBuildingCps;
            }

            // Enforce the invariant the overlay expects:
            // if you own zero of this building, it should not
            // contribute any CpS.
            if (!amountOwned || amountOwned <= 0) {
              currentCps = 0;
            }

            item.cps = currentCps;
            // Enriched percentage metrics (NewtonGR-inspired).
            item.percentageOfTotal = bossModeGetTotalPercentage(o);
            item.synergyPercentage = bossModeGetSynergyPercentage(o);
            item.locked = !!o.locked;

            // Calculate bulkPrice for 1, 10, 100
            item.bulkBuy = {
              1:
                typeof o.getSumPrice === "function"
                  ? o.getSumPrice(1)
                  : o.price,
              10:
                typeof o.getSumPrice === "function" ? o.getSumPrice(10) : null,
              100:
                typeof o.getSumPrice === "function" ? o.getSumPrice(100) : null,
            };

            item.canBuy = {
              1: item.bulkBuy[1] !== null && Game.cookies >= item.bulkBuy[1],
              10: item.bulkBuy[10] !== null && Game.cookies >= item.bulkBuy[10],
              100:
                item.bulkBuy[100] !== null && Game.cookies >= item.bulkBuy[100],
            };

            item.bulkSell = {
              1:
                typeof o.getReverseSumPrice === "function"
                  ? o.getReverseSumPrice(1)
                  : null,
              10:
                typeof o.getReverseSumPrice === "function"
                  ? o.getReverseSumPrice(10)
                  : null,
              100:
                typeof o.getReverseSumPrice === "function"
                  ? o.getReverseSumPrice(100)
                  : null,
            };

            list.push(item);
          }

          return list;
        },
        buyBuilding: function (id, amount) {
          var objs = Game.ObjectsById || [];
          var o = objs[id];
          if (!o || typeof o.buy !== "function") return;
          var n = Math.max(1, Number(amount) || 1);
          try {
            o.buy(n);
          } catch (e) {
            for (var i = 0; i < n; i++) o.buy();
          }
        },
        sellBuilding: function (id, amount) {
          var objs = Game.ObjectsById || [];
          var o = objs[id];
          if (!o) return;
          var n = Math.max(1, Number(amount) || 1);
          if (typeof o.sell === "function") {
            try {
              o.sell(n);
              return;
            } catch (e) {
              // fall through to loop
            }
          }
          if (typeof o.sell === "function") {
            for (var i = 0; i < n; i++) o.sell(1);
          }
        },
        getLegacy: function () {
          if (typeof Game === "undefined") return null;
          // All-time cookies (this run + previous runs) for prestige calculation
          var cookiesEarned =
            typeof Game.cookiesEarned === "number" ? Game.cookiesEarned : 0;
          var cookiesReset =
            typeof Game.cookiesReset === "number" ? Game.cookiesReset : 0;
          var totalCookies = cookiesEarned + cookiesReset;
          // Cookie Clicker uses cubic: level n requires n³ × 1e12 cookies.
          // So level = (totalCookies / 1e12)^(1/3)
          var potentialLevelExact =
            totalCookies <= 0 ? 0 : Math.pow(totalCookies / 1e12, 1 / 3);
          var potentialLevelFloored = Math.floor(potentialLevelExact);
          var prestigeAtRunStart =
            typeof Game.prestige === "number" ? Game.prestige : 0;
          var levelsGainedThisRun = Math.max(
            0,
            potentialLevelFloored - prestigeAtRunStart,
          );
          // Progress towards next prestige (0 to 1)
          var progressTowardsNext = potentialLevelExact - potentialLevelFloored;
          if (progressTowardsNext >= 1) progressTowardsNext = 0;
          // Run duration: try multiple ways Cookie Clicker / Steam may expose it.
          var runSeconds = 0;
          var rawTime =
            typeof Game.runGameTime === "number" ? Game.runGameTime : 0;
          var fps =
            typeof Game.fps === "number" && Game.fps > 0 ? Game.fps : 30;

          if (rawTime > 0) {
            // Heuristic by magnitude: 16 days = 1.38e6 sec, 41.5e6 frames @30fps, or 1.38e9 ms
            if (rawTime >= 1e9) {
              runSeconds = rawTime / 1000;
            } else if (rawTime >= 1e7) {
              runSeconds = rawTime / fps;
            } else if (rawTime >= 86400) {
              runSeconds = rawTime;
            } else {
              runSeconds = rawTime / fps;
            }
          }
          if (
            runSeconds <= 0 &&
            typeof Game.startDate === "number" &&
            Game.startDate > 0
          ) {
            runSeconds = (Date.now() - Game.startDate) / 1000;
          }
          if (
            runSeconds <= 0 &&
            typeof Game.sessionStartTime === "number" &&
            Game.sessionStartTime > 0
          ) {
            runSeconds = (Date.now() - Game.sessionStartTime) / 1000;
          }
          if (
            runSeconds <= 0 &&
            typeof Game.ascensionTime === "number" &&
            Game.ascensionTime > 0
          ) {
            runSeconds = (Date.now() - Game.ascensionTime) / 1000;
          }
          if (
            runSeconds <= 0 &&
            typeof Game.date === "number" &&
            Game.date > 0
          ) {
            runSeconds = (Date.now() - Game.date) / 1000;
          }
          var runDays = runSeconds / (24 * 60 * 60);

          return {
            prestigeLevelsGainedThisRun: levelsGainedThisRun,
            progressTowardsNext: Math.min(1, Math.max(0, progressTowardsNext)),
            runDays: runDays,
            // Display: show earned this run (+N), not total level
            displayLevel: levelsGainedThisRun,
          };
        },
        getCpS: function () {
          let hasTempBuff = false;
          let hasTempDebuff = false;
          if (typeof Game !== "undefined" && Game.buffs) {
            const debuffPatterns = [/clot/i, /cursed finger/i, /rusted/i];
            for (const name in Game.buffs) {
              if (!Object.prototype.hasOwnProperty.call(Game.buffs, name))
                continue;
              const buff = Game.buffs[name];
              if (buff && buff.time > 0) {
                let isDebuff = false;
                for (let i = 0; i < debuffPatterns.length; i++) {
                  if (debuffPatterns[i].test(name)) {
                    isDebuff = true;
                    break;
                  }
                }
                if (isDebuff) hasTempDebuff = true;
                else hasTempBuff = true;
              }
            }
          }
          return {
            cps: Game.cookiesPs,
            cookies: Game.cookies,
            hasTempBuff: hasTempBuff,
            hasTempDebuff: hasTempDebuff,
          };
        },
        getNewsTicker: function () {
          if (typeof Game === "undefined" || !Game.Ticker) return "";
          return typeof Game.Ticker === "string"
            ? Game.Ticker
            : String(Game.Ticker);
        },
        onTick: function (cb) {
          // Use the "logic" hook to keep overlay in sync with Game's main loop.
          Game.registerHook("logic", function () {
            cb();
          });
        },
        playSound: function (url = "snd/tick.mp3") {
          PlaySound(url);
        },
      };

      overlay.init({
        id: "boss-mode-overlay",
        gameApi: gameApi,
        mountButton: function (toggle) {
          var existing = document.getElementById("boss-mode-toggle");
          if (existing) return;
          var btn = document.createElement("button");
          btn.id = "boss-mode-toggle";

          btn.textContent = "Boss";
          btn.style.position = "absolute";
          btn.style.top = "4px";
          btn.style.left = "4px";
          btn.style.padding = "4px 10px";
          btn.style.borderRadius = "4px";
          btn.style.border = "1px solid #f8e7c0";
          btn.style.background = "#5c3b2a";
          btn.style.color = "#f8e7c0";
          btn.style.cursor = "pointer";
          btn.style.zIndex = 10;

          btn.onclick = function () {
            toggle();
            PlaySound("snd/tick.mp3");
          };

          document.body.appendChild(btn);
        },
        // Global keyboard shortcut: Ctrl+B or CMD=B toggles overlay.
        bindHotkey: function (toggle) {
          document.addEventListener("keydown", function (e) {
            if (e.defaultPrevented) return;
            if (
              (e.ctrlKey || e.metaKey) &&
              !e.shiftKey &&
              !e.altKey &&
              e.key.toLowerCase() === "b"
            ) {
              toggle();
            }
          });
        },
      });

      mod._patchGamePurchaseHooks(overlay);
    },

    /**
     * Wrap Game's building buy/sell and upgrade buy so that any purchase
     * (from our overlay or the main game UI) notifies the overlay to refresh.
     */
    _patchGamePurchaseHooks: function (overlay) {
      if (
        typeof overlay === "undefined" ||
        typeof overlay.onPurchase !== "function"
      ) {
        return;
      }

      var notify = function () {
        try {
          overlay.onPurchase();
        } catch (e) {
          console.warn("[Boss Mode] onPurchase failed", e);
        }
      };

      // Patch building buy/sell (IIFE so each building gets its own orig)
      var objs = Game.ObjectsById || [];
      for (var i = 0; i < objs.length; i++) {
        (function (obj) {
          if (!obj) return;
          if (typeof obj.buy === "function") {
            var origBuy = obj.buy;
            obj.buy = function (amount) {
              var result = origBuy.apply(this, arguments);
              notify();
              return result;
            };
          }
          if (typeof obj.sell === "function") {
            var origSell = obj.sell;
            obj.sell = function (amount) {
              var result = origSell.apply(this, arguments);
              notify();
              return result;
            };
          }
        })(objs[i]);
      }

      // Patch upgrade buy (IIFE so each upgrade gets its own origBuy)
      for (var id in Game.UpgradesById) {
        if (!Object.prototype.hasOwnProperty.call(Game.UpgradesById, id))
          continue;
        (function (upgrade) {
          if (!upgrade || typeof upgrade.buy !== "function") return;
          var origBuy = upgrade.buy;
          upgrade.buy = function () {
            var result = origBuy.apply(this, arguments);
            notify();
            return result;
          };
        })(Game.UpgradesById[id]);
      }
    },

    save: function () {
      return "";
    },

    load: function (str) {
      void str;
    },
  });
})();
