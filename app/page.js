"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // fetch sales history
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

  // filter by date range
  useEffect(() => {
    if (range === "all") {
      setFiltered(orders);
      return;
    }

    const now = new Date();
    let from = null;

    switch (range) {
      case "today":
        from = new Date();
        from.setHours(0, 0, 0, 0);
        break;
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

  // compute today's stats
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const todaysOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === todayStr
    );

    setSalesToday(todaysOrders.length);
    setAmountToday(todaysOrders.reduce((sum, o) => sum + (o.total || 0), 0));
  }, [orders]);

  // auto reset sales close
  useEffect(() => {
    const scheduleReset = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(0, 2, 0, 0); // 12:02 AM
      if (now >= nextReset) nextReset.setDate(nextReset.getDate() + 1);

      const msUntilReset = nextReset.getTime() - now.getTime();
      return setTimeout(async () => {
        await handleCloseSales();
        scheduleReset();
      }, msUntilReset);
    };

    const timer = scheduleReset();
    return () => clearTimeout(timer);
  }, [orders, salesToday, amountToday]);

  // close sales
  const handleCloseSales = async (dateStr = new Date().toDateString()) => {
    if (closing) return;
    setClosing(true);
    try {
      await axios.post("https://namaexpressbackend.onrender.com/api/sales-summary", {
        date: dateStr,
        sales: salesToday,
        totalAmount: amountToday,
      });

      await fetchHistory();
      setSalesToday(0);
      setAmountToday(0);
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

  // export excel
  const exportExcel = async () => {
    try {
      const rows = filtered.map((o) => ({
        SN: "",
        orderId: o.id || o._id,
        items: (o.items || []).map((it) => `${it.name}×${it.qty}`).join(" | "),
        total: o.total || 0,
        status: o.status || "",
        createdAt: new Date(o.createdAt).toLocaleString(),
      }));

      rows.forEach((r, idx) => (r.SN = idx + 1));

      const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: ["SN", "orderId", "items", "total", "status", "createdAt"],
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Something went wrong while exporting.");
    }
  };

  // export pdf (orders table)
  // const exportPDF = () => {
  //   try {
  //     const doc = new jsPDF("l", "pt", "a4");
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();

  //     // === LOGO + TITLE ===
  //     const logoUrl = "namalogo.png"; // <-- replace with your logo path or base64 string
  //     doc.addImage(logoUrl, "PNG", 20, 15, 50, 50); // logo top-left
  //     doc.setFontSize(20);
  //     doc.setTextColor(0, 0, 0); // black
  //     doc.text("NAMA EXPRESS", 90, 40);

  //     // === TABLE ===
  //     const tableColumn = ["SN", "Order ID", "Items", "Total", "Status", "Created At"];
  //     const tableRows = filtered.map((o, idx) => [
  //       idx + 1,
  //       o.id || o._id,
  //       (o.items || []).map((it) => `${it.name}×${it.qty}`).join(" | "),
  //       `₦${(o.total || 0).toLocaleString()}`,
  //       o.status || "",
  //       new Date(o.createdAt).toLocaleString(),
  //     ]);

  //     autoTable(doc, {
  //       head: [tableColumn],
  //       body: tableRows,
  //       startY: 70,
  //       styles: {
  //         fontSize: 9,
  //         cellPadding: 6,
  //         overflow: "linebreak",
  //       },
  //       headStyles: {
  //         fillColor: [255, 215, 0], // Yellow
  //         textColor: [0, 0, 0], // Black text
  //         halign: "center",
  //         lineWidth: 0.5,
  //         lineColor: [255, 0, 0], // Red border
  //       },
  //       bodyStyles: {
  //         lineWidth: 0.25,
  //         lineColor: [0, 0, 0], // black grid lines
  //       },
  //       columnStyles: {
  //         0: { cellWidth: 30, halign: "center" },
  //         1: { cellWidth: 120 },
  //         2: { cellWidth: 350 },
  //         3: { cellWidth: 80, halign: "right" },
  //         4: { cellWidth: 80, halign: "center" },
  //         5: { cellWidth: 160 },
  //       },
  //       didDrawPage: function () {
  //         const pageCount = doc.internal.getNumberOfPages();
  //         const footerStr = `Page ${pageCount}`;
  //         doc.setFontSize(10);
  //         doc.text(footerStr, pageWidth - 40, pageHeight - 10, { align: "right" });
  //       },
  //     });

  //     doc.save(`orders_${new Date().toISOString().slice(0, 10)}.pdf`);
  //   } catch (err) {
  //     console.error("PDF export failed:", err);
  //     alert("Something went wrong while exporting PDF.");
  //   }
  // };

  const exportPDF = () => {
    try {
      const doc = new jsPDF("landscape", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
  
      // === LOGO + TITLE ===
      const logoUrl = "namalogo.png"; // replace with actual logo or base64
      doc.addImage(logoUrl, "PNG", 20, 15, 50, 50); // logo top-left
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("NAMA EXPRESS", 90, 40);
  
      // === TABLE HEADERS ===
      const tableColumn = ["SN", "Order ID", "Item", "Qty", "Total", "Status", "Created At"];
  
      // === TABLE DATA (split items into multiple rows with separate Qty) ===
      const tableRows = filtered.flatMap((o, idx) =>
        (o.items || []).map((it, itemIdx) => [
          itemIdx === 0 ? idx + 1 : "",
          itemIdx === 0 ? (o.id || o._id) : "",
          it.name,            // item name
          it.qty,             // item quantity
          itemIdx === 0 ? `#${(o.total || 0).toLocaleString()}` : "",
          itemIdx === 0 ? (o.status || "") : "",
          itemIdx === 0 ? new Date(o.createdAt).toLocaleString() : "",
        ])
      );
  
      // === AUTOTABLE ===
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 80,
        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 5,
          halign: "center",   // center all cells
          valign: "middle",
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [255, 215, 0], // Yellow
          textColor: [0, 0, 0],     // Black text
          halign: "center",
          valign: "middle",
          lineWidth: 0.8,
          lineColor: [255, 0, 0],   // Red border
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: [0, 0, 0],     // Black text
          lineColor: [0, 0, 0],     // Black grid
          lineWidth: 0.25,
        },
        columnStyles: {
          0: { cellWidth: 40 },  // SN
          1: { cellWidth: 100 }, // Order ID
          2: { cellWidth: 150 }, // Item
          3: { cellWidth: 50 },  // Qty
          4: { cellWidth: 80 },  // Total
          5: { cellWidth: 80 },  // Status
          6: { cellWidth: 120 }, // Created At
        },
        didDrawPage: function () {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(
            `Page ${pageCount}`,
            pageWidth - 50,
            pageHeight - 20,
            { align: "right" }
          );
        },
      });
  
      // === SAVE ===
      doc.save(`orders_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Something went wrong while exporting PDF.");
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
          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
          >
            Export PDF
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
          <div className="mt-10">
            <h3 className="text-2xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
              📊 Sales History
            </h3>
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
              <ul className="divide-y divide-gray-200 max-h-80 overflow-auto">
                {history.length === 0 && (
                  <li className="py-6 text-sm text-gray-500 text-center">
                    No history yet 🚫
                  </li>
                )}
                {[...history]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((h, i) => (
                    <li
                      key={i}
                      className="px-4 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-gray-700 text-base">{h.date}</span>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs uppercase text-gray-400">Sales</p>
                          <p className="text-lg font-bold text-green-600">{h.sales}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs uppercase text-gray-400">Total</p>
                          <p className="text-lg font-bold text-gray-800">
                            ₦{(h.totalAmount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
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
