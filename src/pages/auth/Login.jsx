import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Lock, Mail, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await signIn(formData);

      if (!result.success) {
        setError(result.message || "Login failed.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Something went wrong during login.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="px-6 pt-6 pb-4 md:px-8 md:pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f61d5] text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                IML Sales Visit
              </h1>
              <p className="text-sm text-slate-500">Sign in to continue</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-600">
              Use your email from the provided user list.
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              Password: password@123
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 md:px-8 md:pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-[#2f61d5]/20">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-[#2f61d5]/20">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f61d5] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244fb1] disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
