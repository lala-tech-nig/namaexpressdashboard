// "use client";

// import { useState, useEffect } from "react";

// export default function OrderTable({ orders }) {
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [orderToDelete, setOrderToDelete] = useState(null);
//   const [deleting, setDeleting] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");

//   // Auto-hide toast after 3 seconds
//   useEffect(() => {
//     if (!toastMessage) return;
//     const timer = setTimeout(() => setToastMessage(""), 3000);
//     return () => clearTimeout(timer);
//   }, [toastMessage]);

//   const handleDelete = async () => {
//     if (!orderToDelete) return;

//     try {
//       setDeleting(true);
//       const res = await fetch(
//         `https://namaexpressbackend.onrender.com/api/orders/${orderToDelete._id}`,
//         { method: "DELETE" }
//       );
//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.error || "Failed to delete order");
//       }

//       // Show success toast
//       setToastMessage(`Order ${orderToDelete._id} has been deleted successfully`);

//       // Optionally remove the order from UI without page reload
//       // If you want page reload, uncomment below:
//       // window.location.reload();

//       setOrderToDelete(null);
//     } catch (err) {
//       console.error(err);
//       alert("❌ Error deleting order: " + err.message);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <>
//       {/* Toast */}
//       {toastMessage && (
//         <div className="fixed top-5 right-5 z-50 px-4 py-2 bg-green-500 text-white rounded shadow-lg animate-slide-in">
//           {toastMessage}
//         </div>
//       )}

//       <div className="p-4">
//         <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-gray-50">
//               <tr>
//                 {["SN", "Order ID", "Items", "Total", "Status", "Date", "Actions"].map(
//                   (heading) => (
//                     <th
//                       key={heading}
//                       className="px-6 py-3 font-medium text-gray-700 tracking-wider"
//                     >
//                       {heading}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {orders.map((order, index) => {
//                 const itemsPreview = order.items
//                   .map((i) => `${i.name} ×${i.qty}`)
//                   .slice(0, 3)
//                   .join(", ");
//                 const moreCount =
//                   order.items.length > 3 ? ` +${order.items.length - 3} more` : "";

//                 return (
//                   <tr
//                     key={order.id}
//                     className="hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     <td className="px-6 py-4 font-medium text-gray-600">{index + 1}</td>
//                     <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>

//                     <td
//                       className="px-6 py-4 text-gray-700 max-w-xs truncate cursor-pointer hover:text-indigo-600"
//                       onClick={() => setSelectedOrder(order)}
//                       title="Click to view full items"
//                     >
//                       {itemsPreview}
//                       <span className="text-gray-400">{moreCount}</span>
//                     </td>

//                     <td className="px-6 py-4 font-bold text-gray-900">
//                       ₦{(order.total || 0).toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-sm font-semibold
//                           ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
//                           ${order.status === "completed" ? "bg-green-100 text-green-800" : ""}
//                           ${order.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
//                           ${order.status === "processing" ? "bg-blue-100 text-blue-800" : ""}
//                           ${order.status === "Sold" ? "bg-purple-100 text-purple-800" : ""}
//                         `}
//                       >
//                         {order.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-gray-500 text-sm">
//                       {new Date(order.createdAt).toLocaleString()}
//                     </td>

