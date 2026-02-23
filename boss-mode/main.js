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

      Game.Notify(
        "Boss Mode loaded successfully!",
        "Press ctrl+B to toggle",
        "",
        1,
        1,
      );
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
              pool: u.pool,
              icon: u.icon,
            });
          }

          console.log("list", list);
          console.log("str list", JSON.stringify(list));
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
          var o = (Game.ObjectsById || [])[id];
          if (!o || typeof o.buy !== "function") return;
          var n = Math.max(1, Number(amount) || 1);
          // Cookie Clicker objects typically accept buy(amount); extra args are harmless if ignored.
          try {
            o.buy(n);
          } catch (e) {
            for (var i = 0; i < n; i++) o.buy();
          }
        },
        sellBuilding: function (id, amount) {
          var o = (Game.ObjectsById || [])[id];
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
        onTick: function (cb) {
          // Use the "logic" hook to keep overlay in sync with Game's main loop.
          Game.registerHook("logic", function () {
            cb();
          });
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
        playSound: function (url = "snd/tick.mp3") {
          PlaySound(url);
        },
      };

      overlay.init({
        id: "boss-mode-overlay",
        gameApi: gameApi,
        // Create a small toggle button in the top bar.
        mountButton: function (toggle) {
          var existing = document.getElementById("boss-mode-toggle");
          if (existing) return;
          var btn = document.createElement("div");
          btn.id = "boss-mode-toggle";
          btn.className = "smallFancyButton";
          btn.textContent = "Boss";
          btn.style.marginLeft = "4px";
          btn.onclick = function () {
            toggle();
            PlaySound("snd/tick.mp3");
          };
          var menuBar =
            document.getElementById("menu") ||
            document.getElementById("topBar");
          (menuBar || document.body).appendChild(btn);
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
    },

    save: function () {
      return "";
    },

    load: function (str) {
      void str;
    },
  });
})();
