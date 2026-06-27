import React from "react";
import {
  UserCheck,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Users,
  Shield,
} from "lucide-react";

const TeamManagementComponent = ({
  users,
  managers,
  loading,
  actionLoading,
  error,
  success,
  showCreateModal,
  setShowCreateModal,
  createForm,
  setCreateForm,
  onCreateUser,
  onDeleteUser,
  onApprovalAction,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-blue-50">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Team Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage users, approvals, roles, and reporting managers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">Success</h4>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-700" />
          <h2 className="text-base font-semibold text-gray-900">Users</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.email}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2 py-1 rounded-full text-xs border bg-gray-50 text-gray-700 border-gray-200">
                      {item.role}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs border ${
                        item.isApproved
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {item.isApproved ? "Approved" : "Pending"}
                    </span>
                    {item.reportingManagerId && (
                      <span className="px-2 py-1 rounded-full text-xs border bg-blue-50 text-blue-700 border-blue-200">
                        RM: {item.reportingManagerId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!item.isApproved && (
                    <>
                      <button
                        onClick={() => onApprovalAction(item.id, "approve")}
                        disabled={!!actionLoading}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === `approve-${item.id}`
                          ? "Approving..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={() => onApprovalAction(item.id, "reject")}
                        disabled={!!actionLoading}
                        className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                      >
                        {actionLoading === `reject-${item.id}`
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDeleteUser(item.id)}
                    disabled={!!actionLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>
                      {actionLoading === `delete-${item.id}`
                        ? "Deleting..."
                        : "Delete"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
            <div className="p-5 border-b border-gray-200 flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Create User</h3>
                <p className="text-sm text-gray-500">
                  Add a pre-approved user from admin panel.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="team_member">Team Member</option>
                  <option value="abp_salesperson">ABP Salesperson</option>
                  <option value="management">Management</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reporting Manager
                </label>
                <select
                  value={createForm.reportingManagerId}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      reportingManagerId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select reporting manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={onCreateUser}
                disabled={actionLoading === "create"}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === "create" ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementComponent;
