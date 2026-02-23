import { useMemo, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";

import "../chartjsSetup.js";
import { Doughnut } from "react-chartjs-2";

import { formatLargeNumber, getColourArray } from "../utils";

import Table from "../components/Table.jsx";
import Attachment from "../components/Attachment.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

const Buildings = ({ cookies, cps, buildings }) => {
  const [data, setData] = useState([]);
  const [pieChartData, setPieChartData] = useState(null);
  const { storeMultiplier } = useSettings();
  const colours = useRef(getColourArray(10));
  const pieMetaRef = useRef([]);
  const chartRef = useRef(null);

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
        header: "Owned",
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
        accessorKey: "cps",
        header: "CPS",
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
        header: "Sell",
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;

          if (row.locked) {
            return <span className="text-slate-500">???</span>;
          }

          return (
            <button
              type="button"
              className="px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-50 rounded shadow-sm hover:bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400 dark:shadow-none dark:hover:bg-green-500/30 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
              disabled
            >
              {formatLargeNumber(value["1"], "suffix")}
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
          const value = info.getValue()[storeMultiplier.toString()] || "1";
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

    const pieMeta = filteredBuildsings.map((b) => ({
      name: b.name,
      cps: b.cps || 0,
      percentageOfTotal: b.percentageOfTotal || 0,
      synergyPercentage: b.synergyPercentage || 0,
    }));

    const pieData = pieMeta.map((entry) => entry.cps);

    colours.current = getColourArray(labels.length);
    pieMetaRef.current = pieMeta;

    setPieChartData({
      labels,
      datasets: [
        {
          label: "CPS",
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
        onChange={handleAttachmentChange}
        onResize={() => {
          chartRef.current?.resize();
        }}
        width={400}
        height={400}
        x={300}
        y={100}
        lockAspectRatio
      >
        <Doughnut
          ref={chartRef}
          data={pieChartData ?? { labels: [], datasets: [] }}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.parsed || 0;
                    const meta = pieMetaRef.current[context.dataIndex];
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
    </div>
  );
};

export default Buildings;
