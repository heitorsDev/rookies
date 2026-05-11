"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SchemaBuilder } from "@/features/component-types/components/SchemaBuilder";
import {
  componentTypesApi,
  CreateComponentTypeRequest,
} from "@/features/component-types/api";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

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
      router.push(`/types/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update component type");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href={`/types/${slug}`}>
              <Button variant="ghost" size="icon-sm">
                <X className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Edit Component Type
              </h1>
              <p className="text-sm text-muted-foreground">
                Update the schema for {initialData?.name}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
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
      </main>
    </div>
  );
}
