"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/features/inventory/components/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

interface ComponentResponse {
  code: string
  component_type: string
  status: string
  diagnostic_data: Record<string, unknown>
  notes?: string
  loan_info?: {
    borrower_name?: string
    expected_return?: string
    notes?: string
  }
  created_at: string
  updated_at: string
}

interface ComponentTypeResponse {
  name: string
  slug: string
  fields: Array<{
    field_id: string
    label: string
    field_type: string
    unit?: string
    options?: string[]
  }>
}

interface HistoryEntry {
  timestamp: string
  changed_by: string
  field: string
  old_value?: unknown
  new_value?: unknown
}

interface Props {
  params: Promise<{ code: string }>
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatFieldValue(value: unknown, fieldType: string): string {
  if (value === null || value === undefined) return "-"
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (fieldType === "date" && typeof value === "string") {
    return new Date(value).toLocaleDateString()
  }
  return String(value)
}

export default function ComponentDetailPage({ params }: Props) {
  const [code, setCode] = useState("")
  const [component, setComponent] = useState<ComponentResponse | null>(null)
  const [componentType, setComponentType] = useState<ComponentTypeResponse | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(async (p) => {
      setCode(p.code)
      try {
        const [compData, historyData] = await Promise.all([
          api.get<ComponentResponse>(`/components/${p.code}`),
          api.get<HistoryEntry[]>(`/components/${p.code}/history`),
        ])
        setComponent(compData)
        setHistory(historyData)

        const typeSlug = p.code.split("-")[0]
        try {
          const typeData = await api.get<ComponentTypeResponse>(`/component-types/${typeSlug}`)
          setComponentType(typeData)
        } catch {
          // Component type might not exist
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load component")
      } finally {
        setLoading(false)
      }
    })
  }, [params])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#faf7f2]">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (error || !component) {
    return (
      <div className="flex min-h-screen bg-[#faf7f2]">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Component Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {error || "The requested component could not be found."}
                </p>
                <Link href="/inventory" className={buttonVariants({ className: "mt-4" })}>
                  Back to Inventory
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const fieldMap = new Map(
    componentType?.fields.map((f) => [f.field_id, f]) ?? []
  )

  return (
    <div className="flex min-h-screen bg-[#faf7f2]">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{component.code}</h1>
              <p className="text-muted-foreground mt-1">
                {componentType?.name ?? component.component_type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={component.status} />
              <Link href={`/inventory/${code}/edit`} className={buttonVariants()}>
                Edit
              </Link>
            </div>
          </div>

          {component.status === "loaned" && component.loan_info && (
            <Card>
              <CardHeader>
                <CardTitle>Loan Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {component.loan_info.borrower_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Borrower</p>
                    <p className="font-medium">{component.loan_info.borrower_name}</p>
                  </div>
                )}
                {component.loan_info.expected_return && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Return</p>
                    <p className="font-medium">{formatDate(component.loan_info.expected_return)}</p>
                  </div>
                )}
                {component.loan_info.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{component.loan_info.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {Object.keys(component.diagnostic_data).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Data</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(component.diagnostic_data).map(([key, value]) => {
                    const field = fieldMap.get(key)
                    return (
                      <div key={key} className="border-b pb-2 last:border-0">
                        <dt className="text-sm text-muted-foreground">
                          {field?.label ?? key}
                          {field?.unit && <span className="text-muted-foreground ml-1">({field.unit})</span>}
                        </dt>
                        <dd className="mt-1 font-medium">
                          {formatFieldValue(value, field?.field_type ?? "")}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </CardContent>
            </Card>
          )}

          {component.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{component.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground">No history yet.</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, idx) => (
                    <div key={idx} className="flex gap-4 text-sm">
                      <div className="flex-shrink-0 w-40 text-muted-foreground">
                        {formatDate(entry.timestamp)}
                      </div>
                      <div>
                        <span className="font-medium">{entry.changed_by}</span>
                        <span className="text-muted-foreground"> changed </span>
                        <span className="font-medium">{entry.field}</span>
                        {entry.old_value !== undefined && (
                          <>
                            <span className="text-muted-foreground"> from </span>
                            <span className="font-mono">{String(entry.old_value)}</span>
                          </>
                        )}
                        {entry.new_value !== undefined && (
                          <>
                            <span className="text-muted-foreground"> to </span>
                            <span className="font-mono">{String(entry.new_value)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            Created: {formatDate(component.created_at)} · Updated: {formatDate(component.updated_at)}
          </div>
        </div>
      </main>
    </div>
  )
}
