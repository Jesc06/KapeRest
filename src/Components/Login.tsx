// src/components/LoginUI.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import TintedBackdrop from "./TintedBackdrop";

// Clean, professional login without background image.
// Design goals:
// - Neutral palette (white / grayscale / subtle border)
// - Clear visual hierarchy (brand -> form -> secondary actions)
// - Accessible labels and focus states
// - Reduced visual noise, no decorative shadows or scaling gimmicks

const LoginUI: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    // Simulate async auth
    setTimeout(() => {
      setIsLoading(false);
      console.log("login", { email, password });
    }, 900);
  };

  const errorSummary = Object.keys(errors).length > 1 ? Object.values(errors).join(". ") : null;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-neutral-950 dark:via-stone-900 dark:to-neutral-900 font-sans transition-colors duration-300">
      <TintedBackdrop />
      
      {/* Animated Background Pattern */}
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk3NzI2NCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      </div>
      
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:px-6 md:py-8">
        <div className="relative w-full max-w-[440px]">
          {/* Premium Card with Gradient Border Effect */}
          <div className="relative group">
            {/* Gradient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-40 transition duration-500"></div>
            
            <div className="relative rounded-2xl border-2 border-orange-200 dark:border-orange-900/50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl p-8 sm:p-10 shadow-2xl transition-all duration-300 ease-out">
              {/* Login Badge */}
              <div className="absolute -top-3 left-8 inline-flex h-6 items-center rounded-full border-2 border-orange-400 dark:border-orange-600 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600 px-4 text-[11px] font-black tracking-widest text-white shadow-md">
                LOGIN
              </div>
              
              {/* Brand Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">☕</span>
                  </div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-400 dark:to-rose-400">
                    KapeRest
                  </h1>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium ml-1">Professional POS Management System</p>
              </div>
              
              <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-300 dark:via-orange-700 to-transparent mb-8" aria-hidden />
              
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
                  <label htmlFor="email" className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Email Address</label>
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
                      className={`peer block w-full rounded-xl border-2 bg-white dark:bg-neutral-800 pr-11 px-4 py-3.5 text-base text-neutral-900 dark:text-neutral-100 focus:outline-none transition-all duration-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-sm
                        ${emailValid && email.trim().length > 0
                          ? 'border-green-500 dark:border-green-600 focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-600/20'
                          : 'border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/20'}
                        ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:border-orange-400 dark:hover:border-orange-600'}`}
                      placeholder="you@company.com"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    <div className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 transition-all duration-200 ${emailFocused && emailValid && email.trim().length > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-green-600 dark:text-green-500" aria-hidden>
                        <path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>
                {/* Password Field with Caps Lock indicator */}
                <div className="relative">
                  <label htmlFor="password" className="flex items-center justify-between text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                    <span>Password</span>
                    {capsOn && <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      CAPS ON
                    </span>}
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
                      className={`peer block w-full rounded-xl border-2 bg-white dark:bg-neutral-800 pr-11 px-4 py-3.5 text-base text-neutral-900 dark:text-neutral-100 focus:outline-none transition-all duration-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-sm
                        ${passwordValid
                          ? 'border-green-500 dark:border-green-600 focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-600/20'
                          : 'border-neutral-300 dark:border-neutral-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/20'}
                        ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:border-orange-400 dark:hover:border-orange-600'}`}
                      placeholder="••••••••"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={[
                        errors.password ? 'password-error' : undefined,
                        capsOn ? 'caps-warning' : undefined,
                      ].filter(Boolean).join(' ') || undefined}
                    />
                    <div className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 transition-all duration-200 ${passwordFocused && passwordValid ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-green-600 dark:text-green-500" aria-hidden>
                        <path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="group relative inline-flex items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    className="peer relative h-5 w-5 shrink-0 appearance-none rounded-md border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 transition-all duration-200 before:absolute before:inset-0 before:rounded-[4px] before:bg-gradient-to-br before:from-orange-500 before:to-rose-600 before:scale-0 before:opacity-0 before:transition checked:before:scale-100 checked:before:opacity-100 checked:border-orange-500 dark:checked:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-orange-400 dark:hover:border-orange-500"
                  />
                  <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-[3px] h-[14px] w-[14px] text-white opacity-0 transition-opacity peer-checked:opacity-100" aria-hidden>
                    <path d="M6 10.5l2.25 2.25L14 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Remember me</span>
                </label>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">v1.0.0</span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 dark:from-amber-600 dark:via-orange-600 dark:to-rose-700 text-white font-bold py-4 tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                {isLoading ? (
                  <span className="relative inline-flex items-center justify-center gap-2.5">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    <span className="text-base">Signing in…</span>
                  </span>
                ) : (
                  <span className="relative text-base">Sign In</span>
                )}
              </button>
            </form>
            
            {/* Secondary */}
            <p className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Don't have an account? <Link to="/register" className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded transition-colors">Sign up now</Link>
            </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginUI;
