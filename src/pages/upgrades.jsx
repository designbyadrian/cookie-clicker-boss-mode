import { useState, useMemo, useEffect, useRef } from "react";
import "../chartjsSetup.js";
import { Doughnut } from "react-chartjs-2";

import Table from "../components/Table.jsx";
import Attachment from "../components/Attachment.jsx";
import { formatLargeNumber } from "../utils/economy.js";

const UPGRADE_CHART_COLORS = {
  bought: "#22c55e", // green-500
  unlocked: "#3b82f6", // blue-500
  locked: "#94a3b8", // slate-400
};

const Upgrades = ({ actions, upgrades }) => {
  const [data, setData] = useState([]);
  const [upgradeChartData, setUpgradeChartData] = useState(null);
  const upgradeChartRef = useRef(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const handleAttachmentChange = (id, state) => {
    console.log(id, state);
  };
  const columns = useMemo(() => {
    return [
      {
        header: "Name",
        accessorKey: "name",
        minSize: 100,
      },
      {
        header: "Description",
        accessorKey: "desc",
        minSize: 200,
        cell: ({ row }) => {
          return (
            <div
              className="min-w-48"
              dangerouslySetInnerHTML={{ __html: row.original.desc }}
            />
          );
        },
      },
      {
        header: "Type",
        accessorKey: "pool",
        cell: (info) => {
          const value = info.getValue();
          return <span className="capitalize">{value}</span>;
        },
      },
      {
        header: "Buy",
        accessorKey: "canBuy",
        meta: {
          align: "right",
        },
        cell: ({ row }) => {
          const u = row.original;
          const affordable = u.canBuy === true;
          return (
            <button
              onClick={() => actions.buyUpgrade(u.id)}
              className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-50 rounded shadow-sm hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:shadow-none dark:hover:bg-green-500/30 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
              disabled={!affordable}
            >
              {formatLargeNumber(u.price, "suffix")}
            </button>
          );
        },
      },
    ];
  }, [data]);

  useEffect(() => {
    const list = upgrades
      .filter(
        (upgrade) =>
          upgrade.locked === false &&
          upgrade.bought === false &&
          ["cookie", "upgrade"].includes(upgrade.pool),
      )
      .slice().sort((a, b) => a.price - b.price);

    setData(list);

    // Doughnut: bought, unlocked, locked
    const all = upgrades ?? [];
    const bought = all.filter((u) => u.bought === true).length;
    const unlocked = all.filter(
      (u) => u.locked === false && u.bought === false,
    ).length;
    const locked = all.filter((u) => u.locked === true).length;

    setUpgradeChartData({
      labels: ["Invested", "Available", "Locked"],
      datasets: [
        {
          data: [bought, unlocked, locked],
          backgroundColor: [
            UPGRADE_CHART_COLORS.bought,
            UPGRADE_CHART_COLORS.unlocked,
            UPGRADE_CHART_COLORS.locked,
          ],
        },
      ],
    });
  }, [upgrades]);

  return (
    <div className="relative min-w-full">
      <Table columns={columns} data={data} />
      <Attachment
        id="upgrade-status-chart"
        caption="Invested / Available / Locked"
        onChange={handleAttachmentChange}
        onResize={() => {
          upgradeChartRef.current?.resize();
        }}
        width={300}
        height={300}
        x={750}
        y={100}
        lockAspectRatio
        onClick={() => setSelectedAttachment("upgrade-status-chart")}
        selected={selectedAttachment === "upgrade-status-chart"}
      >
        <Doughnut
          ref={upgradeChartRef}
          data={upgradeChartData ?? { labels: [], datasets: [] }}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.parsed ?? 0;
                    const total = context.dataset.data.reduce(
                      (a, b) => a + b,
                      0,
                    );
                    const pct =
                      total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                    return `${context.label}: ${value} (${pct}%)`;
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

export default Upgrades;
