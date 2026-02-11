/**
 * Formats a number in various human-readable ways.
 * @param {number} num - The number to format.
 * @param {'spaced'|'short'|'suffix'|'sci'} [style='spaced'] - The formatting style.
 *   'spaced': 1 234 567
 *   'short': 1.234 million
 *   'suffix': 1.234M
 *   'sci':   1.234e+6
 * @param {number} [decimals=3] - Number of decimals for 'short', 'suffix', and 'sci' styles.
 * @returns {string}
 */
export function formatLargeNumber(num, style = "spaced", decimals = 3) {
  if (typeof num !== "number" || isNaN(num)) return "";
  if (style === "percentage") {
    return ((num * 100).toFixed(1) || "0") + "%";
  }
  if (Math.abs(num) < 1000) {
    // For all styles, round to integer if below 1000
    return Math.round(num).toString();
  }
  if (style === "spaced") {
    // Add spaces as thousand separators
    return num.toLocaleString("en-US").replace(/,/g, " ");
  }
  if (style === "short" || style === "suffix") {
    const units = [
      { value: 1e63, symbol: "vigintillion", short: "Vi" },
      { value: 1e60, symbol: "novemdecillion", short: "Nd" },
      { value: 1e57, symbol: "octodecillion", short: "Od" },
      { value: 1e54, symbol: "septendecillion", short: "Sd" },
      { value: 1e51, symbol: "sexdecillion", short: "Sxd" },
      { value: 1e48, symbol: "quindecillion", short: "Qid" },
      { value: 1e45, symbol: "quattuordecillion", short: "Qad" },
      { value: 1e42, symbol: "tredecillion", short: "Td" },
      { value: 1e39, symbol: "duodecillion", short: "Dd" },
      { value: 1e36, symbol: "undecillion", short: "Ud" },
      { value: 1e33, symbol: "decillion", short: "Dc" },
      { value: 1e30, symbol: "nonillion", short: "No" },
      { value: 1e27, symbol: "octillion", short: "Oc" },
      { value: 1e24, symbol: "septillion", short: "Sp" },
      { value: 1e21, symbol: "sextillion", short: "Sx" },
      { value: 1e18, symbol: "quintillion", short: "Qi" },
      { value: 1e15, symbol: "quadrillion", short: "Qa" },
      { value: 1e12, symbol: "trillion", short: "T" },
      { value: 1e9, symbol: "billion", short: "B" },
      { value: 1e6, symbol: "million", short: "M" },
      { value: 1e3, symbol: "thousand", short: "K" },
    ];
    for (const unit of units) {
      if (Math.abs(num) >= unit.value) {
        if (style === "suffix") {
          return (num / unit.value).toFixed(decimals) + unit.short;
        } else {
          return (num / unit.value).toFixed(decimals) + " " + unit.symbol;
        }
      }
    }
    return Math.round(num).toString();
  }
  if (style === "sci") {
    return num.toExponential(decimals);
  }

  return num.toString();
}

export function getFinancialQuarter(date = new Date()) {
  const month = date.getMonth();
  return Math.floor(month / 3) + 1; // Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec
}
