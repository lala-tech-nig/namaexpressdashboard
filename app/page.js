"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import OrderTable from "./components/OrderTable";
import Pagination from "./components/Pagination";
import DateFilter from "./components/DateFilter";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [range, setRange] = useState("all");
  const [salesToday, setSalesToday] = useState(0);
  const [amountToday, setAmountToday] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [closing, setClosing] = useState(false);
  const perPage = 20;

  // fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get("https://namaexpressbackend.onrender.com/api/orders");
      setOrders(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }, []);

  // fetch sales history from API
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get("https://namaexpressbackend.onrender.com/api/sales-summary");
      setHistory(res.data.summaries || res.data || []);
    } catch (err) {
      console.error("Failed to fetch summaries:", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchHistory();
  }, [fetchOrders, fetchHistory]);

  // filter by date
  useEffect(() => {
    if (range === "all") {
      setFiltered(orders);
      return;
    }

    const now = new Date();
    let from;

    switch (range) {
      case "week":
        from = new Date();
        from.setDate(now.getDate() - 7);
        break;
      case "month":
        from = new Date();
        from.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        from = new Date();
        from.setMonth(now.getMonth() - 3);
        break;
      case "year":
        from = new Date();
        from.setFullYear(now.getFullYear() - 1);
        break;
      default:
        from = null;
    }

    if (from) {
      setFiltered(orders.filter((o) => new Date(o.createdAt) >= from));
    }
  }, [range, orders]);

  // compute today's sales and amount
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const todaysOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === todayStr
    );

    setSalesToday(todaysOrders.length);
    setAmountToday(todaysOrders.reduce((sum, o) => sum + (o.total || 0), 0));
  }, [orders]);

  // auto reset at 12:02 AM (schedules next occurrence)
  useEffect(() => {
    const scheduleReset = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(0, 2, 0, 0); // 12:02 AM

      if (now >= nextReset) nextReset.setDate(nextReset.getDate() + 1);

      const msUntilReset = nextReset.getTime() - now.getTime();
      return setTimeout(async () => {
        await handleCloseSales();   // call to close sales at scheduled time
        scheduleReset();
      }, msUntilReset);
    };

    const timer = scheduleReset();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, salesToday, amountToday]);

  // manual close sales: posts to API, refreshes history and resets counters locally
  const handleCloseSales = async (dateStr = new Date().toDateString()) => {
    if (closing) return;
    setClosing(true);
    try {
      await axios.post("https://namaexpressbackend.onrender.com/api/sales-summary", {
        date: dateStr,
        sales: salesToday,
        totalAmount: amountToday,
      });

      // refresh history from server
      await fetchHistory();

      // clear today's totals locally (orders remain in DB)
      setSalesToday(0);
      setAmountToday(0);

      // also re-fetch orders in case state changed
      await fetchOrders();
    } catch (err) {
      console.error("Error closing sales:", err);
      alert("Failed to close sales. See console.");
    } finally {
      setClosing(false);
    }
  };

  // pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  // export to excel (adds items column as serialized string)
  const exportExcel = async () => {
    try {
      // build rows where items are serialized into a single cell
      const rows = filtered.map((o) => ({
        SN: "", // we'll fill later
        orderId: o.id || o._id,
        items: (o.items || []).map((it) => `${it.name}×${it.qty}`).join(" | "),
        total: o.total || 0,
        status: o.status || "",
        createdAt: new Date(o.createdAt).toLocaleString(),
      }));

      // add serial numbers
      rows.forEach((r, idx) => (r.SN = idx + 1));

      const worksheet = XLSX.utils.json_to_sheet(rows, { header: ["SN","orderId","items","total","status","createdAt"] });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Something went wrong while exporting.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">
          NAMA EXPRESS Dashboard
        </h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <DateFilter value={range} onChange={setRange} />
          <button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Sales Summary */}
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Total Sales Today</p>
            <p className="text-2xl font-bold text-yellow-700">{salesToday}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Total Amount Today</p>
            <p className="text-2xl font-bold text-green-700">
              ₦{amountToday.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition duration-200"
            >
              {showHistory ? "Hide History" : "View History"}
            </button>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleCloseSales()}
              disabled={closing}
              className={`px-4 py-2 rounded-lg shadow font-semibold transition duration-200 ${
                closing
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {closing ? "Closing..." : "Close Today Sales"}
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Sales History</h3>
            <ul className="divide-y divide-gray-200 max-h-64 overflow-auto p-2 bg-gray-50 rounded">
              {history.length === 0 && (
                <li className="py-2 text-sm text-gray-500 text-center">No history yet</li>
              )}
              {history.map((h, i) => (
                <li key={i} className="py-2 flex justify-between text-sm">
                  <span className="font-medium">{h.date}</span>
                  <span>
                    {h.sales} sales — ₦{(h.totalAmount || 0).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-6">
        <OrderTable orders={paginated} />
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
