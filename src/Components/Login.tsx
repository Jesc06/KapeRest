// src/components/LoginUI.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import TintedBackdrop from "./TintedBackdrop";
import { API_BASE_URL } from "../config/api";
import { jwtDecode } from "jwt-decode";
import KapeRestLogo from "../assets/KapeRest.png";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./Shared/LanguageSwitcher";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const emailValid = emailPattern.test(email);
  const passwordValid = password.length >= 8;

  useEffect(() => {
    setMounted(true);
  }, []);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = "Email is required";
    else if (!emailPattern.test(email)) next.email = "Invalid email format";
    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Min 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

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

      if (!response.ok) {
        // Try to parse as JSON first, fallback to text
        let errorMessage = "Login failed. Please check your credentials.";
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        setErrors({ api: errorMessage });
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      const payload: any = jwtDecode(data.token);
      const role =
        payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?.toLowerCase();

      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "staff") navigate("/staff", { replace: true });
      else if (role === "cashier") navigate("/cashier", { replace: true });
      else navigate("/", { replace: true });

    } catch (error) {
      console.error("Login error:", error);
      setErrors({ api: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const errorSummary = errors.api || (Object.keys(errors).length > 1 ? Object.values(errors).filter(e => e !== errors.api).join(". ") : null);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/60 to-stone-100 dark:bg-[#1f1814] font-sans">
      <div className="block dark:hidden">
        <TintedBackdrop />
      </div>
      
      {/* Clean Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-orange-400/20 via-amber-400/15 to-yellow-400/10 dark:from-transparent dark:via-transparent dark:to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-gradient-to-tr from-amber-400/20 via-orange-300/15 to-rose-300/10 dark:from-transparent dark:via-transparent dark:to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-orange-300/12 via-amber-300/8 to-orange-300/12 dark:from-transparent dark:via-transparent dark:to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '14s', animationDelay: '6s' }}></div>
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-3 sm:px-6 md:py-4">
        <div className={`w-full max-w-[440px] transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Clean Card Design */}
          <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white p-4 sm:p-5 shadow-2xl shadow-orange-500/10 dark:border-stone-700/50 dark:bg-neutral-800 dark:shadow-black/50">
            
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"></div>

            {/* Brand Header */}
            <div className="relative mb-3 text-center">
              {/* Logo */}
              <div className="inline-flex items-center justify-center mb-2">
                <div className="p-2.5 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/20 rounded-2xl shadow-lg shadow-orange-500/20 dark:shadow-orange-900/30">
                  <img src={KapeRestLogo} alt="KapeRest Logo" className="w-14 h-14 object-contain" />
                </div>
              </div>
              
              {/* Brand name */}
              <h1 className="text-4xl font-extrabold tracking-tight mb-1">
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent dark:from-orange-400 dark:via-amber-400 dark:to-orange-400">
                  KapeRest
                </span>
              </h1>
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{t('common.posSystem')}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-2.5" aria-busy={isLoading}>
              <div role="status" aria-live="polite" className="sr-only">
                {errors.email || errors.password || ''}
              </div>

              {/* Error Alert */}
              {errorSummary && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/30" role="alert">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{errorSummary}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Email Field */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-2 dark:text-stone-300 break-words leading-tight">
                    {t('login.email')}
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={isLoading}
                      className={`block w-full rounded-xl border-2 bg-white pl-4 pr-12 py-3 text-base text-stone-900 placeholder:text-stone-400 transition-all duration-200 focus:outline-none dark:bg-[#1a1410] dark:text-stone-50 dark:placeholder:text-stone-500
                        ${emailValid && email.trim().length > 0
                          ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:border-emerald-500/50 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20'
                          : errors.email
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:border-red-500/50 dark:focus:border-red-500'
                            : 'border-stone-600/50 hover:border-orange-500/70 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:border-stone-600/50 dark:hover:border-orange-500/70 dark:focus:border-orange-500 dark:focus:ring-orange-500/20'}
                        ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="you@example.com"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {/* Success indicator */}
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${emailValid && email.trim().length > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1.5 dark:text-red-400">
                      <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="group">
                  <label htmlFor="password" className="flex items-center justify-between text-sm font-semibold text-stone-700 mb-2 dark:text-stone-300 gap-2">
                    <span className="break-words leading-tight">{t('login.password')}</span>
                    {capsOn && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded dark:text-amber-400 dark:bg-amber-900/30">
                        {t('login.capsLock')}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyUp={(e) => setCapsOn((e as any).getModifierState && (e as any).getModifierState('CapsLock'))}
                      onKeyDown={(e) => setCapsOn((e as any).getModifierState && (e as any).getModifierState('CapsLock'))}
                      disabled={isLoading}
                      className={`block w-full rounded-xl border-2 bg-white pl-4 pr-12 py-3 text-base text-stone-900 placeholder:text-stone-400 transition-all duration-200 focus:outline-none dark:bg-[#1a1410] dark:text-stone-50 dark:placeholder:text-stone-500
                        ${passwordValid
                          ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:border-emerald-500/50 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20'
                          : errors.password
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:border-red-500/50 dark:focus:border-red-500'
                            : 'border-stone-600/50 hover:border-orange-500/70 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:border-stone-600/50 dark:hover:border-orange-500/70 dark:focus:border-orange-500 dark:focus:ring-orange-500/20'}
                        ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="Enter your password"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    
                    {/* Password toggle button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-700/50 transition-colors dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-700/50"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Success indicator - only show when password is valid */}
                    {passwordValid && (
                      <div className="absolute right-12 top-1/2 -translate-y-1/2 transition-all duration-300">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1.5 dark:text-red-400">
                      <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 cursor-pointer dark:text-stone-400">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500 focus:ring-2 dark:border-stone-600/50 dark:bg-stone-900/50"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-xs text-stone-400 dark:text-stone-500">v1.0.0</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full mt-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 dark:from-orange-600 dark:to-amber-600 dark:shadow-orange-900/40"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="h-5 w-5 animate-spin flex-shrink-0" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    <span className="break-words leading-tight">{t('login.signingIn')}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="break-words leading-tight">{t('login.signin')}</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-700/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-stone-500 dark:bg-neutral-800 dark:text-stone-400">
                  {t('login.noAccount')}
                </span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-600 font-medium text-sm hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="break-words leading-tight">{t('login.signUp')}</span>
              </Link>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="mt-6">
            <LanguageSwitcher />
          </div>

          {/* Footer */}
          <p className="mt-4 text-center text-xs text-stone-400 dark:text-stone-500">
            © 2024 KapeRest POS. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
