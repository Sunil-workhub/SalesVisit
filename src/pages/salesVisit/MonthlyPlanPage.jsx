import React, { useEffect, useMemo, useState } from "react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";
import {
  Plus,
  Send,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Download,
  Search,
  CalendarDays,
  Briefcase,
  Building2,
  Target,
  ClipboardList,
  Trash2,
} from "lucide-react";

const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
const empId = sessionUser?.emp_id;

const VISIT_TYPE_OPTIONS = [
  { value: "BD_VISIT", label: "BD Visit", shortLabel: "BD" },
  { value: "ABP_VISIT", label: "ABP Visit", shortLabel: "ABP" },
  { value: "ONGOING_DEAL", label: "Ongoing Deal", shortLabel: "Deal" },
  { value: "KEY_ACCOUNT", label: "Key Account", shortLabel: "Key" },
  { value: "OFFICE", label: "Office", shortLabel: "Office" },
  { value: "LEAVE", label: "Leave", shortLabel: "Leave" },
];

const NON_BUSINESS_VISIT_TYPES = ["OFFICE", "LEAVE"];
const LOCKED_PLAN_STATUSES = ["pending_approval", "approved"];

const extractLocalDateString = (dateVal) => {
  if (!dateVal) return "";
  return typeof dateVal === "string" ? dateVal.split("T")[0] : "";
};

const normalizeVisitTypes = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizePlanStatus = (status) =>
  String(status || "")
    .trim()
    .toLowerCase();

const isPlanLocked = (planStatus) =>
  LOCKED_PLAN_STATUSES.includes(normalizePlanStatus(planStatus));

const isPlanApproved = (planStatus) =>
  normalizePlanStatus(planStatus) === "approved";

const mapVisit = (visit) => {
  if (!visit) return null;

  return {
    id: visit.id || "",
    userId: visit.user_Id || visit.user_id || visit.userId || "",
    planId: visit.plan_Id || visit.plan_id || visit.planId || "",
    customerName:
      visit.customer_Name || visit.customer_name || visit.customerName || "",
    location: visit.location || "",
    industrialArea:
      visit.industrial_Area ||
      visit.industrial_area ||
      visit.industrialArea ||
      "",
    visitTypes: normalizeVisitTypes(
      visit.visit_Types ||
        visit.visit_types ||
        visit.visitTypes ||
        visit.visitType ||
        visit.visit_type ||
        "",
    ),
    plannedDate:
      visit.planned_Date || visit.planned_date || visit.plannedDate || "",
    actualDate:
      visit.actual_Date || visit.actual_date || visit.actualDate || null,
    status: visit.status || "planned",
    isApproved:
      visit.is_Approved ?? visit.is_approved ?? visit.isApproved ?? false,
    isAlternate:
      visit.is_Alternate ?? visit.is_alternate ?? visit.isAlternate ?? false,
    originalVisitId:
      visit.original_Visit_Id ||
      visit.original_visit_id ||
      visit.originalVisitId ||
      null,
    month: visit.month || "",
    year: visit.year || 0,
    notes: visit.notes || "",
    createdAt: visit.created_At || visit.created_at || visit.createdAt || "",
    updatedAt: visit.updated_At || visit.updated_at || visit.updatedAt || "",
  };
};

const mapPlan = (plan) => {
  if (!plan) return null;
  return {
    id: plan.id,
    userId: plan.user_Id || plan.user_id || plan.userId || "",
    month: plan.month || "",
    year: plan.year || 0,
    visits: (plan.visits || []).map(mapVisit).filter(Boolean),
    status: normalizePlanStatus(plan.status || "draft"),
    submittedAt:
      plan.submitted_At || plan.submitted_at || plan.submittedAt || null,
    approvedAt: plan.approved_At || plan.approved_at || plan.approvedAt || null,
    approvedBy: plan.approved_By || plan.approved_by || plan.approvedBy || null,
    rejectedAt: plan.rejected_At || plan.rejected_at || plan.rejectedAt || null,
    rejectedBy: plan.rejectedBy || plan.rejected_by || null,
    rejectionReason:
      plan.rejection_Reason ||
      plan.rejection_reason ||
      plan.rejectionReason ||
      "",
    changesSummary:
      plan.changes_Summary ||
      plan.changes_summary ||
      plan.changesSummary ||
      null,
    previousVersion:
      plan.previous_Version ||
      plan.previous_version ||
      plan.previousVersion ||
      null,
    createdAt: plan.created_At || plan.created_at || plan.createdAt || "",
    updatedAt: plan.updated_At || plan.updated_at || plan.updatedAt || "",
  };
};

