import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Lock,
  Shield,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  Globe2,
  Network,
  Search,
  RefreshCw,
  User,
  Briefcase,
  Pencil, // Added for Edit Action UI
} from "lucide-react";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";

const DEFAULT_NEW_USER = {
  name: "",
  email: "",
  password: "",
  role: "teammember",
  reportingManagerId: "",
  region: "",
  dept: "",
};

const ROLE_OPTIONS = [
  { label: "Team Member", value: "teammember" },
  { label: "ABP Salesperson", value: "abpsalesperson" },
  { label: "Management", value: "management" },
];

const REGION_OPTIONS = [
  { label: "East", value: "east" },
  { label: "West", value: "west" },
  { label: "North", value: "north" },
  { label: "South", value: "south" },
  { label: "Pan India", value: "pan india" },
];

const DEPT_OPTIONS = [
  { label: "Direct", value: "direct" },
  { label: "Export", value: "export" },
  { label: "ABP", value: "abp" },
];

const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userForm, setUserForm] = useState(DEFAULT_NEW_USER);
  const [editingUserId, setEditingUserId] = useState(null); // Track if updating vs creating

  useEffect(() => {
    loadUsers();
  }, []);

  const normalizeUser = (item = {}) => {
    return {
      id: item.id || item.Id || "",
      name: item.name || item.Name || "",
      email: item.email || item.Email || "",
      role: item.role || item.Role || "",
      reportingManagerId:
        item.reportingManagerId ||
        item.reportingmanagerid ||
        item.ReportingManagerId ||
        "",
      region: item.region || item.Region || "",
      dept: item.dept || item.department || item.Department || item.Dept || "",
      isApproved:
        item.isApproved ?? item.isapproved ?? item.IsApproved ?? false,
      approvedAt: item.approvedAt || item.approvedat || item.ApprovedAt || "",
      rejectedAt: item.rejectedAt || item.rejectedat || item.RejectedAt || "",
      rejectionReason:
        item.rejectionReason ||
        item.rejectionreason ||
        item.RejectionReason ||
        "",
      createdAt: item.createdAt || item.createdat || item.CreatedAt || "",
      updatedAt: item.updatedAt || item.updatedat || item.UpdatedAt || "",
    };
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await SalesVisitService.getTeamUsers();
      const list = response?.data?.data || response?.data || [];
      setUsers((list || []).map(normalizeUser));
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Triggered when clicking Edit on a target user block
  const handleEditClick = (user) => {
    setError("");
    setSuccess("");
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "●●●●●●", // Mask password field during updates
      role: user.role,
      reportingManagerId: user.reportingManagerId || "",
      region: user.region || "",
      dept: user.dept || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    // Password requirement validation is bypassed conditionally during edit mode
    if (
      !userForm.name.trim() ||
      !userForm.email.trim() ||
      (!editingUserId && !userForm.password.trim()) ||
      !userForm.role ||
      !userForm.region ||
      !userForm.dept
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        reportingManagerId: userForm.reportingManagerId || null,
        region: userForm.region,
        dept: userForm.dept,
      };

      if (editingUserId) {
        // Mode: Update Existing User
        await SalesVisitService.updateTeamUser(editingUserId, payload);
        setSuccess("User data updated successfully.");
      } else {
        // Mode: Create New User
        payload.password = userForm.password;
        await SalesVisitService.createTeamUser(payload);
        setSuccess("User created successfully.");
      }

      setUserForm(DEFAULT_NEW_USER);
      setEditingUserId(null);
      setIsModalOpen(false);
      await loadUsers();
    } catch (err) {
      console.error("Error saving user data:", err);
      setError(
        editingUserId
          ? "Failed to update user parameters."
          : "Failed to create user.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const approvedUsers = useMemo(
    () => users.filter((item) => item.isApproved),
    [users],
  );

  const pendingUsers = useMemo(
    () => users.filter((item) => !item.isApproved && !item.rejectedAt),
    [users],
  );

  const rejectedUsers = useMemo(
    () => users.filter((item) => !!item.rejectedAt),
    [users],
  );

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase()) ||
        (item.region || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.dept || "").toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ? true : item.role === roleFilter;

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "approved"
            ? item.isApproved
            : statusFilter === "pending"
              ? !item.isApproved && !item.rejectedAt
              : !!item.rejectedAt;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const getRoleLabel = (role) => {
    switch (role) {
      case "management":
        return "Management";
      case "teammember":
        return "Team Member";
      case "abpsalesperson":
        return "ABP Salesperson";
      default:
        return role || "-";
    }
  };

  const getRoleClasses = (role) => {
    switch (role) {
      case "management":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "teammember":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "abpsalesperson":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (user) => {
    if (user.rejectedAt) return "Rejected";
    if (user.isApproved) return "Approved";
    return "Pending";
  };

  const getStatusClasses = (user) => {
    if (user.rejectedAt) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (user.isApproved) {
      return "bg-green-50 text-green-700 border-green-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getReportingPersonName = (reportingManagerId) => {
    const manager = users.find((item) => item.id === reportingManagerId);
    return manager ? manager.name : "Not assigned";
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] -m-4 md:-m-6 p-4 md:p-6">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="relative px-5 py-6 md:px-8 md:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_32%),radial-gradient(circle_at_left,_rgba(14,165,233,0.06),_transparent_28%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  <Users className="h-3.5 w-3.5" />
                  Team management
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  Team Management
                </h1>
                <p className="mt-2 text-sm md:text-base text-slate-500">
                  Create and modify users, assign reporting structure, and
                  manage region and department mapping configurations.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={loadUsers}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>

                <button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setEditingUserId(null);
                    setUserForm(DEFAULT_NEW_USER);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  <UserPlus className="h-4 w-4" />
                  Create New User
                </button>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
            {success}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Users"
            value={users.length}
            icon={Users}
            tone="slate"
          />
          <StatsCard
            title="Approved"
            value={approvedUsers.length}
            icon={CheckCircle2}
            tone="green"
          />
          <StatsCard
            title="Pending"
            value={pendingUsers.length}
            icon={AlertCircle}
            tone="amber"
          />
          <StatsCard
            title="Rejected"
            value={rejectedUsers.length}
            icon={XCircle}
            tone="red"
          />
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, role, region, dept"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="all">All Roles</option>
                <option value="teammember">Team Member</option>
                <option value="abpsalesperson">ABP Salesperson</option>
                <option value="management">Management</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  User Directory
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Showing all available users with reporting, region, and
                  department details.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {filteredUsers.length} records
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6">
            {loading ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
                <p className="text-sm text-slate-500">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center">
                <Users className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-900">
                  No users found
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Try changing filters or create a new user.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredUsers.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-slate-500 truncate">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* New Edit Action Trigger Component */}
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                          title="Edit User Profile"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            item,
                          )}`}
                        >
                          {getStatusLabel(item)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getRoleClasses(
                          item.role,
                        )}`}
                      >
                        {getRoleLabel(item.role)}
                      </span>

                      {item.region ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                          <Globe2 className="h-3.5 w-3.5" />
                          {item.region}
                        </span>
                      ) : null}

                      {item.dept ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                          <Briefcase className="h-3.5 w-3.5" />
                          {item.dept}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoTile
                        icon={Shield}
                        label="Role"
                        value={getRoleLabel(item.role)}
                      />
                      <InfoTile
                        icon={Network}
                        label="Reporting Person"
                        value={getReportingPersonName(item.reportingManagerId)}
                      />
                      <InfoTile
                        icon={Globe2}
                        label="Region"
                        value={item.region || "Not assigned"}
                      />
                      <InfoTile
                        icon={Building2}
                        label="Department"
                        value={item.dept || "Not assigned"}
                      />
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        Created:{" "}
                        <span className="font-medium text-slate-700">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>

                      {item.rejectedAt && item.rejectionReason ? (
                        <div className="text-xs text-red-600 max-w-[55%] text-right truncate">
                          Reason: {item.rejectionReason}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isModalOpen ? (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] p-4 flex items-center justify-center">
            <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white shadow-2xl overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                      {editingUserId ? "Edit User Profile" : "Create New User"}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {editingUserId
                        ? "Modify explicit user access parameters, region properties, and hierarchy positioning structure."
                        : "Add user details, reporting structure, region, and department configurations."}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setUserForm(DEFAULT_NEW_USER);
                      setEditingUserId(null);
                      setError("");
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="Full Name *" icon={User}>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) =>
                        setUserForm({ ...userForm, name: e.target.value })
                      }
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </FormField>

                  <FormField label="Email Address *" icon={Mail}>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter email address"
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </FormField>

                  {/* Hide or disable password parameter input fields if managing modifications */}
                  {!editingUserId ? (
                    <FormField label="Password *" icon={Lock}>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            password: e.target.value,
                          })
                        }
                        placeholder="Enter password"
                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </FormField>
                  ) : (
                    <FormField label="Password" icon={Lock}>
                      <input
                        type="text"
                        disabled
                        value={userForm.password}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-400 cursor-not-allowed outline-none"
                      />
                    </FormField>
                  )}

                  <FormField label="Role *" icon={Shield}>
                    <select
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm({ ...userForm, role: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                      {ROLE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Reporting Person" icon={Network}>
                    <select
                      value={userForm.reportingManagerId}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          reportingManagerId: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                      <option value="">Select reporting person</option>
                      {approvedUsers
                        // Prevent user mapping themselves as their own Reporting Manager during editing context
                        .filter((u) => u.id !== editingUserId)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} - {getRoleLabel(item.role)}
                          </option>
                        ))}
                    </select>
                  </FormField>

                  <FormField label="Region *" icon={Globe2}>
                    <select
                      value={userForm.region}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          region: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                      <option value="">Select region</option>
                      {REGION_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <div className="md:col-span-2">
                    <FormField label="Department *" icon={Building2}>
                      <select
                        value={userForm.dept}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            dept: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      >
                        <option value="">Select department</option>
                        {DEPT_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setUserForm(DEFAULT_NEW_USER);
                      setEditingUserId(null);
                      setError("");
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveUser}
                    disabled={submitLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    {submitLoading
                      ? "Saving..."
                      : editingUserId
                        ? "Save Changes"
                        : "Create User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, tone = "slate" }) => {
  const toneMap = {
    slate: {
      wrap: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-700",
      text: "text-slate-900",
      label: "text-slate-500",
    },
    green: {
      wrap: "border-green-200 bg-green-50/60",
      icon: "bg-green-100 text-green-700",
      text: "text-green-900",
      label: "text-green-700/80",
    },
    amber: {
      wrap: "border-amber-200 bg-amber-50/70",
      icon: "bg-amber-100 text-amber-700",
      text: "text-amber-900",
      label: "text-amber-700/80",
    },
    red: {
      wrap: "border-red-200 bg-red-50/70",
      icon: "bg-red-100 text-red-700",
      text: "text-red-900",
      label: "text-red-700/80",
    },
  };

  const styles = toneMap[tone] || toneMap.slate;

  return (
    <div className={`rounded-[22px] border p-5 shadow-sm ${styles.wrap}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${styles.label}`}>{title}</p>
          <p
            className={`mt-3 text-3xl font-bold tracking-tight ${styles.text}`}
          >
            {value}
          </p>
        </div>
        <div className={`rounded-2xl p-3 ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
    <p className="mt-2 text-sm font-semibold text-slate-900 break-words">
      {value}
    </p>
  </div>
);

const FormField = ({ label, icon: Icon, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      <span className="inline-flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        {label}
      </span>
    </label>
    {children}
  </div>
);

export default TeamManagement;
