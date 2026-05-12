"use client"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DynamicForm } from "@/features/form-engine/DynamicForm"
import { componentTypesApi, type ComponentType } from "@/features/component-types/api"
import { componentsApi, type CreateComponentRequest, type Component } from "@/features/components/api"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Sidebar } from "@/components/Sidebar"
import { ApiClientError } from "@/lib/api"

interface Props {
  searchParams: Promise<{ code?: string }>
}

export default function RegisterPage({ searchParams }: Props) {
  const router = useRouter()
  const params = use(searchParams)
  const [selectedType, setSelectedType] = useState<string>("")
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("available")
  const [existingComponent, setExistingComponent] = useState<Component | null>(null)
  const [componentType, setComponentType] = useState<ComponentType | null>(null)
  const [loanInfo, setLoanInfo] = useState<{ borrower_name?: string; expected_return?: string; notes?: string }>({})

  const isEditing = !!params.code

  useEffect(() => {
    Promise.all([
      componentTypesApi.list(),
      params.code ? componentsApi.get(params.code).catch((e) => {
        if (e instanceof ApiClientError && e.status === 404) {
          toast.error("Component not found")
          router.push("/inventory")
        }
        return null
      }) : Promise.resolve(null)
    ]).then(([types, comp]) => {
      setComponentTypes(types)
      if (comp) {
        setExistingComponent(comp)
        setNotes(comp.notes || "")
        setStatus(comp.status)
        setLoanInfo(comp.loan_info || {})

        const typeSlug = comp.component_type_slug || params.code?.split("-")[0] || ""
        const foundType = types.find(t => t.slug === typeSlug)
        if (foundType) {
          setSelectedType(foundType.slug)
        } else {
          componentTypesApi.get(typeSlug).then((t) => {
            setSelectedType(t.slug)
          }).catch(() => {
            toast.warning(`Component type "${typeSlug}" not found in list`)
          })
        }
      }
      setLoading(false)
    }).catch(() => {
      toast.error("Failed to load data")
      setLoading(false)
    })
  }, [params.code, router])

  const selectedComponentType = componentTypes.find((ct) => ct.slug === selectedType) || componentType

  async function handleSubmit(diagnosticData: Record<string, unknown>) {
    if (!selectedType && !isEditing) {
      toast.error("Please select a component type")
      return
    }

    setSubmitting(true)
    try {
      if (isEditing && existingComponent) {
        let finalLoanInfo: { borrower_name?: string; expected_return?: string; notes?: string } | undefined
        if (status === "loaned") {
          finalLoanInfo = loanInfo
        }

        await componentsApi.update(existingComponent.code, {
          status,
          loan_info: finalLoanInfo,
          notes: notes || undefined,
          diagnostic_data: diagnosticData,
        })
        toast.success("Component updated successfully")
        router.push(`/inventory/${existingComponent.code}`)
      } else {
        const request: CreateComponentRequest = {
          component_type_slug: selectedType,
          diagnostic_data: diagnosticData,
          notes: notes || undefined,
          status,
        }

        const result = await componentsApi.create(request)
        router.push(`/register/success?code=${encodeURIComponent(result.code)}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save component")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEditing ? `Edit ${params.code}` : "Register Component"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? "Update component details and diagnostic data" : "Register a new electrical component to the inventory"}
            </p>
          </div>

          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Component Type</CardTitle>
                <CardDescription>Select the type of component you want to register</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                  options={componentTypes.map((ct) => ({ value: ct.slug, label: ct.name }))}
                  placeholder="Select component type"
                  disabled={loading}
                />
              </CardContent>
            </Card>
          )}

          {(selectedComponentType || isEditing) && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Data</CardTitle>
                <CardDescription>
                  {selectedComponentType
                    ? `Fill in the diagnostic information for this ${selectedComponentType.name}`
                    : "Component type not found. You can still update status and notes below."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedComponentType ? (
                  <DynamicForm
                    fields={selectedComponentType.fields}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                    initialData={existingComponent?.diagnostic_data}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No diagnostic fields available (component type may be archived)
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(selectedComponentType || isEditing) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={setStatus}
                    options={[
                      { value: "available", label: "Available" },
                      { value: "in_use", label: "In Use" },
                      { value: "loaned", label: "Loaned" },
                      { value: "under_maintenance", label: "Under Maintenance" },
                      ...(isEditing ? [{ value: "decommissioned", label: "Decommissioned" }] : []),
                    ]}
                  />
                </div>

                {status === "loaned" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="borrower_name">Borrower Name</Label>
                      <Textarea
                        id="borrower_name"
                        value={loanInfo.borrower_name ?? ""}
                        onChange={(e) => setLoanInfo({ ...loanInfo, borrower_name: e.target.value })}
                        placeholder="Team or person name"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expected_return">Expected Return</Label>
                      <Textarea
                        id="expected_return"
                        value={loanInfo.expected_return ?? ""}
                        onChange={(e) => setLoanInfo({ ...loanInfo, expected_return: e.target.value })}
                        placeholder="YYYY-MM-DD"
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="loan_notes">Loan Notes</Label>
                      <Textarea
                        id="loan_notes"
                        value={loanInfo.notes ?? ""}
                        onChange={(e) => setLoanInfo({ ...loanInfo, notes: e.target.value })}
                        placeholder="Additional loan details..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this component..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
