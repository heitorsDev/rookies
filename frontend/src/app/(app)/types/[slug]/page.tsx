"use client";

import { useState, useEffect } from "react";
import { Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { componentTypesApi, ComponentType } from "@/features/component-types/api";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";

interface Props {
  params: Promise<{ slug: string }>;
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  number: "Number",
  boolean: "Boolean",
  select: "Select (single)",
  multiselect: "Select (multiple)",
  range: "Range Slider",
  textarea: "Text Area",
  file: "File Upload",
  auto: "Auto (paste from tool)",
  date: "Date",
};

export default function TypeDetailPage({ params }: Props) {
  const [slug, setSlug] = useState<string>("");
  const [type, setType] = useState<ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(async ({ slug: s }) => {
      try {
        const data = await componentTypesApi.get(s);
        setType(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load component type");
      } finally {
        setIsLoading(false);
      }
    });
  }, [params]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#faf7f2]">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#faf7f2]">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">{error}</div>
        </main>
      </div>
    );
  }

  if (!type) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#faf7f2]">
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
                {type.name}
              </h1>
              <p className="text-sm text-muted-foreground">{type.slug}</p>
            </div>
            <Link href={`/types/${type.slug}/edit`}>
              <Button>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>

          {type.description && (
            <p className="text-muted-foreground">{type.description}</p>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-4">Form Fields</h2>
            {type.fields && type.fields.length > 0 ? (
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-4 py-3 text-sm font-medium">Field ID</th>
                      <th className="px-4 py-3 text-sm font-medium">Label</th>
                      <th className="px-4 py-3 text-sm font-medium">Type</th>
                      <th className="px-4 py-3 text-sm font-medium">Required</th>
                      <th className="px-4 py-3 text-sm font-medium">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {type.fields.map((field, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="px-4 py-3 font-mono text-sm">{field.field_id}</td>
                        <td className="px-4 py-3">{field.label}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {FIELD_TYPE_LABELS[field.field_type] || field.field_type}
                          {field.unit && ` (${field.unit})`}
                        </td>
                        <td className="px-4 py-3">
                          {field.required ? (
                            <span className="text-destructive">Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {field.options?.join(", ")}
                          {field.field_type === "number" && field.min_value !== undefined && field.max_value !== undefined && (
                            <span>Range: {field.min_value} - {field.max_value}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No fields defined</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
