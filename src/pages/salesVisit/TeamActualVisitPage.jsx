import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User,
  MessageSquare,
  Globe,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
} from "lucide-react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";

const groupVisitsByDate = (visits) => {
  const grouped = {};

  (visits || []).forEach((visit) => {
    const dateValue = visit?.plannedDate || visit?.planneddate || "";
    const date = String(dateValue).split("T")[0];

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(visit);
  });

  return grouped;
};

const TeamActualVisitsPage = () => {
  const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const user = sessionUser || null;

  const [teamMembers, setTeamMembers] = useState([]);
  const [monthlyActuals, setMonthlyActuals] = useState([]);
  const [actualVisits, setActualVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedMemberVisits, setSelectedMemberVisits] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    visitType: "",
    department: "",
    member: "",
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
      loadDashboardData();
    }
  }, [user?.emp_id, selectedMonth, selectedYear]);

  const normalizeTeamMember = (member) => ({
    id: member?.id || "",
    name: member?.name || "",
    email: member?.email || "",
    role: member?.role || "",
    department: member?.department || member?.Department || "",
    region: member?.region || member?.Region || "",
  });

  const normalizeMonthlyActual = (actual) => ({
    id: actual?.id || "",
    userId: actual?.userId || actual?.userid || "",
    month: actual?.month || "",
    year: actual?.year || 0,
    userName: actual?.userName || actual?.username || "",
    userEmail: actual?.userEmail || actual?.useremail || "",
    actualVisitCount: actual?.actualVisitCount ?? actual?.actualvisitcount ?? 0,
    completedVisitCount:
      actual?.completedVisitCount ?? actual?.completedvisitcount ?? 0,
    alternateVisitCount:
      actual?.alternateVisitCount ?? actual?.alternatevisitcount ?? 0,
  });

  const normalizeActualVisit = (visit) => ({
    id: visit?.id || "",
    userId: visit?.userId || visit?.userid || "",
    planId: visit?.planId || visit?.planid || null,
    customerName: visit?.customerName || visit?.customername || "",
    location: visit?.location || "",
    industrialArea: visit?.industrialArea || visit?.industrialarea || "",
    visitType: visit?.visitType || visit?.visittype || "",
    plannedDate: visit?.plannedDate || visit?.planneddate || "",
    actualDate: visit?.actualDate || visit?.actualdate || "",
    status: visit?.status || "",
    isAlternate: visit?.isAlternate ?? visit?.isalternate ?? false,
    originalVisitId: visit?.originalVisitId || visit?.originalvisitid || null,
    month: visit?.month || "",
    year: visit?.year || 0,
    notes: visit?.notes || "",
    userName: visit?.userName || visit?.username || "",
    userEmail: visit?.userEmail || visit?.useremail || "",
    userRole: visit?.userRole || visit?.userrole || "",
  });

  const loadDashboardData = async () => {
    if (!user?.emp_id || !selectedMonth || !selectedYear) return;

    try {
      setLoading(true);

      const payload = {
        userId: user.emp_id,
        month: selectedMonth,
        year: selectedYear,
      };

      const response =
        await SalesVisitService.getTeamActualVisitsDashboard(payload);

      const data = response?.data?.data || response?.data || {};

      const teamMembersData = Array.isArray(data?.teamMembers)
        ? data.teamMembers
        : Array.isArray(data?.TeamMembers)
          ? data.TeamMembers
          : [];

      const monthlyActualsData = Array.isArray(data?.monthlyActuals)
        ? data.monthlyActuals
        : Array.isArray(data?.MonthlyActuals)
          ? data.MonthlyActuals
          : [];

      const actualVisitsData = Array.isArray(data?.actualVisits)
        ? data.actualVisits
        : Array.isArray(data?.ActualVisits)
          ? data.ActualVisits
          : [];

      setTeamMembers((teamMembersData || []).map(normalizeTeamMember));
      setMonthlyActuals((monthlyActualsData || []).map(normalizeMonthlyActual));
      setActualVisits((actualVisitsData || []).map(normalizeActualVisit));
    } catch (err) {
      console.error("Error loading team actual visits dashboard:", err);
      setTeamMembers([]);
      setMonthlyActuals([]);
      setActualVisits([]);
    } finally {
      setLoading(false);
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
    const [year, monthStr] = month.split("-");
    const date = new Date(parseInt(year, 10), parseInt(monthStr, 10) - 1, 1);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-US");
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "missed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "missed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getVisitTypeColor = (type) => {
    switch (type) {
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
    switch (type) {
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
        return type || "-";
    }
  };

  const getUniqueValues = (field) => {
    return [
      ...new Set(
        (teamMembers || [])
          .map((member) => (member?.[field] || "").toString().trim())
          .filter(Boolean),
      ),
    ].sort();
  };

  const filteredActuals = (monthlyActuals || []).filter((actual) => {
    const member = (teamMembers || []).find((m) => m.id === actual.userId);
    const memberVisits = (actualVisits || []).filter(
      (visit) => visit.userId === actual.userId,
    );

    if (
      filters.search &&
      !actual?.userName?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !actual?.userEmail?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (filters.member && actual.userId !== filters.member) {
      return false;
    }

    if (filters.department && member?.department !== filters.department) {
      return false;
    }

    if (
      filters.status &&
      !memberVisits.some(
        (visit) =>
          (visit?.status || "").toLowerCase() === filters.status.toLowerCase(),
      )
    ) {
      return false;
    }

    if (
      filters.visitType &&
      !memberVisits.some((visit) => visit?.visitType === filters.visitType)
    ) {
      return false;
    }

    return true;
  });

  if (loading && teamMembers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading team actual visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Actual Visits</h1>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Globe className="h-4 w-4" />
            <span>
              {user?.role === "management"
                ? `Organization-wide • ${teamMembers.length} members`
                : `Team Members • ${teamMembers.length} reportees`}
            </span>
          </div>
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
              {actualVisits.length} actual visit
              {actualVisits.length !== 1 ? "s" : ""} by team
            </p>
          </div>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">
              {actualVisits.length}
            </p>
            <p className="text-sm text-blue-700">Total Completed Visits</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
            <p className="text-2xl font-bold text-purple-600">
              {actualVisits.filter((v) => v.isAlternate === true).length}
            </p>
            <p className="text-sm text-purple-700">Alternate/Additional</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search members..."
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
              Team Member
            </label>
            <select
              value={filters.member}
              onChange={(e) =>
                setFilters({ ...filters, member: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Members</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
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
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
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
              <option value="">All Visit Types</option>
              <option value="BD_VISIT">BD Visit</option>
              <option value="ABP_VISIT">ABP Visit</option>
              <option value="ONGOING_DEAL">Ongoing Deal</option>
              <option value="KEY_ACCOUNT">Key Account</option>
              <option value="OFFICE">Office</option>
              <option value="LEAVE">Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {getUniqueValues("department").map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  status: "",
                  visitType: "",
                  department: "",
                  member: "",
                })
              }
              className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Team Monthly Actuals
          </h3>
          <p className="text-sm text-gray-500">
            {filteredActuals.length} team member
            {filteredActuals.length !== 1 ? "s" : ""} with actual visits
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading team actuals...</p>
          </div>
        ) : filteredActuals.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No team members with actual visits found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredActuals.map((actual) => {
              const memberVisits = actualVisits.filter(
                (visit) => visit.userId === actual.userId,
              );

              return (
                <div
                  key={actual.id || `${actual.userId}-${actual.month}`}
                  className="p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {actual.userName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {actual.userEmail}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {actual.actualVisitCount} Actual Visits
                            </p>
                            <p className="text-xs text-gray-500">
                              Total Activities
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {actual.completedVisitCount} Completed
                            </p>
                            <p className="text-xs text-gray-500">
                              Successful Visits
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4 text-purple-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {actual.alternateVisitCount} Alternate
                            </p>
                            <p className="text-xs text-gray-500">
                              Additional Visits
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {memberVisits.length > 0 && (
                        <button
                          onClick={() =>
                            setSelectedMemberVisits({
                              member: actual,
                              visits: memberVisits,
                            })
                          }
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Visits</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {memberVisits.length > 0 && (
                    <div className="mt-4">
                      <div className="space-y-3">
                        {memberVisits.slice(0, 2).map((visit) => (
                          <div
                            key={visit.id}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h6 className="font-medium text-gray-900">
                                    {visit.customerName}
                                  </h6>

                                  <span
                                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                      visit.status,
                                    )}`}
                                  >
                                    {getStatusIcon(visit.status)}
                                    <span className="ml-1 capitalize">
                                      {visit.status}
                                    </span>
                                  </span>

                                  <span
                                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getVisitTypeColor(
                                      visit.visitType,
                                    )}`}
                                  >
                                    {getVisitTypeLabel(visit.visitType)}
                                  </span>

                                  {visit.isAlternate && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      Alternate
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{visit.location}</span>
                                  </div>

                                  <div className="flex items-center space-x-1">
                                    <Building className="h-3 w-3" />
                                    <span>{visit.industrialArea}</span>
                                  </div>

                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {formatShortDate(visit.plannedDate)}
                                    </span>
                                  </div>
                                </div>

                                {visit.notes && (
                                  <div className="bg-white border border-gray-200 rounded p-2 mt-2">
                                    <div className="flex items-start space-x-2">
                                      <MessageSquare className="h-3 w-3 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-medium text-gray-700">
                                          Notes:
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {visit.notes}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => setSelectedVisit(visit)}
                                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        ))}

                        {memberVisits.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{memberVisits.length - 2} more visit
                            {memberVisits.length - 2 !== 1 ? "s" : ""} available
                            in the detailed view
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedVisit && (
        <VisitDetailsModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getVisitTypeColor={getVisitTypeColor}
          getVisitTypeLabel={getVisitTypeLabel}
          formatFullDate={formatFullDate}
        />
      )}

      {selectedMemberVisits && (
        <MemberVisitsModal
          member={selectedMemberVisits.member}
          visits={selectedMemberVisits.visits}
          month={selectedMonth}
          year={selectedYear}
          onClose={() => setSelectedMemberVisits(null)}
          onViewVisit={(visit) => setSelectedVisit(visit)}
          getVisitTypeColor={getVisitTypeColor}
          getVisitTypeLabel={getVisitTypeLabel}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      )}
    </div>
  );
};

const VisitDetailsModal = ({
  visit,
  onClose,
  getStatusColor,
  getStatusIcon,
  getVisitTypeColor,
  getVisitTypeLabel,
  formatFullDate,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Visit Details
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {visit.userName} • {visit.customerName}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-full border ${getStatusColor(
                visit.status,
              )}`}
            >
              {getStatusIcon(visit.status)}
              <span className="ml-2 capitalize">{visit.status}</span>
            </span>

            {visit.isAlternate && (
              <span className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                <RotateCcw className="h-4 w-4 mr-2" />
                Alternate/Additional Visit
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Visit Information
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Customer Name</label>
                  <p className="font-medium text-gray-900">
                    {visit.customerName}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Location</label>
                  <p className="text-gray-900">{visit.location}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">
                    Industrial Area
                  </label>
                  <p className="text-gray-900">{visit.industrialArea}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Visit Type</label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getVisitTypeColor(
                        visit.visitType,
                      )}`}
                    >
                      {getVisitTypeLabel(visit.visitType)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Timeline
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Planned Date</label>
                  <p className="text-gray-900">
                    {formatFullDate(visit.plannedDate)}
                  </p>
                </div>

                {visit.actualDate && (
                  <div>
                    <label className="text-xs text-gray-500">Actual Date</label>
                    <p className="text-gray-900">
                      {formatFullDate(visit.actualDate)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-500">Team Member</label>
                  <p className="text-gray-900">{visit.userName}</p>
                  <p className="text-sm text-gray-500">{visit.userEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {visit.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Visit Notes & Outcomes
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-700">{visit.notes}</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Additional Information
            </h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-gray-500">Visit ID</label>
                <p className="font-mono text-xs text-gray-600 break-all">
                  {visit.id}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Month/Year</label>
                <p className="text-gray-900">
                  {visit.month} / {visit.year}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MemberVisitsModal = ({
  member,
  visits,
  month,
  onClose,
  onViewVisit,
  getVisitTypeColor,
  getVisitTypeLabel,
  getStatusColor,
  getStatusIcon,
}) => {
  const formatMonth = (monthValue) => {
    if (!monthValue) return "";
    const [year, monthStr] = monthValue.split("-");
    const date = new Date(parseInt(year, 10), parseInt(monthStr, 10) - 1, 1);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const groupedVisits = groupVisitsByDate(visits);
  const sortedDates = Object.keys(groupedVisits).sort();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Actual Visits - {formatMonth(month)}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {member.userName} ({member.userEmail}) • {visits.length}{" "}
                completed visit{visits.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">
                {visits.length}
              </p>
              <p className="text-sm text-blue-700">Total Completed</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
              <p className="text-2xl font-bold text-green-600">
                {visits.filter((v) => !v.isAlternate).length}
              </p>
              <p className="text-sm text-green-700">Regular Visits</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">
                {visits.filter((v) => v.isAlternate === true).length}
              </p>
              <p className="text-sm text-purple-700">Alternate/Additional</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Date-wise Completed Visits
            </h4>

            {sortedDates.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No completed visits found for this month
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDates.map((date) => (
                  <DateVisitsCard
                    key={date}
                    date={date}
                    visits={groupedVisits[date]}
                    onViewVisit={onViewVisit}
                    getVisitTypeColor={getVisitTypeColor}
                    getVisitTypeLabel={getVisitTypeLabel}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DateVisitsCard = ({
  date,
  visits,
  onViewVisit,
  getVisitTypeColor,
  getVisitTypeLabel,
  getStatusColor,
  getStatusIcon,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const [year, month, day] = dateString.split("-").map(Number);
    const dateValue = new Date(year, month - 1, day);

    if (Number.isNaN(dateValue.getTime())) return dateString;

    return dateValue.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-semibold text-gray-900">{formatDate(date)}</h5>
            <p className="text-sm text-gray-500">
              {visits.length} visit{visits.length !== 1 ? "s" : ""} completed
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="bg-white rounded-lg p-3 border border-gray-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h6 className="font-medium text-gray-900">
                    {visit.customerName}
                  </h6>

                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                      visit.status,
                    )}`}
                  >
                    {getStatusIcon(visit.status)}
                    <span className="ml-1 capitalize">{visit.status}</span>
                  </span>

                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getVisitTypeColor(
                      visit.visitType,
                    )}`}
                  >
                    {getVisitTypeLabel(visit.visitType)}
                  </span>

                  {visit.isAlternate && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Alternate
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">{visit.location}</p>
                      <p className="text-xs text-gray-500">
                        {visit.industrialArea}
                      </p>
                    </div>
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
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-2">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-3 w-3 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          Notes:
                        </p>
                        <p className="text-xs text-gray-600">{visit.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onViewVisit(visit)}
                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamActualVisitsPage;
