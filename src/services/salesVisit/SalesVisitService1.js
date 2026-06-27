import APIHelper from "../../context/ApiHelper";
import API from "../../constants/API";
import { m } from "framer-motion";

const SalesVisitService = {
  login: async (email, password) => {
    // fetch commercial invoice data based on invoice number
    try {
      const response = await APIHelper("POST", API.SalesVisit.login, {
        email: email,
        password: password,
      });
      return response;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  //   Sample Response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Authentication baseline confirmed. Issue local session token.",
  //   "data": {
  //     "id": "3309e1b9-849a-4b57-a870-eee730880da7",
  //     "name": "Senior Developer",
  //     "email": "developer@company.com",
  //     "role": "developer",
  //     "isApproved": true
  //   }
  // }

  UserRegister: async (name, email, role, reportingManagerId) => {
    // fetch commercial invoice data based on invoice number
    try {
      const response = await APIHelper("POST", API.SalesVisit.register, {
        name: name,
        email: email,
        role: role,
        reportingManagerId: reportingManagerId,
      });
      return response;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  //   Sample Response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "User registration initialized successfully.",
  //   "data": {
  //     "id": "a823b1f1-c42e-4b71-b012-d49e12089da2",
  //     "name": "Amit Sharma",
  //     "email": "amit.sharma@company.com",
  //     "role": "sales_executive",
  //     "isApproved": false
  //   }
  // }

  FilteredUsers: async (
    email,
    is_approved,
    reporting_manager_id,
    exclude_id,
    exclude_role,
  ) => {
    try {
      const response = await APIHelper(
        "GET",
        `${API.SalesVisit.filteredUsers}?email=${email}&is_approved=${is_approved}&reporting_manager_id=${reporting_manager_id}&exclude_id=${exclude_id}&exclude_role=${exclude_role}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching filtered users:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Filtered user profiles retrieved successfully.",
  //   "data": [
  //     {
  //       "id": "3309e1b9-849a-4b57-a870-eee730880da7",
  //       "name": "Senior Developer",
  //       "email": "developer@company.com",
  //       "role": "developer",
  //       "department": "Engineering",
  //       "region": "West",
  //       "reportingManagerId": null,
  //       "isApproved": true,
  //       "approvedBy": "f599fafc-3f3e-4347-8bba-fdd179cfabf4",
  //       "approvedAt": "2026-03-10T11:00:00+05:30",
  //       "rejectedBy": null,
  //       "rejectedAt": null,
  //       "rejectionReason": null,
  //       "createdAt": "2026-01-15T09:30:00+05:30",
  //       "updatedAt": "2026-03-10T11:00:00+05:30"
  //     }
  //   ]
  // }

  UserProfileByID: async (id) => {
    try {
      const response = await APIHelper(
        "GET",
        `${API.SalesVisit.userProfile}/${id}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "User profile context retrieved successfully.",
  //   "data": {
  //     "id": "3309e1b9-849a-4b57-a870-eee730880da7",
  //     "name": "Senior Developer",
  //     "email": "developer@company.com",
  //     "role": "developer",
  //     "department": "Engineering",
  //     "region": "West",
  //     "reportingManagerId": null,
  //     "isApproved": true
  //   }
  // }

  UpdateUserProfile: async (
    id,
    name,
    email,
    reportingManagerId,
    region,
    department,
  ) => {
    try {
      const response = await APIHelper(
        "PUT",
        `${API.SalesVisit.userProfile}/${id}`,
        {
          name: name,
          email: email,
          reportingManagerId: reportingManagerId,
          region: region,
          department: department,
        },
      );
      return response;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "User profile updated successfully.",
  //   "data": null
  // }

  ApproveUserAccount: async (id, actionBy, rejectionReason) => {
    try {
      const response = await APIHelper(
        "PATCH",
        `${API.SalesVisit.approveUser}/${id}/approve`,
        {
          actionBy: actionBy,
          rejectionReason: rejectionReason,
        },
      );
      return response;
    } catch (error) {
      console.error("Error approving user account:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "User account approved successfully.",
  //   "data": null
  // }

  RejectUserAccount: async (id, actionBy, rejectionReason) => {
    try {
      const response = await APIHelper(
        "PATCH",
        `${API.SalesVisit.rejectUser}/${id}/reject`,
        {
          actionBy: actionBy,
          rejectionReason: rejectionReason,
        },
      );
      return response;
    } catch (error) {
      console.error("Error rejecting user account:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "User account application rejected.",
  //   "data": null
  // }

  UserCount: async () => {
    try {
      const response = await APIHelper("GET", API.SalesVisit.userCount);
      return response;
    } catch (error) {
      console.error("Error fetching user count:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "User connectivity check completed.",
  //   "data": 142
  // }

  AdminUser: async (name, email, role, reportingManagerId, approvedBy) => {
    try {
      const response = await APIHelper("POST", API.SalesVisit.adminUser, {
        name: name,
        email: email,
        role: role,
        reportingManagerId: reportingManagerId,
        approvedBy: approvedBy,
      });
      return response;
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Admin pre-approved user forced successfully.",
  //   "data": null
  // }

  AdminPurgeHardDeleteUser: async (id) => {
    try {
      const response = await APIHelper(
        "DELETE",
        `${API.SalesVisit.adminPurgeUser}/${id}`,
      );
      return response;
    } catch (error) {
      console.error("Error hard deleting user:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "User context completely purged.",
  //   "data": null
  // }

  GetFilteredVisits: async (
    plan_id,
    user_id,
    month,
    year,
    status,
    user_ids,
  ) => {
    try {
      const response = await APIHelper(
        "GET",
        `${API.SalesVisit.filteredVisits}?plan_id=${plan_id}&user_id=${user_id}&month=${month}&year=${year}&status=${status}&user_ids=${user_ids}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching filtered visits:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Visits data fetched successfully.",
  //   "data": [
  //     {
  //       "id": "0006b2fe-ee6e-4039-bc35-aab6a674115d",
  //       "userId": "3309e1b9-849a-4b57-a870-eee730880da7",
  //       "planId": "f599fafc-3f3e-4347-8bba-fdd179cfabf4",
  //       "customerName": "Northeast Powerline",
  //       "location": "9 Mile Guwahati",
  //       "industrialArea": "Amingaon Industrial Area",
  //       "visitType": "BD_VISIT",
  //       "plannedDate": "2025-12-23T00:00:00",
  //       "actualDate": "2025-12-24T03:44:30.723+00:00",
  //       "status": "completed",
  //       "isApproved": false,
  //       "isAlternate": false,
  //       "originalVisitId": null,
  //       "month": "2025-12",
  //       "year": 2025,
  //       "notes": "Visited to discuss for order.",
  //       "createdAt": "2025-12-24T03:44:30.723+00:00",
  //       "updatedAt": "2025-12-24T03:44:30.723+00:00"
  //     }
  //   ]
  // }

  CreateSingleScheduledVisit: async (
    userId,
    planId,
    customerName,
    location,
    industrialArea,
    visitType,
    plannedDate,
    status,
    month,
    year,
    notes,
  ) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.createScheduledVisit,
        {
          userId: userId,
          planId: planId,
          customerName: customerName,
          location: location,
          industrialArea: industrialArea,
          visitType: visitType,
          plannedDate: plannedDate,
          status: status,
          month: month,
          year: year,
          notes: notes,
        },
      );
      return response;
    } catch (error) {
      console.error("Error creating scheduled visit:", error);
      throw error;
    }
  },

  //  sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Visit entry saved successfully.",
  //   "data": null
  // }

  BulkCreateVisits: async (visits) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.bulkCreateVisits,
        visits,
      );
      return response;
    } catch (error) {
      console.error("Error bulk creating visits:", error);
      throw error;
    }
  },

  //   req body req
  //   [
  //   {
  //     "userId": "3309e1b9-849a-4b57-a870-eee730880da7",
  //     "planId": "e850dbb3-2b7d-4bc6-a06a-c350e2f12e9a",
  //     "customerName": "Customer A",
  //     "location": "Pune",
  //     "industrialArea": "Chakan Phase 1",
  //     "visitType": "BD_VISIT",
  //     "plannedDate": "2026-07-01",
  //     "status": "planned",
  //     "month": "2026-07",
  //     "year": 2026
  //   }
  // ]

  // sample response
  // {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Bulk processing for plan replication completed.",
  //   "data": null
  // }

  UpdatePlannedVisitDetails: async (
    visitId,
    customerName,
    location,
    industrialArea,
    visitType,
    plannedDate,
    month,
    year,
    notes,
  ) => {
    try {
      const response = await APIHelper(
        "PUT",
        `${API.SalesVisit.updateVisit}/${visitId}`,
        {
          customerName: customerName,
          location: location,
          industrialArea: industrialArea,
          visitType: visitType,
          plannedDate: plannedDate,
          month: month,
          year: year,
          notes: notes,
        },
      );
      return response;
    } catch (error) {
      console.error("Error updating planned visit details:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Visit records modified.",
  //   "data": null
  // }

  PatchVisitOutcomeStatus: async (visitId, status, actualDate, notes) => {
    try {
      const response = await APIHelper(
        "PATCH",
        `${API.SalesVisit.patchVisit}/${visitId}/status`,
        {
          status: status,
          actualDate: actualDate,
          notes: notes,
        },
      );
      return response;
    } catch (error) {
      console.error("Error updating visit outcome status:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Execution status updated.",
  //   "data": null
  // }

  DeleteIndividualScheduledVisit: async (visitId) => {
    try {
      const response = await APIHelper(
        "DELETE",
        `${API.SalesVisit.deleteVisit}/${visitId}`,
      );
      return response;
    } catch (error) {
      console.error("Error deleting scheduled visit:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Scheduled visit deleted.",
  //   "data": null
  // }

  WipeAllVisitsBelongingtoPlan: async (planId) => {
    try {
      const response = await APIHelper(
        "DELETE",
        `${API.SalesVisit.deletePlanVisit}?plan_id=${planId}`,
      );
      return response;
    } catch (error) {
      console.error("Error deleting visits for plan:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Plan references updated.",
  //   "data": null
  // }

  GetFilteredMonthlyPlans: async (user_id, month, year, status, user_ids) => {
    try {
      const response = await APIHelper(
        "GET",
        `${API.SalesVisit.filteredMonthlyPlans}?user_id=${user_id}&month=${month}&year=${year}&status=${status}&userids=${user_ids}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching filtered monthly plans:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Monthly plans retrieved successfully.",
  //   "data": [
  //     {
  //       "id": "f599fafc-3f3e-4347-8bba-fdd179cfabf4",
  //       "userId": "3309e1b9-849a-4b57-a870-eee730880da7",
  //       "month": "2026-06",
  //       "year": 2026,
  //       "status": "submitted",
  //       "submittedAt": "2026-05-22T19:00:00+05:30",
  //       "approvedBy": null,
  //       "approvedAt": null,
  //       "rejectedBy": null,
  //       "rejectedAt": null,
  //       "rejectionReason": null,
  //       "createdAt": "2026-05-01T10:00:00+05:30",
  //       "updatedAt": "2026-05-22T19:00:00+05:30"
  //     }
  //   ]
  // }

  CreateFreshPlanShell: async (userId, month, year) => {
    try {
      const response = await APIHelper("POST", API.SalesVisit.createPlanShell, {
        userId: userId,
        month: month,
        year: year,
      });
      return response;
    } catch (error) {
      console.error("Error creating fresh plan shell:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Draft monthly plan initialized successfully.",
  //   "data": {
  //     "id": "b109fafc-3f3e-4347-8bba-fdd179cfabf4",
  //     "userId": "3309e1b9-849a-4b57-a870-eee730880da7",
  //     "month": "2026-07",
  //     "year": 2026,
  //     "status": "draft"
  //   }
  // }

  UpdateMonthlyPlanBoundaries: async (planId, month, year) => {
    try {
      const response = await APIHelper(
        "PUT",
        `${API.SalesVisit.updatePlanBoundaries}/${planId}`,
        {
          month: month, // "2026-08" applied for all months
          year: year,
        },
      );
      return response;
    } catch (error) {
      console.error("Error updating monthly plan boundaries:", error);
      throw error;
    }
  },

  RoutePlanWorkflowState: async (id, action, actionBy, rejectionReason) => {
    try {
      const response = await APIHelper(
        "PATCH",
        `${API.SalesVisit.routePlanWorkflow}/${id}/status`,
        {
          action: action, // "submited", "approved", "rejected"
          actionBy: actionBy,
          rejectionReason: rejectionReason, // required if action is "reject"
        },
      );
      return response;
    } catch (error) {
      console.error("Error routing plan workflow state:", error);
      throw error;
    }
  },

  GetSummaryCounterofPendingApprovals: async (
    user_ids, // Comma-separated subordinate string array)
  ) => {
    try {
      const response = await APIHelper(
        "GET",
        `${API.SalesVisit.pendingApprovalsCount}?user_ids=${user_ids}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching pending approvals count:", error);
      throw error;
    }
  },

  //   sample response
  //   {
  //   "status_Code": 200,
  //   "status": "Success",
  //   "message": "Pending submission counts summarized.",
  //   "data": 4
  // }

  GetFilteredIndustrialAreas: async (
    is_active,
    ids, // Comma-separated
  ) => {
    try {
      const response = await APIHelper(
        "GET",
        `${API.SalesVisit.industrialAreas}?is_active=${is_active}&ids=${ids}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching filtered industrial areas:", error);
      throw error;
    }
  },

  // sample response
  // {
  // "status_Code": 200,
  // "status": "Success",
  // "message": "Industrial areas data localized.",
  // "data": [
  //   {
  //     "id": "98f34161-c8a9-482b-8360-00078c10814d",
  //     "name": "Hinjewadi",
  //     "city": "Pune",
  //     "state": "Maharashtra",
  //     "region": "West",
  //     "pincode": "411057",
  //     "potential": "High",
  //     "potentialCustomers": 175,
  //     "currentCoverage": "[\"b0067392-e9b0-4522-a8c7-6cc3600c7058\",\"05b0ed83-4aa1-4846-a5de-beaa4875be6e\",\"1f0ec425-b111-4284-8833-bc3159c8f554\",\"904236d4-e960-4036-873c-049dde40c55d\",\"0494fe53-9ecf-4aa7-bbdb-192132c75ce3\",\"5999a272-b115-4f0f-8fef-82f5e30d5daa\"]",
  //     "isActive": true,
  //     "createdBy": "3f79d318-53a2-432a-9d87-e97b41bf34ce",
  //     "createdAt": "2025-07-29T17:13:02.281629+00:00",
  //     "updatedAt": "2025-09-07T12:38:22.208527+00:00",
  //     "focusArea": false
  //   },
  //   {
  //     "id": "d265e8b4-ebe4-4828-afff-001d604427fa",
  //     "name": "Lajpat Nagar Industrial Area",
  //     "city": "New Delhi",
  //     "state": "Delhi",
  //     "region": "North",
  //     "pincode": "",
  //     "potential": "Medium",
  //     "potentialCustomers": 0,
  //     "currentCoverage": "[\"b0067392-e9b0-4522-a8c7-6cc3600c7058\",\"0748041a-5638-431e-9987-dd2ace245d61\",\"f8eac01f-088a-421a-acc8-971d20e22211\",\"fc2ed583-c988-4bd0-934e-7a787a91cc15\",\"904236d4-e960-4036-873c-049dde40c55d\",\"5999a272-b115-4f0f-8fef-82f5e30d5daa\",\"dad51c13-3a2c-4909-8aa3-fbcb4519a568\"]",
  //     "isActive": true,
  //     "createdBy": "3f79d318-53a2-432a-9d87-e97b41bf34ce",
  //     "createdAt": "2025-08-03T10:09:18.138256+00:00",
  //     "updatedAt": "2026-04-16T19:26:09.461661+00:00",
  //     "focusArea": false
  //   },

  CreateIndividualIndustrialAreaHub: async (
    name,
    city,
    state,
    region,
    pincode,
    potential,
    potentialCustomers,
    currentCoverage,
    isActive,
    createdBy,
    focusArea,
  ) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.createIndustrialAreaHub,
        {
          name: name,
          city: city,
          state: state,
          region: region,
          pincode: pincode,
          potential: potential,
          potentialCustomers: potentialCustomers,
          currentCoverage: currentCoverage,
          isActive: isActive,
          createdBy: createdBy,
          focusArea: focusArea,
        },
      );
      return response;
    } catch (error) {
      console.error("Error creating individual industrial area hub:", error);
      throw error;
    }
  },

  UpdateIndustrialAreaNodes: async (
    id,
    name,
    city,
    state,
    region,
    pincode,
    potential,
    potentialCustomers,
    currentCoverage,
    isActive,
    focusArea,
  ) => {
    try {
      const response = await APIHelper(
        "PUT",
        `${API.SalesVisit.updateIndustrialAreaHub}/${id}`,
        {
          name: name,
          city: city,
          state: state,
          region: region,
          pincode: pincode,
          potential: potential,
          potentialCustomers: potentialCustomers,
          currentCoverage: currentCoverage,
          isActive: isActive,
          focusArea: focusArea,
        },
      );
      return response;
    } catch (error) {
      console.error("Error updating industrial area nodes:", error);
      throw error;
    }
  },

  DeleteIndustrialAreaNodeConfiguration: async (id) => {
    try {
      const response = await APIHelper(
        "DELETE",
        `${API.SalesVisit.deleteIndustrialAreaHub}/${id}`,
      );
      return response;
    } catch (error) {
      console.error(
        "Error deleting industrial area node configuration:",
        error,
      );
      throw error;
    }
  },

  BulkUploadIndustrialAreas: async (industrialAreas) => {
    try {
      const response = await APIHelper(
        "POST",
        API.SalesVisit.bulkUploadIndustrialAreas,
        { industrialAreas: industrialAreas },
      );
      return response;
    } catch (error) {
      console.error("Error bulk uploading industrial areas:", error);
      throw error;
    }
  },

  //   req body required
  //   [
  //   {
  //     "name": "Amingaon Hub",
  //     "city": "Guwahati",
  //     "state": "Assam",
  //     "region": "East",
  //     "pincode": "781031",
  //     "potential": "High",
  //     "potentialCustomers": 12,
  //     "currentCoverage": "[]",
  //     "isActive": true,
  //     "focusArea": true
  //   }
  // ]
};

export default SalesVisitService;
