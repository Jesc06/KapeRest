// src/components/LoginUI.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TintedBackdrop from "./TintedBackdrop";
import { API_BASE_URL } from "../config/api";
import { jwtDecode } from "jwt-decode";
import KapeRestLogo from "../assets/KapeRest.png";



// Clean, professional login without background image.
// Design goals:
// - Neutral palette (white / grayscale / subtle border)
// - Clear visual hierarchy (brand -> form -> secondary actions)
// - Accessible labels and focus states
// - Reduced visual noise, no decorative shadows or scaling gimmicks

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const emailValid = emailPattern.test(email);
  const passwordValid = password.length >= 8;
  // derived flags previously used for always-on valid states (now focus-based only)
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // No mount animation (reverted to previous minimal design)

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = "Email is required";
    else if (!emailPattern.test(email)) next.email = "Invalid email format";
    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Min 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // (was isValid) kept earlier for gating button; now removed since button stays enabled

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ api: data.message || "Login failed. Please check your credentials." });
        setIsLoading(false);
        return;
      }

      //Save tokens
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      // DECODE JWT TO GET ROLE
      const payload: any = jwtDecode(data.token);

      const role =
        payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?.toLowerCase();

      console.log("Decoded Role:", role);

      //NAVIGATION BASED ON DECODED ROLE
      if (role === "admin") navigate("/admin");
      else if (role === "staff") navigate("/staff");
      else if (role === "cashier") navigate("/cashier");
      else navigate("/");

    } catch (error) {
      console.error("Login error:", error);
      setErrors({ api: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const errorSummary = errors.api || (Object.keys(errors).length > 1 ? Object.values(errors).filter(e => e !== errors.api).join(". ") : null);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-stone-50 via-orange-50/40 to-amber-50/30 dark:bg-gradient-to-br dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 font-sans transition-colors duration-300">
      <TintedBackdrop />
      {/* Decorative gradient overlays */}
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-3xl dark:bg-orange-600/5" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-200/30 rounded-full blur-3xl dark:bg-amber-600/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-3xl dark:bg-rose-600/3" />
      </div>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 md:py-12">
        <div className="relative w-full max-w-[460px]">
          <div className="auth-card relative rounded-3xl border-2 border-orange-400/60 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-stone-900/10 transition-all duration-300 ease-out dark:border-orange-700/50 dark:bg-stone-900/80 dark:shadow-stone-950/50">
            {/* Brand */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 flex items-center gap-0.5 dark:from-orange-400 dark:via-amber-400 dark:to-orange-300">
                KapeRest <img src={KapeRestLogo} alt="KapeRest Logo" className="w-16 h-16 object-contain" />
              </h1>
              <p className="mt-3 text-base font-semibold text-stone-600 dark:text-stone-400">Professional POS Management</p>
            </div>
            {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-busy={isLoading}>
              {/* Screen reader announcements for first error */}
              <div role="status" aria-live="polite" className="sr-only">
                {errors.email || errors.password || ''}
              </div>
              {errorSummary && (
                <div className="rounded-xl border border-red-300 bg-gradient-to-br from-red-50 to-red-100/50 text-red-800 text-sm px-4 py-3 shadow-sm dark:border-red-800/40 dark:bg-gradient-to-br dark:from-red-950/40 dark:to-red-900/20 dark:text-red-200" role="alert">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{errorSummary}</span>
                  </div>
                </div>
              )}
              <div className="space-y-6">
                {/* Email Field (stacked label, larger target) */}
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-semibold text-stone-700 tracking-wide mb-2 dark:text-stone-300">Email Address</label>
                  <div className="relative group">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      disabled={isLoading}
                      className={`peer block w-full rounded-xl border-2 bg-white pr-12 px-4 py-3.5 text-base leading-tight text-neutral-900 focus:outline-none transition-all duration-200 placeholder:text-stone-400 dark:bg-stone-950/50 dark:text-stone-50 dark:placeholder:text-stone-500
                        ${emailValid && email.trim().length > 0
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:border-emerald-500 dark:focus:ring-emerald-400/30 dark:focus:border-emerald-400'
                          : 'border-stone-300 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 dark:border-stone-700 dark:focus:ring-orange-400/30 dark:focus:border-orange-400'}
                        ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="your.email@company.com"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    <div className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 transition-all duration-200 ease-out ${emailFocused && emailValid && email.trim().length > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white" aria-hidden>
                        <path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1 dark:text-red-400">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>
                {/* Password Field with Caps Lock indicator */}
                <div className="relative">
                  <label htmlFor="password" className="flex items-center justify-between text-sm font-semibold text-stone-700 tracking-wide mb-2 dark:text-stone-300">
                    <span>Password</span>
                    {capsOn && (
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1 dark:text-amber-400">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                        </svg>
                        CAPS LOCK ON
                      </span>
                    )}
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyUp={(e) => setCapsOn((e as any).getModifierState && (e as any).getModifierState('CapsLock'))}
                      onKeyDown={(e) => setCapsOn((e as any).getModifierState && (e as any).getModifierState('CapsLock'))}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      disabled={isLoading}
                      className={`peer block w-full rounded-xl border-2 bg-white pr-12 px-4 py-3.5 text-base leading-tight text-neutral-900 focus:outline-none transition-all duration-200 placeholder:text-stone-400 dark:bg-stone-950/50 dark:text-stone-50 dark:placeholder:text-stone-500
                        ${passwordValid
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:border-emerald-500 dark:focus:ring-emerald-400/30 dark:focus:border-emerald-400'
                          : 'border-stone-300 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 dark:border-stone-700 dark:focus:ring-orange-400/30 dark:focus:border-orange-400'}
                        ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="Enter your password"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={[
                        errors.password ? 'password-error' : undefined,
                        capsOn ? 'caps-warning' : undefined,
                      ].filter(Boolean).join(' ') || undefined}
                    />
                    <div className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 transition-all duration-200 ease-out ${passwordFocused && passwordValid ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white" aria-hidden>
                        <path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1 dark:text-red-400">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="group relative inline-flex items-center gap-2.5 text-sm font-medium text-stone-700 select-none leading-none cursor-pointer dark:text-stone-300">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    className="peer relative h-5 w-5 shrink-0 appearance-none rounded-md border-2 border-stone-300 bg-white transition-all duration-200 before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-br before:from-orange-500 before:to-amber-500 before:scale-0 before:opacity-0 before:transition-all checked:before:scale-100 checked:before:opacity-100 checked:border-orange-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer dark:border-stone-600 dark:bg-stone-950/50 dark:before:from-orange-400 dark:before:to-amber-400 dark:checked:border-orange-400 dark:focus-visible:ring-orange-400/20"
                  />
                  <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-[3px] h-[14px] w-[14px] text-white opacity-0 transition-all duration-200 peer-checked:opacity-100 peer-checked:scale-100 scale-50" aria-hidden>
                    <path d="M6 10.5l2.5 2.5L15 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="translate-y-[1px]">Remember me</span>
                </label>
                <span className="text-xs text-stone-500 leading-none font-medium dark:text-stone-500">v1.0.0</span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group inline-flex justify-center items-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-base font-bold py-4 tracking-wide shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:from-orange-600 hover:to-amber-600 active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed dark:from-orange-600 dark:to-amber-600 dark:hover:from-orange-500 dark:hover:to-amber-500 dark:shadow-orange-900/30 dark:hover:shadow-orange-900/40"
              >
                {isLoading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
            {/* Secondary */}
            <p className="mt-8 text-center text-sm text-stone-600 dark:text-stone-400">
              Don't have an account? <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-md transition-colors dark:text-orange-400 dark:hover:text-orange-300">Sign up now</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