//                     <td className="px-6 py-4">
//                       <button
//                         onClick={() => setOrderToDelete(order)}
//                         className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Order Details Modal */}
//       {selectedOrder && (
//         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//             <div className="p-4 border-b flex items-start justify-between">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
//                 <p className="text-xs text-gray-500 mt-1">Order ID: {selectedOrder._id}</p>
//               </div>
//               <button
//                 onClick={() => setSelectedOrder(null)}
//                 className="text-gray-400 hover:text-gray-600"
//                 aria-label="Close"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="p-4 overflow-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
//               <div className="space-y-3">
//                 {selectedOrder.items.map((item, idx) => (
//                   <div
//                     key={idx}
//                     className="flex justify-between items-center py-2 border-b last:border-b-0"
//                   >
//                     <div>
//                       <div className="font-medium text-gray-700">{item.name}</div>
//                       <div className="text-xs text-gray-500">Qty: {item.qty}</div>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-semibold text-indigo-600">
//                         ₦{(item.price || 0).toLocaleString()}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Subtotal: ₦{((item.price || 0) * (item.qty || 0)).toLocaleString()}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 flex justify-between items-center">
//                 <div className="text-sm text-gray-500">Created:</div>
//                 <div className="text-sm font-medium text-gray-800">
//                   {new Date(selectedOrder.createdAt).toLocaleString()}
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 border-t flex items-center justify-between">
//               <div className="text-sm font-semibold">Total</div>
//               <div className="text-xl font-bold">₦{(selectedOrder.total || 0).toLocaleString()}</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {orderToDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">
//               Confirm Delete
//             </h3>
//             <p className="text-sm text-gray-600 mb-6">
//               Are you sure you want to delete order <strong>{orderToDelete._id}</strong>?
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setOrderToDelete(null)}
//                 className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//               >
//                 No
//               </button>
//               <button
//                 onClick={handleDelete}
//                 disabled={deleting}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
//               >
//                 {deleting ? "Deleting..." : "Yes, Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }







// "use client";

// import { useState, useEffect } from "react";

// export default function OrderTable({ orders }) {
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [orderToDelete, setOrderToDelete] = useState(null);
//   const [deleting, setDeleting] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");

//   // Auto-hide toast after 3 seconds
//   useEffect(() => {
//     if (!toastMessage) return;
//     const timer = setTimeout(() => setToastMessage(""), 3000);
//     return () => clearTimeout(timer);
//   }, [toastMessage]);

//   const handleDelete = async () => {
//     if (!orderToDelete) return;

//     try {
//       setDeleting(true);
//       const res = await fetch(
//         `https://namaexpressbackend.onrender.com/api/orders/${orderToDelete._id}`,
//         { method: "DELETE" }
//       );
//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.error || "Failed to delete order");
//       }

//       // Show success toast
//       setToastMessage(`Order ${orderToDelete._id} has been deleted successfully`);

//       // Optionally remove the order from UI without page reload
//       // If you want page reload, uncomment below:
//       // window.location.reload();

//       setOrderToDelete(null);
//     } catch (err) {
//       console.error(err);
//       alert("❌ Error deleting order: " + err.message);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <>
//       {/* Toast */}
//       {toastMessage && (
//         <div className="fixed top-5 right-5 z-50 px-4 py-2 bg-green-500 text-white rounded shadow-lg animate-slide-in">
//           {toastMessage}
//         </div>
//       )}

//       <div className="p-4">
//         <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-gray-50">
//               <tr>
//                 {["SN", "Order ID", "Items", "Total", "Status", "Date", "Actions"].map(
//                   (heading) => (
//                     <th
//                       key={heading}
//                       className="px-6 py-3 font-medium text-gray-700 tracking-wider"
//                     >
//                       {heading}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {orders.map((order, index) => {
//                 const itemsPreview = order.items
//                   .map((i) => `${i.name} ×${i.qty}`)
//                   .slice(0, 3)
//                   .join(", ");
//                 const moreCount =
//                   order.items.length > 3 ? ` +${order.items.length - 3} more` : "";

//                 return (
//                   <tr
//                     key={order.id}
//                     className="hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     <td className="px-6 py-4 font-medium text-gray-600">{index + 1}</td>
//                     <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>

//                     <td
//                       className="px-6 py-4 text-gray-700 max-w-xs truncate cursor-pointer hover:text-indigo-600"
//                       onClick={() => setSelectedOrder(order)}
//                       title="Click to view full items"
//                     >
//                       {itemsPreview}
//                       <span className="text-gray-400">{moreCount}</span>
//                     </td>

//                     <td className="px-6 py-4 font-bold text-gray-900">
//                       ₦{(order.total || 0).toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-sm font-semibold
//                           ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
//                           ${order.status === "completed" ? "bg-green-100 text-green-800" : ""}
//                           ${order.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
//                           ${order.status === "processing" ? "bg-blue-100 text-blue-800" : ""}
//                           ${order.status === "Sold" ? "bg-purple-100 text-purple-800" : ""}
//                         `}
//                       >
//                         {order.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-gray-500 text-sm">
//                       {new Date(order.createdAt).toLocaleString()}
//                     </td>

