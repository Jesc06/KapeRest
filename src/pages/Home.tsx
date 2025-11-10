import React from "react";
import { Link } from "react-router-dom";
import TintedBackdrop from "../Components/TintedBackdrop";

const heroHighlights = [
  "Inventory management with real-time stock depletion",
  "Multi-branch POS syncing even when offline",
  "Multi-branch sales detection with instant alerts",
  "AI-based sales analysis to predict demand",
  "Automated daily, weekly, and monthly reports",
  "GCash and QR payments ready across branches",
];

const heroFeatureBlocks = [
  {
    title: "Inventory snapshots",
    description: "View par levels and low-stock alerts per branch at a glance.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 8h18" />
        <path d="M8 8v13" />
      </svg>
    ),
  },
  {
    title: "Branch sync",
    description: "Push menus, promos, and pricing updates to every POS instantly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <circle cx="12" cy="12" r="7" />
        <path d="M12 5v3" />
        <path d="M12 16v3" />
        <path d="M5 12h3" />
        <path d="M16 12h3" />
      </svg>
    ),
  },
  {
    title: "AI insights",
    description: "Detect void spikes and predict demand before peak hours hit.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M12 3a6 6 0 00-6 6v2.5a3.5 3.5 0 000 7h6" />
        <path d="M12 3a6 6 0 016 6v2.5a3.5 3.5 0 010 7h-6" />
        <path d="M9.5 12h5" />
      </svg>
    ),
  },
  {
    title: "Automated reports",
    description: "Schedule daily, weekly, and monthly email summaries without manual exports.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
      </svg>
    ),
  },
];

const featureCards = [
  {
    title: "Inventory Management",
    summary: "Track stock from HQ to branch storage with recipe-level deductions and prep batch tracking.",
    points: [
      "Set par levels per branch and trigger auto-reorder suggestions.",
      "Monitor pearl, syrup, and cup usage against sales in real time.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <path d="M13 15h6" />
        <path d="M13 19h6" />
      </svg>
    ),
  },
  {
    title: "Multi-Branch POS",
    summary: "Roll out one POS brain to every Philippine branch while keeping HQ visibility crystal clear.",
    points: [
      "Clone branch layouts, menus, and pricing in minutes for nationwide launches.",
      "Offline caching keeps queues moving from Luzon to Mindanao during internet drops.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="2.5" y="4" width="6.5" height="6.5" rx="1.3" />
        <rect x="8.75" y="4" width="6.5" height="6.5" rx="1.3" />
        <rect x="5.5" y="10.5" width="6.5" height="6.5" rx="1.3" />
        <path d="M15.5 12h4.5" />
        <path d="M17.75 12v7.5" />
        <circle cx="17.75" cy="19.5" r="1.6" />
      </svg>
    ),
  },
  {
    title: "Multi-Branch Sales Detection",
    summary: "Track nationwide sales trends and branch performance without hopping between systems.",
    points: [
      "Real-time variance alerts catch voids, discounts, and refunds per city or franchise.",
      "Cross-branch sales heatmaps highlight underperforming stores across the Philippines.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M3 20h18" />
        <path d="M6 16l4-6 4 3 4-6" />
        <circle cx="6" cy="16" r="1.2" />
        <circle cx="10" cy="10" r="1.2" />
        <circle cx="14" cy="13" r="1.2" />
        <circle cx="18" cy="7" r="1.2" />
      </svg>
    ),
  },
  {
    title: "AI Sales Analysis",
    summary: "Predict tomorrow's rush, top flavors, and crew requirements with AI.",
    points: [
      "Machine learning forecasts demand per branch and daypart.",
      "Suggests staffing and prep adjustments before peak hours.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M12 3a6 6 0 00-6 6v2.5a3.5 3.5 0 000 7h6" />
        <path d="M12 3a6 6 0 016 6v2.5a3.5 3.5 0 010 7h-6" />
        <path d="M9.5 12h5" />
        <path d="M9 16h6" />
      </svg>
    ),
  },
  {
    title: "Automated Reports",
    summary: "Send daily, weekly, and monthly packs automatically to owners and managers.",
    points: [
      "Deliver PDF, spreadsheet, and raw CSV snapshots on schedule.",
      "Attach branch scorecards with payment mix and labor costs.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
      </svg>
    ),
  },
  {
    title: "GCash Integration",
    summary: "Accept GCash and QR payments in seconds and reconcile without spreadsheets.",
    points: [
      "Match QR settlements to shifts and cut-offs automatically.",
      "Display cash vs digital mix inside every dashboard tile.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 10h3" />
        <path d="M7 14h10" />
        <path d="M17 10h1" />
      </svg>
    ),
  },
];

