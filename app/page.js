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
  const perPage = 20;

  // fetch orders
  useEffect(() => {
    axios.get("https://namaexpressbackend.onrender.com/api/orders").then((res) => {
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
      setFiltered(
        orders.filter((o) => new Date(o.createdAt) >= from)
      );
    }
  }, [range, orders]);

  // pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  // export to excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders.xlsx");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">
          POS Orders Dashboard
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
