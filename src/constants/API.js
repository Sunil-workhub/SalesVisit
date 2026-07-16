const API = {
  // tech lib
  GAD: {
    DashboardData: "/ILeap/GetGADDataSheetPaginated",
    GadCreateReq: "/ILeap/CreateGADRequest",
    ReferenceNumberList: "/ILeap/GetGADReferenceNumberBySearch",
    GetRequestNo: "/ILeap/GetNextGADRequestNo",
    AddVendors: "/ILeap/CreateGADVendorInfo",
    GadApprove: "/ILeap/GADApproveByApprover",
  },

  ProjectProfitability: {
    GetPendingProjects: "/ILeap/GetPendingProjects",
    GetProjectDetails: "/ILeap/GetProjectDetails",
    SaveProjectProfitability: "/ILeap/SaveProjectProfitability",
    GetPaginatedProjects: "/ILeap/GetPaginatedProjects",
    GetEstimatedProfitability: "/ILeap/GetEstimatedProfitability",
    GetMaterialCosts: "/ILeap/GetMaterialCosts",
    UpdateBudgetedCosts: "/ILeap/UpdateBudgetedCosts",
  },

  Helpdesk: {
    getTickets: "/ILeap/GetHDTickets",
    createITHelpdeskTicket: "/ILeap/CreateHDTicket",
    enrollTicket: "/ILeap/EnrollHDTicket",
    reassignTicket: "/ILeap/ReassignHDTicket",
    updateTicketStatus: "/ILeap/ChangeHDTicketStatus",
    sendStrike: "/ILeap/sendStrike",
    updateHistory: "/ILeap/AddHDHistory",
    getHistoryById: "/ILeap/GetHDHistory",
    getStrikes: "/ILeap/GetHDStrikes",
    respondStrike: "/ILeap/RespondHDStrike",
    addDiscussion: "/ILeap/AddHDDiscussion",
    getDiscussions: "/ILeap/GetHDDiscussions",
    GetHDCatalog: "/ILeap/GetHDCatalog",
    getTicketEmployees: "/ILeap/GetHDTicketEmployees",
  },

  SalesVisit: {
    login: "/ILeap/auth/login",
    getVisitsByMonth: "/ILeap/GetSalesVisitsByMonth",
    addVisit: "/ILeap/AddSalesVisit",
    getPersonalDashboard: "/ILeap/GetPersonalDashboard",
    getTeamDashboard: "/ILeap/GetTeamDashboard",
    getUsers: "/ILeap/GetIndustrialAreaUsers",
    getIndustrialAreas: "/ILeap/GetIndustrialAreas",
    saveIndustrialArea: "/ILeap/SaveIndustrialArea",
    deleteIndustrialArea: "/ILeap/DeleteIndustrialArea",
    bulkImportIndustrialAreas: "/ILeap/BulkImportIndustrialAreas",
    getTeamVisitPlans: "/ILeap/GetTeamVisitPlans",
    getTeamActualVisitsDashboard: "/ILeap/GetTeamActualVisitsDashboard",
    getMonthlyActualData: "/ILeap/GetMonthlyActualData",
    updateVisitStatus: "/ILeap/UpdateVisitStatus",
    saveAlternateVisit: "/ILeap/SaveAlternateVisit",
    getApprovalPlans: "/ILeap/getApprovalPlans",
    approveMonthlyPlan: "/ILeap/approveMonthlyPlan",
    rejectMonthlyPlan: "/ILeap/rejectMonthlyPlan",
    submitMonthlyPlan: "/ILeap/submitMonthlyPlan",
    getTeamUsers: "/ILeap/GetTeamUsers",
    createTeamUser: "/ILeap/CreateTeamUser",
    getOrgDashboard: "/ILeap/GetOrgDashboard",
    GetMyProfileSalesVisit: "/ILeap/GetMyProfileSalesVisit",
    deleteVisit: "/ILeap/DeleteVisit",
    updateVisit: "/ILeap/UpdateVisit",
  },

  // common
  FileDownload: {
    DownloadFile: "/ILeap/DownloadFile",
  },
};

export default API;
