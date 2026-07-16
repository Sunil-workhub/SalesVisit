import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  RotateCcw,
  Plus,
  Search,
  MessageSquare,
  Clock,
  Building,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarDays,
  Briefcase,
  Target,
  Building2,
  ClipboardList,
} from "lucide-react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";

const VISIT_TYPE_OPTIONS = [
  { value: "BD_VISIT", label: "BD Visit" },
  { value: "ABP_VISIT", label: "ABP Visit" },
  { value: "ONGOING_DEAL", label: "Ongoing Deal" },
  { value: "KEY_ACCOUNT", label: "Key Account" },
  { value: "OFFICE", label: "Office" },
  { value: "LEAVE", label: "Leave" },
];

const MonthlyActual = () => {
  const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const user = sessionUser || null;

  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [industrialAreas, setIndustrialAreas] = useState([]);
  const [isAddingAlternate, setIsAddingAlternate] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [confirmingVisit, setConfirmingVisit] = useState(null);
  const [confirmationNotes, setConfirmationNotes] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    visitType: "",
    search: "",
  });

  useEffect(() => {
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    setSelectedMonth(monthKey);
    setSelectedYear(currentDate.getFullYear());
  }, []);

  useEffect(() => {
    if (user?.emp_id && selectedMonth && selectedYear) {
      loadMonthlyActualData(selectedMonth, selectedYear);
    }
  }, [user?.emp_id, selectedMonth, selectedYear]);

  useEffect(() => {
    applyFilters();
  }, [visits, filters]);

  const normalizeVisit = (visit) => ({
    id: visit?.id || visit?.Id || "",
    userId: visit?.userId || visit?.UserId || "",
    planId: visit?.planId ?? visit?.PlanId ?? null,
    customerName: visit?.customerName || visit?.CustomerName || "",
    location: visit?.location || visit?.Location || "",
    industrialArea: visit?.industrialArea || visit?.IndustrialArea || "",
    visitType: visit?.visitType || visit?.VisitType || "",
    plannedDate: formatDateOnly(visit?.plannedDate || visit?.PlannedDate || ""),
    actualDate: visit?.actualDate || visit?.ActualDate || null,
    status: visit?.status || visit?.Status || "planned",
    isApproved: visit?.isApproved ?? visit?.IsApproved ?? false,
    isAlternate: visit?.isAlternate ?? visit?.IsAlternate ?? false,
    originalVisitId: visit?.originalVisitId || visit?.OriginalVisitId || null,
    month: visit?.month || visit?.Month || "",
    year: visit?.year || visit?.Year || 0,
    notes: visit?.notes || visit?.Notes || "",
    createdAt: visit?.createdAt || visit?.CreatedAt || null,
    updatedAt: visit?.updatedAt || visit?.UpdatedAt || null,
  });

  const normalizeArea = (area) => ({
    id: area?.id || area?.Id || "",
    name: area?.name || area?.Name || "",
    city: area?.city || area?.City || "",
    state: area?.state || area?.State || "",
    region: area?.region || area?.Region || "",
    potential: area?.potential || area?.Potential || "",
    currentCoverage: area?.currentCoverage || area?.CurrentCoverage || "[]",
    potentialCustomers:
      area?.potentialCustomers || area?.PotentialCustomers || 0,
    focusArea: area?.focusArea ?? area?.FocusArea ?? false,
    isActive: area?.isActive ?? area?.IsActive ?? true,
  });

  const formatDateOnly = (value) => {
    if (!value) return "";
    return String(value).split("T")[0];
  };

  const loadMonthlyActualData = async (month, year) => {
    try {
      setLoading(true);

      const payload = {
        userId: user?.emp_id,
        month,
        year,
      };

      const response = await SalesVisitService.getMonthlyActualData(payload);
      const data = response?.data?.data || response?.data || {};

      const visitsData = Array.isArray(data?.visits)
        ? data.visits
        : Array.isArray(data?.Visits)
          ? data.Visits
          : [];

      const industrialAreasData = Array.isArray(data?.industrialAreas)
        ? data.industrialAreas
        : Array.isArray(data?.IndustrialAreas)
          ? data.IndustrialAreas
          : [];

      setVisits((visitsData || []).map(normalizeVisit));
      setIndustrialAreas((industrialAreasData || []).map(normalizeArea));
    } catch (error) {
      console.error("Error loading monthly actual data:", error);
      setVisits([]);
      setIndustrialAreas([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...visits];

    if (filters.status) {
      if (filters.status === "alternate") {
        filtered = filtered.filter((visit) => visit.isAlternate === true);
      } else {
        filtered = filtered.filter(
          (visit) =>
            visit.status === filters.status && visit.isAlternate !== true,
        );
      }
    }

    if (filters.visitType) {
      filtered = filtered.filter((visit) => {
        const types = String(visit.visitType)
          .split(",")
          .map((t) => t.trim());
        return types.includes(filters.visitType);
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (visit) =>
          (visit.customerName || "").toLowerCase().includes(searchTerm) ||
          (visit.location || "").toLowerCase().includes(searchTerm) ||
          (visit.industrialArea || "").toLowerCase().includes(searchTerm),
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime(),
    );

    setFilteredVisits(filtered);
  };

  const handleConfirmVisit = async (visitId, status, notes) => {
    try {
      const currentDateTime = new Date().toISOString();

      const payload = {
        id: visitId,
        status,
        notes,
        actualDate: status === "completed" ? currentDateTime : null,
        updatedAt: currentDateTime,
      };

      const response = await SalesVisitService.updateVisitStatus(payload);

      if (response?.status_Code !== 200 && response?.Status_Code !== 200) {
        alert("Failed to update visit status");
        console.log("response", response, response.data);
        return;
      }

      const updatedVisits = visits.map((visit) =>
        visit.id === visitId
          ? {
              ...visit,
              status,
              actualDate: status === "completed" ? currentDateTime : null,
              notes,
              updatedAt: currentDateTime,
            }
          : visit,
      );

      setVisits(updatedVisits);
      setConfirmingVisit(null);
      setConfirmationNotes("");
    } catch (error) {
      console.error("Error updating visit status:", error);
      alert("Failed to update visit status");
    }
  };

  const handleAddAlternate = (originalVisit) => {
    setSelectedVisit(originalVisit);
    setIsAddingAlternate(true);
  };

  const handleSaveAlternate = async (alternateVisit) => {
    try {
      const [plannedYear, plannedMonth] = alternateVisit.plannedDate
        .split("-")
        .map(Number);

      const plannedMonthKey = `${plannedYear}-${String(plannedMonth).padStart(
        2,
        "0",
      )}`;

      const currentDateTime = new Date().toISOString();

      const payload = {
        userId: user?.emp_id,
        planId: null,
        customerName: alternateVisit.customerName,
        location: alternateVisit.location,
        industrialArea: alternateVisit.industrialArea,
        visitType: Array.isArray(alternateVisit.visitTypes)
          ? alternateVisit.visitTypes.join(",")
          : alternateVisit.visitType,
        plannedDate: alternateVisit.plannedDate,
        actualDate: currentDateTime,
        status: "completed",
        isApproved: false,
        isAlternate: true,
        originalVisitId: selectedVisit?.id || null,
        month: plannedMonthKey,
        year: plannedYear,
        notes: alternateVisit.notes,
        createdAt: currentDateTime,
        updatedAt: currentDateTime,
      };

      const response = await SalesVisitService.saveAlternateVisit(payload);

      if (
        response?.data?.status_Code !== 200 &&
        response?.data?.Status_Code !== 200
      ) {
        alert("Failed to save alternate visit");
        return;
      }

      const savedVisit = normalizeVisit(
        response?.data?.data || response?.data?.Data || {},
      );

      setVisits((prev) => [...prev, savedVisit]);
      setIsAddingAlternate(false);
      setSelectedVisit(null);
    } catch (error) {
      console.error("Error saving alternate visit:", error);
      alert("Failed to save alternate visit");
    }
  };

  const navigateMonth = (direction) => {
    if (!selectedMonth) return;

    const [year, month] = selectedMonth.split("-").map(Number);
    let newYear = year;
    let newMonth = month;

    if (direction === "next") {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    } else {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    }

    const newMonthKey = `${newYear}-${String(newMonth).padStart(2, "0")}`;
    setSelectedMonth(newMonthKey);
    setSelectedYear(newYear);
  };

  const formatMonth = (month) => {
    if (!month) return "";
    const [yearStr, monthStr] = month.split("-");
    const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const groupVisitsByDate = (visitList) => {
    const grouped = {};
    visitList.forEach((visit) => {
      const date = formatDateOnly(visit.plannedDate);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(visit);
    });
    return grouped;
  };

  const getDayName = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });
  };

  const countVisitsByType = (visitList, type) => {
    return visitList.filter((v) => {
      const types = String(v.visitType)
        .split(",")
        .map((t) => t.trim());
      return types.includes(type);
    }).length;
  };

  const groupedVisits = useMemo(
    () => groupVisitsByDate(filteredVisits),
    [filteredVisits],
  );

  const sortedDates = useMemo(
    () => Object.keys(groupedVisits).sort(),
    [groupedVisits],
  );

  // Counter metric constants matching the dynamic layout targets
  const totalVisitsCount = filteredVisits.length;
  const bdVisitsCount = countVisitsByType(filteredVisits, "BD_VISIT");
  const abpVisitsCount = countVisitsByType(filteredVisits, "ABP_VISIT");
  const keyAccountsCount = countVisitsByType(filteredVisits, "KEY_ACCOUNT");
  const ongoingDealsCount = countVisitsByType(filteredVisits, "ONGOING_DEAL");
  const alternateCount = filteredVisits.filter(
    (v) => v.isAlternate === true,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Actual</h1>
        <div className="text-sm text-gray-500">
          {totalVisitsCount} total visit{totalVisitsCount !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {formatMonth(selectedMonth)}
            </h2>
            <p className="text-sm text-gray-500">
              {totalVisitsCount} total visit{totalVisitsCount !== 1 ? "s" : ""}{" "}
              recorded
            </p>
          </div>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Updated Summary Cards Section matching Monthly Plan layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={CalendarDays}
            tone="blue"
            value={totalVisitsCount}
            label="Total Visits"
          />
          <StatCard
            icon={Briefcase}
            tone="emerald"
            value={bdVisitsCount}
            label="BD Visits"
          />
          <StatCard
            icon={Target}
            tone="violet"
            value={abpVisitsCount}
            label="ABP Visits"
          />
          <StatCard
            icon={Building2}
            tone="amber"
            value={keyAccountsCount}
            label="Key Accounts"
          />
          <StatCard
            icon={ClipboardList}
            tone="orange"
            value={ongoingDealsCount}
            label="Ongoing Deals"
          />
          <StatCard
            icon={RotateCcw}
            tone="purple"
            value={alternateCount}
            label="Alternate/Additional"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 checked-layout">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search visits..."
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
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
              <option value="alternate">Alternate/Additional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visit Type
            </label>
            <select
              value={filters.visitType}
              onChange={(e) =>
                setFilters({ ...filters, visitType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="BD_VISIT">BD Visit</option>
              <option value="ABP_VISIT">ABP Visit</option>
              <option value="ONGOING_DEAL">Ongoing Deal</option>
              <option value="KEY_ACCOUNT">Key Account</option>
              <option value="OFFICE">Office</option>
              <option value="LEAVE">Leave</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading visits...</p>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No visits found for this month</p>
            <p className="text-sm text-gray-400">
              {filters.search || filters.status || filters.visitType
                ? "Try adjusting your filters"
                : "No visits have been scheduled yet"}
            </p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <DayCard
              key={date}
              date={date}
              dayName={getDayName(date)}
              visits={groupedVisits[date]}
              onConfirm={(visit) => {
                setConfirmingVisit(visit);
                setConfirmationNotes(visit.notes || "");
              }}
              onAddAlternate={handleAddAlternate}
            />
          ))
        )}
      </div>

      {confirmingVisit && (
        <VisitConfirmationModal
          visit={confirmingVisit}
          notes={confirmationNotes}
          onNotesChange={setConfirmationNotes}
          onConfirm={(status) =>
            handleConfirmVisit(confirmingVisit.id, status, confirmationNotes)
          }
          onCancel={() => {
            setConfirmingVisit(null);
            setConfirmationNotes("");
          }}
        />
      )}

      {isAddingAlternate && selectedVisit && (
        <AlternateVisitForm
          originalVisit={selectedVisit}
          industrialAreas={industrialAreas}
          onSave={handleSaveAlternate}
          onCancel={() => {
            setIsAddingAlternate(false);
            setSelectedVisit(null);
          }}
        />
      )}
    </div>
  );
};

// Reusable StatCard layout component matching structure from plan pages
const StatCard = ({ icon: Icon, tone = "blue", value, label }) => {
  const toneMap = {
    blue: {
      wrap: "bg-blue-50 border-blue-200",
      icon: "bg-blue-100 text-blue-700",
      value: "text-blue-700",
      label: "text-blue-700/80",
    },
    emerald: {
      wrap: "bg-emerald-50 border-emerald-200",
      icon: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-700",
      label: "text-emerald-700/80",
    },
    violet: {
      wrap: "bg-violet-50 border-violet-200",
      icon: "bg-violet-100 text-violet-700",
      value: "text-violet-700",
      label: "text-violet-700/80",
    },
    amber: {
      wrap: "bg-amber-50 border-amber-200",
      icon: "bg-amber-100 text-amber-700",
      value: "text-amber-700",
      label: "text-amber-700/80",
    },
    orange: {
      wrap: "bg-orange-50 border-orange-200",
      icon: "bg-orange-100 text-orange-700",
      value: "text-orange-700",
      label: "text-orange-700/80",
    },
    purple: {
      wrap: "bg-purple-50 border-purple-200",
      icon: "bg-purple-100 text-purple-700",
      value: "text-purple-700",
      label: "text-purple-700/80",
    },
  };

  const styles = toneMap[tone] || toneMap.blue;

  return (
    <div className={`rounded-[22px] border p-4 shadow-sm ${styles.wrap}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-2xl font-bold tracking-tight ${styles.value}`}>
            {value}
          </p>
          <p className={`mt-1 text-xs font-medium ${styles.label}`}>{label}</p>
        </div>
        {Icon && (
          <div className={`rounded-xl p-2.5 ${styles.icon}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
};

const DayCard = ({ date, visits, onConfirm, onAddAlternate }) => {
  const getAlternateBadgeInfo = (visit) => {
    if (!visit.isAlternate || !visit.originalVisitId) return null;

    const originalVisit = visits.find((v) => v.id === visit.originalVisitId);

    if (!originalVisit) {
      return {
        label: "Additional",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      };
    }

    if (originalVisit.status === "missed") {
      return {
        label: "Alternate",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      };
    }

    return {
      label: "Additional",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    };
  };

  const getVisitTypeColor = (type) => {
    const mainType = String(type).split(",")[0];
    switch (mainType) {
      case "BD_VISIT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ABP_VISIT":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ONGOING_DEAL":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "KEY_ACCOUNT":
        return "bg-green-50 text-green-700 border-green-200";
      case "OFFICE":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "LEAVE":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getVisitTypeLabel = (type) => {
    if (!type) return "";
    return String(type)
      .split(",")
      .map((t) => {
        switch (t.trim()) {
          case "BD_VISIT":
            return "BD Visit";
          case "ABP_VISIT":
            return "ABP Visit";
          case "ONGOING_DEAL":
            return "Ongoing Deal";
          case "KEY_ACCOUNT":
            return "Key Account";
          case "OFFICE":
            return "Office";
          case "LEAVE":
            return "Leave";
          default:
            return t;
        }
      })
      .join(", ");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "missed":
        return "text-red-600 bg-red-50 border-red-200";
      case "alternate":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "missed":
        return <XCircle className="h-4 w-4" />;
      case "alternate":
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isPastDateFixed = (() => {
    const [year, month, day] = date.split("-").map(Number);
    const visitDate = new Date(year, month - 1, day, 12, 0, 0);
    const today = new Date();
    const todayIST = new Date(
      today.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );

    visitDate.setHours(0, 0, 0, 0);
    todayIST.setHours(0, 0, 0, 0);

    return visitDate < todayIST;
  })();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {(() => {
                const [year, month, day] = date.split("-").map(Number);
                const dateObj = new Date(year, month - 1, day, 12, 0, 0);
                return dateObj.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "Asia/Kolkata",
                });
              })()}
            </h3>
            <p className="text-sm text-gray-500">
              {visits.length} visit{visits.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {isPastDateFixed && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Past Date
              </span>
            )}

            {visits.some(
              (v) => v.status === "completed" || v.status === "missed",
            ) && (
              <button
                onClick={() => {
                  const representativeVisit =
                    visits.find(
                      (v) => v.status === "completed" || v.status === "missed",
                    ) || visits[0];
                  onAddAlternate(representativeVisit);
                }}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add additional/alternate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {visits.map((visit) => (
          <VisitCard
            key={visit.id}
            visit={visit}
            onConfirm={() => onConfirm(visit)}
            getVisitTypeColor={getVisitTypeColor}
            getVisitTypeLabel={getVisitTypeLabel}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getAlternateBadgeInfo={getAlternateBadgeInfo}
          />
        ))}
      </div>
    </div>
  );
};

const VisitCard = ({
  visit,
  onConfirm,
  getVisitTypeColor,
  getVisitTypeLabel,
  getStatusColor,
  getStatusIcon,
  getAlternateBadgeInfo,
}) => {
  const isPlanned = visit.status === "planned";
  const alternateBadgeInfo = getAlternateBadgeInfo(visit);

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-gray-900">{visit.customerName}</h4>

            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                visit.status,
              )}`}
            >
              {getStatusIcon(visit.status)}
              <span className="ml-1 capitalize">{visit.status}</span>
            </span>

            {alternateBadgeInfo && (
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${alternateBadgeInfo.color}`}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {alternateBadgeInfo.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-900">{visit.location}</p>
                <p className="text-xs text-gray-500">{visit.industrialArea}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-400" />
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getVisitTypeColor(
                  visit.visitType,
                )}`}
              >
                {getVisitTypeLabel(visit.visitType)}
              </span>
            </div>

            {visit.actualDate && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-sm text-gray-900">Completed</p>
                  <p className="text-xs text-gray-500">
                    {new Date(visit.actualDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {visit.notes && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Notes:</p>
                  <p className="text-sm text-gray-600 mt-1">{visit.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {isPlanned && (
            <>
              <button
                onClick={onConfirm}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark Complete</span>
              </button>

              <button
                onClick={onConfirm}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Mark Missed</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const VisitConfirmationModal = ({
  visit,
  notes,
  onNotesChange,
  onConfirm,
  onCancel,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Visit Status
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Update the status for your visit to {visit.customerName}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visit Status *
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedStatus("completed")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                  selectedStatus === "completed"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Visit Completed</p>
                  <p className="text-sm text-gray-500">
                    The visit was successfully completed
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("missed")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                  selectedStatus === "missed"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <XCircle className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Visit Missed</p>
                  <p className="text-sm text-gray-500">
                    The visit could not be completed
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes & Comments
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this visit (outcomes, next steps, issues, etc.)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => selectedStatus && onConfirm(selectedStatus)}
              disabled={!selectedStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlternateVisitForm = ({
  originalVisit,
  industrialAreas,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [areaSearchTerm, setAreaSearchTerm] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState(industrialAreas || []);
  const [formData, setFormData] = useState({
    ...originalVisit,
    id: "",
    customerName: "",
    location: "",
    industrialArea: "",
    visitTypes: [],
    plannedDate: originalVisit.plannedDate,
    actualDate: new Date().toISOString(),
    notes: "",
  });

  useEffect(() => {
    if (!areaSearchTerm.trim()) {
      setFilteredAreas(industrialAreas || []);
    } else {
      const searchLower = areaSearchTerm.toLowerCase();
      const filtered = (industrialAreas || []).filter(
        (area) =>
          (area.name || "").toLowerCase().includes(searchLower) ||
          (area.city || "").toLowerCase().includes(searchLower) ||
          (area.state || "").toLowerCase().includes(searchLower) ||
          (area.region || "").toLowerCase().includes(searchLower),
      );
      setFilteredAreas(filtered);
    }
  }, [areaSearchTerm, industrialAreas]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.customerName ||
      !formData.location ||
      !formData.industrialArea ||
      !formData.visitTypes ||
      formData.visitTypes.length === 0 ||
      !formData.notes
    ) {
      alert(
        "Please fill in all required fields including visit types and notes",
      );
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVisitTypeToggle = (type) => {
    setFormData((prev) => ({
      ...prev,
      visitTypes: prev.visitTypes.includes(type)
        ? prev.visitTypes.filter((item) => item !== type)
        : [...prev.visitTypes, type],
    }));
  };

  const handleAreaSelect = (area) => {
    setFormData({
      ...formData,
      industrialArea: area.name,
    });
    setAreaSearchTerm(`${area.name} - ${area.city}, ${area.state}`);
    setIsAreaDropdownOpen(false);
  };

  const handleAreaSearchChange = (e) => {
    const value = e.target.value;
    setAreaSearchTerm(value);
    setIsAreaDropdownOpen(true);

    const exactMatch = (industrialAreas || []).find(
      (area) => (area.name || "").toLowerCase() === value.toLowerCase(),
    );

    if (exactMatch) {
      setFormData({
        ...formData,
        industrialArea: exactMatch.name,
      });
    } else {
      setFormData({
        ...formData,
        industrialArea: "",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[3px]"
        onClick={onCancel}
      />

      <div className="relative z-10 bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Log Additional/Alternate
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Record an additional visit for {originalVisit.customerName}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industrial Area *
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={areaSearchTerm}
                      onChange={handleAreaSearchChange}
                      onFocus={() => setIsAreaDropdownOpen(true)}
                      placeholder="Search industrial areas..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {isAreaDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredAreas.length > 0 ? (
                        filteredAreas
                          .filter((area) => area.isActive)
                          .map((area) => (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => handleAreaSelect(area)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">
                                {area.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {area.city}, {area.state} • {area.region} •{" "}
                                {area.potential} Potential
                              </div>
                            </button>
                          ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          No industrial areas found matching "{areaSearchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isAreaDropdownOpen && (
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsAreaDropdownOpen(false)}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Date
                </label>
                <input
                  type="date"
                  name="plannedDate"
                  value={formData.plannedDate}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Date is fixed to the original visit date
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Visit Types *
              </label>
              <div className="max-h-52 overflow-y-auto rounded-2xl border border-gray-300 bg-gray-50 p-3 space-y-2.5">
                {VISIT_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-slate-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.visitTypes?.includes(option.value)}
                      onChange={() => handleVisitTypeToggle(option.value)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Notes & Outcomes *
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the alternate visit details, outcomes, discussions, next steps, etc."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <RotateCcw className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Additional Visit Information
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    This visit will be logged as an additional visit for the
                    same date and will be automatically marked as completed.{" "}
                    {originalVisit?.status === "missed"
                      ? 'It will show as "Alternate" since the original visit was missed.'
                      : 'It will show as "Additional" since the original visit was completed.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Log Additional/Alternate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonthlyActual;
