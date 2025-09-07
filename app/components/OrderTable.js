"use client";

export default function OrderTable({ orders }) {
  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              {["SN", "Order ID", "Items", "Total", "Status", "Date"].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-3 font-medium text-gray-700 tracking-wider"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order, index) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 font-medium text-gray-600">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>
                <td className="px-6 py-4 space-y-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center rounded-md px-3 py-1 hover:bg-gray-100 transition-colors duration-150"
                    >
                      <span className="text-gray-700">{item.name} × {item.qty}</span>
                      <span className="font-semibold text-indigo-600">₦{item.price}</span>
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">₦{order.total}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                      ${
                        order.status === "Pending" ? "bg-yellow-100 text-yellow-800" : ""
                      }
                      ${
                        order.status === "Completed" ? "bg-green-100 text-green-800" : ""
                      }
                      ${
                        order.status === "Cancelled" ? "bg-red-100 text-red-800" : ""
                      }
                      ${
                        order.status === "Processing" ? "bg-blue-100 text-blue-800" : ""
                      }
                    `}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
