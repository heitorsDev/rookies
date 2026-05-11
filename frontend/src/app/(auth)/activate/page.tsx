import { ActivateForm } from "@/features/auth/components/ActivateForm";
import { KeyRound, Cpu } from "lucide-react";

export default function ActivatePage() {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1d24ca06_0%,transparent_60%),radial-gradient(ellipse_at_bottom_right,#98abee08_0%,transparent_50%)]" />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
          <div className="aspect-square w-[500px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="absolute -bottom-24 -left-24">
          <div className="aspect-square w-[350px] rounded-full bg-secondary/5 blur-3xl" />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <KeyRound className="size-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Activate your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the one-time token from your team admin to set a password
            </p>
          </div>

          <ActivateForm />

          <div className="mt-8 flex items-center gap-2 text-center text-xs text-muted-foreground/60 justify-center">
            <Cpu className="size-3" />
            <span>FRC Component Registry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
