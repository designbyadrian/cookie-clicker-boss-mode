// src/chartjsSetup.js
// Global Chart.js registration for all charts
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { getColourArray } from "./utils";

const chartColors = getColourArray(10); // Replace 10 with the desired number of colors

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

// Set global default color palette for supported chart elements
ChartJS.defaults.color = "#222"; // fallback text color
if (ChartJS.defaults.elements.arc)
  ChartJS.defaults.elements.arc.backgroundColor = chartColors;
if (ChartJS.defaults.elements.bar)
  ChartJS.defaults.elements.bar.backgroundColor = chartColors;
if (ChartJS.defaults.elements.point)
  ChartJS.defaults.elements.point.backgroundColor = chartColors;
// Note: line.backgroundColor is not used for datasets, so we skip it

// ChartJS.overrides["doughnut"] = {
//   plugins: {
//     legend: {
//       display: false,
//     },
//   },
// };

// Export ChartJS in case you need to use it directly elsewhere
export { ChartJS };