//                     <td className="px-6 py-4">
//                       <button
//                         onClick={() => setOrderToDelete(order)}
//                         className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Order Details Modal */}
//       {selectedOrder && (
//         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//             <div className="p-4 border-b flex items-start justify-between">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
//                 <p className="text-xs text-gray-500 mt-1">Order ID: {selectedOrder._id}</p>
//               </div>
//               <button
//                 onClick={() => setSelectedOrder(null)}
//                 className="text-gray-400 hover:text-gray-600"
//                 aria-label="Close"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="p-4 overflow-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
//               <div className="space-y-3">
//                 {selectedOrder.items.map((item, idx) => (
//                   <div
//                     key={idx}
//                     className="flex justify-between items-center py-2 border-b last:border-b-0"
//                   >
//                     <div>
//                       <div className="font-medium text-gray-700">{item.name}</div>
//                       <div className="text-xs text-gray-500">Qty: {item.qty}</div>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-semibold text-indigo-600">
//                         ₦{(item.price || 0).toLocaleString()}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Subtotal: ₦{((item.price || 0) * (item.qty || 0)).toLocaleString()}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 flex justify-between items-center">
//                 <div className="text-sm text-gray-500">Created:</div>
//                 <div className="text-sm font-medium text-gray-800">
//                   {new Date(selectedOrder.createdAt).toLocaleString()}
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 border-t flex items-center justify-between">
//               <div className="text-sm font-semibold">Total</div>
//               <div className="text-xl font-bold">₦{(selectedOrder.total || 0).toLocaleString()}</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {orderToDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">
//               Confirm Delete
//             </h3>
//             <p className="text-sm text-gray-600 mb-6">
//               Are you sure you want to delete order <strong>{orderToDelete._id}</strong>?
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setOrderToDelete(null)}
//                 className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//               >
//                 No
//               </button>
//               <button
//                 onClick={handleDelete}
//                 disabled={deleting}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
//               >
//                 {deleting ? "Deleting..." : "Yes, Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
















// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function OrderTable({ orders: initialOrders }) {
//   const [orders, setOrders] = useState(initialOrders);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [orderToDelete, setOrderToDelete] = useState(null);
//   const [deleting, setDeleting] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");

//   useEffect(() => {
//     if (!toastMessage) return;
//     const timer = setTimeout(() => setToastMessage(""), 3000);
//     return () => clearTimeout(timer);
//   }, [toastMessage]);

//   const handleDelete = async () => {
//     if (!orderToDelete) return;
//     try {
//       setDeleting(true);
//       const res = await fetch(
//         `https://namaexpressbackend.onrender.com/api/orders/${orderToDelete._id}`,
//         { method: "DELETE" }
//       );
//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.error || "Failed to delete order");
//       }

//       setOrders(prev => prev.filter(o => o._id !== orderToDelete._id));
//       setToastMessage(`Order ${orderToDelete.id} has been deleted successfully`);
//       setOrderToDelete(null);
//     } catch (err) {
//       console.error(err);
//       alert("❌ Error deleting order: " + err.message);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <>
//       {toastMessage && (
//         <div className="fixed top-5 right-5 z-50 px-4 py-2 bg-green-500 text-white rounded shadow-lg animate-slide-in">
//           {toastMessage}
//         </div>
//       )}

//       <div className="p-4">
//         <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-gray-50">
//               <tr>
//                 {["SN", "Order ID", "Items", "Total", "Status", "Date", "Actions"].map(
//                   heading => (
//                     <th
//                       key={heading}
//                       className="px-6 py-3 font-medium text-gray-700 tracking-wider"
//                     >
//                       {heading}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               <AnimatePresence>
//                 {orders.map((order, index) => {
//                   const itemsPreview = order.items
//                     .map(i => `${i.name} ×${i.qty}`)
//                     .slice(0, 3)
//                     .join(", ");
//                   const moreCount = order.items.length > 3 ? ` +${order.items.length - 3} more` : "";

