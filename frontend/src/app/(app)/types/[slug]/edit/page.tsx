"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SchemaBuilder } from "@/features/component-types/components/SchemaBuilder";
import {
  componentTypesApi,
  CreateComponentTypeRequest,
} from "@/features/component-types/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function EditTypePage({ params }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");
  const [initialData, setInitialData] = useState<CreateComponentTypeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(async ({ slug: s }) => {
      setSlug(s);
      try {
        const data = await componentTypesApi.get(s);
        setInitialData({
          name: data.name,
          slug: data.slug,
          description: data.description ?? "",
          fields: data.fields,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load component type");
      } finally {
        setIsLoading(false);
      }
    });
  }, [params]);

  const handleSubmit = async (data: CreateComponentTypeRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await componentTypesApi.update(slug, data);
      router.push("/types");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update component type");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Edit Component Type
        </h1>
        <p className="text-sm text-muted-foreground">
          Update the schema for {initialData?.name}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {initialData && (
        <SchemaBuilder
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}