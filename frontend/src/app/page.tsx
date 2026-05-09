import Link from "next/link";
import {
  Cpu,
  Scan,
  ClipboardList,
  History,
  Users,
  ArrowRight,
  Wrench,
  BarChart3,
  Shield,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Component Registry",
    description:
      "Register every electrical component on your robot with detailed diagnostic data. Each unit gets a unique tracking code.",
  },
  {
    icon: Scan,
    title: "Dynamic Forms",
    description:
      "Define custom component types with flexible schemas. Falcon 500s, SPARK MAXes, NavX — model them all your way.",
  },
  {
    icon: ClipboardList,
    title: "Inventory View",
    description:
      "See everything at a glance. Filter by type, status, or search across codes and notes. Paginated and sortable.",
  },
  {
    icon: History,
    title: "Full History Log",
    description:
      "Every status change, diagnostic update, and note edit is timestamped and attributed. Complete traceability.",
  },
  {
    icon: BarChart3,
    title: "Status Lifecycle",
    description:
      "Track components through available, in-use, loaned, maintenance, and decommissioned states with loan tracking.",
  },
  {
    icon: Shield,
    title: "Team Access Control",
    description:
      "Role-based permissions for members and admins. Secure JWT authentication with admin-managed accounts.",
  },
];

const stats = [
  { label: "Component Types", value: "Unlimited" },
  { label: "Tracking Precision", value: "Per-Unit" },
  { label: "History Depth", value: "Full Audit" },
  { label: "Built For", value: "FRC Teams" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Rookies</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/activate"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              Activate account
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d24ca08_1px,transparent_1px),linear-gradient(to_bottom,#1d24ca08_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className=" aspect-square w-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Cpu className="size-3.5" />
              Built for FIRST Robotics Competition teams
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Component registry for{" "}
              <span className="text-primary">competitive robots</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Register, track, and diagnose every electrical component on your
              FRC robot. Define your own component types with custom diagnostic
              forms, generate unique tracking codes, and maintain a full audit
              history — all in one place.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              >
                Sign in
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted"
              >
                Explore features
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/40 bg-border/40 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-background p-6 text-center sm:p-8"
              >
                <div className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-border/40 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to track components
            </h2>
            <p className="mt-4 text-muted-foreground">
              From registration to decommissioning, Rookies gives your team full
              visibility into every electrical component.
            </p>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border/40 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-background p-8 transition-colors hover:bg-muted/30"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-5 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-border/40 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-muted-foreground">
              A simple workflow that fits into your team&apos;s pit routine.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Define types",
                description:
                  "Create component type schemas with the fields your team needs — CAN IDs, firmware versions, fault flags, and more.",
              },
              {
                step: "02",
                title: "Register components",
                description:
                  "Fill out the dynamic form for each physical unit. A unique tracking code is generated automatically.",
              },
              {
                step: "03",
                title: "Track & diagnose",
                description:
                  "Update status, log diagnostic data, attach files, and view the full change history at any time.",
              },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {step.step}
                </div>
                {i < 2 && (
                  <div className="absolute left-6 top-12 hidden h-8 w-px bg-gradient-to-b from-primary/30 to-transparent sm:block" />
                )}
                <h3 className="mt-5 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/40 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 sm:px-16 sm:py-24">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary-foreground/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-primary-foreground/5 blur-3xl" />
            </div>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to organize your team&apos;s components?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Get started by signing in or activating your account. If
                you&apos;re new, ask an admin to create your account.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-background/90"
                >
                  Sign in
                  <ChevronRight className="size-4" />
                </Link>
                <Link
                  href="/activate"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-primary-foreground/20 px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-foreground/10"
                >
                  Activate account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="size-4" />
            <span>Rookies — FRC Component Registry</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for FIRST Robotics Competition teams
          </p>
        </div>
      </footer>
    </div>
  );
}
