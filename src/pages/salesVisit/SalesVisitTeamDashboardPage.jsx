import React, { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  MapPin,
  Target,
  CheckCircle2,
  Clock3,
  BarChart3,
  Users,
  Building,
  Award,
  Activity,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Eye,
  EyeOff,
} from "lucide-react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";

const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
const empId = sessionUser?.emp_id || sessionUser?.empId || "";

const DEFAULT_TEAM_DASHBOARD = {
  monthly: {
    summary: {
      totalVisits: 0,
      completedVisits: 0,
      plannedVisits: 0,
      completionRate: 0,
      totalPlans: 0,
      approvedPlans: 0,
      pendingPlans: 0,
      rejectedPlans: 0,
      uniqueVisitDays: 0,
      totalMembers: 0,
    },
    visitTypes: [],
    areaCoverage: {
      totalAreas: 0,
      coveredAreas: 0,
      coverageRate: 0,
      byPotential: [],
      focusAreaCoverage: {
        totalFocusAreas: 0,
        areasCovered: 0,
        coverageRate: 0,
        avgVisitsPerArea: 0,
        deepCoverage: 0,
        moderateCoverage: 0,
        lightCoverage: 0,
        noCoverage: 0,
      },
      focusAreaStats: [],
    },
    teamMembers: [],
  },
  ytd: {
    summary: {
      totalVisits: 0,
      completedVisits: 0,
      plannedVisits: 0,
      completionRate: 0,
      totalPlans: 0,
      approvedPlans: 0,
      pendingPlans: 0,
      rejectedPlans: 0,
      uniqueVisitDays: 0,
      totalMembers: 0,
    },
    visitTypes: [],
    areaCoverage: {
      totalAreas: 0,
      coveredAreas: 0,
      coverageRate: 0,
      byPotential: [],
      focusAreaCoverage: {
        totalFocusAreas: 0,
        areasCovered: 0,
        coverageRate: 0,
        avgVisitsPerArea: 0,
        deepCoverage: 0,
        moderateCoverage: 0,
        lightCoverage: 0,
        noCoverage: 0,
      },
      focusAreaStats: [],
    },
    teamMembers: [],
  },
};

const FY_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

