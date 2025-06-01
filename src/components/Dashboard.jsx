import React, { useState, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Upload,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import Papa from "papaparse";
import _ from "lodash";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    dateRange: "all",
    country: "all",
    ageGroup: "all",
    gender: "all",
  });

  // Sample data for demonstration
  const sampleData = [
    {
      Date: "12/1/2021",
      Month: "December",
      Year: 2021,
      Customer_Age: 39,
      Age_Group: "Adults (35-64)",
      Customer_Gender: "F",
      Country: "United States",
      State: "California",
      Product_Category: "Bikes",
      Order_Quantity: 4,
      Profit: 3988,
      Cost: 5008,
      Revenue: 8996,
    },
    {
      Date: "12/1/2021",
      Month: "December",
      Year: 2021,
      Customer_Age: 42,
      Age_Group: "Adults (35-64)",
      Customer_Gender: "M",
      Country: "United States",
      State: "Washington",
      Product_Category: "Bikes",
      Order_Quantity: 3,
      Profit: 232,
      Cost: 1032,
      Revenue: 1264,
    },
    {
      Date: "12/1/2021",
      Month: "December",
      Year: 2021,
      Customer_Age: 36,
      Age_Group: "Adults (35-64)",
      Customer_Gender: "F",
      Country: "Germany",
      State: "Brandenburg",
      Product_Category: "Bikes",
      Order_Quantity: 2,
      Profit: 792,
      Cost: 1426,
      Revenue: 2218,
    },
    {
      Date: "12/1/2021",
      Month: "December",
      Year: 2021,
      Customer_Age: 20,
      Age_Group: "Youth (<25)",
      Customer_Gender: "M",
      Country: "Germany",
      State: "Hamburg",
      Product_Category: "Bikes",
      Order_Quantity: 1,
      Profit: 717,
      Cost: 1555,
      Revenue: 2272,
    },
    {
      Date: "12/1/2021",
      Month: "December",
      Year: 2021,
      Customer_Age: 23,
      Age_Group: "Youth (<25)",
      Customer_Gender: "M",
      Country: "United Kingdom",
      State: "England",
      Product_Category: "Bikes",
      Order_Quantity: 1,
      Profit: 1264,
      Cost: 2171,
      Revenue: 3435,
    },
  ];

  // Initialize with sample data
  React.useEffect(() => {
    if (data.length === 0) {
      setData(sampleData);
      setFileName("Sample Bike Sales Data");
    }
  }, []);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: [",", "\t", "|", ";"],
      complete: (results) => {
        try {
          // Clean and process the data
          const processedData = results.data
            .map((row) => {
              const cleanRow = {};
              Object.keys(row).forEach((key) => {
                const cleanKey = key.trim();
                let value = row[key];

                // Handle monetary values
                if (typeof value === "string" && value.includes("$")) {
                  value = parseFloat(value.replace(/[$,]/g, "")) || 0;
                }

                cleanRow[cleanKey] = value;
              });
              return cleanRow;
            })
            .filter((row) =>
              Object.values(row).some((val) => val !== null && val !== "")
            );

          setData(processedData);
          setIsLoading(false);
        } catch (error) {
          console.error("Error processing data:", error);
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setIsLoading(false);
      },
    });
  }, []);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.country !== "all" && row.Country !== filters.country)
        return false;
      if (filters.ageGroup !== "all" && row.Age_Group !== filters.ageGroup)
        return false;
      if (filters.gender !== "all" && row.Customer_Gender !== filters.gender)
        return false;
      return true;
    });
  }, [data, filters]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!filteredData.length)
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalOrders: 0,
        avgOrderValue: 0,
      };

    const totalRevenue = _.sumBy(filteredData, "Revenue") || 0;
    const totalProfit = _.sumBy(filteredData, "Profit") || 0;
    const totalOrders = filteredData.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalProfit, totalOrders, avgOrderValue };
  }, [filteredData]);

  // Chart data preparations
  const revenueByCountry = useMemo(() => {
    return _(filteredData)
      .groupBy("Country")
      .map((items, country) => ({
        country,
        revenue: _.sumBy(items, "Revenue") || 0,
        profit: _.sumBy(items, "Profit") || 0,
      }))
      .orderBy("revenue", "desc")
      .take(10)
      .value();
  }, [filteredData]);

  const ageGroupDistribution = useMemo(() => {
    return _(filteredData)
      .groupBy("Age_Group")
      .map((items, ageGroup) => ({
        name: ageGroup,
        value: items.length,
        revenue: _.sumBy(items, "Revenue") || 0,
      }))
      .value();
  }, [filteredData]);

  const genderDistribution = useMemo(() => {
    return _(filteredData)
      .groupBy("Customer_Gender")
      .map((items, gender) => ({
        name: gender === "M" ? "Male" : gender === "F" ? "Female" : gender,
        value: items.length,
        revenue: _.sumBy(items, "Revenue") || 0,
      }))
      .value();
  }, [filteredData]);

  const monthlyTrend = useMemo(() => {
    return _(filteredData)
      .groupBy("Month")
      .map((items, month) => ({
        month,
        revenue: _.sumBy(items, "Revenue") || 0,
        profit: _.sumBy(items, "Profit") || 0,
        orders: items.length,
      }))
      .value();
  }, [filteredData]);

  // Get unique values for filters
  const uniqueCountries = useMemo(
    () => [...new Set(data.map((row) => row.Country))].filter(Boolean),
    [data]
  );
  const uniqueAgeGroups = useMemo(
    () => [...new Set(data.map((row) => row.Age_Group))].filter(Boolean),
    [data]
  );

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
    "#8dd1e1",
    "#d084d0",
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const KPICard = ({ title, value, icon: Icon, color, format = "number" }) => (
    <div
      className="bg-white rounded-xl shadow-lg p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {format === "currency"
              ? formatCurrency(value)
              : value.toLocaleString()}
          </p>
        </div>
        <div
          className="p-3 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interactive Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time data visualization and analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2">
                <Upload size={20} />
                <span>Upload Data</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Status */}
        {fileName && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <FileText className="text-green-600" size={20} />
            <span className="text-green-800">
              Data loaded: <strong>{fileName}</strong> ({filteredData.length}{" "}
              records)
            </span>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={filters.country}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, country: e.target.value }))
              }
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            <select
              value={filters.ageGroup}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, ageGroup: e.target.value }))
              }
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Age Groups</option>
              {uniqueAgeGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <select
              value={filters.gender}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, gender: e.target.value }))
              }
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: TrendingUp },
              { id: "demographics", name: "Demographics", icon: Users },
              { id: "trends", name: "Trends", icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Revenue"
            value={kpis.totalRevenue}
            icon={DollarSign}
            color="#10b981"
            format="currency"
          />
          <KPICard
            title="Total Profit"
            value={kpis.totalProfit}
            icon={TrendingUp}
            color="#3b82f6"
            format="currency"
          />
          <KPICard
            title="Total Orders"
            value={kpis.totalOrders}
            icon={FileText}
            color="#8b5cf6"
          />
          <KPICard
            title="Avg Order Value"
            value={kpis.avgOrderValue}
            icon={DollarSign}
            color="#f59e0b"
            format="currency"
          />
        </div>

        {/* Chart Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Country */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Revenue by Country
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByCountry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="country"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Age Group Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Orders by Age Group
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ageGroupDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ageGroupDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "demographics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Gender Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Age Group Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Revenue by Age Group
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageGroupDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Monthly Performance Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={formatCurrency} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "orders" ? value : formatCurrency(value),
                    name === "revenue"
                      ? "Revenue"
                      : name === "profit"
                      ? "Profit"
                      : "Orders",
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#f59e0b"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Table Preview */}
        {filteredData.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Data Preview
              </h3>
              <span className="text-sm text-gray-600">
                Showing first 10 records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(filteredData[0] || {})
                      .slice(0, 8)
                      .map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key.replace(/_/g, " ")}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row)
                        .slice(0, 8)
                        .map((value, i) => (
                          <td
                            key={i}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {typeof value === "number" &&
                            (Object.keys(row)[i].includes("Revenue") ||
                              Object.keys(row)[i].includes("Profit") ||
                              Object.keys(row)[i].includes("Cost"))
                              ? formatCurrency(value)
                              : String(value)}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
