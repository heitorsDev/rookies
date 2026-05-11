"use client";

import { useState } from "react";
import { Pencil, Eye, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComponentTypes } from "@/features/component-types/hooks/useComponentTypes";
import { componentTypesApi } from "@/features/component-types/api";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TypesPage() {
  const router = useRouter();
  const { data: componentTypes, isLoading, refetch } = useComponentTypes();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const handleDelete = async (slug: string) => {
    if (!confirm("Archive this component type? Components using this type will remain but the type won't be available for new registrations.")) {
      return;
    }
    setDeletingSlug(slug);
    try {
      await componentTypesApi.archive(slug);
      toast.success("Component type archived");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Component Types
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage component type schemas for your inventory
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border p-4">
                  <div className="h-5 w-32 bg-muted rounded mb-2" />
                  <div className="h-4 w-48 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : componentTypes && componentTypes.length > 0 ? (
            <div className="grid gap-4">
              {componentTypes.map((type) => (
                <div
                  key={type.slug}
                  className="rounded-lg border bg-card p-4 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground truncate">{type.name}</h3>
                    <p className="text-sm text-muted-foreground">{type.slug}</p>
                    {type.description && (
                      <p className="text-sm text-muted-foreground truncate mt-1 max-w-md">
                        {type.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {type.fields?.length ?? 0} field{type.fields?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/types/${type.slug}`}>
                      <Button variant="ghost" size="icon-sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/types/${type.slug}/edit`}>
                      <Button variant="ghost" size="icon-sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {!type.is_archived && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(type.slug)}
                        disabled={deletingSlug === type.slug}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground mb-1">No component types yet</p>
                <p className="text-sm text-muted-foreground/70">
                  Create your first type to start registering components
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/types/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Start from scratch
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