const getMonthParts = (monthKey) => {
  if (!monthKey) {
    return { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
  }
  const [year, month] = monthKey.split("-").map(Number);
  return { year, month };
};

const isBusinessVisit = (visit) => {
  if (!visit) return false;
  return visit.visitTypes.some(
    (type) => !NON_BUSINESS_VISIT_TYPES.includes(type),
  );
};

const countVisitsByType = (visits, type) =>
  (visits || []).filter((visit) => visit.visitTypes.includes(type)).length;

const MonthlyPlanPage = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [visits, setVisits] = useState([]);
  const [industrialAreas, setIndustrialAreas] = useState([]);
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [editingVisit, setEditingVisit] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0")}`;
    setSelectedMonth(monthKey);
    setSelectedYear(currentDate.getFullYear());
    loadPageData(monthKey);
  }, []);

  const loadPageData = async (month) => {
    try {
      setLoading(true);
      setError(null);

      const targetMonth = month || selectedMonth;
      const response = await SalesVisitService.getVisitsByMonth({
        user_Id: empId,
        month: targetMonth,
      });

      let payloadNode = response?.data || response || {};
      if (payloadNode.data && !payloadNode.visits && !payloadNode.plan) {
        payloadNode = payloadNode.data;
      }

      const rawVisits =
        payloadNode.visits ||
        (payloadNode.plan && payloadNode.plan.visits) ||
        [];
      const mappedVisits = rawVisits.map(mapVisit).filter(Boolean);
      const plan = mapPlan(
        payloadNode.plan ||
          payloadNode.monthlyPlan ||
          payloadNode.currentPlan ||
          null,
      );
      const areas =
        payloadNode.industrial_Areas || payloadNode.industrialAreas || [];

      setCurrentPlan(plan);
      setVisits(mappedVisits);
      setIndustrialAreas(Array.isArray(areas) ? areas : []);
    } catch (err) {
      console.error("Error loading monthly plan page:", err);
      setCurrentPlan(null);
      setVisits([]);
      setIndustrialAreas([]);
      setError("Failed to load monthly plan data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVisit = async (visitData) => {
    try {
      setLoading(true);
      setError(null);

      if (isPlanApproved(currentPlan?.status)) {
        setError("Approved monthly plans cannot be edited");
        return;
      }

      const plannedMonthKey = visitData.plannedDate
        ? visitData.plannedDate.slice(0, 7)
        : selectedMonth;

      const { year: plannedYear, month: plannedMonth } =
        getMonthParts(plannedMonthKey);

      const payload = {
        user_Id: empId,
        customer_Name: visitData.customerName,
        location: visitData.location,
        industrial_Area: visitData.industrialArea,
        visit_Types: visitData.visitTypes,
        planned_Date: visitData.plannedDate,
        notes: visitData.notes,
        id: editingVisit?.id || null,
        plan_Id: currentPlan?.id || visitData.planId || null,
        year: plannedYear,
        month: plannedMonthKey,
        monthKey: `${plannedYear}-${String(plannedMonth).padStart(2, "0")}`,
        ...(editingVisit && { updated_By: empId }),
      };

      if (editingVisit) {
        if (isPlanLocked(currentPlan?.status)) {
          setError("Visits cannot be edited after submitting for approval");
          return;
        }

        await (SalesVisitService.updateVisit
          ? SalesVisitService.updateVisit(payload)
          : Promise.resolve({ success: true }));
      } else {
        await SalesVisitService.addVisit(payload);
      }

      await loadPageData(selectedMonth);
      setIsAddingVisit(false);
      setEditingVisit(null);
      setSelectedDate("");
    } catch (err) {
      console.error("Error saving visit:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to save visit",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVisit = async (visitId) => {
    try {
      if (!visitId) return;

      if (isPlanLocked(currentPlan?.status)) {
        setError("Visits cannot be deleted after submitting for approval");
        return;
      }

      if (!window.confirm("Are you sure you want to delete this visit?")) {
        return;
      }

      setLoading(true);
      setError(null);

      await (SalesVisitService.deleteVisit
        ? SalesVisitService.deleteVisit({
            id: visitId,
            deleted_By: empId,
            plan_Id: currentPlan?.id || null,
          })
        : Promise.resolve({ success: true }));

      await loadPageData(selectedMonth);
      setIsAddingVisit(false);
      setEditingVisit(null);
      setSelectedDate("");
    } catch (err) {
      console.error("Error deleting visit:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete visit",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPlan = async () => {
    const businessVisits = visits.filter(isBusinessVisit);

    if (!currentPlan || !currentPlan.id) {
      setError("No monthly plan found to submit");
      return;
    }

    if (businessVisits.length === 0) {
      setError("Please add at least one business visit before submitting");
      return;
    }

    if (
      !window.confirm("Are you sure you want to submit this plan for approval?")
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        id: currentPlan.id,
        submitted_By: empId,
      };

      const response = await SalesVisitService.submitMonthlyPlan(payload);
      const responseData = response?.data || response || {};

      const isSuccess =
        responseData?.success === true ||
        responseData?.status === "Success" ||
        responseData?.status === "success" ||
        responseData?.message === "Plan submitted successfully";

      if (!isSuccess) {
        throw new Error(
          responseData?.message || "Failed to submit plan for approval",
        );
      }

      const submittedAt = new Date().toISOString();

      setCurrentPlan((prev) =>
        prev
          ? {
              ...prev,
              status: "pending_approval",
              submittedAt,
              updatedAt: submittedAt,
            }
          : prev,
      );

      alert("Plan submitted for approval successfully.");
    } catch (err) {
      console.error("Error submitting monthly plan:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit plan for approval",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "Customer Name",
      "Location",
      "Industrial Area",
      "Visit Types",
      "Planned Date",
      "Notes",
    ];
    const sampleData = [
      [
        "ABC Manufacturing Ltd",
        "Andheri East, Mumbai",
        "Andheri East",
        "BD_VISIT",
        `${selectedMonth}-15`,
        "Initial meeting",
      ],
    ];
    const csvContent = [headers, ...sampleData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `monthly_plan_template_${selectedMonth}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const navigateMonth = (direction) => {
    const { year, month } = getMonthParts(selectedMonth);
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
    loadPageData(newMonthKey);
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

  const getStatusColor = (status) => {
    switch (normalizePlanStatus(status)) {
      case "approved":
        return "text-green-700 bg-green-50 border-green-200";
      case "pending_approval":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "rejected":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const planStatus = normalizePlanStatus(currentPlan?.status);
  const isReadOnlyPlan = !!currentPlan && isPlanLocked(planStatus);
  const canEdit = !isReadOnlyPlan;
  const canAddVisit = !isReadOnlyPlan;
  const canDeleteVisit = !isReadOnlyPlan;

  const calendarDates = useMemo(() => {
    if (!selectedMonth) return [];
    const { year, month } = getMonthParts(selectedMonth);
    const lastDay = new Date(year, month, 0);
    const dates = [];

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`;
      const date = new Date(year, month - 1, day);

      dates.push({
        date: dateString,
        day,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday:
          extractLocalDateString(new Date().toISOString()) === dateString,
        visits: visits.filter((visit) => {
          if (!visit || !visit.plannedDate) return false;
          return extractLocalDateString(visit.plannedDate) === dateString;
        }),
      });
    }
    return dates;
  }, [selectedMonth, visits]);

  const monthGrid = useMemo(() => {
    if (!selectedMonth) return [];

    const { year, month } = getMonthParts(selectedMonth);
    const firstDate = new Date(year, month - 1, 1);
    const firstDayIndex = firstDate.getDay();
    const totalDays = new Date(year, month, 0).getDate();

    const grid = [];

    for (let i = 0; i < firstDayIndex; i += 1) {
      grid.push({
        id: `empty-start-${i}`,
        isCurrentMonth: false,
        isEmpty: true,
      });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`;
      const dateObj = new Date(year, month - 1, day);
      const matched = calendarDates.find((d) => d.date === dateString);

      grid.push({
        ...(matched || {}),
        id: dateString,
        date: dateString,
        day,
        dayName: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
        isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
        isCurrentMonth: true,
        isEmpty: false,
        visits: matched?.visits || [],
      });
    }

    const remainder = grid.length % 7;
    const trailing = remainder === 0 ? 0 : 7 - remainder;

    for (let i = 0; i < trailing; i += 1) {
      grid.push({
        id: `empty-end-${i}`,
        isCurrentMonth: false,
        isEmpty: true,
      });
    }

    return grid;
  }, [selectedMonth, calendarDates]);

  const businessVisitCount = visits.filter(isBusinessVisit).length;
  const weekdayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-[#f6f8fb] -m-4 md:-m-6 p-4 md:p-6">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.06)] overflow-hidden">
          <div className="relative px-5 py-6 md:px-8 md:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_30%),radial-gradient(circle_at_left,_rgba(14,165,233,0.07),_transparent_32%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  Monthly Plan
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {currentPlan && (
                  <div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(currentPlan.status)}`}
                  >
                    <span className="capitalize">
                      {String(currentPlan.status || "").replace("_", " ")}
                    </span>
                  </div>
                )}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {visits.length} visits planned
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-3 py-3 md:px-4 md:py-4 mb-6">
            <button
              onClick={() => navigateMonth("prev")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-800 hover:shadow"
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center px-3">
              <h2 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">
                {formatMonth(selectedMonth)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {businessVisitCount} business visits planned
              </p>
            </div>

            <button
              onClick={() => navigateMonth("next")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-800 hover:shadow"
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-5">
            <div className="text-sm text-slate-500">
              Organize visits, review month coverage, and submit once ready.
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* {canEdit && (
                <>
                  <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900"
                    type="button"
                  >
                    <Download className="h-4 w-4" />
                    <span>Template</span>
                  </button>

                  <label className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm cursor-pointer transition hover:bg-blue-700">
                    <Upload className="h-4 w-4" />
                    <span>Import CSV</span>
                    <input type="file" accept=".csv" className="hidden" />
                  </label>
                </>
              )} */}

              {currentPlan &&
                canEdit &&
                businessVisitCount > 0 &&
                !isPlanLocked(currentPlan.status) && (
                  <button
                    onClick={handleSubmitPlan}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                    type="button"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit for Approval</span>
                  </button>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={CalendarDays}
              tone="blue"
              value={visits.length}
              label="Total Visits"
            />
            <StatCard
              icon={Briefcase}
              tone="emerald"
              value={countVisitsByType(visits, "BD_VISIT")}
              label="BD Visits"
            />
            <StatCard
              icon={Target}
              tone="violet"
              value={countVisitsByType(visits, "ABP_VISIT")}
              label="ABP Visits"
            />
            <StatCard
              icon={Building2}
              tone="amber"
              value={countVisitsByType(visits, "KEY_ACCOUNT")}
              label="Key Accounts"
            />
            <StatCard
              icon={ClipboardList}
              tone="orange"
              value={countVisitsByType(visits, "ONGOING_DEAL")}
              label="Ongoing Deals"
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-5 md:px-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              Monthly Calendar - {formatMonth(selectedMonth)}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Full month view in a single layout, similar to a standard monthly
              calendar.
            </p>
          </div>

          <div className="p-3 md:p-4 lg:p-5">
            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-7 border border-slate-200 rounded-t-2xl overflow-hidden bg-slate-50">
                  {weekdayHeaders.map((day) => (
                    <div
                      key={day}
                      className="border-r last:border-r-0 border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 text-center"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 border-x border-b border-slate-200 rounded-b-2xl overflow-hidden bg-white">
                  {monthGrid.map((dateInfo) => (
                    <MonthCell
                      key={dateInfo.id}
                      dateInfo={dateInfo}
                      canAddVisit={canAddVisit}
                      canEditVisit={!isReadOnlyPlan}
                      canDeleteVisit={canDeleteVisit}
                      onAddVisit={() => {
                        if (!dateInfo?.date || isReadOnlyPlan) return;
                        setSelectedDate(dateInfo.date);
                        setEditingVisit(null);
                        setIsAddingVisit(true);
                      }}
                      onEditVisit={(visit) => {
                        if (isReadOnlyPlan) return;
                        setIsAddingVisit(false);
                        setEditingVisit(visit);
                      }}
                      onDeleteVisit={handleDeleteVisit}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {(isAddingVisit || editingVisit) && (
          <VisitForm
            visit={editingVisit}
            selectedDate={selectedDate}
            industrialAreas={industrialAreas}
            canEditVisit={!isReadOnlyPlan}
            canDeleteVisit={!!editingVisit && canDeleteVisit}
            onDelete={handleDeleteVisit}
            onSave={handleSaveVisit}
            onCancel={() => {
              setIsAddingVisit(false);
              setEditingVisit(null);
              setSelectedDate("");
            }}
          />
        )}
      </div>
    </div>
  );
};

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
  };

  const styles = toneMap[tone] || toneMap.blue;

  return (
    <div className={`rounded-[22px] border p-4 shadow-sm ${styles.wrap}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-2xl font-bold tracking-tight ${styles.value}`}>
            {value}
          </p>
          <p className={`mt-1 text-sm font-medium ${styles.label}`}>{label}</p>
        </div>
        {Icon ? (
          <div className={`rounded-2xl p-3 ${styles.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
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

const getVisitTypeLabel = (type) =>
  VISIT_TYPE_OPTIONS.find((option) => option.value === type)?.shortLabel ||
  type;

const MonthCell = ({
  dateInfo,
  canAddVisit,
  canEditVisit,
  canDeleteVisit,
  onAddVisit,
  onEditVisit,
  onDeleteVisit,
}) => {
  if (!dateInfo?.isCurrentMonth) {
    return (
      <div className="min-h-[150px] border-r border-b border-slate-200 bg-slate-50/70 last:border-r-0" />
    );
  }

  return (
    <div
      className={`group min-h-[170px] border-r border-b border-slate-200 p-2.5 align-top transition-colors last:border-r-0 ${
        dateInfo.isWeekend ? "bg-slate-50/60" : "bg-white"
      } ${dateInfo.isToday ? "ring-1 ring-inset ring-blue-200 bg-blue-50/30" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            dateInfo.isToday ? "bg-blue-600 text-white" : "text-slate-700"
          }`}
        >
          {dateInfo.day}
        </div>

        {canAddVisit && (
          <button
            onClick={onAddVisit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 opacity-70 transition hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100"
            title="Add visit"
            type="button"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {dateInfo.visits.slice(0, 3).map((visit) => {
          const visitTypesList = visit.visitTypes || [];
          const firstType = visitTypesList[0] || "OFFICE";

          return (
            <div
              key={visit.id}
              className={`w-full rounded-xl border px-2.5 py-2 text-left text-[11px] shadow-sm ${getVisitTypeColor(firstType)}`}
            >
              <button
                type="button"
                onClick={() => {
                  if (!canEditVisit) return;
                  onEditVisit(visit);
                }}
                className={`w-full text-left ${canEditVisit ? "cursor-pointer" : "cursor-default"}`}
                disabled={!canEditVisit}
              >
                <div className="truncate font-semibold">
                  {visit.customerName}
                </div>
                <div className="mt-0.5 truncate opacity-75">
                  {visit.location}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {visitTypesList.slice(0, 2).map((type) => (
                    <span
                      key={`${visit.id}-${type}`}
                      className="rounded-full border border-white/60 bg-white/70 px-1.5 py-0.5 text-[9px] font-medium"
                    >
                      {getVisitTypeLabel(type)}
                    </span>
                  ))}
                </div>
              </button>

              {canDeleteVisit && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDeleteVisit(visit.id)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-red-600 transition hover:bg-red-100"
                    title="Delete visit"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {dateInfo.visits.length > 3 && (
          <div className="px-1 text-[11px] font-medium text-slate-500">
            +{dateInfo.visits.length - 3} more
          </div>
        )}

        {dateInfo.visits.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-2.5 py-3 text-center text-[11px] font-medium text-slate-400">
            No visits
          </div>
        )}
      </div>
    </div>
  );
};

const VisitForm = ({
  visit,
  selectedDate,
  industrialAreas,
  canEditVisit,
  canDeleteVisit,
  onDelete,
  onSave,
  onCancel,
}) => {
  const isEditMode = !!visit;
  const isReadOnly = isEditMode && !canEditVisit;

  const [areaSearchTerm, setAreaSearchTerm] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [formData, setFormData] = useState({
    customerName: visit?.customerName || "",
    location: visit?.location || "",
    industrialArea: visit?.industrialArea || "",
    visitTypes: normalizeVisitTypes(visit?.visitTypes).length
      ? normalizeVisitTypes(visit?.visitTypes)
      : [],
    plannedDate: visit?.plannedDate
      ? visit.plannedDate.split("T")[0]
      : selectedDate,
    notes: visit?.notes || "",
  });

  useEffect(() => {
    const list = Array.isArray(industrialAreas) ? industrialAreas : [];
    if (!areaSearchTerm.trim()) {
      setFilteredAreas(list);
      return;
    }

    const searchLower = areaSearchTerm.toLowerCase();
    const filtered = list.filter((area) =>
      [area.name, area.city, area.state, area.region].some((field) =>
        (field || "").toLowerCase().includes(searchLower),
      ),
    );
    setFilteredAreas(filtered);
  }, [areaSearchTerm, industrialAreas]);

  useEffect(() => {
    if (!visit?.industrialArea || !Array.isArray(industrialAreas)) return;
    const selectedArea = industrialAreas.find(
      (area) => area && area.name === visit.industrialArea,
    );
    if (selectedArea) {
      setAreaSearchTerm(
        `${selectedArea.name} - ${selectedArea.city}, ${selectedArea.state}`,
      );
    } else {
      setAreaSearchTerm(visit.industrialArea);
    }
  }, [visit, industrialAreas]);

  const handleChange = (event) => {
    if (isReadOnly) return;
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAreaSelect = (area) => {
    if (isReadOnly) return;
    setFormData((prev) => ({ ...prev, industrialArea: area.name }));
    setAreaSearchTerm(`${area.name} - ${area.city}, ${area.state}`);
    setIsAreaDropdownOpen(false);
  };

  const handleAreaSearchChange = (event) => {
    if (isReadOnly) return;
    const value = event.target.value;
    setAreaSearchTerm(value);
    setIsAreaDropdownOpen(true);

    const list = Array.isArray(industrialAreas) ? industrialAreas : [];
    const exactMatch = list.find(
      (area) =>
        area && area.name && area.name.toLowerCase() === value.toLowerCase(),
    );
    setFormData((prev) => ({
      ...prev,
      industrialArea: exactMatch ? exactMatch.name : value,
    }));
  };

  const handleVisitTypeToggle = (type) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      visitTypes: prev.visitTypes.includes(type)
        ? prev.visitTypes.filter((item) => item !== type)
        : [...prev.visitTypes, type],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isReadOnly) {
      onCancel();
      return;
    }

    if (
      !formData.customerName ||
      !formData.location ||
      !formData.industrialArea ||
      formData.visitTypes.length === 0 ||
      !formData.plannedDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      ...visit,
      customerName: formData.customerName,
      location: formData.location,
      industrialArea: formData.industrialArea,
      visitTypes: formData.visitTypes,
      plannedDate: formData.plannedDate,
      notes: formData.notes,
    });
  };

  const getDisplayDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("T")[0].split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[3px]"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] max-h-[90vh]">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                {isEditMode
                  ? isReadOnly
                    ? "View Visit"
                    : "Edit Visit"
                  : "Add New Visit"}
              </h3>
              {(selectedDate || formData.plannedDate) && (
                <p className="mt-1 text-sm text-slate-500">
                  {getDisplayDate(formData.plannedDate || selectedDate)}
                </p>
              )}
            </div>
            <button
              onClick={onCancel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-88px)] px-6 py-6 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${
                  isReadOnly
                    ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                    : "border-slate-300 text-slate-900 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${
                  isReadOnly
                    ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                    : "border-slate-300 text-slate-900 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Industrial Area *
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={areaSearchTerm}
                    onChange={handleAreaSearchChange}
                    onFocus={() => !isReadOnly && setIsAreaDropdownOpen(true)}
                    disabled={isReadOnly}
                    placeholder="Search industrial areas..."
                    className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 outline-none ${
                      isReadOnly
                        ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                        : "border-slate-300 text-slate-900 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {!isReadOnly && isAreaDropdownOpen && (
                  <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                    {filteredAreas.length > 0 ? (
                      filteredAreas.map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => handleAreaSelect(area)}
                          className="w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900">
                            {area.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {area.city}, {area.state}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No industrial areas found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Visit Types *
              </label>
              <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-300 bg-slate-50 p-3 space-y-2.5">
                {VISIT_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-slate-200 ${
                      isReadOnly
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.visitTypes.includes(option.value)}
                      onChange={() => handleVisitTypeToggle(option.value)}
                      disabled={isReadOnly}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Planned Date *
            </label>
            <input
              type={isReadOnly ? "text" : "date"}
              name="plannedDate"
              value={formData.plannedDate}
              onChange={handleChange}
              disabled={isReadOnly}
              className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${
                isReadOnly
                  ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  : "border-slate-300 text-slate-900 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isReadOnly}
              rows={3}
              className={`w-full rounded-xl border px-3.5 py-2.5 outline-none ${
                isReadOnly
                  ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  : "border-slate-300 text-slate-900 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              }`}
              placeholder="Add any additional notes or comments"
            />
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <div>
              {isEditMode && canDeleteVisit && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => onDelete(visit.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                {isReadOnly ? "Close" : "Cancel"}
              </button>

              {!isReadOnly && (
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  {isEditMode ? "Update Visit" : "Add Visit"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonthlyPlanPage;