const SalesVisitTeamDashboardPage = () => {
  const [selectedTab, setSelectedTab] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState(DEFAULT_TEAM_DASHBOARD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNoDataAreas, setShowNoDataAreas] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Helper to determine the Financial Year string (e.g., FY 2025-26) based on selectedMonth key
  const getDisplayFinancialYear = (monthKey) => {
    if (!monthKey) return "";
    const [year, month] = monthKey.split("-").map(Number);
    if (month >= 1 && month <= 3) {
      return `FY ${year - 1}-${String(year).slice(-2)}`;
    }
    return `FY ${year}-${String(year + 1).slice(-2)}`;
  };

  useEffect(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(monthKey);
    setSelectedYear(now.getFullYear());
  }, []);

  useEffect(() => {
    if (selectedMonth && empId) {
      loadDashboard();
    }
  }, [selectedMonth, selectedYear]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await SalesVisitService.getTeamDashboard({
        empId,
        month: selectedMonth,
        year: selectedYear,
      });

      const payload = response?.data?.data || response?.data || {};

      if (!payload?.monthly && !payload?.ytd) {
        setDashboardData(DEFAULT_TEAM_DASHBOARD);
        return;
      }

      const m = payload.monthly || {};
      const y = payload.ytd || {};

      setDashboardData({
        monthly: {
          summary: {
            ...DEFAULT_TEAM_DASHBOARD.monthly.summary,
            ...(m.summary || {}),
          },
          visitTypes: Array.isArray(m.visitTypes) ? m.visitTypes : [],
          areaCoverage: {
            totalAreas: m.areaCoverage?.totalAreas ?? 0,
            coveredAreas: m.areaCoverage?.coveredAreas ?? 0,
            coverageRate: m.areaCoverage?.coverageRate ?? 0,
            byPotential: Array.isArray(m.areaCoverage?.byPotential)
              ? m.areaCoverage.byPotential
              : [],
            focusAreaStats: Array.isArray(m.areaCoverage?.focusAreaStats)
              ? m.areaCoverage.focusAreaStats
              : [],
            focusAreaCoverage: {
              ...DEFAULT_TEAM_DASHBOARD.monthly.areaCoverage.focusAreaCoverage,
              ...(m.areaCoverage?.focusAreaCoverage || {}),
            },
          },
          teamMembers: Array.isArray(m.teamMembers) ? m.teamMembers : [],
        },
        ytd: {
          summary: {
            ...DEFAULT_TEAM_DASHBOARD.ytd.summary,
            ...(y.summary || {}),
          },
          visitTypes: Array.isArray(y.visitTypes) ? y.visitTypes : [],
          areaCoverage: {
            totalAreas: y.areaCoverage?.totalAreas ?? 0,
            coveredAreas: y.areaCoverage?.coveredAreas ?? 0,
            coverageRate: y.areaCoverage?.coverageRate ?? 0,
            byPotential: Array.isArray(y.areaCoverage?.byPotential)
              ? y.areaCoverage.byPotential
              : [],
            focusAreaStats: Array.isArray(y.areaCoverage?.focusAreaStats)
              ? y.areaCoverage.focusAreaStats
              : [],
            focusAreaCoverage: {
              ...DEFAULT_TEAM_DASHBOARD.ytd.areaCoverage.focusAreaCoverage,
              ...(y.areaCoverage?.focusAreaCoverage || {}),
            },
          },
          teamMembers: Array.isArray(y.teamMembers) ? y.teamMembers : [],
        },
      });
    } catch (err) {
      console.error("Error loading team dashboard:", err);
      setError("Failed to load team dashboard data.");
      setDashboardData(DEFAULT_TEAM_DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const currentIdx = FY_MONTHS.indexOf(month);
    let newMonthIdx = direction === "next" ? currentIdx + 1 : currentIdx - 1;
    let newYear = year;

    if (newMonthIdx > 11) {
      newMonthIdx = 0;
      newYear += 1;
    } else if (newMonthIdx < 0) {
      newMonthIdx = 11;
      newYear -= 1;
    }

    const newMonth = FY_MONTHS[newMonthIdx];

    // Explicit cross-year calendar navigation rules
    if (month === 12 && newMonth === 1) {
      newYear = year + 1;
    } else if (month === 1 && newMonth === 12) {
      newYear = year - 1;
    } else if (month === 4 && newMonth === 3) {
      newYear = year;
    } else if (month === 3 && newMonth === 4) {
      newYear = year;
    }

    const monthKey = `${newYear}-${String(newMonth).padStart(2, "0")}`;
    setSelectedMonth(monthKey);
    setSelectedYear(newYear);
  };

  const formatMonth = (month) => {
    if (!month) return "";
    const [year, monthNo] = month.split("-");
    const date = new Date(parseInt(year, 10), parseInt(monthNo, 10) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleYearChange = (e) => {
    const targetYear = parseInt(e.target.value, 10);
    const [, currentMonthStr] = selectedMonth.split("-");
    setSelectedYear(targetYear);
    setSelectedMonth(`${targetYear}-${currentMonthStr}`);
  };

  const getVisitTypeLabel = (type) => {
    switch (type) {
      case "BD_VISIT":
      case "BDVISIT":
        return "BD Visits";
      case "ABP_VISIT":
      case "ABPVISIT":
        return "ABP Visits";
      case "ONGOING_DEAL":
      case "ONGOINGDEAL":
        return "Ongoing Deals";
      case "KEY_ACCOUNT":
      case "KEYACCOUNT":
        return "Key Accounts";
      default:
        return type;
    }
  };

  const activeData =
    (selectedTab === "month" ? dashboardData?.monthly : dashboardData?.ytd) ||
    DEFAULT_TEAM_DASHBOARD.monthly;
  const summaryPrefix = selectedTab === "month" ? "" : "YTD ";

  // FIX: Sum total completed visits across all categories to get accurate actual denominator
  const totalTeamCompletedVisits =
    activeData.visitTypes?.reduce((acc, item) => acc + (item.actual || 0), 0) ||
    0;

  // Segmenting focus areas into data-containing vs empty variants
  const areasWithData =
    activeData?.areaCoverage?.focusAreaStats?.filter(
      (area) => (area.totalVisits || 0) > 0,
    ) || [];
  const areasWithoutData =
    activeData?.areaCoverage?.focusAreaStats?.filter(
      (area) => (area.totalVisits || 0) === 0,
    ) || [];

  if (loading) {
    return (
      <div className="min-h-[320px] rounded-[28px] border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="flex h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              Loading team dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] -m-4 md:-m-6 p-4 md:p-6">
      <div className="space-y-6">
        {/* Dynamic Header Block */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="relative px-5 py-6 md:px-8 md:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_35%),radial-gradient(circle_at_left,_rgba(99,102,241,0.06),_transparent_30%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  Team Dashboard
                </h1>
                <p className="text-sm mt-1 font-medium text-slate-500 flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  Performance metrics for{" "}
                  {activeData?.summary?.totalMembers || 0} team member
                  {(activeData?.summary?.totalMembers || 0) !== 1
                    ? "s"
                    : ""}{" "}
                  (excluding self)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* FIX: Formatted selection labels as Financial Year */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="year-select"
                    className="text-sm font-medium text-slate-600"
                  >
                    Financial Year:
                  </label>
                  <select
                    id="year-select"
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-slate-400"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        FY {year}-{String(year + 1).slice(-2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner">
                  <button
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      selectedTab === "month"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setSelectedTab("month")}
                  >
                    <Calendar className="h-4 w-4" />
                    Monthly
                  </button>
                  {/* FIX: Label toggled to YTD */}
                  <button
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      selectedTab === "ytd"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setSelectedTab("ytd")}
                  >
                    <TrendingUp className="h-4 w-4" />
                    YTD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 md:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          {/* Controls Controls Panel */}
          <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-3 py-3 md:px-4 md:py-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-800 hover:shadow"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center px-3">
              <h2 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">
                {formatMonth(selectedMonth)}
              </h2>
              {/* FIX: Dynamic short duration indicator for Financial Year alignment */}
              <div className="mt-1 flex flex-col items-center gap-1">
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  Duration View: {getDisplayFinancialYear(selectedMonth)}
                </span>
                <p className="text-xs text-slate-400">
                  {selectedTab === "month"
                    ? "Team Monthly Summary (Financial Calendar)"
                    : "Team YTD summary till selected month"}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateMonth("next")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-800 hover:shadow"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryCard
              title={`${summaryPrefix}Total Planned`}
              value={activeData?.summary?.plannedVisits || 0}
              icon={Layers3}
              tone="slate"
            />
            <SummaryCard
              title={`${summaryPrefix}Completed`}
              value={activeData?.summary?.completedVisits || 0}
              icon={CheckCircle2}
              tone="green"
              subtitle={`${Number(activeData?.summary?.completionRate || 0).toFixed(1)}% Completion Rate`}
            />
            <SummaryCard
              title={`${summaryPrefix}Pending`}
              value={activeData?.summary?.pendingPlans || 0}
              icon={Clock3}
              tone="amber"
            />
            <SummaryCard
              title={`${summaryPrefix}Visit Days`}
              value={activeData?.summary?.uniqueVisitDays || 0}
              icon={Briefcase}
              tone="blue"
            />
          </div>

          <div className="mt-6 space-y-6">
            {/* Visit Types */}
            <SectionCard title="Team Visit Types Breakdown" icon={BarChart3}>
              {activeData.visitTypes?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {activeData.visitTypes.map((item, index) => {
                    // FIX: Re-calculated share logs exclusively based on completed actions
                    const sharePercentage =
                      totalTeamCompletedVisits > 0
                        ? (
                            (item.actual / totalTeamCompletedVisits) *
                            100
                          ).toFixed(1)
                        : "0.0";

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-slate-700 truncate">
                              {getVisitTypeLabel(item.visitType)}
                            </p>
                            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 border border-slate-200">
                              Comp:{" "}
                              {Number(item.completionRate || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-end justify-between">
                              <span className="text-xs text-slate-500">
                                Planned
                              </span>
                              <span className="text-lg font-semibold text-slate-900">
                                {item.planned || 0}
                              </span>
                            </div>
                            <div className="flex items-end justify-between">
                              <span className="text-xs text-slate-500">
                                Completed
                              </span>
                              <span className="text-lg font-semibold text-slate-900">
                                {item.actual || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-500">
                              Share of Completed Visits:
                            </span>
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                              {sharePercentage}%
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="h-2 rounded-full bg-slate-200">
                              {/* FIX: Progress bar filled capacity now scales dynamically to complete visual share matches */}
                              <div
                                className="h-2 rounded-full bg-indigo-600"
                                style={{
                                  width: `${Math.min(parseFloat(sharePercentage), 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState text="No visit type data available for this period." />
              )}
            </SectionCard>

            {/* Industrial Area Coverage */}
            <SectionCard
              title={`${summaryPrefix}Team Industrial Area Coverage`}
              icon={MapPin}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MetricBox
                  label="Assigned Areas"
                  value={activeData?.areaCoverage?.totalAreas || 0}
                />
                <MetricBox
                  label="Areas Visited"
                  value={activeData?.areaCoverage?.coveredAreas || 0}
                />
                <MetricBox
                  label="Coverage Rate"
                  value={`${Number(activeData?.areaCoverage?.coverageRate || 0).toFixed(1)}%`}
                />
              </div>

              <div className="border-t border-slate-200 pt-5">
                <h4 className="text-sm font-bold text-slate-800 mb-4">
                  Coverage Depth Segments by Target Potential
                </h4>
                {activeData?.areaCoverage?.byPotential?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeData.areaCoverage.byPotential.map((item, index) => {
                      const highlightTheme =
                        item.potential === "High"
                          ? "from-emerald-600 to-teal-500 text-emerald-700 bg-emerald-50/50 border-emerald-200"
                          : item.potential === "Medium"
                            ? "from-amber-500 to-orange-400 text-amber-700 bg-amber-50/50 border-amber-200"
                            : "from-rose-500 to-red-400 text-rose-700 bg-rose-50/50 border-rose-200";
                      return (
                        <div
                          key={index}
                          className="rounded-2xl border p-4 bg-white shadow-sm flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${highlightTheme.split(" ")[2]} ${highlightTheme.split(" ")[3]}`}
                            >
                              {item.potential} Potential
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {Number(item.coverageRate || 0).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mb-3">
                            {item.coveredAreas || 0} / {item.totalAreas || 0}{" "}
                            Regions Engaged
                          </p>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${highlightTheme.split(" ")[0]} ${highlightTheme.split(" ")[1]}`}
                              style={{
                                width: `${Math.min(item.coverageRate || 0, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState text="No segment details available for current data limits." />
                )}
              </div>
            </SectionCard>

            {/* Analysis Grid Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SectionCard
                title="Focus Area Engagement Analysis"
                icon={Activity}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricBox
                    label="Total Focus Areas"
                    value={
                      activeData?.areaCoverage?.focusAreaCoverage
                        ?.totalFocusAreas || 0
                    }
                  />
                  <MetricBox
                    label="Areas Covered"
                    value={
                      activeData?.areaCoverage?.focusAreaCoverage
                        ?.areasCovered || 0
                    }
                  />
                  <MetricBox
                    label="Coverage Rate"
                    value={`${Number(activeData?.areaCoverage?.focusAreaCoverage?.coverageRate || 0).toFixed(1)}%`}
                  />
                  <MetricBox
                    label="Avg Visits / Area"
                    value={Number(
                      activeData?.areaCoverage?.focusAreaCoverage
                        ?.avgVisitsPerArea || 0,
                    ).toFixed(1)}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Coverage Density Depth Matrix"
                icon={Building}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DensityMetricBox
                    label="Deep Coverage"
                    hint={selectedTab === "month" ? "5+ visits" : "8+ visits"}
                    value={
                      activeData?.areaCoverage?.focusAreaCoverage
                        ?.deepCoverage || 0
                    }
                    tone="emerald"
                  />
                  <DensityMetricBox
                    label="Moderate Coverage"
                    hint={selectedTab === "month" ? "2-4 visits" : "3-7 visits"}
                    value={
                      activeData?.areaCoverage?.focusAreaCoverage
                        ?.moderateCoverage || 0
                    }
                    tone="blue"
                  />
                  <DensityMetricBox
                    label="Light Coverage"
                    hint={selectedTab === "month" ? "1 visit" : "1-2 visits"}
                    value={
                      activeData?.areaCoverage?.focusAreaCoverage
                        ?.lightCoverage || 0
                    }
                    tone="amber"
                  />
                  <DensityMetricBox
                    label="No Coverage"
                    hint="0 active visits"
                    value={
                      activeData?.areaCoverage?.focusAreaCoverage?.noCoverage ||
                      0
                    }
                    tone="rose"
                  />
                </div>
              </SectionCard>
            </div>

            {/* Focus Progress Slider Track */}
            <SectionCard
              title={`${summaryPrefix}Strategic Team Focus Progression`}
              icon={TrendingUp}
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-600 font-medium">
                    {activeData?.areaCoverage?.focusAreaCoverage
                      ?.areasCovered || 0}{" "}
                    of{" "}
                    {activeData?.areaCoverage?.focusAreaCoverage
                      ?.totalFocusAreas || 0}{" "}
                    core targets engaged
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {Number(
                      activeData?.areaCoverage?.focusAreaCoverage
                        ?.coverageRate || 0,
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600"
                    style={{
                      width: `${Math.min(Number(activeData?.areaCoverage?.focusAreaCoverage?.coverageRate || 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Team Focus Areas */}
            <SectionCard title="Team Strategic Focus Profiles" icon={Users}>
              {activeData?.areaCoverage?.focusAreaStats?.length ? (
                <div className="space-y-6">
                  {areasWithData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {areasWithData.map((focusArea, index) => (
                        <TeamFocusAreaCard
                          key={`active-${index}`}
                          focusArea={focusArea}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No active focus areas with team visit metrics found.
                    </p>
                  )}

                  {areasWithoutData.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setShowNoDataAreas(!showNoDataAreas)}
                        className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 transition hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <span>
                            Areas Without Active Team Data (
                            {areasWithoutData.length})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          {showNoDataAreas ? (
                            <>
                              <EyeOff className="h-4 w-4" /> Hide Section
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" /> View Section
                            </>
                          )}
                        </div>
                      </button>

                      {showNoDataAreas && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-all duration-300">
                          {areasWithoutData.map((focusArea, index) => (
                            <TeamFocusAreaCard
                              key={`empty-${index}`}
                              focusArea={focusArea}
                              opacityClass="opacity-75"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState text="No allocated regional focus logs established for this corporate sector." />
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamFocusAreaCard = ({ focusArea, opacityClass = "" }) => (
  <div
    className={`group rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${opacityClass}`}
  >
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900 truncate">
            {focusArea.areaName}
          </h4>
          <p className="text-xs font-medium text-slate-500">
            {focusArea.city}, {focusArea.state}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            focusArea.potential === "High"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : focusArea.potential === "Medium"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {focusArea.potential}
        </span>
      </div>

      <div className="space-y-2 text-xs border-t border-slate-100 pt-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Planned Visits</span>
          <span className="font-semibold text-slate-900">
            {focusArea.totalVisits || 0}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Completed Log</span>
          <span className="font-semibold text-emerald-600">
            {focusArea.completedVisits || 0}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Engagement Scale</span>
          <span className="font-semibold text-indigo-600">
            {Number(focusArea.coverageRate || 0).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>

    <div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500"
          style={{
            width: `${Math.min(Number(focusArea.coverageRate || 0), 100)}%`,
          }}
        />
      </div>

      {focusArea.assignedUsers?.length > 0 ? (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
            Assigned Officers
          </p>
          <div className="flex flex-wrap gap-1">
            {focusArea.assignedUsers.map((user, uIdx) => (
              <span
                key={uIdx}
                className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600 rounded-md border border-slate-200"
              >
                {user.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  </div>
);

const SummaryCard = ({
  title,
  value,
  tone = "slate",
  icon: Icon,
  subtitle,
}) => {
  const toneMap = {
    slate: {
      wrap: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-700",
      text: "text-slate-900",
      label: "text-slate-500",
    },
    green: {
      wrap: "border-emerald-200 bg-emerald-50/60",
      icon: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-900",
      label: "text-emerald-700/80",
    },
    amber: {
      wrap: "border-amber-200 bg-amber-50/70",
      icon: "bg-amber-100 text-amber-700",
      text: "text-amber-900",
      label: "text-amber-700/80",
    },
    blue: {
      wrap: "border-sky-200 bg-sky-50/70",
      icon: "bg-sky-100 text-sky-700",
      text: "text-sky-900",
      label: "text-sky-700/80",
    },
  };
  const styles = toneMap[tone] || toneMap.slate;

  return (
    <div
      className={`rounded-[22px] border p-5 shadow-sm transition-all hover:shadow-md ${styles.wrap}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${styles.label}`}>{title}</p>
          <p
            className={`mt-3 text-3xl font-bold tracking-tight ${styles.text}`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs mt-1.5 font-medium text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-2xl p-3 shrink-0 ${styles.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

const MetricBox = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
      {value}
    </p>
  </div>
);

const DensityMetricBox = ({ label, hint, value, tone = "blue" }) => {
  const configurationMap = {
    emerald:
      "bg-emerald-50/60 border-emerald-200 text-emerald-800 value-emerald-600",
    blue: "bg-blue-50/60 border-blue-200 text-blue-800 value-blue-600",
    amber: "bg-amber-50/60 border-amber-200 text-amber-800 value-amber-600",
    rose: "bg-rose-50/60 border-rose-200 text-rose-800 value-rose-600",
  };
  const styles = configurationMap[tone] || configurationMap.blue;
  const valColor = styles.split(" ")[3].replace("value-", "text-");

  return (
    <div
      className={`rounded-2xl border p-4 text-center shadow-sm ${styles.split(" ").slice(0, 3).join(" ")}`}
    >
      <p className={`text-2xl font-bold ${valColor}`}>{value}</p>
      <p className="text-sm font-bold mt-1 text-slate-800">{label}</p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{hint}</p>
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
    <div className="mb-5 flex items-center gap-3">
      {Icon && (
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const EmptyState = ({ text }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
    <p className="text-sm font-medium text-slate-400 italic">{text}</p>
  </div>
);

export default SalesVisitTeamDashboardPage;
