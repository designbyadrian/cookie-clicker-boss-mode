import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const Table = ({ colour, columns, data }) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const headerBg = {
    blue: "bg-blue-400 dark:bg-blue-800/75",
    green: "bg-green-400 dark:bg-green-800/75",
    red: "bg-red-400 dark:bg-red-800/75",
    yellow: "bg-yellow-400 dark:bg-yellow-800/75",
  }[colour];

  return (
    <table className="relative divide-y divide-slate-300 dark:divide-white/15">
      <thead className={headerBg}>
        {table.getHeaderGroups().map((headerGroup) => {
          return (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(
                (
                  header, // map over the headerGroup headers array
                ) => (
                  <th
                    key={header.id}
                    scope="col"
                    colSpan={header.colSpan}
                    className="px-4 py-2 text-xs font-semibold text-white "
                    style={{ width: `${header.getSize()}px` }}
                    align={header.column.columnDef.meta?.align || "left"}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ),
              )}
            </tr>
          );
        })}
      </thead>
      <tbody className="divide-y divide-slate-200 bg-white dark:divide-white/10 dark:bg-slate-800/50">
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              return (
                <td
                  key={cell.id}
                  className="py-2 px-4  text-xs text-slate-700 dark:text-white"
                  style={{ width: `${cell.column.getSize()}px` }}
                  align={cell.column.columnDef.meta?.align || "left"}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