const branchHighlights = [
  {
    title: "Spot branch outliers",
    description: "AI flags unusual voids, discounts, and refunds so you can coach teams quickly.",
  },
  {
    title: "Match stock to sales",
    description: "Compare recipe ingredient usage against actual sales without switching tools.",
  },
  {
    title: "Stay report-ready",
    description: "Download aligned branch summaries in one click or let emails send automatically.",
  },
  {
    title: "Simplify reconciliations",
    description: "Check cash vs GCash settlements per shift without juggling spreadsheets.",
  },
];

const Home: React.FC = () => {
  return (
    <div className="relative min-h-[100dvh] text-neutral-800 transition-colors duration-300 dark:text-neutral-200">
      <TintedBackdrop />
      {/* translucent white overlay (kept for structure; homepage uses a yellow tint via the hero card accents) */}
      <div aria-hidden className="absolute inset-0 z-0 bg-stone-50/90 backdrop-blur-xl dark:bg-neutral-900/60 pointer-events-none" />
  <main className="mx-auto relative z-10 flex w-full max-w-7xl flex-col gap-0 px-4 sm:px-6 lg:px-8">
        <section className="milk-hero relative flex min-h-[calc(100vh-6rem)] items-center justify-center py-12 sm:py-16 lg:py-20">
          <div className="w-full overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 px-6 py-12 shadow-xl backdrop-blur-lg transition-colors duration-300 sm:px-8 sm:py-14 lg:px-12 lg:py-16 dark:border-neutral-800/60 dark:bg-neutral-900/75 dark:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.85)]">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div className="space-y-8 flex flex-col justify-center">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/60 bg-amber-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-amber-700 transition-colors duration-300 dark:border-neutral-700/70 dark:bg-neutral-800/70 dark:text-amber-300">
                  POS for Coffee & Milk Tea
                </span>
                <div className="space-y-5">
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-100">
                    Align every branch with one POS dashboard
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-300">
                    KapeRest centralizes ordering, payments, and inventory so franchise owners see the full picture in seconds—from Metro Manila flagships to provincial kiosks. Launch new stores faster while keeping quality and cash control on track.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-neutral-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:ring-offset-white dark:bg-amber-400 dark:text-neutral-900 dark:hover:bg-amber-300 dark:focus:ring-amber-300 dark:focus:ring-offset-neutral-900"
                  >
                    Get started
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-amber-300/50 bg-amber-100/40 px-8 py-3.5 text-sm font-semibold text-amber-800 shadow-sm transition duration-200 hover:bg-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-white dark:border-amber-300/40 dark:bg-neutral-900/50 dark:text-amber-200 dark:hover:bg-neutral-900/30 dark:focus:ring-amber-200 dark:focus:ring-offset-neutral-900"
                  >
                    Sign in
                  </Link>
                </div>
                <ul className="mt-6 grid gap-3 text-xs sm:text-sm text-neutral-600 sm:grid-cols-2 dark:text-neutral-300">
                  {heroHighlights.map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-neutral-800 dark:text-amber-300">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                          <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-5 lg:pl-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {heroFeatureBlocks.map(feature => (
                    <article
                      key={feature.title}
                      className="group rounded-2xl border border-amber-200/50 bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-amber-200 hover:bg-white/80 hover:shadow-md sm:p-5 dark:border-neutral-800/50 dark:bg-neutral-900/40 dark:hover:border-neutral-800 dark:hover:bg-neutral-900/60"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-100 text-amber-600 transition-colors duration-200 group-hover:border-amber-300 group-hover:bg-amber-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-amber-200 dark:group-hover:border-amber-300/60">
                        {feature.icon}
                      </span>
                      <p className="mt-3 text-sm font-semibold text-neutral-900 group-hover:text-neutral-800 dark:text-neutral-100 dark:group-hover:text-neutral-50">{feature.title}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 group-hover:text-neutral-700 dark:text-neutral-300 dark:group-hover:text-neutral-200">{feature.description}</p>
                    </article>
                  ))}
                </div>
                <div className="rounded-2xl border border-amber-300/50 bg-amber-100/50 p-4 text-xs leading-relaxed text-amber-900 transition-colors duration-300 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100">
                  <p className="font-semibold mb-2">✨ Key Features</p>
                  Bring inventory, multi-branch POS, AI analysis, automated reports, and GCash integration to your operations.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-32 py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center space-y-3 mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-100">
              Designed for café teams that live on data
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-300">
              KapeRest keeps operations calm with dashboards built for franchise owners, operations leads, and store crews.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map(feature => (
                  <article
                key={feature.title}
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md sm:p-6 dark:border-neutral-800/60 dark:bg-neutral-900/70 dark:hover:border-neutral-700/80 dark:hover:bg-neutral-900/60 dark:hover:shadow-lg"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-100 text-amber-600 shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:border-amber-300 group-hover:bg-amber-200 group-hover:text-amber-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-amber-200 dark:group-hover:border-amber-300/60 dark:group-hover:bg-neutral-700 dark:group-hover:text-amber-200">
                    {feature.icon}
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-neutral-900 transition duration-200 group-hover:text-neutral-800 dark:text-neutral-100 dark:group-hover:text-neutral-50">{feature.title}</h3>
                    <p className="text-sm text-neutral-600 transition duration-200 group-hover:text-neutral-700 dark:text-neutral-300 dark:group-hover:text-neutral-200">{feature.summary}</p>
                  </div>
                  <ul className="mt-auto space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                    {feature.points.map(point => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400/80 dark:bg-amber-300" aria-hidden />
                        <span className="leading-snug">{point}</span>
                      </li>
                    ))}
                  </ul>
              </article>
            ))}
          </div>
        </section>
        <section id="about" className="scroll-mt-32 py-16 sm:py-20 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-100">
                Quiet clarity for branch operators
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-300">
                Keep every café in rhythm without living in spreadsheets. KapeRest consolidates POS activity, stock usage, and payments in a single, calm workspace.
              </p>
              <ul className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-neutral-800 dark:text-amber-300">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="leading-relaxed">Real-time variance alerts surface void spikes and unusual discounts immediately.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-neutral-800 dark:text-amber-300">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M4 10h12M10 4v12" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="leading-relaxed">Branch scorecards benchmark crew performance and highlight top sellers every week.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-neutral-800 dark:text-amber-300">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M5 15l4-4 3 3 3-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="leading-relaxed">Ingredient usage, prep batches, and cash reconciliation live side by side.</span>
                </li>
              </ul>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {branchHighlights.map(highlight => (
                <article
                  key={highlight.title}
                  className="group rounded-2xl border border-neutral-200/70 bg-white/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-900/70 dark:hover:shadow-lg"
                >
                  <p className="text-sm font-semibold text-neutral-900 group-hover:text-neutral-800 dark:text-neutral-100 dark:group-hover:text-neutral-50">{highlight.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 group-hover:text-neutral-700 dark:text-neutral-300 dark:group-hover:text-neutral-200">{highlight.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-32 py-16 sm:py-20 lg:py-28">
          <div className="mx-auto flex max-w-5xl flex-col gap-10 rounded-3xl border border-neutral-200/70 bg-white/80 p-8 shadow-lg transition-colors duration-300 sm:gap-12 sm:p-10 lg:flex-row lg:items-center dark:border-neutral-800/60 dark:bg-neutral-900/70 dark:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.85)]">
            <div className="flex-1 space-y-5">
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">Ready for a calmer café rollout?</h2>
              <p className="text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-300">
                Our team guides menu migration, payment setup, and branch training so you can focus on customer experience.
              </p>
              <Link
                to="/register"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:ring-offset-white dark:bg-amber-400 dark:text-neutral-900 dark:hover:bg-amber-300 dark:focus:ring-amber-300 dark:focus:ring-offset-neutral-900"
              >
                Book a walkthrough
              </Link>
            </div>
            <div className="flex-1 space-y-6 border-t lg:border-l lg:border-t-0 pt-8 lg:pt-0 lg:pl-10 border-neutral-200/70 dark:border-neutral-800/70">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Email</p>
                <p className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">hello@kaperest.io</p>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Send us your current branch setup—we'll map the rollout within a day.</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Support line</p>
                <p className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">+63 917 000 1234</p>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Weekdays 9 AM–6 PM for deployment planning and support.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="mt-16 border-t border-neutral-200/70 bg-white/80 backdrop-blur-lg transition-colors duration-300 sm:mt-20 dark:border-neutral-800/70 dark:bg-neutral-900/80">
              <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div className="max-w-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700 dark:text-amber-300">KapeRest</span>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                A milk tea POS crafted for teams that scale fast. Keep every branch aligned, settled, and ready for the next rush.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm text-neutral-600 sm:grid-cols-3 dark:text-neutral-300">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Product</p>
                <ul className="mt-3 space-y-2">
                  <li><a href="#features" className="transition-colors duration-200 hover:text-amber-600 dark:hover:text-amber-300">Features</a></li>
                  <li><a href="#about" className="transition-colors duration-200 hover:text-amber-600 dark:hover:text-amber-300">Why KapeRest</a></li>
                  <li><Link to="/register" className="transition-colors duration-200 hover:text-amber-600 dark:hover:text-amber-300">Request a Demo</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Support</p>
                <ul className="mt-3 space-y-2">
                  <li><a href="#contact" className="transition-colors duration-200 hover:text-amber-600 dark:hover:text-amber-300">Contact</a></li>
                  <li><a href="#contact" className="transition-colors duration-200 hover:text-amber-600 dark:hover:text-amber-300">Onboarding</a></li>
                  <li><a href="#contact" className="transition-colors duration-200 hover:text-amber-600 dark:hover:text-amber-300">Knowledge Base</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Development Team</p>
                <ul className="mt-3 space-y-2">
                  <li className="dark:text-neutral-300">John Joshua Manalo Escarez</li>
                  <li className="dark:text-neutral-300">CJ Royo Mendoza</li>
                  <li className="dark:text-neutral-300">Lhey Anne Inao Pedernal</li>
                  <li className="dark:text-neutral-300">Jaira Gomez Cunanan</li>
                </ul>
              </div>
            </div>
          </div>
                  <div className="mt-10 flex flex-col gap-4 border-t border-amber-200/70 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800/70 dark:text-neutral-400">
            <p>© {new Date().getFullYear()} KapeRest Milk Tea POS. All rights reserved.</p>
            <div className="flex items-center gap-4">
                      <a href="#" className="transition-colors duration-200 hover:text-amber-600 dark:hover:text-amber-300">Privacy</a>
                      <a href="#" className="transition-colors duration-200 hover:text-amber-600 dark:hover:text-amber-300">Terms</a>
                      <Link to="/login" className="transition-colors duration-200 hover:text-amber-600 dark:hover:text-amber-300">Admin Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
