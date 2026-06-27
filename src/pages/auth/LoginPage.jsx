import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell.jsx";
import LoginForm from "../../components/auth/LoginForm.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    if (!password.trim()) nextErrors.password = "Password is required";
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const formErrors = validate();
    if (Object.keys(formErrors).length) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email, password, rememberMe);

      if (result?.error) {
        setApiError(result.error);
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login page error:", error);
      setApiError("Unable to login right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome 👋"
      subtitle="Log in to your account"
      leftTitle="Sales Visit Tracker"
      leftSubtitle="Modern field planning and reporting workspace"
    >
      <LoginForm
        email={email}
        password={password}
        showPassword={showPassword}
        rememberMe={rememberMe}
        loading={loading}
        errors={errors}
        apiError={apiError}
        onEmailChange={(value) => {
          setEmail(value);
          setErrors((prev) => ({ ...prev, email: undefined }));
          setApiError("");
        }}
        onPasswordChange={(value) => {
          setPassword(value);
          setErrors((prev) => ({ ...prev, password: undefined }));
          setApiError("");
        }}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onRememberChange={setRememberMe}
        onSubmit={handleSubmit}
        onGoToSignup={() => navigate("/signup")}
      />
    </AuthShell>
  );
}
