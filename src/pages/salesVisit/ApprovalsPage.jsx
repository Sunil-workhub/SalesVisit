import React, { useEffect, useMemo, useState } from "react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Building,
  MessageSquare,
  RefreshCw,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ApprovalsPage = () => {
  const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const user = sessionUser || null;

  const [pendingPlans, setPendingPlans] = useState([]);
  const [approvedPlans, setApprovedPlans] = useState([]);
  const [rejectedPlans, setRejectedPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingPlanId, setRejectingPlanId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
      loadPlans(selectedMonth, selectedYear);
    }
  }, [user?.emp_id, selectedMonth, selectedYear]);

  const formatDateOnly = (value) => {
    if (!value) return "";
    return String(value).split("T")[0];
  };

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

  const normalizePlan = (plan) => ({
    id: plan?.id || plan?.Id || "",
    userId: plan?.userId || plan?.UserId || "",
    month: plan?.month || plan?.Month || "",
    year: plan?.year || plan?.Year || 0,
    status: plan?.status || plan?.Status || "",
    submittedAt: plan?.submittedAt || plan?.SubmittedAt || null,
    approvedAt: plan?.approvedAt || plan?.ApprovedAt || null,
    approvedBy: plan?.approvedBy || plan?.ApprovedBy || null,
    rejectedAt: plan?.rejectedAt || plan?.RejectedAt || null,
    rejectedBy: plan?.rejectedBy || plan?.RejectedBy || null,
    rejectionReason: plan?.rejectionReason || plan?.RejectionReason || "",
    changesSummary: plan?.changesSummary || plan?.ChangesSummary || "",
    previousVersion: plan?.previousVersion || plan?.PreviousVersion || null,
    createdAt: plan?.createdAt || plan?.CreatedAt || null,
    updatedAt: plan?.updatedAt || plan?.UpdatedAt || null,
    user: {
      name: plan?.user?.name || plan?.User?.Name || "",
      email: plan?.user?.email || plan?.User?.Email || "",
      role: plan?.user?.role || plan?.User?.Role || "",
    },
    visits: Array.isArray(plan?.visits)
      ? plan.visits.map(normalizeVisit)
      : Array.isArray(plan?.Visits)
        ? plan.Visits.map(normalizeVisit)
        : [],
  });

  const getResponseData = (response) => {
    return response?.data?.data || response?.data?.Data || response?.data || {};
  };

  const getResponseMessage = (response) => {
    return (
      response?.data?.message ||
      response?.data?.Message ||
      response?.message ||
      response?.Message ||
      ""
    );
  };

  const getResponseStatusCode = (response) => {
    return (
      response?.data?.status_Code ||
      response?.data?.Status_Code ||
      response?.status_Code ||
      response?.Status_Code ||
      response?.status ||
      response?.Status ||
      null
    );
  };

  const isSuccessResponse = (response) => {
    const status = response?.data?.status || response?.data?.Status;
    const statusCode = getResponseStatusCode(response);

    if (status === "Success" || status === "success") return true;
    if (statusCode === 200) return true;

    return false;
  };

  const loadPlans = async (
    monthParam = selectedMonth,
    yearParam = selectedYear,
  ) => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        userId: user?.emp_id,
        month: monthParam,
        year: yearParam,
      };

      const response = await SalesVisitService.getApprovalPlans(payload);
      const data = getResponseData(response);

      let plansData = [];
      if (Array.isArray(data)) {
        plansData = data;
      } else if (Array.isArray(data?.plans)) {
        plansData = data.plans;
      } else if (Array.isArray(data?.Plans)) {
        plansData = data.Plans;
      } else if (Array.isArray(response?.data?.data)) {
        plansData = response.data.data;
      } else if (Array.isArray(response?.data?.Data)) {
        plansData = response.data.Data;
      }

      const plans = (plansData || []).map(normalizePlan);

      const pending = plans.filter(
        (item) => item.status === "pending_approval",
      );
      const approved = plans.filter((item) => item.status === "approved");
      const rejected = plans.filter((item) => item.status === "rejected");

      setPendingPlans(pending);
      setApprovedPlans(approved);
      setRejectedPlans(rejected);
    } catch (err) {
      console.error("Error loading approval plans:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err.message ||
          "Failed to load approval plans.",
      );
      setPendingPlans([]);
      setApprovedPlans([]);
      setRejectedPlans([]);
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
    const [yearStr, monthStr] = month.split("-");
    const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatMonthOld = (month, year) => {
    if (!month) return "";
    const [yearStr, monthStr] = month.split("-");
    const date = new Date(
      parseInt(yearStr || year, 10),
      parseInt(monthStr, 10) - 1,
      1,
    );

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleApprovePlan = async (planId) => {
    if (
      !window.confirm("Are you sure you want to approve this monthly plan?")
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const currentDateTime = new Date().toISOString();

      const payload = {
        id: planId,
        approvedBy: user?.emp_id,
        approvedAt: currentDateTime,
        updatedAt: currentDateTime,
      };

      const response = await SalesVisitService.approveMonthlyPlan(payload);

      if (!isSuccessResponse(response)) {
        alert(getResponseMessage(response) || "Failed to approve monthly plan");
        return;
      }

      await loadPlans();
      alert("Monthly plan approved successfully.");
    } catch (err) {
      console.error("Error approving plan:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err.message ||
          "Failed to approve monthly plan.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPlan = async (planId) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const currentDateTime = new Date().toISOString();

      const payload = {
        id: planId,
        rejectedBy: user?.emp_id,
        rejectedAt: currentDateTime,
        rejectionReason: rejectionReason.trim(),
        updatedAt: currentDateTime,
      };

      const response = await SalesVisitService.rejectMonthlyPlan(payload);

      if (!isSuccessResponse(response)) {
        alert(getResponseMessage(response) || "Failed to reject monthly plan");
        return;
      }

      setRejectionReason("");
      setRejectingPlanId(null);
      await loadPlans();
      alert("Monthly plan rejected successfully.");
    } catch (err) {
      console.error("Error rejecting plan:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err.message ||
          "Failed to reject monthly plan.",
      );
    } finally {
      setLoading(false);
    }
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
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCurrentPlans = () => {
    switch (selectedTab) {
      case "pending":
        return pendingPlans;
      case "approved":
        return approvedPlans;
      case "rejected":
        return rejectedPlans;
      default:
        return pendingPlans;
    }
  };

  const totalPlansCount = useMemo(() => {
    return pendingPlans.length + approvedPlans.length + rejectedPlans.length;
  }, [pendingPlans, approvedPlans, rejectedPlans]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Monthly Plan Approvals
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadPlans()}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
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
              {totalPlansCount} plan{totalPlansCount !== 1 ? "s" : ""} for this
              month
            </p>
          </div>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">
                Pending Approval
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {pendingPlans.length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900">
                {approvedPlans.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900">
                {rejectedPlans.length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              {
                id: "pending",
                label: "Pending Approval",
                count: pendingPlans.length,
              },
              {
                id: "approved",
                label: "Approved",
                count: approvedPlans.length,
              },
              {
                id: "rejected",
                label: "Rejected",
                count: rejectedPlans.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading plans...</p>
            </div>
          ) : getCurrentPlans().length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No {selectedTab} plans found
              </h4>
              <p className="text-sm text-gray-500">
                {selectedTab === "pending"
                  ? "No monthly plans are currently waiting for your approval"
                  : `No ${selectedTab} monthly plans to display`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getCurrentPlans().map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onApprove={() => handleApprovePlan(plan.id)}
                  onReject={() => setRejectingPlanId(plan.id)}
                  onViewDetails={() => setSelectedPlan(plan)}
                  canApprove={selectedTab === "pending"}
                  formatMonth={formatMonthOld}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPlan && (
        <PlanDetailsModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          formatMonth={formatMonthOld}
        />
      )}

      {rejectingPlanId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Monthly Plan
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Please provide a reason for rejecting this plan
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this plan is being rejected..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setRejectingPlanId(null);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectPlan(rejectingPlanId)}
                  disabled={!rejectionReason.trim() || loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Rejecting..." : "Reject Plan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PlanCard = ({
  plan,
  onApprove,
  onReject,
  onViewDetails,
  canApprove,
  formatMonth,
  getStatusColor,
  getStatusIcon,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {plan.user?.name || "-"}
              </h3>
              <p className="text-sm text-gray-500">{plan.user?.email || "-"}</p>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(plan.status)}`}
            >
              {getStatusIcon(plan.status)}
              <span className="ml-1 capitalize">
                {(plan.status || "").replace("_", " ")}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatMonth(plan.month, plan.year)}
                </p>
                <p className="text-xs text-gray-500">Planning Period</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {plan.visits?.length || 0} Visits
                </p>
                <p className="text-xs text-gray-500">Planned Activities</p>
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
          </div>

          {plan.rejectionReason && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start space-x-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-red-700">{plan.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onViewDetails}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </button>

          {canApprove && (
            <>
              <button
                onClick={onApprove}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={onReject}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PlanDetailsModal = ({ plan, onClose, formatMonth }) => {
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
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Plan Details - {formatMonth(plan.month, plan.year)}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {plan.user?.name || "-"} ({plan.user?.email || "-"})
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">
                {plan.visits?.length || 0}
              </p>
              <p className="text-sm text-blue-700">Total Visits</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">
                {plan.visits?.filter((v) => v.visitType === "BD_VISIT")
                  .length || 0}
              </p>
              <p className="text-sm text-purple-700">BD Visits</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
              <p className="text-2xl font-bold text-orange-600">
                {plan.visits?.filter((v) => v.visitType === "ABP_VISIT")
                  .length || 0}
              </p>
              <p className="text-sm text-orange-700">ABP Visits</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
              <p className="text-2xl font-bold text-green-600">
                {plan.visits?.filter((v) => v.visitType === "KEY_ACCOUNT")
                  .length || 0}
              </p>
              <p className="text-sm text-green-700">Key Accounts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-600">
                {plan.visits?.filter((v) => v.visitType === "ONGOING_DEAL")
                  .length || 0}
              </p>
              <p className="text-sm text-yellow-700">Ongoing Deals</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <p className="text-2xl font-bold text-gray-600">
                {plan.visits?.filter((v) => v.visitType === "OFFICE").length ||
                  0}
              </p>
              <p className="text-sm text-gray-700">Office Days</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
              <p className="text-2xl font-bold text-red-600">
                {plan.visits?.filter((v) => v.visitType === "LEAVE").length ||
                  0}
              </p>
              <p className="text-sm text-red-700">Leave Days</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Planned Visits
            </h4>
            {!plan.visits || plan.visits.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No visits planned for this month
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {plan.visits.map((visit, index) => (
                  <div
                    key={visit.id || index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="font-medium text-gray-900">
                            {visit.customerName}
                          </h5>
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getVisitTypeColor(
                              visit.visitType,
                            )}`}
                          >
                            {getVisitTypeLabel(visit.visitType)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-900">
                                {visit.location}
                              </p>
                              <p className="text-xs text-gray-500">
                                {visit.industrialArea}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-900">
                                {visit.plannedDate
                                  ? new Date(
                                      visit.plannedDate,
                                    ).toLocaleDateString()
                                  : "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {visit.plannedDate
                                  ? new Date(
                                      visit.plannedDate,
                                    ).toLocaleDateString("en-US", {
                                      weekday: "long",
                                    })
                                  : "-"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-900">
                                {visit.industrialArea}
                              </p>
                              <p className="text-xs text-gray-500">
                                Industrial Area
                              </p>
                            </div>
                          </div>
                        </div>

                        {visit.notes && (
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Notes:
                                </p>
                                <p className="text-sm text-gray-600">
                                  {visit.notes}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
