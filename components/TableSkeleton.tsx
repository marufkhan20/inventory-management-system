const TableSkeleton = ({ col }: { col: number }) => (
  <tbody className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b border-gray-50">
        {[...Array(col)].map((_, i) => (
          <td key={i} className="py-4 pr-6">
            <div className="h-4 bg-gray-200 rounded w-32" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

export default TableSkeleton;
