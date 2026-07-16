import APIHelper from "../../context/ApiHelper";
import API from "../../constants/API";

const SalesVisitService = {
  login: async (email, password) => {
    try {
      const response = await APIHelper("POST", API.SalesVisit.login, {
        email,
        password,
      });
      return response;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  getVisitsByMonth: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.getVisitsByMonth,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching monthly visit data:", error);
      throw error;
    }
  },

  addVisit: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.addVisit,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error adding visit:", error);
      throw error;
    }
  },

  getPersonalDashboard: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.getPersonalDashboard,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching personal dashboard data:", error);
      throw error;
    }
  },

  getTeamDashboard: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.getTeamDashboard,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching team dashboard:", error);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const response = await APIHelper("POST", API.SalesVisit.getUsers, {});
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getIndustrialAreas: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.getIndustrialAreas,
        payload || {},
      );
      return response;
    } catch (error) {
      console.error("Error fetching industrial areas:", error);
      throw error;
    }
  },

  saveIndustrialArea: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.saveIndustrialArea,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error saving industrial area:", error);
      throw error;
    }
  },

  deleteIndustrialArea: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.deleteIndustrialArea,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error deleting industrial area:", error);
      throw error;
    }
  },

  bulkImportIndustrialAreas: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.bulkImportIndustrialAreas,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error bulk importing industrial areas:", error);
      throw error;
    }
  },

  getTeamVisitPlans: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.getTeamVisitPlans,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching team visit plans:", error);
      throw error;
    }
  },

  getTeamActualVisitsDashboard: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.getTeamActualVisitsDashboard,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching team actual visits dashboard:", error);
      throw error;
    }
  },

  getMonthlyActualData: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.getMonthlyActualData,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching monthly actual data:", error);
      throw error;
    }
  },

  updateVisitStatus: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.updateVisitStatus,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error updating visit status:", error);
      throw error;
    }
  },

  saveAlternateVisit: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.saveAlternateVisit,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error saving alternate visit:", error);
      throw error;
    }
  },

  getApprovalPlans: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.getApprovalPlans,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching approval plans:", error);
      throw error;
    }
  },

  approveMonthlyPlan: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.approveMonthlyPlan,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error approving monthly plan:", error);
      throw error;
    }
  },

  rejectMonthlyPlan: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.rejectMonthlyPlan,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error rejecting monthly plan:", error);
      throw error;
    }
  },

  submitMonthlyPlan: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.submitMonthlyPlan,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error submitting monthly plan:", error);
      throw error;
    }
  },

  getTeamUsers: async () => {
    try {
      const response = await APIHelper("GET", API.SalesVisit.getTeamUsers);
      return response;
    } catch (error) {
      console.error("Error fetching team users:", error);
      throw error;
    }
  },

  createTeamUser: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.createTeamUser,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error creating team user:", error);
      throw error;
    }
  },

  getOrgDashboard: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.getOrgDashboard,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error fetching organization dashboard:", error);
      throw error;
    }
  },

  updateVisit: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.updateVisit,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error updating visit:", error);
      throw error;
    }
  },

  deleteVisit: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.deleteVisit,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error deleting visit:", error);
      throw error;
    }
  },
  getMyProfile: async (id) => {
    try {
      const response = await APIHelper(
        "GET",
        `${API.SalesVisit.GetMyProfileSalesVisit}/${id}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching my profile:", error);
      throw error;
    }
  },

  updateTeamUser: async (payload) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.updateTeamUser,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error updating team user:", error);
      throw error;
    }
  },
};

export default SalesVisitService;
