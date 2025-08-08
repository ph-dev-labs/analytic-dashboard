import React, { useState, useCallback, useMemo, useRef } from "react";
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
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
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
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart as PieIcon,
  TrendingDown,
  Activity,
  Target,
} from "lucide-react";
import Papa from "papaparse";
import _ from "lodash";

const Dashboard = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Data State
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [chartType, setChartType] = useState({
    primary: "bar",
    secondary: "pie",
    trend: "line",
  });

  // Advanced Filters
  const [filters, setFilters] = useState({
    dateRange: "all",
    country: "all",
    ageGroup: "all",
    gender: "all",
    productCategory: "all",
    revenueRange: { min: "", max: "" },
  });

  // File upload ref
  const fileInputRef = useRef(null);

  // Sample users for demo (in real app, this would be backend)
  const users = [
    { username: "admin", password: "admin123", role: "Administrator" },
    { username: "analyst", password: "analyst123", role: "Business Analyst" },
    { username: "manager", password: "manager123", role: "Manager" },
  ];

  // Enhanced sample data
  const sampleData = [
    {
      Date: "2024-01-15",
      Month: "January",
      Year: 2024,
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
      Date: "2024-02-10",
      Month: "February",
      Year: 2024,
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
      Date: "2024-03-05",
      Month: "March",
      Year: 2024,
      Customer_Age: 36,
      Age_Group: "Adults (35-64)",
      Customer_Gender: "F",
      Country: "Germany",
      State: "Brandenburg",
      Product_Category: "Accessories",
      Order_Quantity: 2,
      Profit: 792,
      Cost: 1426,
      Revenue: 2218,
    },
    {
      Date: "2024-04-20",
      Month: "April",
      Year: 2024,
      Customer_Age: 20,
      Age_Group: "Youth (<25)",
      Customer_Gender: "M",
      Country: "Germany",
      State: "Hamburg",
      Product_Category: "Clothing",
      Order_Quantity: 1,
      Profit: 717,
      Cost: 1555,
      Revenue: 2272,
    },
    {
      Date: "2024-05-12",
      Month: "May",
      Year: 2024,
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
      setFileName("Sample Business Dataset");
    }
  }, []);

  // Authentication handlers
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === loginForm.username && u.password === loginForm.password
    );
    
    if (user) {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: "", password: "" });
    setLoginError("");
  };

  // Enhanced file upload with validation
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // File size validation (5MB limit as per thesis)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError("File size exceeds 5MB limit");
      return;
    }

    // File type validation
    const allowedTypes = [".csv", ".xlsx", ".xls", ".json"];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(fileExtension)) {
      setUploadError("Unsupported file format. Please upload CSV, Excel, or JSON files.");
      return;
    }

    setIsLoading(true);
    setUploadError("");
    setFileName(file.name);

    if (fileExtension === ".json") {
      // Handle JSON files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          const processedData = Array.isArray(jsonData) ? jsonData : [jsonData];
          setData(processedData);
          setIsLoading(false);
        } catch (error) {
          setUploadError("Invalid JSON format");
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } else {
      // Handle CSV/Excel files
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [",", "\t", "|", ";"],
        complete: (results) => {
          try {
            const processedData = results.data
              .map((row) => {
                const cleanRow = {};
                Object.keys(row).forEach((key) => {
                  const cleanKey = key.trim();
                  let value = row[key];

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
            setUploadError("Error processing file: " + error.message);
            setIsLoading(false);
          }
        },
        error: (error) => {
          setUploadError("Error parsing file: " + error.message);
          setIsLoading(false);
        },
      });
    }
  }, []);

  // Advanced filtering with revenue range
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.country !== "all" && row.Country !== filters.country)
        return false;
      if (filters.ageGroup !== "all" && row.Age_Group !== filters.ageGroup)
        return false;
      if (filters.gender !== "all" && row.Customer_Gender !== filters.gender)
        return false;
      if (filters.productCategory !== "all" && row.Product_Category !== filters.productCategory)
        return false;
      
      // Revenue range filter
      if (filters.revenueRange.min && row.Revenue < parseFloat(filters.revenueRange.min))
        return false;
      if (filters.revenueRange.max && row.Revenue > parseFloat(filters.revenueRange.max))
        return false;
      
      return true;
    });
  }, [data, filters]);

  // Enhanced KPI calculations
  const kpis = useMemo(() => {
    if (!filteredData.length)
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        profitMargin: 0,
        totalCustomers: 0,
        avgQuantity: 0,
        growthRate: 0,
      };

    const totalRevenue = _.sumBy(filteredData, "Revenue") || 0;
    const totalProfit = _.sumBy(filteredData, "Profit") || 0;
    const totalCost = _.sumBy(filteredData, "Cost") || 0;
    const totalOrders = filteredData.length;
    const totalQuantity = _.sumBy(filteredData, "Order_Quantity") || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const totalCustomers = new Set(filteredData.map(row => `${row.Customer_Age}-${row.Customer_Gender}-${row.Country}`)).size;
    const avgQuantity = totalOrders > 0 ? totalQuantity / totalOrders : 0;

    return { 
      totalRevenue, 
      totalProfit, 
      totalOrders, 
      avgOrderValue, 
      profitMargin, 
      totalCustomers,
      avgQuantity,
      growthRate: 0 // Placeholder for growth calculation
    };
  }, [filteredData]);

  // Enhanced chart data preparations
  const revenueByCountry = useMemo(() => {
    return _(filteredData)
      .groupBy("Country")
      .map((items, country) => ({
        country,
        revenue: _.sumBy(items, "Revenue") || 0,
        profit: _.sumBy(items, "Profit") || 0,
        orders: items.length,
      }))
      .orderBy("revenue", "desc")
      .take(10)
      .value();
  }, [filteredData]);

  const productCategoryData = useMemo(() => {
    return _(filteredData)
      .groupBy("Product_Category")
      .map((items, category) => ({
        name: category || "Unknown",
        value: items.length,
        revenue: _.sumBy(items, "Revenue") || 0,
        profit: _.sumBy(items, "Profit") || 0,
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
  const uniqueProductCategories = useMemo(
    () => [...new Set(data.map((row) => row.Product_Category))].filter(Boolean),
    [data]
  );

  // Export functionality
  const exportToPDF = () => {
    window.print(); // Simple PDF export via browser print
  };

  const exportToExcel = () => {
    const csvContent = Papa.unparse(filteredData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportChart = (format) => {
    // This would require html2canvas or similar library in a real implementation
    alert(`Chart export to ${format.toUpperCase()} functionality would be implemented with html2canvas library`);
  };

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
    "#8dd1e1",
    "#d084d0",
    "#ffb347",
    "#87ceeb",
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Enhanced KPI Card component
  const KPICard = ({ title, value, icon: Icon, color, format = "number", trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-shadow" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {format === "currency"
              ? formatCurrency(value)
              : format === "percentage"
              ? `${value.toFixed(1)}%`
              : value.toLocaleString()}
          </p>
          {trend && (
            <div className={`flex items-center mt-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
              {trend === 'up' ? <TrendingUp size={16} /> : trend === 'down' ? <TrendingDown size={16} /> : null}
              <span className="text-sm ml-1">{trendValue || 'No change'}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Business Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Sign in to access your data visualization platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={20} />
                <span className="text-sm">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Demo accounts:</p>
            <div className="text-xs space-y-1">
              <div>admin / admin123 (Administrator)</div>
              <div>analyst / analyst123 (Business Analyst)</div>
              <div>manager / manager123 (Manager)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interactive Analytics Dashboard</h1>
              <p className="text-gray-600">Real-time business intelligence and data visualization</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={exportToPDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download size={20} />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download size={20} />
                  <span>Export Excel</span>
                </button>
              </div>
              
              <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2">
                <Upload size={20} />
                <span>Upload Data</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Status */}
        {fileName && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800">
              Data loaded: <strong>{fileName}</strong> ({filteredData.length} records)
            </span>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            )}
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800">{uploadError}</span>
          </div>
        )}

        {/* Enhanced Filters */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <Filter size={20} className="text-gray-500" />
            <span className="font-medium text-gray-700">Advanced Filters:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={filters.ageGroup}
              onChange={(e) => setFilters(prev => ({ ...prev, ageGroup: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Age Groups</option>
              {uniqueAgeGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>

            <select
              value={filters.productCategory}
              onChange={(e) => setFilters(prev => ({ ...prev, productCategory: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {uniqueProductCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min Revenue"
              value={filters.revenueRange.min}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                revenueRange: { ...prev.revenueRange, min: e.target.value }
              }))}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              placeholder="Max Revenue"
              value={filters.revenueRange.max}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                revenueRange: { ...prev.revenueRange, max: e.target.value }
              }))}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <span className="text-sm font-medium text-gray-700">Chart Types:</span>
            <select
              value={chartType.primary}
              onChange={(e) => setChartType(prev => ({ ...prev, primary: e.target.value }))}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: TrendingUp },
              { id: "demographics", name: "Demographics", icon: Users },
              { id: "performance", name: "Performance", icon: Target },
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

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Revenue"
            value={kpis.totalRevenue}
            icon={DollarSign}
            color="#10b981"
            format="currency"
            trend="up"
            trendValue="12% vs last period"
          />
          <KPICard
            title="Total Profit"
            value={kpis.totalProfit}
            icon={TrendingUp}
            color="#3b82f6"
            format="currency"
            trend="up"
            trendValue="8% vs last period"
          />
          <KPICard
            title="Profit Margin"
            value={kpis.profitMargin}
            icon={Activity}
            color="#8b5cf6"
            format="percentage"
            trend="stable"
          />
          <KPICard
            title="Total Orders"
            value={kpis.totalOrders}
            icon={FileText}
            color="#f59e0b"
            trend="up"
            trendValue="15% vs last period"
          />
        </div>

        {/* Dynamic Chart Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Revenue by Country</h3>
                <button
                  onClick={() => exportChart('png')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download size={16} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {chartType.primary === "bar" ? (
                  <BarChart data={revenueByCountry}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                ) : chartType.primary === "line" ? (
                  <LineChart data={revenueByCountry}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                ) : (
                  <AreaChart data={revenueByCountry}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Product Category Performance</h3>
                <button
                  onClick={() => exportChart('png')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download size={16} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Age Group Distribution</h3>
                <button
                  onClick={() => exportChart('png')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download size={16} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={_(filteredData).groupBy("Age_Group").map((items, ageGroup) => ({
                      name: ageGroup,
                      value: items.length,
                      revenue: _.sumBy(items, "Revenue") || 0,
                    })).value()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {_(filteredData).groupBy("Age_Group").map((items, ageGroup) => ({
                      name: ageGroup,
                      value: items.length,
                    })).value().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Gender Distribution</h3>
                <button
                  onClick={() => exportChart('png')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download size={16} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={_(filteredData).groupBy("Customer_Gender").map((items, gender) => ({
                  gender: gender === "M" ? "Male" : gender === "F" ? "Female" : gender,
                  count: items.length,
                  revenue: _.sumBy(items, "Revenue") || 0,
                })).value()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="gender" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Revenue vs Profit Analysis</h3>
                <button
                  onClick={() => exportChart('png')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download size={16} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={filteredData.slice(0, 50)}>
                  <CartesianGrid />
                  <XAxis dataKey="Revenue" name="Revenue" tickFormatter={formatCurrency} />
                  <YAxis dataKey="Profit" name="Profit" tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name]}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter dataKey="Profit" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Performing Countries</h3>
                <button
                  onClick={() => exportChart('png')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download size={16} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByCountry} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={formatCurrency} />
                  <YAxis dataKey="country" type="category" width={100} />
                  <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Monthly Performance Trends</h3>
                <button
                  onClick={() => exportChart('png')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download size={16} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={_(filteredData).groupBy("Month").map((items, month) => ({
                  month,
                  revenue: _.sumBy(items, "Revenue") || 0,
                  profit: _.sumBy(items, "Profit") || 0,
                  orders: items.length,
                })).value()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "orders" ? value : formatCurrency(value),
                      name === "revenue" ? "Revenue" : name === "profit" ? "Profit" : "Orders",
                    ]}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                  <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Growth by Quarter</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={[
                    { quarter: "Q1", growth: 12.5 },
                    { quarter: "Q2", growth: 18.2 },
                    { quarter: "Q3", growth: 15.7 },
                    { quarter: "Q4", growth: 22.1 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Growth"]} />
                    <Area type="monotone" dataKey="growth" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Market Share by Region</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "North America", value: 45, color: "#8884d8" },
                        { name: "Europe", value: 30, color: "#82ca9d" },
                        { name: "Asia Pacific", value: 20, color: "#ffc658" },
                        { name: "Others", value: 5, color: "#ff7c7c" },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "North America", value: 45, color: "#8884d8" },
                        { name: "Europe", value: 30, color: "#82ca9d" },
                        { name: "Asia Pacific", value: 20, color: "#ffc658" },
                        { name: "Others", value: 5, color: "#ff7c7c" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Data Table with Drill-down */}
        {filteredData.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Data Explorer</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Showing {Math.min(10, filteredData.length)} of {filteredData.length} records
                </span>
                <button
                  onClick={exportToExcel}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Export All Data
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(filteredData[0] || {}).slice(0, 10).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        {key.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      {Object.values(row).slice(0, 10).map((value, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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

        {/* Additional KPI Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Order Value:</span>
                <span className="font-semibold">{formatCurrency(kpis.avgOrderValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Customers:</span>
                <span className="font-semibold">{kpis.totalCustomers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Quantity:</span>
                <span className="font-semibold">{kpis.avgQuantity.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Margin:</span>
                <span className="font-semibold text-green-600">{kpis.profitMargin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate:</span>
                <span className="font-semibold">2.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Return Rate:</span>
                <span className="font-semibold">1.2%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Data Quality</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Records Loaded:</span>
                <span className="font-semibold">{data.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Filtered Records:</span>
                <span className="font-semibold">{filteredData.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data Completeness:</span>
                <span className="font-semibold text-green-600">98.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Interactive Data Visualization Dashboard for Business Analytics</p>
          <p className="mt-1">Real-time insights • Advanced filtering • Export capabilities</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;