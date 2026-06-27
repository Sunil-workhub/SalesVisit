import React from "react";
import { CheckCircle, AlertCircle, ClipboardCheck, Pencil } from "lucide-react";

const TeamActualVisitsComponent = ({
  visits,
  teamUsers,
  loading,
  actionLoading,
  error,
  success,
  showModal,
  filters,
  setFilters,
  outcomeForm,
  setOutcomeForm,
  selectedVisit,
  onOpenOutcomeModal,
  onClose,
  onSaveOutcome,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-blue-50">
          <ClipboardCheck className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Team Actual Visits
          </h1>
          <p className="text-sm text-gray-500">
            Track execution status and update actual visit outcomes.
          </p>
        </div>
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
          <div className="p-8 text-center text-gray-500">
            Loading actual visits...
          </div>
        ) : visits.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No actual visits found.
          </div>
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
                    Planned: {visit.plannedDate?.split("T")[0] || "-"} | Actual:{" "}
                    {visit.actualDate ? visit.actualDate.split("T")[0] : "-"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {visit.status} | Approved:{" "}
                    {visit.isApproved ? "Yes" : "No"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {visit.notes || "No notes"}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => onOpenOutcomeModal(visit)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Update Outcome
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Update Visit Outcome
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={outcomeForm.status}
                  onChange={(e) =>
                    setOutcomeForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Date
                </label>
                <input
                  type="date"
                  value={outcomeForm.actualDate}
                  onChange={(e) =>
                    setOutcomeForm((prev) => ({
                      ...prev,
                      actualDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={outcomeForm.notes}
                  onChange={(e) =>
                    setOutcomeForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Enter outcome notes"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={onSaveOutcome}
                disabled={actionLoading === "save-outcome"}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === "save-outcome" ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamActualVisitsComponent;
