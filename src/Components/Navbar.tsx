import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

// Fixed, translucent navbar matching the auth UI theme
// Palette: neutral background, subtle border + shadow, focus-visible rings
// Items: Home, About, Contact, Sign in, Sign up

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem("kaperest-theme");
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const isDark = theme === "dark";

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("kaperest-theme", theme);
  }, [theme]);

  // Shared styles
  const navLinkBase =
    "group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:text-neutral-300 dark:hover:text-white";

  const buttonBase =
    "inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-medium focus:outline-none transition select-none";
  const btnText =
    `${buttonBase} border border-neutral-200/70 bg-white/40 text-neutral-900 hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:bg-neutral-800`;
  const btnPrimary =
    `${buttonBase} bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-amber-400 dark:text-neutral-900 dark:hover:bg-amber-300`;

  const toggleTheme = () => setTheme(current => (current === "dark" ? "light" : "dark"));

  return (
    <>
      {/* Fixed top bar */}
      <nav className="fixed inset-x-0 top-4 z-30 flex justify-center px-4 sm:px-6">
        <div className="w-full max-w-6xl">
          <div className="flex h-14 items-center gap-4 rounded-[28px] border border-white/60 bg-white/70 px-4 shadow-[0_20px_48px_-28px_rgba(15,23,42,0.55)] backdrop-blur-2xl transition-all duration-300 sm:h-16 sm:px-6 dark:border-neutral-800/80 dark:bg-neutral-900/75 dark:shadow-[0_20px_48px_-28px_rgba(15,23,42,0.85)]">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-full px-2 py-1 text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-neutral-100"
            >
              <span className="text-lg font-semibold tracking-tight sm:text-xl">KapeRest</span>
            </Link>

            <div className="hidden md:flex flex-1 items-center justify-center gap-1">
              <NavLink
                to="/"
                end
                aria-current={isHome ? "page" : undefined}
                className={({ isActive }) =>
                  `${navLinkBase} ${isActive ? "text-neutral-900" : ""}`
                }
              >
                Home
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-neutral-800/80 via-neutral-800 to-neutral-800/80 opacity-0 transition group-hover:opacity-40 group-[aria-current="page"]:opacity-100 dark:from-amber-400/80 dark:via-amber-400 dark:to-amber-400/80`}
                />
              </NavLink>
              <a href="#about" className={navLinkBase}>
                About
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-neutral-800/60 via-neutral-800 to-neutral-800/60 opacity-0 transition group-hover:opacity-40 dark:from-amber-400/60 dark:via-amber-400 dark:to-amber-400/60"
                />
              </a>
              <a href="#contact" className={navLinkBase}>
                Contact
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-neutral-800/60 via-neutral-800 to-neutral-800/60 opacity-0 transition group-hover:opacity-40 dark:from-amber-400/60 dark:via-amber-400 dark:to-amber-400/60"
                />
              </a>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                aria-current={isLogin ? "page" : undefined}
                className={btnText}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                aria-current={isRegister ? "page" : undefined}
                className={btnPrimary}
              >
                <span>Sign up</span>
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={isDark}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white/40 text-neutral-900 transition hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {isDark ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2" strokeLinecap="round" />
                    <path d="M12 21v2" strokeLinecap="round" />
                    <path d="M4.22 4.22l1.42 1.42" strokeLinecap="round" />
                    <path d="M18.36 18.36l1.42 1.42" strokeLinecap="round" />
                    <path d="M1 12h2" strokeLinecap="round" />
                    <path d="M21 12h2" strokeLinecap="round" />
                    <path d="M4.22 19.78l1.42-1.42" strokeLinecap="round" />
                    <path d="M18.36 5.64l1.42-1.42" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>

            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/0 text-neutral-700 transition hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-neutral-300 dark:hover:bg-neutral-800/80 md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                {open ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <path d="M3 6h18" />
                    <path d="M3 12h18" />
                    <path d="M3 18h18" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {open && (
            <div className="mt-3 overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-[0_18px_44px_-26px_rgba(15,23,42,0.5)] backdrop-blur-2xl md:hidden dark:border-neutral-800/80 dark:bg-neutral-900/85">
              <div className="space-y-1 px-4 py-4">
                <Link
                  to="/"
                  aria-current={isHome ? "page" : undefined}
                  className={`block rounded-full px-3 py-2 text-sm font-medium transition hover:bg-white/70 ${isHome ? "text-neutral-900" : "text-neutral-700"} dark:hover:bg-neutral-800/60 ${isHome ? "dark:text-neutral-100" : "dark:text-neutral-300"}`}
                >
                  Home
                </Link>
                <a
                  href="#about"
                  className="block rounded-full px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-white/70 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="block rounded-full px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-white/70 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
                >
                  Contact
                </a>
                <div className="my-3 h-px bg-neutral-200/80 dark:bg-neutral-800/70" aria-hidden />
                <Link to="/login" aria-current={isLogin ? "page" : undefined} className={`${btnText} block w-full text-center`}>
                  Sign in
                </Link>
                <Link to="/register" aria-current={isRegister ? "page" : undefined} className={`${btnPrimary} block w-full text-center`}>
                  Sign up
                </Link>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-pressed={isDark}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-neutral-200/70 bg-white/40 px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <span className="mr-2">
                    {isDark ? "Dark" : "Light"} mode
                  </span>
                  {isDark ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2" strokeLinecap="round" />
                      <path d="M12 21v2" strokeLinecap="round" />
                      <path d="M4.22 4.22l1.42 1.42" strokeLinecap="round" />
                      <path d="M18.36 18.36l1.42 1.42" strokeLinecap="round" />
                      <path d="M1 12h2" strokeLinecap="round" />
                      <path d="M21 12h2" strokeLinecap="round" />
                      <path d="M4.22 19.78l1.42-1.42" strokeLinecap="round" />
                      <path d="M18.36 5.64l1.42-1.42" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer removed; global pt-16 applied in App wrapper */}
    </>
  );
};

export default Navbar;
