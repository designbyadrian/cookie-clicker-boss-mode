import { useMemo, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";

import "../chartjsSetup.js";
import { Bar, Doughnut } from "react-chartjs-2";

import { formatLargeNumber, getColourArray } from "../utils";

import Table from "../components/Table.jsx";
import Attachment from "../components/Attachment.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

const Buildings = ({ cookies, cps, buildings }) => {
  const [data, setData] = useState([]);
  const [cpsChartData, setCpsChartData] = useState(null);
  const [buildingCountData, setBuildingCountData] = useState(null);
  const { storeMultiplier } = useSettings();
  const colours = useRef(getColourArray(10));
  const cpsChartMetaRef = useRef([]);
  const cpsChartRef = useRef(null);
  const buildingChartRef = useRef(null);
  const buildingChartMetaRef = useRef([]);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const handleAttachmentChange = (id, state) => {
    console.log(id, state);
  };

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    return [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;
          const index = info.row.index;

          if (row.locked) {
            return (
              <span className="flex items-center font-medium text-slate-400">
                <FontAwesomeIcon icon={faLock} className="inline-block mr-1" />{" "}
                ???
              </span>
            );
          }

          return (
            <span className="inline-flex gap-1 items-center font-medium text-slate-900">
              <span
                className="inline-block rounded-full shrink-0 size-4"
                style={{ backgroundColor: colours.current[index] }}
              />
              <span className="whitespace-nowrap">{value}</span>
            </span>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "Count",
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;

          if (row.locked) {
            return <span className="text-slate-400">???</span>;
          }

          return (
            <span title={formatLargeNumber(value, "short")}>
              {formatLargeNumber(value, "suffix")}
            </span>
          );
        },
        meta: {
          align: "right",
        },
      },
      {
        accessorKey: "level",
        header: "Lv.",
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;

          if (row.locked) {
            return <span className="text-slate-400">???</span>;
          }

          return <span>{value}</span>;
        },
        meta: {
          align: "right",
        },
      },
      {
        accessorKey: "cps",
        header: "CpS",
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;

          if (row.locked) {
            return <span className="text-slate-400">???</span>;
          }

          return (
            <span title={formatLargeNumber(value, "short")}>
              {formatLargeNumber(value, "suffix")}
            </span>
          );
        },
        meta: {
          align: "right",
        },
      },
      {
        accessorKey: "percentageOfTotal",
        header: "Share",
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;

          if (row.locked) {
            return <span className="text-slate-400">???</span>;
          }

          return <span>{value.toFixed(2)}%</span>;
        },
        meta: {
          align: "right",
        },
      },
      {
        accessorKey: "bulkSell",
        header: () => {
          return `Sell (${storeMultiplier}x)`;
        },
        cell: (info) => {
          const value = info.getValue()[storeMultiplier.toString()] || "0";
          const row = info.row.original;
          const amount = info.row.original.amount;

          if (row.locked) {
            return <span className="text-slate-500">???</span>;
          }

          if (value === "0") {
            return <span className="text-slate-500">n/a</span>;
          }

          return (
            <button
              type="button"
              className="px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-50 rounded shadow-sm hover:bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400 dark:shadow-none dark:hover:bg-green-500/30 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
            >
              {formatLargeNumber(value, "suffix")}
            </button>
          );
        },
        meta: {
          align: "right",
        },
      },
      {
        accessorKey: "bulkBuy",
        header: () => {
          return `Buy (${storeMultiplier}x)`;
        },
        cell: (info) => {
          const value = info.getValue()[storeMultiplier.toString()] || "0";
          const row = info.row.original;

          if (row.locked) {
            return <span className="text-slate-500">???</span>;
          }

          return (
            <button
              type="button"
              className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-50 rounded shadow-sm hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:shadow-none dark:hover:bg-green-500/30 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
              disabled={cookies < value}
            >
              {formatLargeNumber(value, "suffix")}
            </button>
          );
        },
        meta: {
          align: "right",
        },
      },
    ];
  }, [data, cookies, storeMultiplier]);

  useEffect(() => {
    const filteredBuildsings = (buildings || []).filter((b) => !b.locked);

    const labels = filteredBuildsings.map((b) => b.name);

    colours.current = getColourArray(labels.length);

    // Building Count Data

    const buildingCountMeta = filteredBuildsings.map((b) => ({
      name: b.name,
      amount: b.amount || 0,
    }));

    const buildingCountData = buildingCountMeta.map((entry) => entry.amount);

    setBuildingCountData({
      labels,
      datasets: [
        {
          //label: "Amount",
          data: buildingCountData,
          backgroundColor: colours.current,

          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        },
      ],
      meta: buildingCountMeta,
    });

    buildingChartMetaRef.current = buildingCountMeta;

    // CpS Chart Data

    const pieMeta = filteredBuildsings.map((b) => ({
      name: b.name,
      cps: b.cps || 0,
      percentageOfTotal: b.percentageOfTotal || 0,
      synergyPercentage: b.synergyPercentage || 0,
    }));

    const pieData = pieMeta.map((entry) => entry.cps);

    cpsChartMetaRef.current = pieMeta;

    setCpsChartData({
      labels,
      datasets: [
        {
          label: "CpS",
          data: pieData,
          backgroundColor: colours.current,
        },
      ],
      meta: pieMeta,
    });

    // always show one locked building if there are any locked buildings.
    if (
      buildings &&
      buildings.some((b) => b.locked) &&
      !filteredBuildsings.some((b) => b.locked)
    ) {
      const firstLocked = buildings.find((b) => b.locked);
      if (firstLocked) filteredBuildsings.push(firstLocked);
    }

    setData(filteredBuildsings);
  }, [buildings]);

  return (
    <div className="min-w-full">
      <Table columns={columns} data={data} />
      <Attachment
        id="cps-chart"
        caption="CpS Distribution"
        onChange={handleAttachmentChange}
        onResize={() => {
          cpsChartRef.current?.resize();
        }}
        width={300}
        height={300}
        x={750}
        y={100}
        lockAspectRatio
        onClick={() => setSelectedAttachment("cps-chart")}
        selected={selectedAttachment === "cps-chart"}
      >
        <Doughnut
          ref={cpsChartRef}
          data={cpsChartData ?? { labels: [], datasets: [] }}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.parsed || 0;
                    const meta = cpsChartMetaRef.current[context.dataIndex];
                    const total =
                      meta && typeof meta.percentageOfTotal === "number"
                        ? meta.percentageOfTotal
                        : 0;
                    const synergy =
                      meta && typeof meta.synergyPercentage === "number"
                        ? meta.synergyPercentage
                        : 0;

                    const totalStr = total.toFixed(1);
                    const synergyStr = synergy.toFixed(1);
                    return `${formatLargeNumber(
                      value,
                      "suffix",
                    )} CpS — ${totalStr}% (+${synergyStr}% synergy)`;
                  },
                },
              },
              legend: {
                display: false,
              },
            },
          }}
        />
      </Attachment>
      <Attachment
        id="building-count-chart"
        caption="Facility Count"
        onChange={handleAttachmentChange}
        onResize={() => {
          buildingChartRef.current?.resize();
        }}
        width={800}
        height={200}
        x={200}
        y={600}
        onClick={() => setSelectedAttachment("building-count-chart")}
        selected={selectedAttachment === "building-count-chart"}
      >
        <Bar
          ref={buildingChartRef}
          data={buildingCountData ?? { labels: [], datasets: [] }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { display: false },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const { label, raw } = context;

                    return `${formatLargeNumber(raw, "suffix")} units`;
                  },
                },
              },
              legend: {
                display: false,
              },
              datalabels: {
                display: false,
              },
            },
          }}
        />
      </Attachment>
    </div>
  );
};

export default Buildings;
