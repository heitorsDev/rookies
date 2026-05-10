import { SetupForm } from "@/features/auth/components/SetupForm";
import { Wrench, ShieldCheck } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d24ca08_1px,transparent_1px),linear-gradient(to_bottom,#1d24ca08_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
          <div className="aspect-square w-[500px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="absolute -bottom-32 -right-32">
          <div className="aspect-square w-[400px] rounded-full bg-secondary/5 blur-3xl" />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="size-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Initial Setup
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first admin account to get started
            </p>
          </div>

          <SetupForm />

          <div className="mt-8 flex items-center gap-2 text-center text-xs text-muted-foreground/60 justify-center">
            <Wrench className="size-3" />
            <span>FRC Component Registry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
