// src/components/LoginUI.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TintedBackdrop from "./TintedBackdrop";
import { API_BASE_URL } from "../config/api";
import { jwtDecode } from "jwt-decode";



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
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-amber-50/40 dark:bg-stone-900 font-sans transition-colors duration-300">
      <TintedBackdrop />
      {/* Warm Café Theme Background with Coffee Tones */}
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-100/30 dark:from-stone-900 dark:via-stone-950/80 dark:to-amber-950/60" />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:px-6 md:py-8">
        <div className="relative w-full max-w-[440px]">
          <div className="auth-card relative rounded-xl border-2 border-orange-500 bg-stone-100/90 p-7 sm:p-8 shadow-lg transition-all duration-300 ease-out dark:border-orange-600 dark:bg-stone-800/70">
            <div className="absolute -top-3 left-6 inline-flex h-6 items-center rounded-full border border-orange-300/70 bg-orange-50 px-3 text-[11px] font-semibold tracking-wide text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/40 dark:text-orange-300">LOGIN</div>
            {/* Brand */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 flex items-center gap-2 dark:text-neutral-50">KapeRest <span aria-hidden="true" className="coffee-emoji text-[24px]">☕</span></h1>
              <p className="mt-1.5 text-base text-neutral-600 dark:text-neutral-400">Professional POS Management</p>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-neutral-300 via-neutral-400 to-neutral-300 mb-6 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800" aria-hidden />
            {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-busy={isLoading}>
              {/* Screen reader announcements for first error */}
              <div role="status" aria-live="polite" className="sr-only">
                {errors.email || errors.password || ''}
              </div>
              {errorSummary && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-[12px] px-3 py-2 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200" role="alert">
                  {errorSummary}
                </div>
              )}
              <div className="space-y-5">
                {/* Email Field (stacked label, larger target) */}
                <div className="relative">
                  <label htmlFor="email" className="block text-[13px] font-medium text-neutral-700 tracking-wide dark:text-neutral-300">Email</label>
                  <div className="mt-1 relative">
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
                      className={`peer block w-full rounded-lg border bg-white pr-10 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition placeholder:text-neutral-400 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-500
                        ${emailValid && email.trim().length > 0
                          ? 'border-orange-500 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 dark:border-orange-500 dark:focus:ring-orange-400 dark:focus:border-orange-400'
                          : 'border-neutral-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 dark:border-neutral-700 dark:focus:ring-orange-400 dark:focus:border-orange-400'}
                        ${isLoading ? 'opacity-90' : ''}`}
                      placeholder="you@company.com"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 transition-all duration-150 ease-out ${emailFocused && emailValid && email.trim().length > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden>
                        <path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-[11px] text-red-600 dark:text-red-200">{errors.email}</p>
                  )}
                </div>
                {/* Password Field with Caps Lock indicator */}
                <div className="relative">
                  <label htmlFor="password" className="flex items-center justify-between text-[13px] font-medium text-neutral-700 tracking-wide dark:text-neutral-300">
                    <span>Password</span>
                    {capsOn && <span className="text-[10px] font-medium text-orange-600 dark:text-orange-300">CAPS ON</span>}
                  </label>
                  <div className="mt-1 relative">
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
                      className={`peer block w-full rounded-lg border bg-white pr-10 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition placeholder:text-neutral-400 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-500
                        ${passwordValid
                          ? 'border-orange-500 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 dark:border-orange-500 dark:focus:ring-orange-400 dark:focus:border-orange-400'
                          : 'border-neutral-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 dark:border-neutral-700 dark:focus:ring-orange-400 dark:focus:border-orange-400'}
                        ${isLoading ? 'opacity-90' : ''}`}
                      placeholder="••••••••"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={[
                        errors.password ? 'password-error' : undefined,
                        capsOn ? 'caps-warning' : undefined,
                      ].filter(Boolean).join(' ') || undefined}
                    />
                    <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 transition-all duration-150 ease-out ${passwordFocused && passwordValid ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden>
                        <path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {capsOn && (
                    <p id="caps-warning" aria-live="polite" className="mt-1 text-xs text-orange-600 dark:text-orange-300">Caps Lock is on</p>
                  )}
                  {errors.password && (
                    <p id="password-error" className="mt-1 text-[11px] text-red-600 dark:text-red-200">{errors.password}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="group relative inline-flex items-center gap-2 pl-[2px] text-[11px] font-medium text-neutral-700 select-none leading-none cursor-pointer dark:text-neutral-300">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    className="peer relative h-4 w-4 shrink-0 appearance-none rounded-[5px] border border-neutral-300 bg-white transition-colors before:absolute before:inset-0 before:rounded-[4px] before:bg-neutral-900 before:scale-0 before:opacity-0 before:transition checked:before:scale-100 checked:before:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-60 cursor-pointer dark:border-neutral-700 dark:bg-neutral-800 dark:before:bg-orange-400 dark:focus-visible:ring-orange-400"
                  />
                  <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-[6px] h-[10px] w-[10px] text-white opacity-0 transition-opacity peer-checked:opacity-100" aria-hidden>
                    <path d="M6 10.5l2.25 2.25L14 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="translate-y-[0.5px]">Remember me</span>
                </label>
                <span className="text-[11px] text-neutral-500 leading-none dark:text-neutral-400">v1.0.0</span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-orange-600 text-white text-sm md:text-[15px] font-medium py-3 tracking-wide shadow-sm hover:bg-orange-700 active:scale-[.99] focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-white transition disabled:opacity-50 disabled:hover:bg-orange-600 disabled:cursor-not-allowed dark:bg-orange-500 dark:text-neutral-950 dark:hover:bg-orange-400 dark:focus:ring-orange-400 dark:focus:ring-offset-neutral-950"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
            {/* Secondary */}
            <p className="mt-6 text-center text-[13px] text-neutral-600 dark:text-neutral-400">
              Don't have an account? <Link to="/register" className="font-medium text-neutral-800 hover:underline focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:ring-offset-white rounded dark:text-orange-300 dark:hover:text-orange-200 dark:focus:ring-orange-400 dark:focus:ring-offset-neutral-950">Sign up</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
