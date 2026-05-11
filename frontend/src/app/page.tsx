import Link from "next/link";
import {
  Wrench,
  ArrowRight,
  ClipboardCheck,
  Package,
  Tag,
  Users,
  FileText,
  Settings,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

const sections = [
  {
    id: "what-is",
    title: "What is Rookies?",
    icon: HelpCircle,
    description:
      "Rookies is a tool for your FRC team to keep track of every electrical component on your robot. Think of it as a digital inventory where every motor, controller, and sensor gets its own ID card with all the important details — CAN IDs, firmware versions, diagnostic results, and who last touched it.",
  },
  {
    id: "workflow",
    title: "How it works",
    icon: ClipboardCheck,
    description:
      "The system follows three simple steps. First, your team defines what types of components exist (like 'Falcon 500 Motor' or 'SPARK MAX Controller') with the specific fields you want to track. Second, when you get a new component, you register it through a form based on its type, and the system gives it a unique code. Third, anyone on the team can update that component's status, add notes, or record new diagnostic information — everything is logged.",
  },
  {
    id: "getting-started",
    title: "Getting started",
    icon: Package,
    description:
      "Before you can use Rookies, an admin on your team needs to create your account. They'll give you a one-time activation token. Use that token to set your password, then log in with your username. Once inside, you can see the inventory, register new components, and update existing ones. If you're an admin, you can also manage team accounts and create new component types.",
  },
  {
    id: "component-codes",
    title: "Understanding component codes",
    icon: Tag,
    description:
      "Every component gets a unique code that looks like 'falcon500-2025-001'. The first part comes from the component type (trimmed to 10 characters), the second part is the current year, and the third part is a sequential number that resets each year. This makes it easy to identify a specific physical unit at a glance.",
  },
  {
    id: "statuses",
    title: "Component statuses",
    icon: FileText,
    description:
      "Each component has a status that tells you where it is. 'Available' means it's in the inventory ready to use. 'In use' means it's currently on the robot or test bench. 'Loaned' means it's been lent to someone — you'll see who has it and when it's due back. 'Under maintenance' means it's being worked on. 'Decommissioned' means it's retired from service.",
  },
  {
    id: "account-roles",
    title: "Accounts and roles",
    icon: Users,
    description:
      "There are two types of accounts: members and admins. Every team member can view the inventory, register components, and update information. Admins can additionally create team accounts, manage component types, and handle account activations. Your admin will set up your account the first time — there's no public sign-up.",
  },
  {
    id: "component-types",
    title: "Creating component types",
    icon: Settings,
    description:
      "Component types define what kind of electrical parts exist in your inventory and what information you want to track for each one. For example, a 'Falcon 500 Motor' type might have fields for CAN device ID, firmware version, peak current, and fault flags. You can create and edit component types through the types section — just add the fields you need and save.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#201658]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md border border-[#98abee]/30 bg-[#98abee]/10">
              <Wrench className="size-3.5 text-[#98abee]" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-[#f9e8c9]">
              ROOKIES
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="#what-is"
              className="text-xs tracking-wider text-[#98abee]/70 transition-colors hover:text-[#98abee] uppercase"
            >
              Guide
            </Link>
            <Link
              href="/login"
              className="text-xs tracking-wider text-[#98abee]/70 transition-colors hover:text-[#98abee] uppercase"
            >
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
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[#1d24ca]/8 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#98abee]/15 bg-[#98abee]/8 px-3.5 py-1">
              <Wrench className="size-3 text-[#98abee]" />
              <span className="text-[11px] font-medium tracking-widest text-[#98abee]/80 uppercase">
                FRC Team Inventory Guide
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#f9e8c9] sm:text-4xl lg:text-5xl">
              Track every electrical component on your robot.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#98abee]/60 sm:text-lg">
              A simple guide to understanding how your team can register,
              track, and maintain a complete history of all motors, controllers,
              and sensors on your FRC robot.
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
                href="#what-is"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-medium text-[#98abee] transition-all hover:bg-white/10"
              >
                Read the guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Guide sections */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <div className="grid gap-12">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="group relative scroll-mt-20"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex shrink-0">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-[#98abee]/15 bg-[#98abee]/5 text-[#98abee] sm:size-12">
                      <section.icon className="size-4 sm:size-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#98abee]/40">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-lg font-semibold text-[#f9e8c9] sm:text-xl">
                        {section.title}
                      </h2>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#98abee]/70 sm:text-base">
                      {section.description}
                    </p>
                    {section.id === "getting-started" && (
                      <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.02] p-4 sm:p-5">
                        <h3 className="text-sm font-medium text-[#f9e8c9]">
                          Quick walkthrough:
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm text-[#98abee]/60">
                          <li className="flex items-start gap-2">
                            <ChevronRight className="mt-0.5 size-3 shrink-0 text-[#98abee]/40" />
                            <span>
                              Your admin creates your account and gives you an
                              activation token
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="mt-0.5 size-3 shrink-0 text-[#98abee]/40" />
                            <span>
                              Go to the activate page, enter your username and
                              token, set a password
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="mt-0.5 size-3 shrink-0 text-[#98abee]/40" />
                            <span>
                              Log in and start exploring — check the inventory
                              or register a new component
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}
                    {section.id === "component-codes" && (
                      <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.02] p-4 sm:p-5">
                        <h3 className="text-sm font-medium text-[#f9e8c9]">
                          Code examples:
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {[
                            "falcon500-2025-001",
                            "sparkmax-2025-014",
                            "navx-2025-003",
                          ].map((code) => (
                            <code
                              key={code}
                              className="rounded bg-[#98abee]/10 px-2.5 py-1 text-xs font-mono text-[#98abee]"
                            >
                              {code}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                    {section.id === "statuses" && (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {[
                          {
                            status: "Available",
                            desc: "Ready to use, sitting in inventory",
                          },
                          {
                            status: "In use",
                            desc: "Currently on the robot or test bench",
                          },
                          {
                            status: "Loaned",
                            desc: "Lent to someone — check loan details",
                          },
                          {
                            status: "Maintenance",
                            desc: "Being repaired or re-diagnosed",
                          },
                          {
                            status: "Decommissioned",
                            desc: "Retired — no longer in active service",
                          },
                        ].map((item) => (
                          <div
                            key={item.status}
                            className="flex items-start gap-2 rounded border border-white/5 bg-white/[0.02] p-2.5"
                          >
                            <div className="mt-0.5 h-2 w-2 rounded-full bg-[#98abee]/40" />
                            <div>
                              <span className="text-xs font-medium text-[#f9e8c9]">
                                {item.status}
                              </span>
                              <p className="mt-0.5 text-[11px] text-[#98abee]/50">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.id === "account-roles" && (
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-[#98abee]/10 bg-[#98abee]/5 p-4">
                          <h3 className="text-sm font-medium text-[#f9e8c9]">
                            Members
                          </h3>
                          <p className="mt-2 text-xs text-[#98abee]/60">
                            Can view inventory, register components, update
                            information, and create component types.
                          </p>
                        </div>
                        <div className="rounded-lg border border-[#98abee]/10 bg-[#98abee]/5 p-4">
                          <h3 className="text-sm font-medium text-[#f9e8c9]">
                            Admins
                          </h3>
                          <p className="mt-2 text-xs text-[#98abee]/60">
                            All member permissions plus: create team accounts,
                            manage component types, generate activation tokens.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* CTA */}
      <section className="border-t border-white/5 bg-[#1d1550]/30">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <div className="rounded-xl border border-[#98abee]/10 bg-gradient-to-br from-[#1d1550] via-[#201658] to-[#1a1250] px-6 py-10 sm:px-10 sm:py-14">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#f9e8c9] sm:text-3xl">
                Ready to start using Rookies?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#98abee]/60">
                If you already have an account, sign in below. If you&apos;re new,
                ask your team admin to create your account — they&apos;ll give you
                an activation token to set your password.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
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