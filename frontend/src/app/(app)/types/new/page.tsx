"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SchemaBuilder } from "@/features/component-types/components/SchemaBuilder";
import { componentTypesApi, CreateComponentTypeRequest } from "@/features/component-types/api";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewTypePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateComponentTypeRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await componentTypesApi.create(data);
      router.push("/types");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create component type");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/types">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Create Component Type
              </h1>
              <p className="text-sm text-muted-foreground">
                Define a new type of electrical component with its diagnostic fields
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <SchemaBuilder onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  );
}
