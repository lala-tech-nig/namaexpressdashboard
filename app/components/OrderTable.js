export default function OrderTable({ orders }) {
    return (
      <div className="overflow-x-auto shadow rounded bg-white">
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-2 border">Order ID</th>
              <th className="px-4 py-2 border">Items</th>
              <th className="px-4 py-2 border">Total</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{o.id}</td>
                <td className="px-4 py-2">
                  {o.items.map((i, idx) => (
                    <div key={idx}>
                      {i.name} × {i.qty} (₦{i.price})
                    </div>
                  ))}
                </td>
                <td className="px-4 py-2 font-bold">₦{o.total}</td>
                <td className="px-4 py-2">{o.status}</td>
                <td className="px-4 py-2">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  