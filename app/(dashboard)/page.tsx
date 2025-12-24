import Link from "next/link";

const Page = () => {
  return (
    <div>
      <div className="flex gap-6 flex-wrap">
        <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col gap-2">
          <h4 className="text-xs uppercase font-semibold text-secondary">
            TOTAL REVENUE
          </h4>
          <h2 className="text-xl font-semibold">$84,500</h2>
          <p className="text-xs text-secondary font-medium">
            vs last 7 days: <span className="text-[#16A34A]">+12%</span>
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col gap-2">
          <h4 className="text-xs uppercase font-semibold text-secondary">
            TOTAL COST
          </h4>
          <h2 className="text-xl font-semibold">$43,000</h2>
          <p className="text-xs text-secondary font-medium">
            vs last 7 days: <span className="text-[#16A34A]">-3%</span>
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col gap-2">
          <h4 className="text-xs uppercase font-semibold text-secondary">
            GROSS PROFIT
          </h4>
          <h2 className="text-xl font-semibold">$49,450</h2>
          <p className="text-xs text-secondary font-medium">
            Margin: <span className="text-[#16A34A]">61%</span>
          </p>
        </div>
      </div>

      <div className="flex gap-6 mt-10 flex-wrap">
        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col gap-6 h-fit">
          <h2 className="font-normal">Inventory overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-xs font-medium tracking-wider text-secondary pr-4">
                    Item
                  </th>
                  <th className="text-xs font-medium tracking-wider text-secondary pr-4">
                    In stock
                  </th>
                  <th className="text-xs font-medium tracking-wider text-secondary">
                    Min stock
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-sm text-main pr-4 pt-4">
                    Vodka Finlandia
                  </td>
                  <td className="text-sm text-main pr-4 pt-4">98</td>
                  <td className="text-sm text-main pr-4 pt-4">20</td>
                </tr>
                <tr>
                  <td className="text-sm text-main pr-4 pt-4">Rum Havana</td>
                  <td className="text-sm text-main pr-4 pt-4">98</td>
                  <td className="text-sm text-main pr-4 pt-4">20</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Link href="/inventory" className="text-primary text-sm">
            View full inventory
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col gap-6 h-fit">
          <h2 className="font-normal">Recent Revisions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr>
                  <td className="text-sm text-main pr-4 pt-4">10 May 2024</td>
                  <td className="text-xs font-medium text-secondary text-main pr-4 pt-4">
                    <span className="text-[#166534]">Completed</span> - 37 items
                  </td>
                  <td className="text-xs font-medium text-danger pr-4 pt-4">
                    -$12,400
                  </td>
                </tr>
                <tr>
                  <td className="text-sm text-main pr-4 pt-4">10 May 2024</td>
                  <td className="text-xs font-medium text-secondary text-main pr-4 pt-4">
                    <span className="text-[#166534]">Completed</span> - 37 items
                  </td>
                  <td className="text-xs font-medium text-danger pr-4 pt-4">
                    -$12,400
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
