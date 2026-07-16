import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Building,
  Globe,
  Target,
  Users,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";

const INDUSTRY_TYPES = [
  "Manufacturing",
  "ITSoftware",
  "Automotive",
  "Pharmaceuticals",
  "Textiles",
  "Food Processing",
  "Chemicals",
  "Electronics",
  "Mixed",
];

const COVERAGE_LEVELS = ["High", "Medium", "Low"];

const IndustrialAreasPage = () => {
  const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const user = sessionUser || null;

  const [areas, setAreas] = useState([]);
  const [accessibleAreas, setAccessibleAreas] = useState([]); // Interim state for role security
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  console.log("All users loaded:", allUsers);
  const [teamMembers, setTeamMembers] = useState([]);

  const [isAddingArea, setIsAddingArea] = useState(false);
  const [coverageOptions, setCoverageOptions] = useState([]);
  const [editingArea, setEditingArea] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [totalAreasCount, setTotalAreasCount] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    region: "",
    potential: "",
    coverageMar25: "",
    state: "",
    city: "",
    focusArea: "",
    unassigned: false,
    coverage: "",
    assignedUser: "",
    sortBy: "name",
    sortOrder: "asc", // "asc" | "desc"
  });

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    region: "",
    potential: "Medium", // "High" | "Medium" | "Low"
    coverageLevels: [],
    assignedTeamMembers: [],
    focusArea: false,
  });

  // Initial load
  useEffect(() => {
    loadAreas();
    loadUsers();
  }, []);

  // Extract unique coverage values for filter when areas change
  useEffect(() => {
    const uniqueCoverageValues = [
      ...new Set(
        (areas || [])
          .map((area) => area.coverageMar25)
          .filter((coverage) => coverage && coverage.trim() !== ""),
      ),
    ].sort();
    setCoverageOptions(uniqueCoverageValues);
  }, [areas]);

  // Step 1: Apply security access controls to raw data
  useEffect(() => {
    if (areas.length >= 0 && allUsers.length >= 0 && user) {
      applyAccessControl();
    }
  }, [areas, allUsers, user]);

  // Step 2: Apply custom search filters to the accessible data subset
  useEffect(() => {
    applyFilters();
  }, [accessibleAreas, filters]);

  const loadUsers = async () => {
    try {
      const response = await SalesVisitService.getUsers();
      const data = response?.data?.data || response?.data || [];
      const users = Array.isArray(data) ? data : [];

      setAllUsers(users);

      const members = users.filter(
        (u) =>
          u.role === "teammember" ||
          u.role === "abpsalesperson" ||
          u.role === "team_member",
      );
      setTeamMembers(members);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  // Synchronous helper for hierarchy
  const getAllSubordinatesSync = (managerId) => {
    const directReports = allUsers.filter(
      (u) => u.reportingmanagerid === managerId && u.isapproved,
    );
    let allSubordinates = directReports.map((u) => u.id);

    directReports.forEach((report) => {
      const indirectReports = getAllSubordinatesSync(report.id);
      allSubordinates = [...allSubordinates, ...indirectReports];
    });

    return allSubordinates;
  };

  const applyAccessControl = () => {
    if (!user) return;

    let accessible = areas;

    if (user.role === "management") {
      accessible = areas;
    } else if (user.role === "teammember" || user.role === "abpsalesperson") {
      const subordinateIds = getAllSubordinatesSync(user.id);

      accessible = areas.filter((area) => {
        const currentCoverage = area.currentCoverage || [];

        if (currentCoverage.includes(user.id)) {
          return true;
        }

        if (subordinateIds.length > 0) {
          const hasSubordinateAssignment = subordinateIds.some((subId) =>
            currentCoverage.includes(subId),
          );
          if (hasSubordinateAssignment) return true;
        }

        return false;
      });
    }

    setAccessibleAreas(accessible);
  };

  const loadAreas = async () => {
    if (!user) return;

    let responseData = [];
    try {
      setLoading(true);
      setError(null);

      const response = await SalesVisitService.getIndustrialAreas();
      responseData = response?.data?.data || response?.data || [];

      const allAreas = (responseData || []).map((area) => {
        const raw = area.currentCoverage || area.currentcoverage || [];

        let coverageArray = [];

        if (Array.isArray(raw)) {
          const joined = raw.join(",");
          const trimmed = joined.trim();

          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                coverageArray = parsed;
              }
            } catch (e) {
              coverageArray = raw.map((c) => String(c));
            }
          } else {
            coverageArray = raw.map((c) => String(c));
          }
        } else if (typeof raw === "string") {
          const trimmed = raw.trim();
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                coverageArray = parsed;
              }
            } catch (e) {
              coverageArray = trimmed.split(",");
            }
          } else {
            coverageArray = trimmed.split(",");
          }
        }

        const cleanedCoverage = coverageArray
          .map((c) => String(c).replace(/"/g, "").trim())
          .filter(Boolean);

        return {
          id: area.id,
          name: area.name,
          city: area.city,
          state: area.state,
          region: area.region,
          potential: area.potential,
          coverageMar25: area.coverageMar25 || area.coveragemar25 || "",
          currentCoverage: cleanedCoverage,
          focusArea: !!area.focusArea || !!area.focusarea,
          createdBy: area.createdBy || area.createdby,
          createdAt: area.createdAt || area.createdat,
          updatedAt: area.updatedAt || area.updatedat,
        };
      });

      setTotalAreasCount(allAreas.length);
      setAreas(allAreas);
    } catch (err) {
      console.error("Error loading industrial areas:", err);
      setError("Failed to load industrial areas");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Read from accessible dataset instead of raw base array
    let filtered = [...accessibleAreas];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (area) =>
          area.name.toLowerCase().includes(searchTerm) ||
          area.city.toLowerCase().includes(searchTerm) ||
          area.state.toLowerCase().includes(searchTerm) ||
          area.region.toLowerCase().includes(searchTerm),
      );
    }

    if (filters.region) {
      filtered = filtered.filter((area) => area.region === filters.region);
    }

    if (filters.state) {
      filtered = filtered.filter((area) => area.state === filters.state);
    }

    if (filters.city) {
      filtered = filtered.filter((area) => area.city === filters.city);
    }

    if (filters.potential) {
      filtered = filtered.filter(
        (area) => area.potential === filters.potential,
      );
    }

    if (filters.focusArea) {
      const isFocus = filters.focusArea === "yes";
      filtered = filtered.filter((area) => area.focusArea === isFocus);
    }

    if (filters.coverageMar25) {
      filtered = filtered.filter(
        (area) => area.coverageMar25 === filters.coverageMar25,
      );
    }

    if (filters.assignedUser) {
      filtered = filtered.filter((area) =>
        (area.currentCoverage || []).includes(filters.assignedUser),
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue;
      let bValue;

      switch (filters.sortBy) {
        case "name":
          aValue = (a.name || "").toLowerCase();
          bValue = (b.name || "").toLowerCase();
          break;
        case "city":
          aValue = (a.city || "").toLowerCase();
          bValue = (b.city || "").toLowerCase();
          break;
        case "state":
          aValue = (a.state || "").toLowerCase();
          bValue = (b.state || "").toLowerCase();
          break;
        case "region":
          aValue = (a.region || "").toLowerCase();
          bValue = (b.region || "").toLowerCase();
          break;
        case "potential": {
          const potentialOrder = { High: 3, Medium: 2, Low: 1 };
          aValue = potentialOrder[a.potential] || 0;
          bValue = potentialOrder[b.potential] || 0;
          break;
        }
        case "assignedCount": {
          const aCoverage = a.currentCoverage || [];
          const bCoverage = b.currentCoverage || [];
          aValue = aCoverage.filter(
            (c) => !["High", "Medium", "Low"].includes(c),
          ).length;
          bValue = bCoverage.filter(
            (c) => !["High", "Medium", "Low"].includes(c),
          ).length;
          break;
        }
        case "focusArea":
          aValue = a.focusArea ? 1 : 0;
          bValue = b.focusArea ? 1 : 0;
          break;
        default:
          aValue = (a.name || "").toLowerCase();
          bValue = (b.name || "").toLowerCase();
          break;
      }

      if (filters.sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });

    setFilteredAreas(filtered);
  };

  const handleSaveArea = async () => {
    if (
      !formData.name ||
      !formData.city ||
      !formData.state ||
      !formData.region
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const areaPayload = {
        id: editingArea?.id || null,
        name: formData.name,
        city: formData.city,
        state: formData.state,
        region: formData.region,
        potential: formData.potential,
        coverageLevels: formData.coverageLevels || [],
        assignedTeamMembers: formData.assignedTeamMembers || [],
        focusArea: formData.focusArea,
        createdBy: user?.id || null,
      };

      await SalesVisitService.saveIndustrialArea(areaPayload);

      setIsAddingArea(false);
      setEditingArea(null);
      resetForm();
      await loadAreas();
    } catch (err) {
      console.error("Error saving industrial area:", err);
      setError("Failed to save industrial area");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = async (areaId) => {
    if (
      !window.confirm("Are you sure you want to delete this industrial area?")
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await SalesVisitService.deleteIndustrialArea({ id: areaId });
      await loadAreas();
    } catch (err) {
      console.error("Error deleting industrial area:", err);
      setError("Failed to delete industrial area");
    } finally {
      setLoading(false);
    }
  };

  const handleEditArea = (area) => {
    setEditingArea(area);

    const currentCoverage = area.currentCoverage || [];
    const coverageLevels = currentCoverage.filter((item) =>
      ["High", "Medium", "Low"].includes(item),
    );
    const teamMemberIds = currentCoverage.filter(
      (item) => !["High", "Medium", "Low"].includes(item),
    );

    setFormData({
      name: area.name || "",
      city: area.city || "",
      state: area.state || "",
      region: area.region || "",
      potential: area.potential || "Medium",
      coverageLevels,
      assignedTeamMembers: teamMemberIds,
      focusArea: !!area.focusArea,
    });

    setIsAddingArea(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      state: "",
      region: "",
      potential: "Medium",
      coverageLevels: [],
      assignedTeamMembers: [],
      focusArea: false,
    });
  };

  const handleCancel = () => {
    setIsAddingArea(false);
    setEditingArea(null);
    resetForm();
    setError(null);
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "City",
      "State",
      "Region",
      "Potential",
      "Current Coverage",
      "Industry Types",
      "Assigned Team Members",
    ];

    const csvData = filteredAreas.map((area) => {
      const currentCoverage = area.currentCoverage || [];
      const coverageStr = currentCoverage.join("|");
      const assignedNames = (currentCoverage || [])
        .filter((id) => !["High", "Medium", "Low"].includes(id))
        .map((userId) => {
          const matchedUser = allUsers.find((u) => u.id === userId);
          return matchedUser ? matchedUser.name : userId;
        })
        .join("|");

      return [
        area.name,
        area.city,
        area.state,
        area.region,
        area.potential,
        coverageStr,
        "",
        assignedNames,
      ];
    });

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `industrial-areas-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const headers = [
      "Name",
      "City",
      "State",
      "Region",
      "Potential",
      "Current Coverage",
    ];
    const sampleData = [
      [
        "Sample Industrial Area",
        "Mumbai",
        "Maharashtra",
        "West",
        "High",
        "High|Medium",
      ],
    ];

    const csvContent = [headers, ...sampleData]
      .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "industrial-areas-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      if (!lines.length) {
        setError("Empty CSV file.");
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((h) => h.replace(/"/g, "").trim());
      const expectedHeaders = [
        "Name",
        "City",
        "State",
        "Region",
        "Potential",
        "Current Coverage",
      ];

      const hasValidHeaders = expectedHeaders.every((header) =>
        headers.some((h) => h.toLowerCase() === header.toLowerCase()),
      );

      if (!hasValidHeaders) {
        setError("Invalid CSV format. Please use the template.");
        return;
      }

      const dataRows = lines.slice(1);
      const importData = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
          .split(",")
          .map((cell) => cell.replace(/"/g, "").trim());

        if (row.length < expectedHeaders.length) continue;

        const [name, city, state, region, potential, coverage] = row;

        if (!name || !city || !state || !region) {
          setError(`Row ${i + 2}: Missing required fields.`);
          return;
        }

        if (!["High", "Medium", "Low"].includes(potential)) {
          setError(
            `Row ${i + 2}: Invalid potential value. Must be High, Medium, or Low.`,
          );
          return;
        }

        const coverageLevels = (coverage || "")
          .split("|")
          .map((c) => c.trim())
          .filter((c) => COVERAGE_LEVELS.includes(c));

        const duplicateIndex = importData.findIndex(
          (otherRow) => otherRow.name === name,
        );
        if (duplicateIndex !== -1) {
          setError(
            `Row ${i + 2}: Duplicate area name "${name}" also found in row ${
              duplicateIndex + 2
            }.`,
          );
          return;
        }

        importData.push({
          name,
          city,
          state,
          region,
          potential,
          coverageLevels,
          focusArea: false,
          createdBy: user?.id || null,
        });
      }

      if (!importData.length) {
        setError("No valid data found in CSV file.");
        return;
      }

      await SalesVisitService.bulkImportIndustrialAreas(importData);
      alert(`Successfully imported ${importData.length} industrial areas!`);
      await loadAreas();
    } catch (err) {
      console.error("Error processing file:", err);
      setError("Failed to process CSV file.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const getPotentialColor = (potential) => {
    switch (potential) {
      case "High":
        return "bg-green-50 text-green-700 border-green-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getCoverageColor = (coverage) => {
    switch (coverage) {
      case "High":
        return "bg-green-100 text-green-800 border-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getUniqueValues = (field) => {
    return [
      ...new Set(
        (areas || [])
          .map((area) => (area[field] || "").toString())
          .filter(Boolean),
      ),
    ].sort();
  };

  const getAssignedUserNames = (userIds) => {
    if (!userIds || !userIds.length) return "";

    const cleanIds = userIds
      .map((id) => String(id).replace(/"/g, "").trim())
      .filter(Boolean);

    return cleanIds
      .map((id) => {
        const matchedUser = allUsers.find(
          (u) => String(u.id).toLowerCase() === id.toLowerCase(),
        );
        return matchedUser ? matchedUser.name : "Unknown User";
      })
      .join(", ");
  };

  const highCoverageCount = areas.filter(
    (area) => area.currentCoverage && area.currentCoverage.includes("High"),
  ).length;

  const filteredCount = filteredAreas.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Industrial Areas</h1>
          <div className="flex items-center space-x-3 mt-1">
            <div className="text-lg font-semibold text-blue-600">
              Total in Database: {totalAreasCount}
            </div>
            <div className="text-sm text-gray-500">
              {filteredCount} area{filteredCount !== 1 ? "s" : ""} shown
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {user?.role === "management" && (
            <button
              onClick={() => setIsAddingArea(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Area</span>
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Total in Database
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {totalAreasCount}
              </p>
              <p className="text-xs text-blue-600">All areas in system</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                High Potential
              </p>
              <p className="text-2xl font-bold text-green-900">
                {areas.filter((a) => a.potential === "High").length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                High Coverage
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {highCoverageCount}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-xl shadow-sm border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Assigned Areas
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {
                  areas.filter(
                    (a) =>
                      (a.currentCoverage || []).filter(
                        (c) => !["High", "Medium", "Low"].includes(c),
                      ).length > 0,
                  ).length
                }
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Manage Industrial Areas
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadAreas}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Template</span>
            </button>
            <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Primary filters */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search areas..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) =>
                  setFilters({ ...filters, state: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All States</option>
                {getUniqueValues("state").map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                {getUniqueValues("city").map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) =>
                  setFilters({ ...filters, region: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Regions</option>
                {getUniqueValues("region").map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potential
              </label>
              <select
                value={filters.potential}
                onChange={(e) =>
                  setFilters({ ...filters, potential: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Potential</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage Mar 25
              </label>
              <select
                value={filters.coverageMar25}
                onChange={(e) =>
                  setFilters({ ...filters, coverageMar25: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Coverage Levels</option>
                {coverageOptions.map((coverage) => (
                  <option key={coverage} value={coverage}>
                    {coverage}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Focus Area
              </label>
              <select
                value={filters.focusArea}
                onChange={(e) =>
                  setFilters({ ...filters, focusArea: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Areas</option>
                <option value="yes">Focus Areas Only</option>
                <option value="no">Non-Focus Areas Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned User
              </label>
              <select
                value={filters.assignedUser}
                onChange={(e) =>
                  setFilters({ ...filters, assignedUser: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Users</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="city">City</option>
                <option value="state">State</option>
                <option value="region">Region</option>
                <option value="potential">Potential</option>
                <option value="focusArea">Focus Area</option>
                <option value="assignedCount">Assigned Count</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  setFilters({ ...filters, sortOrder: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    region: "",
                    potential: "",
                    coverageMar25: "",
                    state: "",
                    city: "",
                    focusArea: "",
                    unassigned: false,
                    coverage: "",
                    assignedUser: "",
                    sortBy: "name",
                    sortOrder: "asc",
                  })
                }
                className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>
                Showing {filteredAreas.length} of {accessibleAreas.length} areas
              </span>
              {(filters.search ||
                filters.state ||
                filters.city ||
                filters.region ||
                filters.potential ||
                filters.focusArea ||
                filters.coverageMar25) && (
                <span className="text-blue-600">Filters active</span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Sorted by {filters.sortBy} ({filters.sortOrder})
            </div>
          </div>
        </div>
      </div>

      {/* Areas table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Location
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Region
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Potential
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Focus Area
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Coverage Mar 25
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Assigned Team Members
                </th>
                {user?.role === "management" && (
                  <th className="text-left py-3 px-6 font-medium text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={user?.role === "management" ? 8 : 7}>
                    <div className="py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Loading industrial areas...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === "management" ? 8 : 7}>
                    <div className="py-12 text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No industrial areas found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your filters or add your first industrial
                        area.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area) => {
                  const currentCoverage = area.currentCoverage || [];
                  const coverageLevels = currentCoverage.filter((item) =>
                    ["High", "Medium", "Low"].includes(item),
                  );
                  const userIds = currentCoverage.filter(
                    (item) => !["High", "Medium", "Low"].includes(item),
                  );

                  return (
                    <tr key={area.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {area.name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-gray-900">{area.city}</div>
                          <div className="text-sm text-gray-500">
                            {area.state}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{area.region}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getPotentialColor(
                            area.potential,
                          )}`}
                        >
                          {area.potential}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${
                            area.focusArea
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {area.focusArea ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {coverageLevels.length > 0 ? (
                            coverageLevels.map((coverage, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getCoverageColor(
                                  coverage,
                                )}`}
                              >
                                {coverage}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">
                              No coverage
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          {userIds.length > 0 ? (
                            getAssignedUserNames(userIds)
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </td>
                      {user?.role === "management" && (
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditArea(area)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit area"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteArea(area.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete area"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Area Modal */}
      {isAddingArea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingArea
                  ? "Edit Industrial Area"
                  : "Add New Industrial Area"}
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter area name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter region"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Potential
                  </label>
                  <select
                    value={formData.potential}
                    onChange={(e) =>
                      setFormData({ ...formData, potential: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Area
                  </label>
                  <select
                    value={formData.focusArea ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        focusArea: e.target.value === "yes",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Coverage levels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Coverage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COVERAGE_LEVELS.map((level) => (
                    <label
                      key={level}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.coverageLevels.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              coverageLevels: [
                                ...formData.coverageLevels,
                                level,
                              ],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              coverageLevels: formData.coverageLevels.filter(
                                (c) => c !== level,
                              ),
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Team members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Team Members
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Selected: {formData.assignedTeamMembers.length} member
                  {formData.assignedTeamMembers.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {teamMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedTeamMembers.includes(
                          member.id,
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              assignedTeamMembers: [
                                ...formData.assignedTeamMembers,
                                member.id,
                              ],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assignedTeamMembers:
                                formData.assignedTeamMembers.filter(
                                  (id) => id !== member.id,
                                ),
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {member.name}{" "}
                        <span className="text-xs text-gray-400">
                          {member.role}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 p-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArea}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>
                  {loading
                    ? "Saving..."
                    : editingArea
                      ? "Update Area"
                      : "Add Area"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrialAreasPage;
