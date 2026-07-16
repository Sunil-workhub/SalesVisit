import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Network,
  Globe2,
  Building2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";

const ProfilePage = () => {
  const { user } = useAuth();

  const sessionUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch (error) {
      console.error("Error reading session user:", error);
      return {};
    }
  }, []);

  const loggedInUser = user || sessionUser || {};
  const loggedInUserId =
    loggedInUser?.emp_id || loggedInUser?.id || loggedInUser?.Id || "";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const normalizeUser = (item = {}) => ({
    id: item.id || item.Id || "",
    name: item.name || item.Name || "",
    email: item.email || item.Email || "",
    role: item.role || item.Role || "",
    reportingManagerId:
      item.reportingManagerId ||
      item.reportingmanagerid ||
      item.ReportingManagerId ||
      "",
    reportingManagerName:
      item.reportingManagerName || item.ReportingManagerName || "",
    region: item.region || item.Region || "",
    dept: item.dept || item.department || item.Department || item.Dept || "",
    isApproved: item.isApproved ?? item.isapproved ?? item.IsApproved ?? false,
    rejectedAt: item.rejectedAt || item.rejectedat || item.RejectedAt || "",
  });

  const mergeWithSessionFallback = (apiUser) => {
    const normalized = normalizeUser(apiUser || {});

    return {
      ...normalized,
      id: normalized.id || loggedInUser?.emp_id || "",
      name:
        normalized.name ||
        loggedInUser?.name ||
        `${loggedInUser?.first_name || ""} ${loggedInUser?.last_name || ""}`.trim(),
      email: normalized.email || loggedInUser?.emp_email || "",
      role: normalized.role || loggedInUser?.role || "",
      region: normalized.region || loggedInUser?.region || "",
      dept: normalized.dept || loggedInUser?.department || "",
    };
  };

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

  const getStatusLabel = (item) => {
    if (item?.rejectedAt) return "Rejected";
    if (item?.isApproved) return "Approved";
    return "Pending";
  };

  const getStatusClasses = (item) => {
    if (item?.rejectedAt) return "bg-red-50 text-red-700 border-red-200";
    if (item?.isApproved) return "bg-green-50 text-green-700 border-green-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await SalesVisitService.getMyProfile(loggedInUserId);

      const profileData =
        response?.data?.data ||
        response?.data?.Data ||
        response?.data ||
        response ||
        null;

      setProfile(mergeWithSessionFallback(profileData));
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile details.");
      setProfile(mergeWithSessionFallback({}));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInUserId) {
      loadProfile();
    }
  }, [loggedInUserId]);

  const handleCopyEmail = async (email) => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] -m-4 md:-m-6 p-4 md:p-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
            <p className="text-sm text-slate-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const profileData = profile || mergeWithSessionFallback({});

  return (
    <div className="min-h-screen bg-[#f6f8fb] -m-4 md:-m-6 p-4 md:p-6">
      <div className="space-y-5">
        {/* Header / summary card - combined, no repeated fields */}
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="relative px-5 py-6 md:px-8 md:py-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_32%),radial-gradient(circle_at_left,_rgba(14,165,233,0.06),_transparent_28%)]" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#eef4ff] text-[#2d5bce] shadow-sm">
                  <User className="h-8 w-8" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 truncate">
                    {profileData.name || "Profile"}
                  </h1>

                  <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {profileData.email || "No email available"}
                    </span>
                    {profileData.email ? (
                      <button
                        onClick={() => handleCopyEmail(profileData.email)}
                        title="Copy email"
                        className="ml-1 inline-flex items-center justify-center rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                        profileData,
                      )}`}
                    >
                      {getStatusLabel(profileData)}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {getRoleLabel(profileData.role)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={loadProfile}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 md:self-start"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {/* Single details card - only fields not already shown above */}
        <SectionCard title="Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoTile
              icon={Network}
              label="Reporting Person"
              value={profileData.reportingManagerName || "Not assigned"}
            />
            <InfoTile
              icon={Globe2}
              label="Region"
              value={profileData.region || "Not assigned"}
            />
            <InfoTile
              icon={Building2}
              label="Department"
              value={profileData.dept || "Not assigned"}
            />
            <InfoTile
              icon={Shield}
              label="Role"
              value={getRoleLabel(profileData.role)}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

const SectionCard = ({ title, children }) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
    <div className="mb-4">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
    <p className="mt-2 text-sm font-semibold text-slate-900 break-words">
      {value || "-"}
    </p>
  </div>
);

export default ProfilePage;
