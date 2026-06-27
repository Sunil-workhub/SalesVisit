import React from "react";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const TeamVisitPlansComponent = ({
  visits,
  plans,
  teamUsers,
  loading,
  actionLoading,
  error,
  success,
  showModal,
  filters,
  setFilters,
  form,
  setForm,
  editingVisit,
  onOpenCreate,
  onOpenEdit,
  onSave,
  onDelete,
  onClose,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-50">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Team Visit Plans
            </h1>
            <p className="text-sm text-gray-500">
              Manage scheduled visits across team members.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Visit
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

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.userId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userId: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Users</option>
            {teamUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={filters.month}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, month: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />

          <input
            type="number"
            value={filters.year}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, year: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Year"
          />

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading visits...</div>
        ) : visits.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No visits found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">
                    {visit.customerName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {visit.location} • {visit.industrialArea}
                  </p>
                  <p className="text-sm text-gray-500">
                    {visit.visitType} • {visit.plannedDate?.split("T")[0]} •{" "}
                    {visit.status}
                  </p>
                  <p className="text-sm text-gray-500">
                    {visit.notes || "No notes"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenEdit(visit)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(visit.id)}
                    disabled={actionLoading === `delete-${visit.id}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {actionLoading === `delete-${visit.id}`
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {editingVisit ? "Edit Planned Visit" : "Create Planned Visit"}
              </h3>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={form.userId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, userId: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select user</option>
                {teamUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              <select
                value={form.planId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, planId: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.month} - {plan.userId}
                  </option>
                ))}
              </select>

              <input
                value={form.customerName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, customerName: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Customer name"
              />

              <input
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Location"
              />

              <input
                value={form.industrialArea}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    industrialArea: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Industrial area"
              />

              <select
                value={form.visitType}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, visitType: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="BD_VISIT">BD Visit</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="COLLECTION">Collection</option>
                <option value="OTHER">Other</option>
              </select>

              <input
                type="date"
                value={form.plannedDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, plannedDate: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />

              <input
                type="month"
                value={form.month}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, month: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />

              <input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, year: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Year"
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>

              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="Notes"
              />
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={actionLoading === "save"}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === "save" ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamVisitPlansComponent;
