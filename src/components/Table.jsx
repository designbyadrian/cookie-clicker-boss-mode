import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const TH = ({ children, ...props }) => (
  <th
    className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-200"
    {...props}
  >
    {children}
  </th>
);

const TR = ({ children, ...props }) => (
  <tr className="divide-x divide-slate-300" {...props}>
    {children}
  </tr>
);

const MIN_ROWS = 100;
const MIN_COLS = 26; // A–Z

const alphaColumns = Array.from({ length: MIN_COLS }, (_, i) =>
  String.fromCharCode(65 + i),
);

const Table = ({ columns, data }) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const headerRows = table.getHeaderGroups();

  // Pad to at least MIN_ROWS: real rows first, then empty placeholder rows
  const totalDataRows = Math.max(MIN_ROWS, rows.length);
  const dataRowIndices = Array.from({ length: totalDataRows }, (_, i) => i);

  const emptyCellClass =
    "px-2 py-1 text-xs text-slate-700 dark:text-white min-w-20 hover:bg-slate-100";

  const emptyCellHeaderClass =
    "px-2 py-1 text-xs text-slate-700 dark:text-white min-w-20 hover:bg-slate-100 font-semibold";

  return (
    <table className="relative min-w-full divide-y divide-slate-300 dark:divide-white/15">
      <thead>
        <TR>
          <TH scope="column" />
          {alphaColumns.map((col) => (
            <TH key={col} scope="column">
              {col}
            </TH>
          ))}
        </TR>
      </thead>
      <tbody className="divide-y divide-slate-300 dark:divide-white/15">
        {headerRows.map((group, groupIdx) => (
          <TR key={group.id}>
            <TH scope="row">{groupIdx + 1}</TH>
            {Array.from({ length: MIN_COLS }, (_, colIdx) => {
              const header = group.headers[colIdx];
              if (!header) {
                return <td key={colIdx} className={emptyCellClass} />;
              }
              return (
                <td
                  key={header.id}
                  scope="col"
                  className={emptyCellHeaderClass}
                  align={header.column.columnDef.meta?.align || "left"}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </td>
              );
            })}
          </TR>
        ))}
        {dataRowIndices.map((idx) => {
          const row = rows[idx];
          const rowNumber = headerRows.length + idx + 1;

          return (
            <TR key={row?.id ?? `empty-${idx}`}>
              <TH scope="row">{rowNumber}</TH>
              {Array.from({ length: MIN_COLS }, (_, colIdx) => {
                if (!row) {
                  return <td key={colIdx} className={emptyCellClass} />;
                }
                const cells = row.getVisibleCells();
                const cell = cells[colIdx];
                if (!cell) {
                  return <td key={colIdx} className={emptyCellClass} />;
                }
                return (
                  <td
                    key={cell.id}
                    className={emptyCellClass}
                    style={{ width: `${cell.column.getSize()}px` }}
                    align={cell.column.columnDef.meta?.align || "left"}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </TR>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
