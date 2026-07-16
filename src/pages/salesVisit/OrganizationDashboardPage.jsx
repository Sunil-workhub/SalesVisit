import React, { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building,
  Target,
  BarChart3,
  MapPin,
  CheckCircle2,
  Award,
  Users,
} from "lucide-react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";

const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
const empId = sessionUser?.emp_id;
const FY_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

const OrgDashboardPage = () => {
  const [selectedTab, setSelectedTab] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    const now = new Date();
    setSelectedMonth(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    );
    setSelectedYear(now.getFullYear());
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadDashboard();
    }
  }, [selectedMonth, selectedYear]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await SalesVisitService.getOrgDashboard({
        month: selectedMonth,
        year: selectedYear,
        empId: null,
      });
      const resData = response?.data?.data || response?.data || response;
      setDashboardData(resData);
    } catch (err) {
      setError("An error occurred while loading dashboard metrics.");
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

    setSelectedMonth(
      `${newYear}-${String(FY_MONTHS[newMonthIdx]).padStart(2, "0")}`,
    );
    setSelectedYear(newYear);
  };

  const activeData =
    selectedTab === "month" ? dashboardData?.monthly : dashboardData?.ytd;
  const visitLabels = [
    "BD Visits",
    "ABP Visits",
    "Ongoing Deals",
    "Key Accounts",
  ];
  const uniqueMonths = Array.from(
    new Set((dashboardData?.trends6Month || []).map((t) => t.monthLabel)),
  );

  const visitColorMap = {
    "BD Visits": "bg-blue-500",
    "ABP Visits": "bg-purple-500",
    "Ongoing Deals": "bg-orange-500",
    "Key Accounts": "bg-emerald-500",
  };

  if (loading || !dashboardData || !activeData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-[1600px] mx-auto bg-slate-50/50 min-h-screen font-sans antialiased text-slate-800">
      {/* Filter Control Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Organization Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
            IML Sales Visit Tracker
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedYear}
            onChange={(e) => {
              const y = parseInt(e.target.value, 10);
              setSelectedYear(y);
              setSelectedMonth(`${y}-${selectedMonth.split("-")[1]}`);
            }}
            className="bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y} - {y + 1}
              </option>
            ))}
          </select>

          <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedTab("month")}
              className={`rounded-lg px-4 py-2 transition-all ${selectedTab === "month" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedTab("ytd")}
              className={`rounded-lg px-4 py-2 transition-all ${selectedTab === "ytd" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
            >
              Year To Date
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Team Members"
          value={activeData.summary.teamMembersCount}
          icon={Users}
          theme="indigo"
        />
        <MetricCard
          label="Total Planned Visits"
          value={activeData.summary.totalPlanned}
          icon={BarChart3}
          theme="slate"
        />
        <MetricCard
          label="Completed Visits"
          value={activeData.summary.completed}
          icon={CheckCircle2}
          theme="emerald"
        />
        <MetricCard
          label="Pending Executions"
          value={activeData.summary.pending}
          icon={Target}
          theme="orange"
        />
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-extrabold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          {new Date(
            parseInt(selectedMonth.split("-")[0], 10),
            parseInt(selectedMonth.split("-")[1], 10) - 1,
            1,
          ).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Chart & Leaderboard Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Simplified Clear Grouped Comparison Bar Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Visit Completion Trends
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              6-month side-by-side volume comparison
            </p>
          </div>

          <div className="mt-6 flex-1 flex flex-col justify-end space-y-4">
            {/* Unified Single-View Chart Frame Grid */}
            <div className="grid grid-cols-6 gap-2 items-end h-56 border-b border-slate-100 pb-1">
              {uniqueMonths.map((mLabel) => {
                const monthPoints = (dashboardData.trends6Month || []).filter(
                  (t) => t.monthLabel === mLabel,
                );
                const maxVal = Math.max(
                  ...(dashboardData.trends6Month || []).map(
                    (t) => t.completedCount,
                  ),
                  1,
                );

                return (
                  <div
                    key={mLabel}
                    className="flex flex-col h-full justify-end items-center bg-slate-50/40 border border-slate-100/50 rounded-xl p-1 pt-6"
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {visitLabels.map((lbl) => {
                        const count =
                          monthPoints.find((p) => p.visitType === lbl)
                            ?.completedCount || 0;
                        const pctHeight = (count / maxVal) * 100;
                        const barColor = visitColorMap[lbl] || "bg-slate-400";

                        return (
                          <div
                            key={lbl}
                            className="flex flex-col justify-end items-center flex-1 h-full group relative"
                          >
                            {/* Inline Count Value Badge directly on top of active bars */}
                            {count > 0 && (
                              <span className="text-[9px] font-black text-slate-700 mb-1 absolute -top-4 transition-transform group-hover:scale-110">
                                {count}
                              </span>
                            )}
                            <div
                              className={`w-full ${barColor} rounded-t-xs transition-all duration-500 shadow-2xs`}
                              style={{
                                height: `${Math.max(pctHeight, count > 0 ? 5 : 1)}%`,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Month Label pinned directly under each grouped cluster */}
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase mt-2 tracking-wider">
                      {mLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chart Legend Box */}
            <div className="flex flex-wrap items-center justify-center gap-5 pt-2 text-[10px] font-bold text-slate-500">
              {visitLabels.map((lbl) => (
                <div key={lbl} className="flex items-center gap-1.5">
                  <div
                    className={`h-2.5 w-2.5 rounded-sm ${visitColorMap[lbl]}`}
                  />
                  <span>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers Leaderboard Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              Top Performers Standings
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Rankings based on active staff completion success
            </p>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[250px] my-4 pr-1">
            {activeData.topPerformers?.length ? (
              activeData.topPerformers.map((perf, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 border border-slate-200/60 text-[10px] font-black text-slate-500">
                      {i + 1}
                    </span>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {perf.employeeName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg flex flex-col items-center">
                      <span className="text-[8px] uppercase tracking-wide text-slate-400 font-bold">
                        Comp. Rate
                      </span>
                      {perf.completionRate}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 font-medium italic">
                No performer metrics recorded.
              </div>
            )}
          </div>
          <div className="text-[9px] text-center text-slate-400 font-bold tracking-wider uppercase pt-2 border-t border-slate-100">
            Live Database Ledger Sync
          </div>
        </div>
      </div>

      {/* Visit Types Distribution Matrix Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Visit Types Distribution Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeData.visitTypes.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-3 shadow-2xs hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between border-b border-slate-200/40 pb-2">
                {/* Fixed explicitly missing card titles labels */}
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  {item.visitType || item.label}
                </span>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                  {item.completionRate}% Rate
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs text-slate-400 font-semibold">
                <span>
                  Planned: <b className="text-slate-800">{item.planned}</b>
                </span>
                <span>
                  Actual: <b className="text-slate-800">{item.actual}</b>
                </span>
              </div>
              <div className="text-[10px] font-bold text-indigo-500/90 bg-indigo-50/40 border border-indigo-100/30 text-center rounded py-1">
                Share of Total Visits: {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industrial Area Geographic Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Industrial Area Coverage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Areas
            </p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {activeData.areaCoverage.totalAreas}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Areas Visited
            </p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {activeData.areaCoverage.coveredAreas}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Coverage Rate
            </p>
            <p className="text-xl font-black text-indigo-600 mt-1">
              {activeData.areaCoverage.coverageRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Focus Area Metrics Bottom Ribbon Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Focus Areas
            </p>
            <p className="text-base font-black text-slate-900 mt-0.5">
              {activeData.focusAreaCoverage.totalFocusAreas}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400">
            <Building className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Focus Areas with Active Data
            </p>
            <p className="text-base font-black text-emerald-600 mt-0.5">
              {activeData.focusAreaCoverage.areasCovered}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, theme }) => {
  const colorMap = {
    indigo: "border-indigo-100 bg-indigo-50/40 text-indigo-600",
    emerald: "border-emerald-100 bg-emerald-50/40 text-emerald-600",
    orange: "border-orange-100 bg-orange-50/40 text-orange-600",
    slate: "border-slate-200 bg-slate-50/50 text-slate-600",
  };
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between hover:shadow-xs transition">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xl font-black text-slate-900 tracking-tight">
          {value}
        </p>
      </div>
      <div
        className={`p-2.5 border rounded-xl ${colorMap[theme] || colorMap.slate}`}
      >
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
};

export default OrgDashboardPage;
