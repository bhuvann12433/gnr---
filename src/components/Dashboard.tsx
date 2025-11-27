import React from "react";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

import { EquipmentStats } from "../types/Equipment";

// -------------------------------
// FORMAT INR ₹
// -------------------------------
const formatCurrencyINR = (value: any) => {
  let num = Number(String(value).replace(/[^\d.-]/g, "")) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(num);
};

// -------------------------------
// NORMAL NUMBER FORMAT (1,23,456)
// -------------------------------
const formatNumber = (n: number | undefined | null) =>
  new Intl.NumberFormat("en-IN").format(n || 0);

// -------------------------------
// CARD COMPONENT
// -------------------------------
const Card: React.FC<{ children: any }> = ({ children }) => (
  <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-md border p-6 hover:-translate-y-1 transition">
    {children}
  </div>
);

// -------------------------------
// CIRCLE ICON WRAPPER
// -------------------------------
const IconCircle: React.FC<{ children: any }> = ({ children }) => (
  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow">
    {children}
  </div>
);

// -------------------------------
// MAIN DASHBOARD
// -------------------------------
const Dashboard: React.FC<{ stats: EquipmentStats }> = ({ stats }) => {
  return (
    <div className="space-y-6">

      {/* ----------------------------- */}
      {/* TOP SUMMARY CARDS */}
      {/* ----------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Equipment Types */}
        <Card>
          <div className="flex items-center">
            <IconCircle>
              <Package className="h-6 w-6" />
            </IconCircle>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Equipment Types</p>
              <p className="text-2xl font-semibold">
                {formatNumber(stats.totalEquipmentTypes)}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Units */}
        <Card>
          <div className="flex items-center">
            <IconCircle>
              <TrendingUp className="h-6 w-6" />
            </IconCircle>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-2xl font-semibold">
                {formatNumber(stats.totalUnits)}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Value */}
        <Card>
          <div className="flex items-center">
            <IconCircle>
              <AlertTriangle className="h-6 w-6" />
            </IconCircle>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-semibold">
                {formatCurrencyINR(stats.totalCost || 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* Available */}
        <Card>
          <div className="flex items-center">
            <IconCircle>
              <CheckCircle className="h-6 w-6" />
            </IconCircle>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-semibold">
                {formatNumber(stats.statusTotals.available)}
              </p>
            </div>
          </div>
        </Card>

      </div>

      {/* ----------------------------- */}
      {/* CATEGORY OVERVIEW */}
      {/* ----------------------------- */}
      <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 border">
        <p className="text-lg font-medium mb-4">Category Overview</p>

        {Object.entries(stats.categoryTotals).map(([category, totals]) => (
          <div
            key={category}
            className="flex justify-between border-b last:border-b-0 py-2 text-sm"
          >
            <span>
              {category} ({totals.count} types, {totals.units} units)
            </span>

            <span className="font-semibold">
              {formatCurrencyINR(totals.cost)}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
