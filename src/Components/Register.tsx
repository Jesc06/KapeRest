// src/components/Register.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TintedBackdrop from './TintedBackdrop';


// Registration form styled to match LoginUI aesthetics.
// Fields: first name, middle name (optional), last name, email, password, role, branch.
// Validation: required (except middle name), email pattern, password >= 8, role selected, branch non-empty.
// Shows green border + check icon when valid (persist after blur). Neutral when invalid.

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const roles = ['Admin', 'Staff', 'Cashier'];
const branches = ['Main', 'Downtown', 'Uptown', 'Warehouse'];

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [branch, setBranch] = useState('');
  const [capsOn, setCapsOn] = useState(false);
  const [errors, setErrors] = useState<{[k:string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleHighlight, setRoleHighlight] = useState(0);
  const roleButtonRef = useRef<HTMLButtonElement | null>(null);
  const roleListRef = useRef<HTMLUListElement | null>(null);
  const [branchOpen, setBranchOpen] = useState(false);
  const [branchHighlight, setBranchHighlight] = useState(0);
  const branchButtonRef = useRef<HTMLButtonElement | null>(null);
  const branchListRef = useRef<HTMLUListElement | null>(null);

  // Focus tracking for animated check icons (show only when focused + valid)
  const [focusField, setFocusField] = useState<string | null>(null);

  const validFirst = firstName.trim().length > 0;
  const validMiddle = middleName.trim().length > 0 || middleName.trim().length === 0; // optional
  const validLast = lastName.trim().length > 0;
  const validEmail = emailPattern.test(email);
  const validPassword = password.length >= 8;
  const validRole = role.trim().length > 0;
  const validBranch = branch.trim().length > 0;

  const validate = () => {
    const next: {[k:string]: string} = {};
    if (!validFirst) next.firstName = 'First name required';
    if (!validLast) next.lastName = 'Last name required';
    if (!validEmail) next.email = email ? 'Invalid email' : 'Email required';
    if (!validPassword) next.password = password ? 'Min 8 characters' : 'Password required';
    if (!validRole) next.role = 'Select a role';
    if (!validBranch) next.branch = 'Branch required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('register', { firstName, middleName, lastName, email, password, role, branch });
    }, 900);
  };

  // Close role/branch dropdowns on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!roleOpen && !branchOpen) return;
      const target = e.target as Node;
      if (roleButtonRef.current?.contains(target) || roleListRef.current?.contains(target)) return;
      if (branchButtonRef.current?.contains(target) || branchListRef.current?.contains(target)) return;
      setRoleOpen(false);
      setBranchOpen(false);
      setFocusField(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [roleOpen, branchOpen]);

  const errorSummary = Object.keys(errors).length > 1 ? Object.values(errors).join('. ') : null;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-transparent font-sans">
      <TintedBackdrop />
      {/* page overlay: stone-50 with subtle tint for consistency with homepage */}
      <div aria-hidden className="absolute inset-0 z-0 bg-stone-50/90 backdrop-blur-xl dark:bg-neutral-900/60 pointer-events-none" />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:px-6 md:py-8">
        <div className="relative w-full max-w-[580px]">
          <div className="auth-card relative rounded-3xl border border-amber-200/70 bg-white/85 p-7 sm:p-8 shadow-lg backdrop-blur-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl focus-within:-translate-y-1 dark:border-neutral-800/70 dark:bg-neutral-900/85">
            <div className="absolute -top-3 left-6 inline-flex h-6 items-center rounded-full border border-amber-200 bg-amber-50/80 px-3 text-[11px] font-semibold tracking-wide text-amber-600 dark:border-amber-400/60 dark:bg-amber-400/15 dark:text-amber-200">REGISTER</div>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-2 dark:text-neutral-100">
                Create your account 
                <span aria-hidden="true" className="coffee-emoji text-[20px]">☕</span>
              </h1>
              <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">Enter your details below</p>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 mb-6 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700" aria-hidden />
            <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-busy={isLoading}>
              <div role="status" aria-live="polite" className="sr-only">
                {errors.firstName || errors.lastName || errors.email || errors.password || errors.role || errors.branch || ''}
              </div>
              {errorSummary && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-[12px] px-3 py-2 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200" role="alert">{errorSummary}</div>
              )}
              <div className="space-y-5">
                {/* Name fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* First Name */}
                  <div className="relative">
                    <label htmlFor="firstName" className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 tracking-wide">First Name</label>
                    <div className="mt-1 relative">
                      <input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        onFocus={() => setFocusField('firstName')}
                        onBlur={() => setFocusField(null)}
                        disabled={isLoading}
                        className={`peer block w-full rounded-xl border bg-neutral-50/80 pr-12 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition placeholder:text-neutral-400 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-500
                          ${validFirst ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400' : 'border-neutral-300 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 dark:border-neutral-700 dark:focus:ring-amber-400 dark:focus:border-amber-400'}
                          ${isLoading ? 'opacity-90' : ''}`}
                        placeholder="Juan"
                        aria-invalid={errors.firstName ? 'true' : 'false'}
                        aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                      />
                      <div className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 transition-all duration-150 ease-out ${focusField==='firstName' && validFirst ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    {errors.firstName && <p id="firstName-error" className="mt-1 text-[11px] text-red-600 dark:text-red-200">{errors.firstName}</p>}
                  </div>
                  {/* Middle Name (optional) */}
                  <div className="relative">
                    <label htmlFor="middleName" className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 tracking-wide">Middle Name</label>
                    <div className="mt-1 relative">
                      <input
                        id="middleName"
                        type="text"
                        autoComplete="additional-name"
                        value={middleName}
                        onChange={e => setMiddleName(e.target.value)}
                        onFocus={() => setFocusField('middleName')}
                        onBlur={() => setFocusField(null)}
                        disabled={isLoading}
                        className={`peer block w-full rounded-xl border bg-neutral-50/80 pr-3.5 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition placeholder:text-neutral-400 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-500
                          ${validMiddle ? 'border-neutral-300 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 dark:border-neutral-700 dark:focus:ring-amber-400 dark:focus:border-amber-400' : 'border-neutral-300 dark:border-neutral-700'}
                          ${isLoading ? 'opacity-90' : ''}`}
                        placeholder="Cruz"
                      />
                      {/* Optional field doesn't show green success icon */}
                    </div>
                  </div>
                  {/* Last Name */}
                  <div className="relative">
                    <label htmlFor="lastName" className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 tracking-wide">Last Name</label>
                    <div className="mt-1 relative">
                      <input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        onFocus={() => setFocusField('lastName')}
                        onBlur={() => setFocusField(null)}
                        disabled={isLoading}
                        className={`peer block w-full rounded-xl border bg-neutral-50/80 pr-12 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition placeholder:text-neutral-400 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-500
                          ${validLast ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400' : 'border-neutral-300 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 dark:border-neutral-700 dark:focus:ring-amber-400 dark:focus:border-amber-400'}
                          ${isLoading ? 'opacity-90' : ''}`}
                        placeholder="Dela Cruz"
                        aria-invalid={errors.lastName ? 'true' : 'false'}
                        aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                      />
                      <div className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 transition-all duration-150 ease-out ${focusField==='lastName' && validLast ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    {errors.lastName && <p id="lastName-error" className="mt-1 text-[11px] text-red-600 dark:text-red-200">{errors.lastName}</p>}
                  </div>
                </div>
                {/* Email + Password (side-by-side on md+) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Email */}
                  <div className="relative">
                    <label htmlFor="email" className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 tracking-wide">Email</label>
                    <div className="mt-1 relative">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocusField('email')}
                        onBlur={() => setFocusField(null)}
                        disabled={isLoading}
                        className={`peer block w-full rounded-xl border bg-neutral-50/80 pr-12 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition placeholder:text-neutral-400 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-500
                          ${validEmail ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400' : 'border-neutral-300 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 dark:border-neutral-700 dark:focus:ring-amber-400 dark:focus:border-amber-400'}
                          ${isLoading ? 'opacity-90' : ''}`}
                        placeholder="you@company.com"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 transition-all duration-150 ease-out ${focusField==='email' && validEmail ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    {errors.email && <p id="email-error" className="mt-1 text-[11px] text-red-600 dark:text-red-200">{errors.email}</p>}
                  </div>
                  {/* Password */}
                  <div className="relative">
                    <label htmlFor="password" className="flex items-center justify-between text-[13px] font-medium text-neutral-700 dark:text-neutral-300 tracking-wide">
                      <span>Password</span>
                      {capsOn && <span className="text-[10px] font-medium text-amber-600 dark:text-amber-300">CAPS ON</span>}
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyUp={(e) => setCapsOn((e as any).getModifierState && (e as any).getModifierState('CapsLock'))}
                        onKeyDown={(e) => setCapsOn((e as any).getModifierState && (e as any).getModifierState('CapsLock'))}
                        onFocus={() => setFocusField('password')}
                        onBlur={() => setFocusField(null)}
                        disabled={isLoading}
                        className={`peer block w-full rounded-xl border bg-neutral-50/80 pr-12 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition placeholder:text-neutral-400 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder:text-neutral-500
                          ${validPassword ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400' : 'border-neutral-300 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 dark:border-neutral-700 dark:focus:ring-amber-400 dark:focus:border-amber-400'}
                          ${isLoading ? 'opacity-90' : ''}`}
                        placeholder="••••••••"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 transition-all duration-150 ease-out ${focusField==='password' && validPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    {errors.password && <p id="password-error" className="mt-1 text-[11px] text-red-600 dark:text-red-200">{errors.password}</p>}
                  </div>
                </div>
                {/* Role + Branch (side-by-side on md+) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Role */}
                  <div className="relative">
                    <label htmlFor="role" className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 tracking-wide">Role</label>
                    <div className="mt-1 relative">
                      <button
                        ref={roleButtonRef}
                        id="role"
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          const idx = Math.max(0, roles.indexOf(role));
                          setRoleHighlight(idx);
                          setRoleOpen(v => !v);
                          setFocusField('role');
                        }}
                        onKeyDown={(e) => {
                          if (isLoading) return;
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (!roleOpen) {
                              const idx = Math.max(0, roles.indexOf(role));
                              setRoleHighlight(idx);
                              setRoleOpen(true);
                              setFocusField('role');
                              return;
                            }
                            setRoleHighlight((i) => {
                              if (e.key === 'ArrowDown') return Math.min(i + 1, roles.length - 1);
                              return Math.max(i - 1, 0);
                            });
                          } else if (e.key === 'Home') {
                            e.preventDefault();
                            setRoleHighlight(0);
                          } else if (e.key === 'End') {
                            e.preventDefault();
                            setRoleHighlight(roles.length - 1);
                          } else if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!roleOpen) {
                              const idx = Math.max(0, roles.indexOf(role));
                              setRoleHighlight(idx);
                              setRoleOpen(true);
                              setFocusField('role');
                            } else {
                              const next = roles[roleHighlight];
                              if (next) {
                                setRole(next);
                              }
                              setRoleOpen(false);
                              setFocusField(null);
                            }
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            setRoleOpen(false);
                            setFocusField(null);
                          }
                        }}
                        className={`w-full text-left rounded-xl border bg-neutral-50/80 pr-12 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition dark:bg-neutral-900/60 dark:text-neutral-100
                          ${validRole ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400' : 'border-neutral-300 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 dark:border-neutral-700 dark:focus:ring-amber-400 dark:focus:border-amber-400'}
                          ${isLoading ? 'opacity-90' : ''}`}
                        aria-haspopup="listbox"
                        aria-expanded={roleOpen}
                        aria-controls="role-listbox"
                        aria-invalid={errors.role ? 'true' : 'false'}
                        aria-describedby={errors.role ? 'role-error' : undefined}
                      >
                        <span className={`block truncate ${!role ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-100'}`}>
                          {role || 'Select role...'}
                        </span>
                        {/* Chevron */}
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <svg className={`h-4 w-4 text-neutral-500 dark:text-neutral-400 transition-transform ${roleOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden>
                            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                      {/* Success icon bubble when valid + focused */}
                      <div className={`pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 transition-all duration-150 ease-out ${focusField==='role' && validRole ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      {roleOpen && (
                        <ul
                          ref={roleListRef}
                          id="role-listbox"
                          role="listbox"
                          aria-labelledby="role"
                          className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/90"
                        >
                          {roles.map((r, i) => {
                            const active = i === roleHighlight;
                            const selected = r === role;
                            return (
                              <li
                                key={r}
                                id={`role-option-${i}`}
                                role="option"
                                aria-selected={selected}
                                className={`flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-[14px] ${active ? 'bg-neutral-100 dark:bg-neutral-800/60' : ''}`}
                                onMouseEnter={() => setRoleHighlight(i)}
                                onMouseDown={(e) => {
                                  e.preventDefault(); // prevent button blur
                                }}
                                onClick={() => {
                                  setRole(r);
                                  setRoleOpen(false);
                                  setFocusField(null);
                                }}
                              >
                                <span className="truncate text-neutral-900 dark:text-neutral-100">{r}</span>
                                {selected && (
                                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-emerald-600" fill="none" aria-hidden>
                                    <path d="M6 10.5l2.25 2.25L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    {errors.role && <p id="role-error" className="mt-1 text-[11px] text-red-600 dark:text-red-200">{errors.role}</p>}
                  </div>
                  {/* Branch combobox */}
                  <div className="relative">
                    <label htmlFor="branch" className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 tracking-wide">Branch</label>
                    <div className="mt-1 relative">
                      <button
                        ref={branchButtonRef}
                        id="branch"
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          const idx = Math.max(0, branches.indexOf(branch));
                          setBranchHighlight(idx);
                          setBranchOpen(v => !v);
                          setFocusField('branch');
                        }}
                        onKeyDown={(e) => {
                          if (isLoading) return;
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (!branchOpen) {
                              const idx = Math.max(0, branches.indexOf(branch));
                              setBranchHighlight(idx);
                              setBranchOpen(true);
                              setFocusField('branch');
                              return;
                            }
                            setBranchHighlight((i) => {
                              if (e.key === 'ArrowDown') return Math.min(i + 1, branches.length - 1);
                              return Math.max(i - 1, 0);
                            });
                          } else if (e.key === 'Home') {
                            e.preventDefault();
                            setBranchHighlight(0);
                          } else if (e.key === 'End') {
                            e.preventDefault();
                            setBranchHighlight(branches.length - 1);
                          } else if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!branchOpen) {
                              const idx = Math.max(0, branches.indexOf(branch));
                              setBranchHighlight(idx);
                              setBranchOpen(true);
                              setFocusField('branch');
                            } else {
                              const next = branches[branchHighlight];
                              if (next) {
                                setBranch(next);
                              }
                              setBranchOpen(false);
                              setFocusField(null);
                            }
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            setBranchOpen(false);
                            setFocusField(null);
                          }
                        }}
                        className={`w-full text-left rounded-xl border bg-neutral-50/80 pr-12 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition dark:bg-neutral-900/60 dark:text-neutral-100
                          ${validBranch ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400' : 'border-neutral-300 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 dark:border-neutral-700 dark:focus:ring-amber-400 dark:focus:border-amber-400'}
                          ${isLoading ? 'opacity-90' : ''}`}
                        aria-haspopup="listbox"
                        aria-expanded={branchOpen}
                        aria-controls="branch-listbox"
                        aria-invalid={errors.branch ? 'true' : 'false'}
                        aria-describedby={errors.branch ? 'branch-error' : undefined}
                      >
                        <span className={`block truncate ${!branch ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-100'}`}>
                          {branch || 'Select branch...'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <svg className={`h-4 w-4 text-neutral-500 dark:text-neutral-400 transition-transform ${branchOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden>
                            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                      {/* Success icon bubble when valid + focused */}
                      <div className={`pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 transition-all duration-150 ease-out ${focusField==='branch' && validBranch ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      {branchOpen && (
                        <ul
                          ref={branchListRef}
                          id="branch-listbox"
                          role="listbox"
                          aria-labelledby="branch"
                          className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/90"
                        >
                          {branches.map((b, i) => {
                            const active = i === branchHighlight;
                            const selected = b === branch;
                            return (
                              <li
                                key={b}
                                id={`branch-option-${i}`}
                                role="option"
                                aria-selected={selected}
                                className={`flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-[14px] ${active ? 'bg-neutral-100 dark:bg-neutral-800/60' : ''}`}
                                onMouseEnter={() => setBranchHighlight(i)}
                                onMouseDown={(e) => { e.preventDefault(); }}
                                onClick={() => {
                                  setBranch(b);
                                  setBranchOpen(false);
                                  setFocusField(null);
                                }}
                              >
                                <span className="truncate text-neutral-900 dark:text-neutral-100">{b}</span>
                                {selected && (
                                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-emerald-600" fill="none" aria-hidden>
                                    <path d="M6 10.5l2.25 2.25L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    {errors.branch && <p id="branch-error" className="mt-1 text-[11px] text-red-600 dark:text-red-200">{errors.branch}</p>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-2">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-none order-2 sm:order-1">All fields required except middle name</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-none order-1 sm:order-2">v1.0.0</span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-neutral-900 text-white text-sm md:text-[15px] font-medium py-3 tracking-wide shadow-sm hover:bg-neutral-800 active:scale-[.99] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:ring-offset-white transition disabled:opacity-50 disabled:hover:bg-neutral-900 disabled:cursor-not-allowed dark:bg-amber-400 dark:text-neutral-900 dark:hover:bg-amber-300 dark:focus:ring-amber-200 dark:focus:ring-offset-neutral-900 dark:disabled:hover:bg-amber-400"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    <span>Creating…</span>
                  </>
                ) : (
                  <span>Sign up</span>
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-[13px] text-neutral-600 dark:text-neutral-400">Already have an account? <Link to="/login" className="font-medium text-neutral-800 hover:underline focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:ring-offset-white rounded dark:text-amber-300 dark:hover:text-amber-200 dark:focus:ring-amber-200 dark:focus:ring-offset-neutral-900">Sign in</Link></p>
          </div>
       
        </div>
      </main>
    </div>
  );
};

export default Register;
