import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Building,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Globe,
  AlertCircle,
} from "lucide-react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";

const TeamVisitPlansPage = () => {
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));
  const user = sessionUser || null;

  const [teamMembers, setTeamMembers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState("plans");
  const [expandedPlans, setExpandedPlans] = useState(new Set());
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    department: "",
    visitType: "",
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
    if (user && selectedMonth && selectedYear) {
      loadTeamVisitPlans(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const loadTeamVisitPlans = async (month, year) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const payload = {
        userId: user.emp_id,
        role: user.role,
        month,
        year,
      };

      const response = await SalesVisitService.getTeamVisitPlans(payload);
      const data = response?.data?.data || response?.data || {};

      const teamMembersData = Array.isArray(data.teamMembers)
        ? data.teamMembers
        : [];
      const plansData = Array.isArray(data.plans) ? data.plans : [];
      const visitsData = Array.isArray(data.visits) ? data.visits : [];

      const normalizedTeamMembers = teamMembersData.map((member) => ({
        id: member.id,
        name: member.name || "",
        email: member.email || "",
        role: member.role || "",
        department: member.department || "",
        region: member.region || "",
        reportingManagerId:
          member.reportingManagerId || member.reporting_manager_id || null,
      }));

      const normalizedPlans = plansData.map((plan) => ({
        id: plan.id,
        userId: plan.userId || plan.user_id,
        month: plan.month,
        year: plan.year,
        status: plan.status || "",
        submittedAt: plan.submittedAt || plan.submitted_at || null,
        approvedAt: plan.approvedAt || plan.approved_at || null,
        rejectedAt: plan.rejectedAt || plan.rejected_at || null,
        userName: plan.userName || plan.user_name || "Unknown",
        userEmail: plan.userEmail || plan.user_email || "",
        visitCount: plan.visitCount || plan.visit_count || 0,
      }));

      const normalizedVisits = visitsData.map((visit) => ({
        id: visit.id,
        userId: visit.userId || visit.user_id,
        planId: visit.planId || visit.plan_id || null,
        customerName: visit.customerName || visit.customer_name || "",
        location: visit.location || "",
        industrialArea: visit.industrialArea || visit.industrial_area || "",
        visitType: visit.visitType || visit.visit_type || "",
        plannedDate: visit.plannedDate || visit.planned_date || "",
        actualDate: visit.actualDate || visit.actual_date || null,
        status: visit.status || "",
        month: visit.month || "",
        year: visit.year || 0,
        notes: visit.notes || "",
        userName: visit.userName || visit.user_name || "Unknown",
        userEmail: visit.userEmail || visit.user_email || "",
      }));

      setTeamMembers(normalizedTeamMembers);
      setPlans(normalizedPlans);
      setVisits(normalizedVisits);
    } catch (err) {
      console.error("Error loading team visit plans:", err);
      setError("Failed to load team visit plans.");
      setTeamMembers([]);
      setPlans([]);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
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
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending_approval":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending_approval":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
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
        return type || "";
    }
  };

  const togglePlanExpansion = (planId) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  const getUniqueValues = (field) => {
    return [...new Set(teamMembers.map((member) => member[field]))]
      .filter(Boolean)
      .sort();
  };

  const filteredPlans = plans.filter((plan) => {
    if (
      filters.search &&
      !plan.userName?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !plan.userEmail?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (filters.status && plan.status !== filters.status) {
      return false;
    }

    if (filters.department) {
      const member = teamMembers.find((m) => m.id === plan.userId);
      if (!member || member.department !== filters.department) {
        return false;
      }
    }

    return true;
  });

  const filteredVisits = visits.filter((visit) => {
    if (
      filters.search &&
      !visit.userName?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !visit.customerName
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      !visit.location?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (filters.visitType && visit.visitType !== filters.visitType) {
      return false;
    }

    if (filters.department) {
      const member = teamMembers.find((m) => m.id === visit.userId);
      if (!member || member.department !== filters.department) {
        return false;
      }
    }

    return true;
  });

  if (
    loading &&
    teamMembers.length === 0 &&
    plans.length === 0 &&
    visits.length === 0
  ) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Visit Plans</h1>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown className="h-5 w-5 rotate-90" />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {formatMonth(selectedMonth)}
            </h2>
            <p className="text-sm text-gray-500">
              {plans.length} plan{plans.length !== 1 ? "s" : ""} •{" "}
              {visits.length} visit
              {visits.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown className="h-5 w-5 -rotate-90" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{plans.length}</p>
            <p className="text-sm text-blue-700">Total Plans</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
            <p className="text-2xl font-bold text-green-600">
              {plans.filter((p) => p.status === "approved").length}
            </p>
            <p className="text-sm text-green-700">Approved</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">
              {plans.filter((p) => p.status === "pending_approval").length}
            </p>
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
            <p className="text-2xl font-bold text-purple-600">
              {visits.length}
            </p>
            <p className="text-sm text-purple-700">Total Visits</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedView("plans")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedView === "plans"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly Plans
              </button>
              <button
                onClick={() => setSelectedView("visits")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedView === "visits"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Visit Details
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={
                  selectedView === "plans"
                    ? "Search members..."
                    : "Search visits..."
                }
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {selectedView === "plans" && (
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
                <option value="draft">Draft</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {selectedView === "visits" && (
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
          )}

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
                  department: "",
                  visitType: "",
                })
              }
              className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {selectedView === "plans" ? (
        <PlansView
          plans={filteredPlans}
          visits={visits}
          expandedPlans={expandedPlans}
          onToggleExpansion={togglePlanExpansion}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getVisitTypeColor={getVisitTypeColor}
          getVisitTypeLabel={getVisitTypeLabel}
          loading={loading}
          setSelectedPlanForDetails={setSelectedPlanForDetails}
        />
      ) : (
        <VisitsView
          visits={filteredVisits}
          getVisitTypeColor={getVisitTypeColor}
          getVisitTypeLabel={getVisitTypeLabel}
          loading={loading}
        />
      )}

      {selectedPlanForDetails && (
        <PlanDetailsModal
          plan={selectedPlanForDetails}
          visits={visits.filter((v) => v.planId === selectedPlanForDetails.id)}
          onClose={() => setSelectedPlanForDetails(null)}
          getVisitTypeColor={getVisitTypeColor}
          getVisitTypeLabel={getVisitTypeLabel}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      )}
    </div>
  );
};

const PlansView = ({
  plans,
  visits,
  expandedPlans,
  onToggleExpansion,
  getStatusColor,
  getStatusIcon,
  getVisitTypeColor,
  getVisitTypeLabel,
  loading,
  setSelectedPlanForDetails,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading plans...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No monthly plans found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Plans</h3>
        <p className="text-sm text-gray-500">
          {plans.length} plan{plans.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {plans.map((plan) => {
          const planVisits = visits.filter((v) => v.planId === plan.id);
          const isExpanded = expandedPlans.has(plan.id);

          return (
            <div key={plan.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2 flex-wrap">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {plan.userName}
                      </h4>
                      <p className="text-sm text-gray-500">{plan.userEmail}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        plan.status,
                      )}`}
                    >
                      {getStatusIcon(plan.status)}
                      <span className="ml-1 capitalize">
                        {plan.status?.replace("_", " ")}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {plan.visitCount} Visits
                        </p>
                        <p className="text-xs text-gray-500">
                          Planned Activities
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {plan.submittedAt
                            ? new Date(plan.submittedAt).toLocaleDateString()
                            : "Not submitted"}
                        </p>
                        <p className="text-xs text-gray-500">Submitted Date</p>
                      </div>
                    </div>

                    {plan.approvedAt && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(plan.approvedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Approved Date</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {planVisits.length > 0 && (
                    <>
                      <button
                        onClick={() => onToggleExpansion(plan.id)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span>{isExpanded ? "Hide" : "Show"} Visits</span>
                      </button>
                      <button
                        onClick={() => setSelectedPlanForDetails(plan)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Details</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && planVisits.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="grid gap-3">
                    {planVisits.map((visit) => (
                      <div key={visit.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2 flex-wrap">
                              <span
                                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getVisitTypeColor(
                                  visit.visitType,
                                )}`}
                              >
                                {getVisitTypeLabel(visit.visitType)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {visit.plannedDate
                                  ? new Date(
                                      visit.plannedDate,
                                    ).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                            <h5 className="font-medium text-gray-900">
                              {visit.customerName}
                            </h5>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 flex-wrap">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{visit.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Building className="h-3 w-3" />
                                <span>{visit.industrialArea}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VisitsView = ({
  visits,
  getVisitTypeColor,
  getVisitTypeLabel,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading visits...</p>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No visits found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Visit Details</h3>
        <p className="text-sm text-gray-500">
          {visits.length} visit{visits.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {visits.map((visit) => (
          <div key={visit.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getVisitTypeColor(
                      visit.visitType,
                    )}`}
                  >
                    {getVisitTypeLabel(visit.visitType)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {visit.plannedDate
                      ? new Date(visit.plannedDate).toLocaleDateString()
                      : ""}
                  </span>
                </div>

                <h4 className="font-semibold text-gray-900 mb-1">
                  {visit.customerName}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  by {visit.userName}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {visit.location}
                      </p>
                      <p className="text-xs text-gray-500">Location</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {visit.industrialArea}
                      </p>
                      <p className="text-xs text-gray-500">Industrial Area</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {visit.userName}
                      </p>
                      <p className="text-xs text-gray-500">Team Member</p>
                    </div>
                  </div>
                </div>

                {visit.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{visit.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlanDetailsModal = ({
  plan,
  visits,
  onClose,
  getVisitTypeColor,
  getVisitTypeLabel,
  getStatusColor,
  getStatusIcon,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Plan Details
              </h2>
              <p className="text-sm text-gray-500">
                {plan.userName} • {plan.userEmail}
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-lg font-semibold text-blue-900">
                    {visits.length}
                  </p>
                  <p className="text-sm text-blue-700">Total Visits</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${getStatusColor(plan.status)}`}
            >
              <div className="flex items-center space-x-2">
                {getStatusIcon(plan.status)}
                <div>
                  <p className="text-lg font-semibold capitalize">
                    {plan.status?.replace("_", " ")}
                  </p>
                  <p className="text-sm">Status</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {plan.submittedAt
                      ? new Date(plan.submittedAt).toLocaleDateString()
                      : "Not submitted"}
                  </p>
                  <p className="text-sm text-gray-700">Submitted</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Visit Schedule
            </h3>
            <div className="space-y-3">
              {visits.map((visit) => (
                <div key={visit.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getVisitTypeColor(
                            visit.visitType,
                          )}`}
                        >
                          {getVisitTypeLabel(visit.visitType)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {visit.plannedDate
                            ? new Date(visit.plannedDate).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {visit.customerName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 flex-wrap">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{visit.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Building className="h-3 w-3" />
                          <span>{visit.industrialArea}</span>
                        </div>
                      </div>
                      {visit.notes && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-sm text-gray-700">{visit.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {visits.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No visits found for this plan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamVisitPlansPage;
