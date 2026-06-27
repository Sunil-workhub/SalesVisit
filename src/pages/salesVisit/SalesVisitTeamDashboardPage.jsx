import React, { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  MapPin,
  Target,
  CheckCircle,
  Clock,
  BarChart3,
  Users,
  Building,
  Award,
  Activity,
  Briefcase,
  ChevronLeft,
  ChevronRight,
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

const SalesVisitTeamDashboardPage = () => {
  const [selectedTab, setSelectedTab] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState(DEFAULT_TEAM_DASHBOARD);
  console.log("dashboardData", dashboardData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      console.log("response", response);
      // response.data = APIResponseModel { status_Code, status, message, data }
      // response.data.data = { monthly, ytd }
      const payload = response?.data;
      
      if (!payload?.monthly && !payload?.ytd) {
        setDashboardData(DEFAULT_TEAM_DASHBOARD);
        return;
      }

      const m = payload.monthly || {};
      console.log("Monthly Data:", m);
      const y = payload.ytd || {};
      console.log("YTD Data:", y);

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

  const getFinancialYearLabel = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const fyStart = currentMonth >= 4 ? currentYear : currentYear - 1;
    const fyEnd = currentMonth >= 4 ? currentYear + 1 : currentYear;
    return `${fyStart}-${String(fyEnd).slice(-2)}`;
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

  const getVisitTypeColor = (type) => {
    switch (type) {
      case "BD_VISIT":
      case "BDVISIT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ABP_VISIT":
      case "ABPVISIT":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ONGOING_DEAL":
      case "ONGOINGDEAL":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "KEY_ACCOUNT":
      case "KEYACCOUNT":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const activeData =
    (selectedTab === "month" ? dashboardData?.monthly : dashboardData?.ytd) ||
    DEFAULT_TEAM_DASHBOARD.monthly;
  const summaryPrefix = selectedTab === "month" ? "" : "YTD ";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading team dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-sm text-gray-500">
            Team performance analytics excluding self
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>
            {activeData?.summary?.totalMembers || 0} team member
            {(activeData?.summary?.totalMembers || 0) !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {[
              { id: "month", label: "Monthly View", icon: Calendar },
              { id: "ytd", label: "Year to Date", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    selectedTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTab === "month"
                    ? formatMonth(selectedMonth)
                    : `FY ${getFinancialYearLabel()}`}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedTab === "month"
                    ? `${activeData?.summary?.totalVisits || 0} business visits planned`
                    : "Year to date team performance"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MetricCard
              title={`${summaryPrefix}Total Planned`}
              value={activeData?.summary?.totalVisits || 0}
              note="Business visits planned"
              icon={selectedTab === "month" ? Calendar : TrendingUp}
              color="blue"
            />
            <MetricCard
              title={`${summaryPrefix}Completed`}
              value={activeData?.summary?.completedVisits || 0}
              note={`${Number(activeData?.summary?.completionRate || 0).toFixed(1)}% of business visits`}
              icon={selectedTab === "month" ? CheckCircle : Award}
              color="green"
            />
            <MetricCard
              title={`${summaryPrefix}Pending`}
              value={activeData?.summary?.plannedVisits || 0}
              note="Remaining business visits"
              icon={selectedTab === "month" ? Clock : Target}
              color="yellow"
            />
            <MetricCard
              title={`${summaryPrefix}Visit Days`}
              value={activeData?.summary?.uniqueVisitDays || 0}
              note="Days with business visits"
              icon={selectedTab === "month" ? Briefcase : Activity}
              color="purple"
            />
          </div>

          <SectionCard
            title={
              selectedTab === "month"
                ? `Visit Types - ${formatMonth(selectedMonth)}`
                : `Visit Types - FY ${getFinancialYearLabel()}`
            }
            subtitle="Team planned vs actual performance by visit type"
            icon={BarChart3}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(activeData?.visitTypes || []).map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getVisitTypeColor(item.visitType)}`}
                >
                  <h4 className="font-medium mb-3">
                    {getVisitTypeLabel(item.visitType)}
                  </h4>
                  <div className="space-y-2">
                    <Row label="Planned" value={item.planned || 0} />
                    <Row
                      label={selectedTab === "month" ? "Actual" : "Completed"}
                      value={item.actual || 0}
                    />
                    <Row
                      label="Completion"
                      value={`${Number(item.completionRate || 0).toFixed(1)}%`}
                    />
                    {selectedTab === "ytd" ? (
                      <Row
                        label="% of Total"
                        value={`${Number(item.percentage || 0).toFixed(1)}%`}
                      />
                    ) : null}
                    <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-2">
                      <div
                        className="bg-current h-2 rounded-full opacity-70"
                        style={{
                          width: `${Math.min(Number(item.completionRate || 0), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={`${summaryPrefix}Team Industrial Area Coverage`}
            subtitle={
              selectedTab === "month"
                ? `Coverage data for ${formatMonth(selectedMonth)}`
                : "Year to date coverage"
            }
            icon={MapPin}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <CenterMetric
                label="Assigned Areas"
                value={activeData?.areaCoverage?.totalAreas || 0}
                color="text-blue-600"
              />
              <CenterMetric
                label="Areas Visited"
                value={activeData?.areaCoverage?.coveredAreas || 0}
                color="text-green-600"
              />
              <CenterMetric
                label="Coverage Rate"
                value={`${Number(activeData?.areaCoverage?.coverageRate || 0).toFixed(1)}%`}
                color="text-purple-600"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {selectedTab === "month"
                  ? "Coverage by Potential"
                  : "YTD Coverage by Potential"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(activeData?.areaCoverage?.byPotential || []).map(
                  (item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        item.potential === "High"
                          ? "bg-green-50 border-green-200"
                          : item.potential === "Medium"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-red-50 border-red-200"
                      }`}
                    >
                      <h5
                        className={`font-medium mb-2 ${
                          item.potential === "High"
                            ? "text-green-700"
                            : item.potential === "Medium"
                              ? "text-yellow-700"
                              : "text-red-700"
                        }`}
                      >
                        {item.potential} Potential
                      </h5>
                      <div className="space-y-1 text-sm">
                        <Row label="Total" value={item.totalAreas || 0} />
                        <Row label="Covered" value={item.coveredAreas || 0} />
                        <Row
                          label="Rate"
                          value={`${Number(item.coverageRate || 0).toFixed(1)}%`}
                        />
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-3">
                        <div
                          className={`h-2 rounded-full ${
                            item.potential === "High"
                              ? "bg-green-600"
                              : item.potential === "Medium"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }`}
                          style={{
                            width: `${Math.min(Number(item.coverageRate || 0), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                    style={{
                      width: `${Math.min(Number(activeData?.areaCoverage?.coverageRate || 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={
              selectedTab === "month"
                ? `Team Focus Area Coverage Analysis - ${formatMonth(selectedMonth)}`
                : `Team Focus Area Coverage Analysis - FY ${getFinancialYearLabel()}`
            }
            subtitle="Strategic area penetration and engagement depth analysis for your team"
            icon={Building}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatBox
                label="Total Focus Areas"
                value={
                  activeData?.areaCoverage?.focusAreaCoverage
                    ?.totalFocusAreas || 0
                }
                boxClass="bg-blue-50 border-blue-200"
                textClass="text-blue-700"
                valueClass="text-blue-600"
              />
              <StatBox
                label="Areas Covered"
                value={
                  activeData?.areaCoverage?.focusAreaCoverage?.areasCovered || 0
                }
                boxClass="bg-green-50 border-green-200"
                textClass="text-green-700"
                valueClass="text-green-600"
              />
              <StatBox
                label="Coverage Rate"
                value={`${Number(activeData?.areaCoverage?.focusAreaCoverage?.coverageRate || 0).toFixed(1)}%`}
                boxClass="bg-purple-50 border-purple-200"
                textClass="text-purple-700"
                valueClass="text-purple-600"
              />
              <StatBox
                label="Avg Visits/Area"
                value={Number(
                  activeData?.areaCoverage?.focusAreaCoverage
                    ?.avgVisitsPerArea || 0,
                ).toFixed(1)}
                boxClass="bg-orange-50 border-orange-200"
                textClass="text-orange-700"
                valueClass="text-orange-600"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Coverage Depth Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DepthBox
                  label="Deep Coverage"
                  hint={selectedTab === "month" ? "5+ visits" : "8+ visits"}
                  value={
                    activeData?.areaCoverage?.focusAreaCoverage?.deepCoverage ||
                    0
                  }
                  className="bg-emerald-50 border-emerald-200 text-emerald-700"
                  valueClass="text-emerald-600"
                />
                <DepthBox
                  label="Moderate Coverage"
                  hint={selectedTab === "month" ? "2-4 visits" : "3-7 visits"}
                  value={
                    activeData?.areaCoverage?.focusAreaCoverage
                      ?.moderateCoverage || 0
                  }
                  className="bg-blue-50 border-blue-200 text-blue-700"
                  valueClass="text-blue-600"
                />
                <DepthBox
                  label="Light Coverage"
                  hint={selectedTab === "month" ? "1 visit" : "1-2 visits"}
                  value={
                    activeData?.areaCoverage?.focusAreaCoverage
                      ?.lightCoverage || 0
                  }
                  className="bg-yellow-50 border-yellow-200 text-yellow-700"
                  valueClass="text-yellow-600"
                />
                <DepthBox
                  label="No Coverage"
                  hint="0 visits"
                  value={
                    activeData?.areaCoverage?.focusAreaCoverage?.noCoverage || 0
                  }
                  className="bg-red-50 border-red-200 text-red-700"
                  valueClass="text-red-600"
                />
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedTab === "month"
                      ? "Team Focus Area Coverage Progress"
                      : "YTD Team Focus Area Coverage Progress"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {activeData?.areaCoverage?.focusAreaCoverage
                      ?.areasCovered || 0}{" "}
                    of{" "}
                    {activeData?.areaCoverage?.focusAreaCoverage
                      ?.totalFocusAreas || 0}{" "}
                    areas covered
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                    style={{
                      width: `${Math.min(
                        Number(
                          activeData?.areaCoverage?.focusAreaCoverage
                            ?.coverageRate || 0,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={
              selectedTab === "month"
                ? `Team Focus Areas - ${formatMonth(selectedMonth)}`
                : `Team Focus Areas - FY ${getFinancialYearLabel()}`
            }
            subtitle="Performance in focus areas assigned to your team"
            icon={Users}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(activeData?.areaCoverage?.focusAreaStats || []).map(
                (focusArea, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {focusArea.areaName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {focusArea.city}, {focusArea.state}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border mt-1 ${
                            focusArea.potential === "High"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : focusArea.potential === "Medium"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {focusArea.potential} Potential
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <Row
                        label={
                          selectedTab === "month" ? "Visits" : "YTD Visits"
                        }
                        value={focusArea.totalVisits || 0}
                      />
                      <Row
                        label="Completed"
                        value={focusArea.completedVisits || 0}
                      />
                      <Row
                        label="Success Rate"
                        value={`${Number(focusArea.coverageRate || 0).toFixed(1)}%`}
                      />
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(Number(focusArea.coverageRate || 0), 100)}%`,
                        }}
                      />
                    </div>

                    {focusArea.assignedUsers &&
                    focusArea.assignedUsers.length > 0 ? (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Team Members
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {focusArea.assignedUsers.map(
                            (assignedUser, userIndex) => (
                              <span
                                key={userIndex}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                              >
                                {assignedUser.name}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, note, icon: Icon, color = "blue" }) => {
  const colorMap = {
    blue: {
      box: "bg-blue-50",
      icon: "text-blue-600",
      note: "text-blue-600",
    },
    green: {
      box: "bg-green-50",
      icon: "text-green-600",
      note: "text-green-600",
    },
    yellow: {
      box: "bg-yellow-50",
      icon: "text-yellow-600",
      note: "text-yellow-600",
    },
    purple: {
      box: "bg-purple-50",
      icon: "text-purple-600",
      note: "text-purple-600",
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-xs flex items-center mt-1 ${scheme.note}`}>
            {note}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${scheme.box}`}>
          {Icon ? <Icon className={`h-6 w-6 ${scheme.icon}`} /> : null}
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, subtitle, icon: Icon, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center gap-2 mb-1">
      {Icon ? <Icon className="h-5 w-5 text-blue-600" /> : null}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {subtitle ? <p className="text-sm text-gray-500 mb-4">{subtitle}</p> : null}
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

const CenterMetric = ({ label, value, color = "text-blue-600" }) => (
  <div className="text-center">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

const StatBox = ({ label, value, boxClass, textClass, valueClass }) => (
  <div className={`p-4 rounded-lg text-center border ${boxClass}`}>
    <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    <p className={`text-sm ${textClass}`}>{label}</p>
  </div>
);

const DepthBox = ({ label, hint, value, className, valueClass }) => (
  <div className={`p-4 rounded-lg border ${className}`}>
    <div className="text-center">
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs mt-1">{hint}</p>
    </div>
  </div>
);

export default SalesVisitTeamDashboardPage;
