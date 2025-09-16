"use client";

import { useEffect, useState } from "react";
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
  const perPage = 20;

  // fetch orders
  useEffect(() => {
    axios
      .get("https://namaexpressbackend.onrender.com/api/orders")
      .then((res) => {
        setOrders(res.data);
        setFiltered(res.data);
      });
  }, []);

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
        from = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        from = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "quarter":
        from = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "year":
        from = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        from = null;
    }

    if (from) {
      setFiltered(orders.filter((o) => new Date(o.createdAt) >= from));
    }
  }, [range, orders]);

  // track today's sales + auto reset at 1AM
  useEffect(() => {
    const today = new Date().toDateString();
    const todaysOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    );

    setSalesToday(todaysOrders.length);
    setAmountToday(todaysOrders.reduce((sum, o) => sum + (o.total || 0), 0));

    const scheduleReset = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(1, 0, 0, 0); // 1 AM

      if (now >= nextReset) {
        nextReset.setDate(nextReset.getDate() + 1);
      }

      const msUntilReset = nextReset.getTime() - now.getTime();
      setTimeout(() => {
        // send final summary to DB before reset
        axios.post("https://namaexpressbackend.onrender.com/api/sales-summary", {
          date: today,
          sales: salesToday,
          totalAmount: amountToday,
        });

        // push to local history
        setHistory((prev) => [
          ...prev,
          { date: today, sales: salesToday, totalAmount: amountToday },
        ]);

        // reset
        setSalesToday(0);
        setAmountToday(0);
      }, msUntilReset);
    };

    scheduleReset();
  }, [orders, salesToday, amountToday]);

  // pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  // export to excel + share on Android (desktop safe)
  const exportExcel = async () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filtered);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const file = new File([blob], "orders.xlsx", { type: blob.type });

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "Orders Export",
          text: "Here is the exported Excel file from NAMA EXPRESS POS.",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "orders.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export/Share failed:", err);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {showHistory && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Sales History</h3>
            <ul className="divide-y divide-gray-200">
              {history.map((h, i) => (
                <li key={i} className="py-2 flex justify-between text-sm">
                  <span>{h.date}</span>
                  <span>
                    {h.sales} sales — ₦{h.totalAmount.toLocaleString()}
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
