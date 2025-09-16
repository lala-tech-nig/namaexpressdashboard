"use client";

import { useState } from "react";

export default function OrderTable({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <>
      <div className="p-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                {["SN", "Order ID", "Items", "Total", "Status", "Date"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-6 py-3 font-medium text-gray-700 tracking-wider"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order, index) => {
                const itemsPreview = order.items
                  .map((i) => `${i.name} ×${i.qty}`)
                  .slice(0, 3)
                  .join(", ");
                const moreCount =
                  order.items.length > 3 ? ` +${order.items.length - 3} more` : "";

                return (
                  <tr
                    key={order._id || order.id || index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {order.id}
                    </td>

                    {/* Items column - truncated preview, click to open modal */}
                    <td
                      className="px-6 py-4 text-gray-700 max-w-xs truncate cursor-pointer hover:text-indigo-600"
                      onClick={() => setSelectedOrder(order)}
                      title="Click to view full items"
                    >
                      {itemsPreview}
                      <span className="text-gray-400">{moreCount}</span>
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₦{(order.total || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold
                          ${
                            order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""
                          }
                          ${order.status === "completed" ? "bg-green-100 text-green-800" : ""}
                          ${order.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                          ${order.status === "processing" ? "bg-blue-100 text-blue-800" : ""}
                          ${order.status === "Sold" ? "bg-purple-100 text-purple-800" : ""}
                        `}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: responsive, centered, scrollable on small screens */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
                <p className="text-xs text-gray-500 mt-1">Order ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-gray-700">{item.name}</div>
                      <div className="text-xs text-gray-500">Qty: {item.qty}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-indigo-600">₦{(item.price || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Subtotal: ₦{((item.price || 0) * (item.qty || 0)).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">Created:</div>
                <div className="text-sm font-medium text-gray-800">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm font-semibold">Total</div>
              <div className="text-xl font-bold">₦{(selectedOrder.total || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
