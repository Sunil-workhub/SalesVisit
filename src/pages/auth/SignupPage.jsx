import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SalesVisitService from "../../services/salesVisit/SalesVisitService";
import AuthShell from "../../components/auth/AuthShell";
import SignupForm from "../../components/auth/SignupForm.jsx";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [managers, setManagers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "team_member",
    reportingManagerId: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadManagers = async () => {
      setLoadingManagers(true);
      try {
        const response = await SalesVisitService.FilteredUsers(
          "",
          true,
          "",
          "",
          "",
        );
        if (response?.status === "Success" && Array.isArray(response?.data)) {
          setManagers(response.data);
        }
      } catch (err) {
        console.error("Failed to load managers:", err);
      } finally {
        setLoadingManagers(false);
      }
    };

    loadManagers();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) return setError("Full name is required.");
    if (!formData.email.trim()) return setError("Email is required.");
    if (!formData.password.trim()) return setError("Password is required.");
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);

    try {
      const result = await signUp({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        reportingManagerId: formData.reportingManagerId,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSuccess("Account request submitted successfully.");
      setFormData({
        name: "",
        email: "",
        role: "team_member",
        reportingManagerId: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Signup page error:", err);
      setError("Unable to create account right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle={
        loadingManagers
          ? "Loading managers..."
          : "Request access to the platform"
      }
      leftTitle="Sales Visit Tracker"
      leftSubtitle="Organized planning, approvals and reporting"
    >
      <SignupForm
        formData={formData}
        managers={managers}
        showPassword={showPassword}
        loading={loading}
        error={error}
        success={success}
        onChange={handleChange}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onSubmit={handleSubmit}
        onGoToLogin={() => navigate("/login")}
      />
    </AuthShell>
  );
}