//                   return (
//                     <motion.tr
//                       key={order._id}
//                       initial={{ opacity: 0, y: -10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: 10 }}
//                       transition={{ duration: 0.3 }}
//                       className="hover:bg-gray-50 transition-colors duration-200"
//                     >
//                       <td className="px-6 py-4 font-medium text-gray-600">{index + 1}</td>
//                       <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>
//                       <td
//                         className="px-6 py-4 text-gray-700 max-w-xs truncate cursor-pointer hover:text-indigo-600"
//                         onClick={() => setSelectedOrder(order)}
//                         title="Click to view full items"
//                       >
//                         {itemsPreview}
//                         <span className="text-gray-400">{moreCount}</span>
//                       </td>
//                       <td className="px-6 py-4 font-bold text-gray-900">
//                         ₦{(order.total || 0).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-sm font-semibold
//                             ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
//                             ${order.status === "completed" ? "bg-green-100 text-green-800" : ""}
//                             ${order.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
//                             ${order.status === "processing" ? "bg-blue-100 text-blue-800" : ""}
//                             ${order.status === "Sold" ? "bg-purple-100 text-purple-800" : ""}
//                           `}
//                         >
//                           {order.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-gray-500 text-sm">
//                         {new Date(order.createdAt).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => setOrderToDelete(order)}
//                           className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </motion.tr>
//                   );
//                 })}
//               </AnimatePresence>
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {selectedOrder && (
//         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//             <div className="p-4 border-b flex items-start justify-between">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
//                 <p className="text-xs text-gray-500 mt-1">Order ID: {selectedOrder._id}</p>
//               </div>
//               <button
//                 onClick={() => setSelectedOrder(null)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="p-4 overflow-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
//               <div className="space-y-3">
//                 {selectedOrder.items.map((item, idx) => (
//                   <div
//                     key={idx}
//                     className="flex justify-between items-center py-2 border-b last:border-b-0"
//                   >
//                     <div>
//                       <div className="font-medium text-gray-700">{item.name}</div>
//                       <div className="text-xs text-gray-500">Qty: {item.qty}</div>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-semibold text-indigo-600">
//                         ₦{(item.price || 0).toLocaleString()}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Subtotal: ₦{((item.price || 0) * (item.qty || 0)).toLocaleString()}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-4 flex justify-between items-center">
//                 <div className="text-sm text-gray-500">Created:</div>
//                 <div className="text-sm font-medium text-gray-800">
//                   {new Date(selectedOrder.createdAt).toLocaleString()}
//                 </div>
//               </div>
//             </div>
//             <div className="p-4 border-t flex items-center justify-between">
//               <div className="text-sm font-semibold">Total</div>
//               <div className="text-xl font-bold">₦{(selectedOrder.total || 0).toLocaleString()}</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {orderToDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
//             <p className="text-sm text-gray-600 mb-6">
//               Are you sure you want to delete order <strong>{orderToDelete.id}</strong>?
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setOrderToDelete(null)}
//                 className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//               >
//                 No
//               </button>
//               <button
//                 onClick={handleDelete}
//                 disabled={deleting}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
//               >
//                 {deleting ? "Deleting..." : "Yes, Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }












"use client";

import { useState, useEffect } from "react";

export default function OrderTable({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleDelete = async () => {
    if (!orderToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(
        `https://namaexpressbackend.onrender.com/api/orders/${orderToDelete._id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete order");
      }

      setToastMessage(`Order ${orderToDelete.id} has been deleted successfully`);
      setOrderToDelete(null);

      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting order: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2 bg-green-500 text-white rounded shadow-lg">
          {toastMessage}
        </div>
      )}

      <div className="p-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                {["SN", "Order ID", "Items", "Total", "Status", "Date", "Actions"].map(
                  heading => (
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
                  .map(i => `${i.name} ×${i.qty}`)
                  .slice(0, 3)
                  .join(", ");
                const moreCount = order.items.length > 3 ? ` +${order.items.length - 3} more` : "";

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-medium text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>
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
                          ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setOrderToDelete(order)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
                <p className="text-xs text-gray-500 mt-1">Order ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
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
                      <div className="font-semibold text-indigo-600">
                        ₦{(item.price || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Subtotal: ₦{((item.price || 0) * (item.qty || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">Created:</div>
                <div className="text-sm font-medium text-gray-800">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm font-semibold">Total</div>
              <div className="text-xl font-bold">₦{(selectedOrder.total || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete order <strong>{orderToDelete.id}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
