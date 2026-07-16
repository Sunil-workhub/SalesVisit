import React, { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  Target,
  BarChart3,
  MapPin,
  Activity,
  CheckCircle2,
  Clock3,
  CalendarDays,
  Layers3,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";

const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
const empId = sessionUser?.emp_id;

const DEFAULT_DASHBOARD = {
  monthly: {
    summary: {
      totalPlanned: 0,
      completed: 0,
      pending: 0,
      visitDays: 0,
    },
    visitTypes: [],
    industrialAreaCoverage: {
      assignedAreas: 0,
      areasVisited: 0,
      coverageRate: 0,
    },
    coverageByPotential: [],
    focusAreaCoverageAnalysis: {
      totalFocusAreas: 0,
      areasCovered: 0,
      coverageRate: 0,
      avgVisitsPerArea: 0,
    },
    coverageDepthAnalysis: {
      deepCoverage: 0,
      moderateCoverage: 0,
      lightCoverage: 0,
      noCoverage: 0,
    },
    focusAreaCoverageProgress: {
      covered: 0,
      total: 0,
      percentage: 0,
    },
    myFocusAreas: [],
  },
  ytd: {
    summary: {
      totalPlanned: 0,
      completed: 0,
      pending: 0,
      visitDays: 0,
    },
    visitTypes: [],
    industrialAreaCoverage: {
      assignedAreas: 0,
      areasVisited: 0,
      coverageRate: 0,
    },
    coverageByPotential: [],
    focusAreaCoverageAnalysis: {
      totalFocusAreas: 0,
      areasCovered: 0,
      coverageRate: 0,
      avgVisitsPerArea: 0,
    },
    coverageDepthAnalysis: {
      deepCoverage: 0,
      moderateCoverage: 0,
      lightCoverage: 0,
      noCoverage: 0,
    },
    focusAreaCoverageProgress: {
      covered: 0,
      total: 0,
      percentage: 0,
    },
    myFocusAreas: [],
  },
};

// Financial Year Month Order: April (4) to March (3)
const FY_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

const SalesVisitDashboardPage = () => {
  const [selectedTab, setSelectedTab] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState(DEFAULT_DASHBOARD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNoDataAreas, setShowNoDataAreas] = useState(false);

  // Generate a dynamic list of years for selection
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
    if (selectedMonth) {
      loadDashboard();
    }
  }, [selectedMonth, selectedYear]);

  const normalizeDashboardData = (apiData = {}) => {
    const normalizeSection = (section = {}) => {
      const summary = section.summary || {};
      const focusAreaCoverage = section.focusAreaCoverage || {};
      const areaCoverage = section.areaCoverage || {};

      return {
        summary: {
          totalPlanned: summary.plannedVisits || 0,
          completed: summary.completedVisits || 0,
          pending: summary.pendingPlans || 0,
          visitDays: summary.uniqueVisitDays || 0,
        },
        visitTypes: (section.visitTypes || []).map((item) => ({
          label: item.visitType || "",
          count: item.planned ?? item.actual ?? 0,
          planned: item.planned || 0,
          actual: item.actual || 0,
          completionRate: item.completionRate || 0,
          percentage: item.percentage || 0,
        })),
        industrialAreaCoverage: {
          assignedAreas: areaCoverage.totalAreas || 0,
          areasVisited: areaCoverage.coveredAreas || 0,
          coverageRate: areaCoverage.coverageRate || 0,
        },
        coverageByPotential: areaCoverage.byPotential || [],
        focusAreaCoverageAnalysis: {
          totalFocusAreas: focusAreaCoverage.totalFocusAreas || 0,
          areasCovered: focusAreaCoverage.areasCovered || 0,
          coverageRate: focusAreaCoverage.coverageRate || 0,
          avgVisitsPerArea: focusAreaCoverage.avgVisitsPerArea || 0,
        },
        coverageDepthAnalysis: {
          deepCoverage: focusAreaCoverage.deepCoverage || 0,
          moderateCoverage: focusAreaCoverage.moderateCoverage || 0,
          lightCoverage: focusAreaCoverage.lightCoverage || 0,
          noCoverage: focusAreaCoverage.noCoverage || 0,
        },
        focusAreaCoverageProgress: {
          covered: focusAreaCoverage.areasCovered || 0,
          total: focusAreaCoverage.totalFocusAreas || 0,
          percentage: focusAreaCoverage.coverageRate || 0,
        },
        myFocusAreas: section.focusAreaStats || [],
      };
    };

    return {
      monthly: normalizeSection(apiData.monthly),
      ytd: normalizeSection(apiData.ytd),
    };
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await SalesVisitService.getPersonalDashboard({
        month: selectedMonth,
        year: selectedYear,
        empId: empId,
      });

      const apiData = response?.data?.data || response?.data || {};
      setDashboardData(normalizeDashboardData(apiData));
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data.");
      setDashboardData(DEFAULT_DASHBOARD);
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

  const activeData =
    selectedTab === "month" ? dashboardData.monthly : dashboardData.ytd;
  const summaryPrefix = selectedTab === "month" ? "" : "YTD ";

  const totalCompletedVisits =
    activeData.visitTypes?.reduce((acc, item) => acc + (item.actual || 0), 0) ||
    0;

  const areasWithData =
    activeData?.myFocusAreas?.filter((area) => (area.totalVisits || 0) > 0) ||
    [];
  const areasWithoutData =
    activeData?.myFocusAreas?.filter((area) => (area.totalVisits || 0) === 0) ||
    [];

  if (loading) {
    return (
      <div className="min-h-[320px] rounded-[28px] border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="flex h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] -m-4 md:-m-6 p-4 md:p-6">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="relative px-5 py-6 md:px-8 md:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_35%),radial-gradient(circle_at_left,_rgba(59,130,246,0.06),_transparent_30%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  My Dashboard
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4">
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
              <div className="mt-1 flex flex-col items-center gap-1">
                {/* <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  Duration View: {getDisplayFinancialYear(selectedMonth)}
                </span> */}
                <p className="text-xs text-slate-400">
                  {selectedTab === "month"
                    ? "Monthly summary (Financial Calendar)"
                    : "YTD summary till selected month"}
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

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryCard
              title={`${summaryPrefix}Total Planned`}
              value={activeData.summary.totalPlanned}
              icon={Layers3}
              tone="slate"
            />
            <SummaryCard
              title={`${summaryPrefix}Completed`}
              value={activeData.summary.completed}
              icon={CheckCircle2}
              tone="green"
            />
            <SummaryCard
              title={`${summaryPrefix}Pending`}
              value={activeData.summary.pending}
              icon={Clock3}
              tone="amber"
            />
            <SummaryCard
              title={`${summaryPrefix}Visit Days`}
              value={activeData.summary.visitDays}
              icon={CalendarDays}
              tone="blue"
            />
          </div>

          <div className="mt-6 space-y-6">
            <SectionCard title={`${summaryPrefix}Visit Types`} icon={BarChart3}>
              {activeData.visitTypes?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {activeData.visitTypes.map((item, index) => {
                    const sharePercentage =
                      totalCompletedVisits > 0
                        ? ((item.actual / totalCompletedVisits) * 100).toFixed(
                            1,
                          )
                        : "0.0";

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-slate-700 truncate">
                              {item.label}
                            </p>
                            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 border border-slate-200">
                              Comp: {item.completionRate}%
                            </span>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-end justify-between">
                              <span className="text-xs text-slate-500">
                                Planned
                              </span>
                              <span className="text-lg font-semibold text-slate-900">
                                {item.planned}
                              </span>
                            </div>
                            <div className="flex items-end justify-between">
                              <span className="text-xs text-slate-500">
                                Completed
                              </span>
                              <span className="text-lg font-semibold text-slate-900">
                                {item.actual}
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

            <SectionCard
              title={`${summaryPrefix}Industrial Area Coverage`}
              icon={MapPin}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricBox
                  label="Assigned Areas"
                  value={activeData?.industrialAreaCoverage?.assignedAreas}
                />
                <MetricBox
                  label="Areas Visited"
                  value={activeData?.industrialAreaCoverage?.areasVisited}
                />
                <MetricBox
                  label="Coverage Rate"
                  value={`${activeData?.industrialAreaCoverage?.coverageRate}%`}
                />
              </div>
            </SectionCard>

            <SectionCard
              title={`${summaryPrefix}Coverage by Potential`}
              icon={Target}
            >
              {activeData?.coverageByPotential?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeData?.coverageByPotential?.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">
                          {item.potential}
                        </p>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {item.coverageRate}%
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        {item.coveredAreas} / {item.totalAreas} covered
                      </p>
                      <div className="mt-4 h-2.5 rounded-full bg-slate-200">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-500"
                          style={{ width: `${item.coverageRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No potential-based coverage data available." />
              )}
            </SectionCard>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SectionCard title="Focus Area Coverage Analysis" icon={Activity}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricBox
                    label="Total Focus Areas"
                    value={
                      activeData?.focusAreaCoverageAnalysis?.totalFocusAreas
                    }
                  />
                  <MetricBox
                    label="Areas Covered"
                    value={activeData?.focusAreaCoverageAnalysis?.areasCovered}
                  />
                  <MetricBox
                    label="Coverage Rate"
                    value={`${activeData?.focusAreaCoverageAnalysis?.coverageRate}%`}
                  />
                  <MetricBox
                    label="Avg Visits / Area"
                    value={
                      activeData?.focusAreaCoverageAnalysis?.avgVisitsPerArea
                    }
                  />
                </div>
              </SectionCard>

              {/* FIX: Replaced with DensityMetricBox layouts from team dashboard matching configuration rules */}
              <SectionCard
                title="Coverage Density Depth Matrix"
                icon={Building}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DensityMetricBox
                    label="Deep Coverage"
                    hint={selectedTab === "month" ? "5+ visits" : "8+ visits"}
                    value={activeData?.coverageDepthAnalysis?.deepCoverage}
                    tone="emerald"
                  />
                  <DensityMetricBox
                    label="Moderate Coverage"
                    hint={selectedTab === "month" ? "2-4 visits" : "3-7 visits"}
                    value={activeData?.coverageDepthAnalysis?.moderateCoverage}
                    tone="blue"
                  />
                  <DensityMetricBox
                    label="Light Coverage"
                    hint={selectedTab === "month" ? "1 visit" : "1-2 visits"}
                    value={activeData?.coverageDepthAnalysis?.lightCoverage}
                    tone="amber"
                  />
                  <DensityMetricBox
                    label="No Coverage"
                    hint="0 active visits"
                    value={activeData?.coverageDepthAnalysis?.noCoverage}
                    tone="rose"
                  />
                </div>
              </SectionCard>
            </div>

            <SectionCard
              title={`${summaryPrefix}Focus Area Coverage Progress`}
              icon={TrendingUp}
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-600">
                    {activeData?.focusAreaCoverageProgress?.covered} of{" "}
                    {activeData?.focusAreaCoverageProgress?.total} areas covered
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {activeData?.focusAreaCoverageProgress?.percentage}%
                  </p>
                </div>
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600"
                    style={{
                      width: `${activeData?.focusAreaCoverageProgress?.percentage}%`,
                    }}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="My Focus Areas" icon={Building}>
              {activeData?.myFocusAreas?.length ? (
                <div className="space-y-6">
                  {areasWithData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {areasWithData.map((area, index) => (
                        <FocusAreaCard key={`active-${index}`} area={area} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No active focus areas with visit metrics found.
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
                            Areas Without Active Data ({areasWithoutData.length}
                            )
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
                          {areasWithoutData.map((area, index) => (
                            <FocusAreaCard
                              key={`empty-${index}`}
                              area={area}
                              opacityClass="opacity-75"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState text="No focus areas available for this period." />
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const FocusAreaCard = ({ area, opacityClass = "" }) => (
  <div
    className={`group rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${opacityClass}`}
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h4 className="font-semibold text-slate-900 truncate">
          {area.areaName}
        </h4>
        <p className="text-sm text-slate-500">
          {area.city}, {area.state}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 text-xs font-semibold">
        {area.potential}
      </span>
    </div>

    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-slate-500">Visits</span>
        <span className="font-semibold text-slate-900">{area.totalVisits}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-500">Completed</span>
        <span className="font-semibold text-emerald-600">
          {area.completedVisits}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-500">Coverage</span>
        <span className="font-semibold text-violet-600">
          {area.coverageRate}%
        </span>
      </div>
    </div>

    <div className="mt-4 h-2.5 rounded-full bg-slate-200 overflow-hidden">
      <div
        className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
        style={{
          width: `${Math.min(area.coverageRate || 0, 100)}%`,
        }}
      />
    </div>
  </div>
);

const SummaryCard = ({ title, value, tone = "slate", icon: Icon }) => {
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
    <div className={`rounded-[22px] border p-5 shadow-sm ${styles.wrap}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${styles.label}`}>{title}</p>
          <p
            className={`mt-3 text-3xl font-bold tracking-tight ${styles.text}`}
          >
            {value}
          </p>
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

const MetricBox = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
      {value}
    </p>
  </div>
);

// Added DensityMetricBox sub-component from team dashboard
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
      {Icon ? (
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
      </div>
    </div>
    {children}
  </div>
);

const EmptyState = ({ text }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
    <p className="text-sm font-medium text-slate-500">{text}</p>
  </div>
);

export default SalesVisitDashboardPage;
