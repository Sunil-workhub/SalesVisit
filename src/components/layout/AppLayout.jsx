import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";
import menuConfig from "../../config/menuConfig";
import {
  Building2,
  Calendar,
  CheckCircle,
  ClipboardList,
  LogOut,
  MapPin,
  Menu,
  User,
  UserCheck,
  Users,
  Briefcase,
  BarChart3,
  X,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const iconMap = {
  dashboard: BarChart3,
  "team-dashboard": Users,
  "team-dashboard-manager": Users,
  "monthly-plan": Calendar,
  "monthly-actual": CheckCircle,
  approvals: ClipboardList,
  hierarchy: Users,
  "industrial-areas": MapPin,
  "team-management": UserCheck,
  "team-visit-plans": Briefcase,
  "team-visit-plans-manager": Briefcase,
  "team-actual-visits": CheckCircle,
  "team-actual-visits-manager": CheckCircle,
  profile: User,
};

const labelMap = {
  dashboard: "Dashboard",
  "team-dashboard": "Organization Dashboard",
  "team-dashboard-manager": "Team Dashboard",
  "monthly-plan": "Monthly Plan",
  "monthly-actual": "Monthly Actual",
  approvals: "Approvals",
  hierarchy: "Team Hierarchy",
  "industrial-areas": "Industrial Areas",
  "team-management": "Team Management",
  "team-visit-plans": "Team Visit Plans",
  "team-visit-plans-manager": "Team Visit Plans",
  "team-actual-visits": "Team Actual Visits",
  "team-actual-visits-manager": "Team Actual Visits",
  profile: "Profile",
};

function AppLayout({ children }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const loggedInUser = user || sessionUser || null;
  const loggedInUserId =
    loggedInUser?.emp_id || loggedInUser?.id || loggedInUser?.Id || "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [hasTeamMembers, setHasTeamMembers] = useState(false);
  const [loadingFlags, setLoadingFlags] = useState(false);

  const isManagement = loggedInUser?.role === "management";
  const currentPath = location.pathname;

  const extractResponseStatus = (response) =>
    response?.status ||
    response?.Status ||
    response?.data?.status ||
    response?.data?.Status;

  const extractResponseData = (response) =>
    response?.data?.data ||
    response?.data?.Data ||
    response?.data ||
    response?.Data ||
    response;

  const normalizePlan = (plan) => ({
    id: plan?.id || plan?.Id || "",
    userId: plan?.userId || plan?.UserId || "",
    month: plan?.month || plan?.Month || "",
    year: plan?.year || plan?.Year || "",
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
  });

  const loadApprovalSummary = useCallback(async () => {
    if (!loggedInUserId) return;

    try {
      setLoadingFlags(true);

      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}`;
      const yearValue = now.getFullYear();

      const payload = {
        UserId: loggedInUserId,
        Month: monthKey,
        Year: yearValue,
      };

      const response = await SalesVisitService.getApprovalPlans(payload);
      const responseData = extractResponseData(response);

      const plans = Array.isArray(responseData)
        ? responseData.map(normalizePlan)
        : [];

      const pendingPlans = plans.filter(
        (item) => item.status === "pending_approval",
      );

      setPendingApprovalsCount(pendingPlans.length);
      setHasTeamMembers(plans.length > 0);
    } catch (error) {
      console.error("Error loading approval summary:", error);
      setPendingApprovalsCount(0);
      setHasTeamMembers(false);
    } finally {
      setLoadingFlags(false);
    }
  }, [loggedInUserId]);

  useEffect(() => {
    loadApprovalSummary();
  }, [loadApprovalSummary]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [currentPath]);

  const canShowMenuItem = useCallback(
    (item) => {
      const id = item.id || item.key || item.slug;
      if (!id) return true;

      if (id === "dashboard") return !isManagement;
      if (id === "team-dashboard") return !isManagement;
      if (id === "team-dashboard-manager")
        return !isManagement && hasTeamMembers;
      if (id === "monthly-plan") return !isManagement;
      if (id === "monthly-actual") return !isManagement;
      if (id === "approvals") return isManagement || hasTeamMembers;
      if (id === "hierarchy") return isManagement;
      if (id === "industrial-areas") return true;
      if (id === "team-management") return !isManagement;
      if (id === "team-visit-plans") return !isManagement;
      if (id === "team-visit-plans-manager")
        return !isManagement && hasTeamMembers;
      if (id === "team-actual-visits") return !isManagement;
      if (id === "team-actual-visits-manager")
        return !isManagement && hasTeamMembers;
      return true;
    },
    [isManagement, hasTeamMembers],
  );

  const normalizedMenu = useMemo(() => {
    const mapped = (menuConfig || [])
      .filter((item) => item?.path)
      .map((item) => {
        const id =
          item.id ||
          item.key ||
          item.slug ||
          item.path.replace(/^\//, "") ||
          "menu-item";

        return {
          id,
          path: item.path,
          name: item.name || item.label || labelMap[id] || "Menu",
          icon: item.icon || iconMap[id] || BarChart3,
          show: canShowMenuItem({ ...item, id }),
          badge:
            id === "approvals" && pendingApprovalsCount > 0
              ? pendingApprovalsCount
              : undefined,
        };
      });

    return mapped.filter((item) => item.show);
  }, [canShowMenuItem, pendingApprovalsCount]);

  const currentPageName =
    normalizedMenu.find((item) => item.path === currentPath)?.name ||
    (currentPath === "/profile" ? "Profile" : "Workspace");

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const isActiveRoute = (path) => {
    if (path === "/") return currentPath === "/";
    return currentPath === path;
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = isActiveRoute(item.path);

    return (
      <button
        onClick={() => handleNavigate(item.path)}
        title={sidebarCollapsed ? item.name : ""}
        className={[
          "group relative w-full flex items-center rounded-xl transition-all duration-200",
          sidebarCollapsed
            ? "justify-center px-2 py-2.5"
            : "justify-between px-3 py-2.5",
          isActive
            ? "bg-[#eef4ff] text-[#2d5bce]"
            : "text-slate-600 hover:bg-white hover:text-slate-900",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={[
              "flex items-center justify-center rounded-lg transition-all shrink-0",
              "h-8 w-8",
              isActive
                ? "bg-white text-[#2d5bce] shadow-sm"
                : "text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-800",
            ].join(" ")}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>

          {!sidebarCollapsed && (
            <span className="truncate text-[15px] font-medium">
              {item.name}
            </span>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 shrink-0">
            {item.badge ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                {item.badge}
              </span>
            ) : isActive ? (
              <ChevronRight className="h-4 w-4 text-[#2d5bce]" />
            ) : null}
          </div>
        )}

        {isActive && !sidebarCollapsed && (
          <span className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-[#2d5bce]" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-[#f7f8fa] transition-all duration-300",
            sidebarCollapsed ? "w-[88px]" : "w-[270px]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0",
          ].join(" ")}
        >
          <div className="flex h-[78px] items-center justify-between px-5 border-b border-slate-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2f61d5] text-white shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>

              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="truncate text-[15px] font-bold text-slate-900">
                    IML Sales Visit
                  </h1>
                  <p className="truncate text-sm text-slate-500">tracker</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => setSidebarOpen(false)}
                className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <div className="px-4 pt-4 pb-3">
              <div className="rounded-[26px] bg-gradient-to-br from-[#0d1f47] to-[#243a62] p-4 text-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="mt-1 text-lg font-semibold leading-6">
                      {isManagement ? "Management Console" : "Field Operations"}
                    </h2>
                  </div>
                  <Sparkles className="h-4 w-4 text-slate-300 shrink-0" />
                </div>

                <div className="mt-4 grid gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/approvals")}
                    className="rounded-[20px] bg-white/10 px-3 py-3 text-left transition hover:bg-white/15"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-300">
                          Pending Approvals
                        </p>
                        <p className="text-2xl font-semibold">
                          {loadingFlags ? "..." : pendingApprovalsCount}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                        <ChevronRight className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <nav className="space-y-1">
              {normalizedMenu.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </nav>
          </div>
        </aside>

        <div
          className={[
            "flex min-h-screen flex-1 flex-col transition-all duration-300",
            sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[270px]",
          ].join(" ")}
        >
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#f6f8fb]/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                    Sales Visit Tracker
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {currentPageName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {(isManagement || hasTeamMembers) && (
                  <button
                    type="button"
                    onClick={() => navigate("/approvals")}
                    className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover:bg-slate-50"
                  >
                    <ClipboardList className="h-4 w-4 text-slate-500" />
                    <span>Pending approvals</span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                      {loadingFlags ? "..." : pendingApprovalsCount}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover:bg-slate-50 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-5 lg:p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
