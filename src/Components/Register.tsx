// src/components/Register.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TintedBackdrop from './TintedBackdrop';
import { API_BASE_URL } from '../config/api';
import KapeRestLogo from '../assets/KapeRest.png';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './Shared/LanguageSwitcher';

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const roles = ['Staff', 'Cashier'];

interface CashierAccount {
  id: string;
  userName: string;
  branchId: number;
  branchName: string;
  location: string;
  role?: string;
}

interface Branch {
  id: number;
  branchName: string;
  location: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [branch, setBranch] = useState('');
  const [branchId, setBranchId] = useState<number>(0);
  const [assignedCashier, setAssignedCashier] = useState('');
  const [assignedCashierId, setAssignedCashierId] = useState('');
  const [capsOn, setCapsOn] = useState(false);
  const [errors, setErrors] = useState<{[k:string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorSummary, setErrorSummary] = useState<string>('');
  const [cashiers, setCashiers] = useState<CashierAccount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingCashiers, setLoadingCashiers] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleHighlight, setRoleHighlight] = useState(0);
  const roleButtonRef = useRef<HTMLButtonElement | null>(null);
  const roleListRef = useRef<HTMLUListElement | null>(null);
  const [branchOpen, setBranchOpen] = useState(false);
  const [branchHighlight, setBranchHighlight] = useState(0);
  const branchButtonRef = useRef<HTMLButtonElement | null>(null);
  const branchListRef = useRef<HTMLUListElement | null>(null);
  const [cashierOpen, setCashierOpen] = useState(false);
  const [cashierHighlight, setCashierHighlight] = useState(0);
  const cashierButtonRef = useRef<HTMLButtonElement | null>(null);
  const cashierListRef = useRef<HTMLUListElement | null>(null);

  const [focusField, setFocusField] = useState<string | null>(null);

  // Fetch cashiers when role is Staff
  useEffect(() => {
    if (role === 'Staff') {
      setLoadingCashiers(true);
      fetch(`${API_BASE_URL}/RegisterPendingAccount/ExistingCashierAccount`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch cashiers: ${res.status}`);
          return res.json();
        })
        .then((data: CashierAccount[]) => {
          const cashierRoleOnly = (data || []).filter(account => 
            !account.role || account.role.toLowerCase() === 'cashier'
          );
          setCashiers(cashierRoleOnly);
        })
        .catch(err => {
          console.error('Error fetching cashiers:', err);
          setErrors(prev => ({ ...prev, cashier: 'Failed to load cashiers' }));
        })
        .finally(() => setLoadingCashiers(false));
    } else {
      setAssignedCashier('');
      setAssignedCashierId('');
      setCashiers([]);
      setBranch('');
      setBranchId(0);
    }
  }, [role]);

  // Fetch branches when role is not Staff
  useEffect(() => {
    if (role !== 'Staff' && role !== '') {
      setLoadingBranches(true);
      fetch(`${API_BASE_URL}/Branch/GetAllBranch`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch branches');
          return res.json();
        })
        .then((data: Branch[]) => {
          setBranches(data || []);
        })
        .catch(err => {
          console.error('Error fetching branches:', err);
          setErrors(prev => ({ ...prev, branch: 'Failed to load branches' }));
        })
        .finally(() => setLoadingBranches(false));
    } else {
      setBranches([]);
    }
  }, [role]);

  const validFirst = firstName.trim().length > 0;
  const validLast = lastName.trim().length > 0;
  const validEmail = emailPattern.test(email);
  const validPassword = password.length >= 8;
  const validRole = role.trim().length > 0;
  const validBranch = branch.trim().length > 0;
  const validCashier = role === 'Staff' ? assignedCashier.trim().length > 0 : true;

  const validate = () => {
    const next: {[k:string]: string} = {};
    if (!validFirst) next.firstName = 'First name required';
    if (!validLast) next.lastName = 'Last name required';
    if (!validEmail) next.email = email ? 'Invalid email' : 'Email required';
    if (!validPassword) next.password = password ? 'Min 8 characters' : 'Password required';
    if (!validRole) next.role = 'Select a role';
    if (!validBranch) next.branch = 'Branch required';
    if (role === 'Staff' && !validCashier) next.assignedCashier = 'Select assigned cashier';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrorSummary('');

    try {
      const payload = {
        firstName,
        middleName: middleName || '',
        lastName,
        email,
        password,
        role,
        branchId: branchId,
        cashierId: role === 'Staff' ? assignedCashierId : ''
      };

      const response = await fetch(`${API_BASE_URL}/RegisterPendingAccount/RegisterPendingAccount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      navigate('/login');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrorSummary(`Registration failed: ${error.message || 'Please check your information and try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!roleOpen && !branchOpen && !cashierOpen) return;
      const target = e.target as Node;
      if (roleButtonRef.current?.contains(target) || roleListRef.current?.contains(target)) return;
      if (branchButtonRef.current?.contains(target) || branchListRef.current?.contains(target)) return;
      if (cashierButtonRef.current?.contains(target) || cashierListRef.current?.contains(target)) return;
      setRoleOpen(false);
      setBranchOpen(false);
      setCashierOpen(false);
      setFocusField(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [roleOpen, branchOpen, cashierOpen]);

  // Close role/branch/cashier dropdowns on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!roleOpen && !branchOpen && !cashierOpen) return;
      const target = e.target as Node;
      if (roleButtonRef.current?.contains(target) || roleListRef.current?.contains(target)) return;
      if (branchButtonRef.current?.contains(target) || branchListRef.current?.contains(target)) return;
      if (cashierButtonRef.current?.contains(target) || cashierListRef.current?.contains(target)) return;
      setRoleOpen(false);
      setBranchOpen(false);
      setCashierOpen(false);
      setFocusField(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [roleOpen, branchOpen, cashierOpen]);

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
        <div className="relative w-full max-w-[620px]">
          {/* Clean Card Design */}
          <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white p-4 sm:p-5 shadow-2xl shadow-orange-500/10 dark:border-stone-700/50 dark:bg-neutral-800 dark:shadow-black/50">
            
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"></div>

            {/* Brand Header */}
            <div className="relative mb-3 text-center">
              {/* Logo */}
              <div className="inline-flex items-center justify-center mb-2">
                <div className="p-2.5 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/20 rounded-2xl shadow-lg shadow-orange-500/20 dark:shadow-orange-900/30">
                  <img src={KapeRestLogo} alt="KapeRest Logo" className="w-10 h-10 object-contain" />
                </div>
              </div>
              
              {/* Brand name */}
              <h1 className="text-4xl font-extrabold tracking-tight mb-0.5">
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent dark:from-orange-400 dark:via-amber-400 dark:to-orange-400">
                  {t('register.title')}
                </span>
              </h1>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">KapeRest {t('common.posSystem')}</p>
            </div>
            <form onSubmit={handleSubmit} noValidate className="space-y-2.5" aria-busy={isLoading}>
              <div role="status" aria-live="polite" className="sr-only">
                {errors.firstName || errors.lastName || errors.email || errors.password || errors.role || errors.branch || ''}
              </div>
              {errorSummary && (
                <div className="animate-in slide-in-from-top-2 duration-300 rounded-2xl border border-red-200/80 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 px-3 py-2.5 shadow-lg shadow-red-500/10 dark:border-red-800/40 dark:from-red-950/60 dark:via-rose-950/40 dark:to-red-950/60" role="alert">
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/60 dark:to-rose-900/40 flex items-center justify-center shadow-inner">
                      <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200">{errorSummary}</p>
                      <p className="text-xs text-red-600/70 dark:text-red-300/60 mt-0.5">Please check your information</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2.5">
                {/* Name fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* First Name */}
                  <div className="relative">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide mb-2 break-words leading-tight">{t('register.firstName')}</label>
                    <div className="relative group">
                      <input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        onFocus={() => setFocusField('firstName')}
                        onBlur={() => setFocusField(null)}
                        disabled={isLoading}
                        className={`peer block w-full rounded-lg border-2 bg-stone-50 pr-12 px-4 py-3 text-base leading-tight text-neutral-900 focus:outline-none transition-all duration-200 placeholder:text-stone-400 dark:bg-[#1a1410] dark:text-stone-50 dark:placeholder:text-stone-500
                          ${validFirst ? 'border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-emerald-500/50 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500' : 'border-stone-300 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:border-stone-600/50 dark:focus:ring-orange-500/20 dark:focus:border-orange-500'}
                          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        placeholder="Juan"
                        aria-invalid={errors.firstName ? 'true' : 'false'}
                        aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                      />
                      <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 transition-all duration-200 ease-out ${focusField==='firstName' && validFirst ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    {errors.firstName && <p id="firstName-error" className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1 dark:text-red-400"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.firstName}</p>}
                  </div>
                  {/* Middle Name (optional) */}
                  <div className="relative">
                    <label htmlFor="middleName" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide mb-2 break-words leading-tight">{t('register.middleName')}</label>
                    <div className="relative group">
                      <input
                        id="middleName"
                        type="text"
                        autoComplete="additional-name"
                        value={middleName}
                        onChange={e => setMiddleName(e.target.value)}
                        onFocus={() => setFocusField('middleName')}
                        onBlur={() => setFocusField(null)}
                        disabled={isLoading}
                        className={`peer block w-full rounded-lg border-2 bg-stone-50 pr-4 px-4 py-3 text-base leading-tight text-neutral-900 focus:outline-none transition-all duration-200 placeholder:text-stone-400 dark:bg-[#1a1410] dark:text-stone-50 dark:placeholder:text-stone-500 border-stone-300 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:border-stone-600/50 dark:focus:ring-orange-500/20 dark:focus:border-orange-500
                          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        placeholder="Cruz"
                      />
                    </div>
                  </div>
                  {/* Last Name */}
                  <div className="relative">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide mb-2 break-words leading-tight">{t('register.lastName')}</label>
                    <div className="relative group">
                      <input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        onFocus={() => setFocusField('lastName')}
                        onBlur={() => setFocusField(null)}
                        disabled={isLoading}
                        className={`peer block w-full rounded-lg border-2 bg-stone-50 pr-12 px-4 py-3 text-base leading-tight text-neutral-900 focus:outline-none transition-all duration-200 placeholder:text-stone-400 dark:bg-[#1a1410] dark:text-stone-50 dark:placeholder:text-stone-500
                          ${validLast ? 'border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-emerald-500/50 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500' : 'border-stone-300 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:border-stone-600/50 dark:focus:ring-orange-500/20 dark:focus:border-orange-500'}
                          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        placeholder="Dela Cruz"
                        aria-invalid={errors.lastName ? 'true' : 'false'}
                        aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                      />
                      <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 transition-all duration-200 ease-out ${focusField==='lastName' && validLast ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    {errors.lastName && <p id="lastName-error" className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1 dark:text-red-400"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.lastName}</p>}
                  </div>
                </div>
                {/* Email + Password (side-by-side on md+) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide mb-2 break-words leading-tight">{t('register.email')}</label>
                    <div className="relative group">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocusField('email')}
                        onBlur={() => setFocusField(null)}
                        disabled={isLoading}
                        className={`peer block w-full rounded-lg border-2 bg-stone-50 pr-12 px-4 py-3 text-base leading-tight text-neutral-900 focus:outline-none transition-all duration-200 placeholder:text-stone-400 dark:bg-[#1a1410] dark:text-stone-50 dark:placeholder:text-stone-500
                          ${validEmail ? 'border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-emerald-500/50 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500' : 'border-stone-300 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:border-stone-600/50 dark:focus:ring-orange-500/20 dark:focus:border-orange-500'}
                          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        placeholder="your.email@company.com"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 transition-all duration-200 ease-out ${focusField==='email' && validEmail ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    {errors.email && <p id="email-error" className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1 dark:text-red-400"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.email}</p>}
                  </div>
                  {/* Password */}
                  <div className="relative">
                    <label htmlFor="password" className="flex items-center justify-between text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide mb-2 gap-2">
                      <span className="break-words leading-tight flex-1 min-w-0">{t('register.password')}</span>
                      {capsOn && (
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1 dark:text-amber-400">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                          </svg>
                          CAPS
                        </span>
                      )}
                    </label>
                    <div className="relative group">
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
                        className={`peer block w-full rounded-lg border-2 bg-stone-50 pr-12 px-4 py-3 text-base leading-tight text-neutral-900 focus:outline-none transition-all duration-200 placeholder:text-stone-400 dark:bg-[#1a1410] dark:text-stone-50 dark:placeholder:text-stone-500
                          ${validPassword ? 'border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-emerald-500/50 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500' : 'border-stone-300 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:border-stone-600/50 dark:focus:ring-orange-500/20 dark:focus:border-orange-500'}
                          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        placeholder="Min 8 characters"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 transition-all duration-200 ease-out ${focusField==='password' && validPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                    {errors.password && <p id="password-error" className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1 dark:text-red-400"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.password}</p>}
                  </div>
                </div>
                {/* Role + Branch (side-by-side on md+) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role */}
                  <div className="relative">
                    <label htmlFor="role" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide mb-2">{t('register.role')}</label>
                    <div className="relative group">
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
                        className={`w-full text-left rounded-lg border-2 bg-stone-50 pr-12 px-4 py-3 text-base leading-tight text-neutral-900 focus:outline-none transition-all duration-200 dark:bg-[#1a1410] dark:text-stone-50
                          ${validRole ? 'border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-emerald-500/50 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500' : 'border-stone-300 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:border-stone-600/50 dark:focus:ring-orange-500/20 dark:focus:border-orange-500'}
                          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        aria-haspopup="listbox"
                        aria-expanded={roleOpen}
                        aria-controls="role-listbox"
                        aria-invalid={errors.role ? 'true' : 'false'}
                        aria-describedby={errors.role ? 'role-error' : undefined}
                      >
                        <span className={`block truncate ${!role ? 'text-stone-400 dark:text-stone-500' : 'text-neutral-900 dark:text-stone-50'}`}>
                          {role || 'Select role...'}
                        </span>
                        {/* Chevron */}
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <svg className={`h-5 w-5 text-stone-500 dark:text-stone-400 transition-transform duration-200 ${roleOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden>
                            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                      {/* Success icon bubble when valid + focused */}
                      <div className={`pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 transition-all duration-200 ease-out ${focusField==='role' && validRole ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      {roleOpen && (
                        <ul
                          ref={roleListRef}
                          id="role-listbox"
                          role="listbox"
                          aria-labelledby="role"
                          className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-orange-200/50 bg-stone-50/95 backdrop-blur-sm shadow-xl focus:outline-none dark:border-stone-600/50 dark:bg-[#1a1410]/95"
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
                                className={`flex cursor-pointer items-center justify-between px-4 py-3 text-base transition-colors ${active ? 'bg-orange-50 dark:bg-orange-500/20' : ''} ${selected ? 'font-semibold text-orange-600 dark:text-orange-400' : 'text-stone-900 dark:text-stone-50'}`}
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
                                <span className="truncate">{r}</span>
                                {selected && (
                                  <svg viewBox="0 0 20 20" className="h-5 w-5 text-emerald-500" fill="none" aria-hidden>
                                    <path d="M6 10.5l2.25 2.25L14 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    {errors.role && <p id="role-error" className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1 dark:text-red-400"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.role}</p>}
                  </div>
                  {/* Branch combobox */}
                  <div className="relative">
                    <label htmlFor="branch" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide mb-2">
                      Branch {role === 'Staff' && <span className="text-xs text-orange-400 dark:text-orange-400">(Auto-filled)</span>}
                    </label>
                    <div className="mt-1 relative">
                      <button
                        ref={branchButtonRef}
                        id="branch"
                        type="button"
                        disabled={isLoading || role === 'Staff'}
                        onClick={() => {
                          const idx = Math.max(0, branches.findIndex(b => b.id === branchId));
                          setBranchHighlight(idx);
                          setBranchOpen(v => !v);
                          setFocusField('branch');
                        }}
                        onKeyDown={(e) => {
                          if (isLoading || role === 'Staff') return;
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (!branchOpen) {
                              const idx = Math.max(0, branches.findIndex(b => b.id === branchId));
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
                              const idx = Math.max(0, branches.findIndex(b => b.id === branchId));
                              setBranchHighlight(idx);
                              setBranchOpen(true);
                              setFocusField('branch');
                            } else {
                              const next = branches[branchHighlight];
                              if (next) {
                                setBranch(`${next.branchName} - ${next.location}`);
                                setBranchId(next.id);
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
                        className={`w-full text-left rounded-lg border bg-stone-50/95 pr-12 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-neutral-900 focus:outline-none transition dark:bg-[#1a1410]/60 dark:text-stone-50
                          ${validCashier ? 'border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-emerald-500/50 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500' : 'border-neutral-300 focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500 dark:border-stone-600/50 dark:focus:ring-orange-500/20 dark:focus:border-orange-500'}
                          ${isLoading || role === 'Staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        aria-haspopup="listbox"
                        aria-expanded={branchOpen}
                        aria-controls="branch-listbox"
                        aria-invalid={errors.branch ? 'true' : 'false'}
                        aria-describedby={errors.branch ? 'branch-error' : undefined}
                      >
                        <span className={`block truncate ${!branch ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-50'}`}>
                          {role !== 'Staff' && loadingBranches ? 'Loading branches...' : (branch || 'Select branch...')}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <svg className={`h-4 w-4 text-stone-400 dark:text-stone-400 transition-transform ${branchOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden>
                            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                      {/* Success icon bubble when valid + focused */}
                      <div className={`pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 transition-all duration-150 ease-out ${focusField==='branch' && validBranch ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-500" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      {branchOpen && (
                        <ul
                          ref={branchListRef}
                          id="branch-listbox"
                          role="listbox"
                          aria-labelledby="branch"
                          className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-stone-50/95 shadow-lg focus:outline-none dark:border-stone-600/50 dark:bg-[#1a1410]/95"
                        >
                          {branches.length === 0 ? (
                            <li className="px-3.5 py-2.5 text-[14px] text-stone-400 dark:text-stone-400 text-center">
                              {loadingBranches ? 'Loading...' : 'No branches available'}
                            </li>
                          ) : (
                          branches.map((b, i) => {
                            const active = i === branchHighlight;
                            const selected = b.id === branchId;
                            return (
                              <li
                                key={b.id}
                                id={`branch-option-${i}`}
                                role="option"
                                aria-selected={selected}
                                className={`flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-[14px] ${active ? 'bg-orange-900/30 dark:bg-neutral-800/60' : ''}`}
                                onMouseEnter={() => setBranchHighlight(i)}
                                onMouseDown={(e) => { e.preventDefault(); }}
                                onClick={() => {
                                  setBranch(`${b.branchName} - ${b.location}`);
                                  setBranchId(b.id);
                                  setBranchOpen(false);
                                  setFocusField(null);
                                }}
                              >
                                <span className="truncate text-stone-900 dark:text-stone-50">{b.branchName} - {b.location}</span>
                                {selected && (
                                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-emerald-500" fill="none" aria-hidden>
                                    <path d="M6 10.5l2.25 2.25L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </li>
                            );
                          })
                          )}
                        </ul>
                      )}
                    </div>
                    {errors.branch && <p id="branch-error" className="mt-1 text-[11px] text-red-400 dark:text-red-400">{errors.branch}</p>}
                  </div>
                </div>
                
                {/* Assigned Cashier - only shown when role is Staff */}
                {role === 'Staff' && (
                  <div className="relative">
                    <label htmlFor="assignedCashier" className="block text-[13px] font-medium text-stone-700 dark:text-stone-300 tracking-wide">Assigned Cashier</label>
                    <div className="mt-1 relative">
                      <button
                        ref={cashierButtonRef}
                        id="assignedCashier"
                        type="button"
                        disabled={isLoading || loadingCashiers}
                        onClick={() => {
                          const idx = Math.max(0, cashiers.findIndex(c => c.id === assignedCashierId));
                          setCashierHighlight(idx);
                          setCashierOpen(v => !v);
                          setFocusField('assignedCashier');
                        }}
                        onKeyDown={(e) => {
                          if (isLoading || loadingCashiers) return;
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (!cashierOpen) {
                              const idx = Math.max(0, cashiers.findIndex(c => c.id === assignedCashierId));
                              setCashierHighlight(idx);
                              setCashierOpen(true);
                              setFocusField('assignedCashier');
                              return;
                            }
                            setCashierHighlight((i) => {
                              if (e.key === 'ArrowDown') return Math.min(i + 1, cashiers.length - 1);
                              return Math.max(i - 1, 0);
                            });
                          } else if (e.key === 'Home') {
                            e.preventDefault();
                            setCashierHighlight(0);
                          } else if (e.key === 'End') {
                            e.preventDefault();
                            setCashierHighlight(cashiers.length - 1);
                          } else if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!cashierOpen) {
                              const idx = Math.max(0, cashiers.findIndex(c => c.id === assignedCashierId));
                              setCashierHighlight(idx);
                              setCashierOpen(true);
                              setFocusField('assignedCashier');
                            } else {
                              const next = cashiers[cashierHighlight];
                              if (next) {
                                setAssignedCashier(next.userName);
                                setAssignedCashierId(next.id);
                                setBranch(`${next.branchName} - ${next.location}`);
                                setBranchId(next.branchId);
                              }
                              setCashierOpen(false);
                              setFocusField(null);
                            }
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            setCashierOpen(false);
                            setFocusField(null);
                          }
                        }}
                        className={`w-full text-left rounded-lg border-2 bg-[#1a1410] pr-12 px-3.5 py-3 text-[15px] leading-tight tracking-tight text-stone-100 focus:outline-none transition dark:bg-[#1a1410] dark:text-stone-50
                          ${validBranch ? 'border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-emerald-500/50 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500' : 'border-stone-600/50 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:border-stone-600/50 dark:focus:ring-orange-500/20 dark:focus:border-orange-500'}
                          ${isLoading ? 'opacity-90' : ''}`}
                        aria-haspopup="listbox"
                        aria-expanded={cashierOpen}
                        aria-controls="cashier-listbox"
                        aria-invalid={errors.assignedCashier ? 'true' : 'false'}
                        aria-describedby={errors.assignedCashier ? 'cashier-error' : undefined}
                      >
                        <span className={`block truncate ${!assignedCashier ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-50'}`}>
                          {loadingCashiers ? 'Loading cashiers...' : (assignedCashier || 'Select cashier...')}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <svg className={`h-4 w-4 text-neutral-500 dark:text-stone-400 transition-transform ${cashierOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden>
                            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                      {/* Success icon bubble when valid + focused */}
                      <div className={`pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 transition-all duration-150 ease-out ${focusField==='assignedCashier' && validCashier ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-500" aria-hidden><path d="M7.75 10.75l2 2.5 3.75-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      {cashierOpen && (
                        <ul
                          ref={cashierListRef}
                          id="cashier-listbox"
                          role="listbox"
                          aria-labelledby="assignedCashier"
                          className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-stone-50/95 shadow-lg focus:outline-none dark:border-stone-600/50 dark:bg-[#1a1410]/90"
                        >
                          {cashiers.length === 0 ? (
                            <li className="px-3.5 py-2.5 text-[14px] text-stone-400 dark:text-stone-400 text-center">
                              {loadingCashiers ? 'Loading...' : 'No cashiers available'}
                            </li>
                          ) : (
                            cashiers.map((c, i) => {
                            const active = i === cashierHighlight;
                            const selected = c.id === assignedCashierId;
                            return (
                              <li
                                key={c.id}
                                id={`cashier-option-${i}`}
                                role="option"
                                aria-selected={selected}
                                className={`flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-[14px] ${active ? 'bg-neutral-100 dark:bg-orange-500/20' : ''}`}
                                onMouseEnter={() => setCashierHighlight(i)}
                                onMouseDown={(e) => { e.preventDefault(); }}
                                onClick={() => {
                                  setAssignedCashier(c.userName);
                                  setAssignedCashierId(c.id);
                                  setBranch(`${c.branchName} - ${c.location}`);
                                  setBranchId(c.branchId);
                                  setCashierOpen(false);
                                  setFocusField(null);
                                }}
                              >
                                <span className="truncate text-stone-900 dark:text-stone-50">{c.userName}</span>
                                {selected && (
                                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-emerald-500" fill="none" aria-hidden>
                                    <path d="M6 10.5l2.25 2.25L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </li>
                            );
                          })
                          )}
                        </ul>
                      )}
                    </div>
                    {errors.assignedCashier && <p id="cashier-error" className="mt-1 text-[11px] text-red-400 dark:text-red-400">{errors.assignedCashier}</p>}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                <span className="text-xs text-stone-600 dark:text-stone-400 leading-none font-medium order-2 sm:order-1">All fields required except middle name</span>
                <span className="text-xs text-stone-500 dark:text-stone-500 leading-none font-medium order-1 sm:order-2">v1.0.0</span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative inline-flex justify-center items-center gap-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white text-base font-bold py-4 tracking-wide shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[.98] focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-lg overflow-hidden dark:from-orange-700 dark:to-amber-700 dark:shadow-orange-900/30 dark:hover:shadow-orange-900/40 dark:focus:ring-orange-400/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" aria-hidden="true"></div>
                {isLoading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    <span className="break-words leading-tight">{t('register.creating')}</span>
                  </>
                ) : (
                  <>
                    <span className="break-words leading-tight">{t('register.createAccount')}</span>
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
            
            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200/80 dark:border-stone-700/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/70 px-4 text-sm font-medium text-stone-400 dark:bg-neutral-800 dark:text-stone-400">
                  {t('register.haveAccount')}
                </span>
              </div>
            </div>
            
            {/* Sign in Link */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-600 font-medium text-sm hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="break-words leading-tight">{t('register.signIn')}</span>
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

export default Register;
