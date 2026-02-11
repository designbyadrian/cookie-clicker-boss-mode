import { useMemo, useEffect, useRef, useState } from "react";

import { Doughnut } from "react-chartjs-2";
import "../chartjsSetup.js";

import { formatLargeNumber, getColourArray } from "../utils";

import Table from "../components/Table.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";

const Buildings = ({ cps, buildings }) => {
  const [data, setData] = useState([]);
  const [pieChartData, setPieChartData] = useState(null);
  const colours = useRef(getColourArray(10));
  const pieMetaRef = useRef([]);

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
        accessorKey: "price",
        header: "Price",
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;

          if (row.locked) {
            return <span className="text-slate-500">???</span>;
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
    ];
  }, [data]);

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
    <div className="flex flex-row gap-8 min-w-full">
      <div className="flex-1">
        <h2 className="mb-4 text-xl font-bold text-blue-400">Facilities</h2>
        <Table columns={columns} data={data} colour="blue" />
      </div>
      <div className="w-1/3">
        {pieChartData && (
          <>
            <h2 className="mb-4 text-xl font-bold text-slate-700">
              CPS Distribution
            </h2>
            <Doughnut
              data={pieChartData}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Buildings;
