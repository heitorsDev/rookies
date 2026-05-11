"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DynamicForm } from "@/features/form-engine/DynamicForm"
import { componentTypesApi, type ComponentType } from "@/features/component-types/api"
import { componentsApi, type CreateComponentRequest } from "@/features/components/api"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Sidebar } from "@/components/Sidebar"
import { ArrowLeft, Layers } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string>("")
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("available")

  useEffect(() => {
    componentTypesApi.list().then((data) => {
      setComponentTypes(data)
      setLoading(false)
    }).catch(() => {
      toast.error("Failed to load component types")
      setLoading(false)
    })
  }, [])

  const selectedComponentType = componentTypes.find((ct) => ct.slug === selectedType)

  async function handleSubmit(diagnosticData: Record<string, unknown>) {
    if (!selectedType) {
      toast.error("Please select a component type")
      return
    }

    setSubmitting(true)
    try {
      const request: CreateComponentRequest = {
        component_type_slug: selectedType,
        diagnostic_data: diagnosticData,
        notes: notes || undefined,
        status,
      }

      const result = await componentsApi.create(request)
      router.push(`/register/success?code=${encodeURIComponent(result.code)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register component")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/inventory">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold tracking-tight">Register Component</h1>
              <p className="text-muted-foreground mt-1">
                Register a new electrical component to the inventory
              </p>
            </div>
            <Link href="/types">
              <Button variant="outline" size="sm">
                <Layers className="h-4 w-4 mr-2" />
                Component Types
              </Button>
            </Link>
          </div>

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

          {selectedComponentType && selectedComponentType.fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Data</CardTitle>
                <CardDescription>
                  Fill in the diagnostic information for this {selectedComponentType.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicForm
                  fields={selectedComponentType.fields}
                  onSubmit={handleSubmit}
                  isSubmitting={submitting}
                />
              </CardContent>
            </Card>
          )}

          {selectedComponentType && (
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
                    ]}
                  />
                </div>

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
