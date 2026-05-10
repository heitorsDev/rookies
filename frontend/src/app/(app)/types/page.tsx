"use client";

import { Plus, Pencil, Eye, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComponentTypes } from "@/features/component-types/hooks/useComponentTypes";
import Link from "next/link";

export default function TypesPage() {
  const { data: componentTypes, isLoading } = useComponentTypes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Component Types
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage component type schemas for your inventory
          </p>
        </div>
        <Link href="/types/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Type
          </Button>
        </Link>
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">No component types yet</p>
          <Link href="/types/new">
            <Button variant="outline">Create your first type</Button>
          </Link>
        </div>
      )}
    </div>
  );
}