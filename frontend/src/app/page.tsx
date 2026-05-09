import Link from "next/link";
import {
  Cpu,
  Scan,
  ClipboardList,
  History,
  BarChart3,
  Shield,
  Wrench,
  ArrowRight,
  CircuitBoard,
  Cable,
  HardDrive,
  Boxes,
} from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Component Registry",
    description: "Every electrical unit gets a unique tracking code. CAN IDs, firmware versions, fault flags — all structured, all searchable.",
  },
  {
    icon: Scan,
    title: "Dynamic Schemas",
    description: "Define your own component types. Falcon 500s, SPARK MAXes, NavX — model each category with exactly the fields your team needs.",
  },
  {
    icon: ClipboardList,
    title: "Inventory Control",
    description: "Full overview with filters by type, status, or free-text search. Sortable, paginated, always up to date.",
  },
  {
    icon: History,
    title: "Audit Trail",
    description: "Every change logged with timestamp and attribution. Who changed what, when — no more guessing.",
  },
  {
    icon: BarChart3,
    title: "Status Lifecycle",
    description: "Available, in-use, loaned, maintenance, decommissioned. Track where every component is, right now.",
  },
  {
    icon: Shield,
    title: "Team Access",
    description: "Role-based permissions with JWT auth. Admins manage accounts; members register and update components.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Persistent noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.015] mix-blend-overlay">
        <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIuNzUiIG51bU9jdGF2ZXM9IjQiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] bg-repeat" />
      </div>

      {/* Scan-line effect */}
      <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.03]">
        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,black_2px,black_3px)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#201658]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md border border-[#98abee]/30 bg-[#98abee]/10">
              <Wrench className="size-3.5 text-[#98abee]" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-[#f9e8c9]">ROOKIES</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-xs tracking-wider text-[#98abee]/70 transition-colors hover:text-[#98abee] uppercase">
              Capabilities
            </Link>
            <Link href="#how-it-works" className="text-xs tracking-wider text-[#98abee]/70 transition-colors hover:text-[#98abee] uppercase">
              Workflow
            </Link>
            <Link href="/login" className="text-xs tracking-wider text-[#98abee]/70 transition-colors hover:text-[#98abee] uppercase">
              Sign in
            </Link>
            <Link
              href="/activate"
              className="inline-flex h-8 items-center justify-center rounded-md border border-[#98abee]/20 bg-[#98abee]/10 px-3.5 text-xs font-medium tracking-wider text-[#98abee] transition-all hover:bg-[#98abee]/20 uppercase"
            >
              Activate
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(152,171,238,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(152,171,238,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[#1d24ca]/8 blur-[120px]" />
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-[#98abee]/5 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: text */}
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#98abee]/15 bg-[#98abee]/8 px-3.5 py-1">
                <CircuitBoard className="size-3 text-[#98abee]" />
                <span className="text-[11px] font-medium tracking-widest text-[#98abee]/80 uppercase">FRC Component Registry</span>
              </div>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-[#f9e8c9] sm:text-5xl lg:text-6xl">
                Know every
                <span className="block text-[#98abee]">component</span>
                on your robot.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#98abee]/60 sm:text-base">
                Rookies is an internal team tool for registering, tracking, and diagnosing
                electrical components on FRC robots. Define custom component types with
                tailored diagnostic forms, generate unique tracking codes, and maintain a
                full audit history — all accessible by any team member.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#98abee] px-5 text-sm font-medium text-[#201658] transition-all hover:bg-[#98abee]/90"
                >
                  Sign in
                  <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-medium text-[#98abee] transition-all hover:bg-white/10"
                >
                  Explore
                </Link>
              </div>
            </div>

            {/* Right: visual */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-square">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border border-[#98abee]/10" />
                <div className="absolute inset-[12%] rounded-full border border-[#98abee]/8" />
                <div className="absolute inset-[24%] rounded-full border border-[#98abee]/6" />

                {/* Center icon cluster */}
                <div className="absolute inset-[30%] flex items-center justify-center">
                  <div className="relative flex size-full items-center justify-center">
                    <div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-[#98abee]/15" />
                    <div className="flex flex-col items-center gap-1">
                      <Cpu className="size-8 text-[#98abee]" />
                      <span className="text-[10px] font-mono tracking-widest text-[#98abee]/40">SYS::CORE</span>
                    </div>
                  </div>
                </div>

                {/* Orbiting elements */}
                <div className="absolute inset-0 animate-[spin_30s_linear_infinite]">
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-[#98abee]/15 bg-[#201658] text-[#98abee]">
                      <Cable className="size-4" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 animate-[spin_25s_linear_infinite_reverse]">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-[#98abee]/15 bg-[#201658] text-[#98abee]">
                      <HardDrive className="size-4" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 animate-[spin_35s_linear_infinite]">
                  <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-[#98abee]/15 bg-[#201658] text-[#98abee]">
                      <Boxes className="size-4" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 animate-[spin_40s_linear_infinite_reverse]">
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-[#98abee]/15 bg-[#201658] text-[#98abee]">
                      <Wrench className="size-4" />
                    </div>
                  </div>
                </div>

                {/* Scan line across center */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#98abee]/20 to-transparent" />
                <div className="absolute left-0 right-0 top-1/2 mt-4 h-px bg-gradient-to-r from-transparent via-[#98abee]/8 to-transparent" />
              </div>
            </div>
          </div>

          {/* Bottom metrics bar */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/5 bg-white/5 sm:grid-cols-4">
            {[
              { label: "Component Types", value: "Unlimited" },
              { label: "Tracking Granularity", value: "Per Unit" },
              { label: "Audit Depth", value: "Full History" },
              { label: "Purpose", value: "FRC Teams" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#201658] px-5 py-4 sm:px-6 sm:py-5">
                <div className="text-lg font-bold tracking-tight text-[#f9e8c9] sm:text-xl">{stat.value}</div>
                <div className="mt-0.5 text-[11px] tracking-wider text-[#98abee]/50 uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative border-b border-white/5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-[#1d24ca]/5 blur-[150px]" />
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-medium tracking-[0.2em] text-[#98abee]/50 uppercase">Capabilities</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#f9e8c9] sm:text-4xl">
              Everything you need to track electrical components.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#98abee]/50">
              From registration to decommissioning, Rookies gives your team full visibility
              into every component on the robot. No more lost parts or forgotten diagnoses.
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-[#201658] p-6 transition-all hover:bg-[#1d1550] sm:p-8"
              >
                <div className="flex size-9 items-center justify-center rounded-lg border border-[#98abee]/10 bg-[#98abee]/5 text-[#98abee] transition-colors group-hover:bg-[#98abee]/10">
                  <feature.icon className="size-4" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#f9e8c9]">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#98abee]/50">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative border-b border-white/5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-[#98abee]/5 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-medium tracking-[0.2em] text-[#98abee]/50 uppercase">Workflow</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#f9e8c9] sm:text-4xl">
              Three steps to full traceability.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                number: "01",
                label: "DEFINE",
                title: "Create component types",
                description:
                  "Build schemas for each component category — Falcon 500s, SPARK MAXes, NavX. Add the fields your team cares about: CAN IDs, firmware versions, fault flags, peak currents.",
              },
              {
                number: "02",
                label: "REGISTER",
                title: "Log each physical unit",
                description:
                  "Fill out the dynamic form for every component. On submit, a unique tracking code is generated — formatted as TYPE-YEAR-SEQUENCE — and the component enters your inventory.",
              },
              {
                number: "03",
                label: "TRACK",
                title: "Diagnose & update",
                description:
                  "Change status, log diagnostic data, attach tool output files, add notes. Every mutation is timestamped and attributed. Full history, always accessible.",
              },
            ].map((step) => (
              <div key={step.number} className="group relative rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-bold tracking-tight text-[#98abee]/30">{step.number}</span>
                  <span className="text-[10px] font-medium tracking-[0.15em] text-[#98abee]/40">{step.label}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#f9e8c9]">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#98abee]/50">{step.description}</p>
                <div className="mt-4 h-px w-8 bg-[#98abee]/10 transition-all group-hover:w-12 group-hover:bg-[#98abee]/30" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1d24ca]/8 blur-[150px]" />
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-xl border border-[#98abee]/10 bg-gradient-to-br from-[#1d1550] via-[#201658] to-[#1a1250] px-6 py-14 sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -right-20 -top-20 size-72 rounded-full bg-[#98abee]/5 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-[#1d24ca]/8 blur-[80px]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(152,171,238,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(152,171,238,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
            </div>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#f9e8c9] sm:text-4xl">
                Ready to organize your electrical inventory?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#98abee]/60">
                Sign in to get started. If you&apos;re new, ask an admin on your team
                to create your account — then use the activation token to set your password.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#98abee] px-5 text-sm font-medium text-[#201658] transition-all hover:bg-[#98abee]/90"
                >
                  Sign in
                  <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/activate"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-medium text-[#98abee] transition-all hover:bg-white/10"
                >
                  Activate account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-[#98abee]/40">
            <Wrench className="size-3" />
            <span>ROOKIES — FRC Component Registry</span>
          </div>
          <p className="text-xs text-[#98abee]/30">
            Built for FIRST Robotics Competition teams
          </p>
        </div>
      </footer>
    </div>
  );
}
