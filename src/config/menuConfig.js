import { lazy } from "react";

const DashboardPage = lazy(
  () => import("../pages/salesVisit/SalesVisitDashboardPage"),
);
const MonthlyPlanPage = lazy(
  () => import("../pages/salesVisit/MonthlyPlanPage"),
);
const TeamDashboardPage = lazy(
  () => import("../pages/salesVisit/SalesVisitTeamDashboardPage"),
);
const MonthlyActualPage = lazy(
  () => import("../pages/salesVisit/MonthlyActualPage"),
);
const IndustrialAreaPage = lazy(
  () => import("../pages/salesVisit/IndustrialAreasPage"),
);
const TeamVisitPlansPage = lazy(
  () => import("../pages/salesVisit/TeamVisitPlansPage"),
);
const TeamActualVisitPage = lazy(
  () => import("../pages/salesVisit/TeamActualVisitPage"),
);
const ApprovalsPage = lazy(() => import("../pages/salesVisit/ApprovalsPage"));
const TeamManagementPage = lazy(
  () => import("../pages/salesVisit/TeamManagement"),
);
const OrgDashboardPage = lazy(
  () => import("../pages/salesVisit/OrganizationDashboardPage"),
);
const ProfilePage = lazy(() => import("../pages/salesVisit/ProfilePage"));

const menuConfig = [
  {
    path: "/dashboard",
    key: "dashboard",
    label: "Dashboard",
    component: DashboardPage,
  },
  {
    path: "/org-dashboard",
    key: "org-dashboard",
    label: "Organization Dashboard",
    component: OrgDashboardPage,
  },
  {
    path: "/team-dashboard",
    key: "team-dashboard",
    label: "Team Dashboard",
    component: TeamDashboardPage,
  },
  {
    path: "/monthly-plans",
    key: "monthly-plans",
    label: "Monthly Plans",
    component: MonthlyPlanPage,
  },
  {
    path: "/monthly-actuals",
    key: "monthly-actuals",
    label: "Monthly Actuals",
    component: MonthlyActualPage,
  },
  {
    path: "/industrial-areas",
    key: "industrial-areas",
    label: "Industrial Areas",
    component: IndustrialAreaPage,
  },
  {
    path: "/team-visit-plans",
    key: "team-visit-plans",
    label: "Team Visit Plans",
    component: TeamVisitPlansPage,
  },
  {
    path: "/team-actual-visits",
    key: "team-actual-visits",
    label: "Team Actual Visits",
    component: TeamActualVisitPage,
  },
  {
    path: "/approvals",
    key: "approvals",
    label: "Approvals",
    component: ApprovalsPage,
  },
  {
    path: "/team-management",
    key: "team-management",
    label: "Team Management",
    component: TeamManagementPage,
  },
  {
    path: "/profile",
    key: "profile",
    label: "Profile",
    component: ProfilePage,
  },
];

export default menuConfig;
