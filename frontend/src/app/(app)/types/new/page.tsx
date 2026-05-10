"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SchemaBuilder } from "@/features/component-types/components/SchemaBuilder";
import { componentTypesApi, CreateComponentTypeRequest } from "@/features/component-types/api";

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create Component Type
        </h1>
        <p className="text-sm text-muted-foreground">
          Define a new type of electrical component with its diagnostic fields
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <SchemaBuilder onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}