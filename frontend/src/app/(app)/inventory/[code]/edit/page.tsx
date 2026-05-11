"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { StatusBadge } from "@/features/inventory/components/StatusBadge"
import { Sidebar } from "@/components/Sidebar"

interface LoanInfo {
  borrower_name?: string
  expected_return?: string
  notes?: string
}

interface DiagnosticField {
  field_id: string
  label: string
  field_type: string
  required?: boolean
  options?: string[]
  min_value?: number
  max_value?: number
  unit?: string
  auto?: boolean
  auto_hint?: string
}

interface ComponentData {
  code: string
  component_type: string
  status: string
  diagnostic_data: Record<string, unknown>
  notes?: string
  loan_info?: LoanInfo
  created_at: string
  updated_at: string
}

interface ComponentTypeData {
  name: string
  slug: string
  fields: DiagnosticField[]
}

interface Props {
  params: Promise<{ code: string }>
}

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In Use" },
  { value: "loaned", label: "Loaned" },
  { value: "under_maintenance", label: "Under Maintenance" },
  { value: "decommissioned", label: "Decommissioned" },
]

function buildDiagnosticSchema(fields: DiagnosticField[]) {
  const shape: Record<string, z.ZodType> = {}

  for (const field of fields) {
    let schema: z.ZodType = z.string()
    const fieldType = field.field_type || "text"

    switch (fieldType) {
      case "number": {
        let numberSchema: z.ZodNumber = z.coerce.number()
        if (field.min_value !== undefined) numberSchema = numberSchema.min(field.min_value) as z.ZodNumber
        if (field.max_value !== undefined) numberSchema = numberSchema.max(field.max_value) as z.ZodNumber
        schema = numberSchema
        break
      }
      case "boolean":
        schema = z.boolean()
        break
      case "select":
        schema = z.string()
        break
      case "multiselect":
        schema = z.array(z.string())
        break
      case "range":
        schema = z.number()
        break
      default:
        schema = z.string()
    }

    if (field.required) {
      if (fieldType === "multiselect") {
        schema = (schema as z.ZodArray<z.ZodString>).min(1) as z.ZodType
      } else {
        schema = (schema as z.ZodString).min(1, { error: `${field.label} is required` }) as z.ZodType
      }
    } else {
      schema = schema.optional() as z.ZodType
    }
    shape[field.field_id] = schema
  }

  return z.object(shape)
}

function InputField({
  field,
  register,
  setValue,
  watch,
  errors,
}: {
  field: DiagnosticField
  register: ReturnType<typeof useForm>["register"]
  setValue: ReturnType<typeof useForm>["setValue"]
  watch: ReturnType<typeof useForm>["watch"]
  errors: Record<string, unknown>
}) {
  const value = watch(field.field_id)
  const error = errors[field.field_id] as { message?: string } | undefined

  switch (field.field_type) {
    case "text":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.field_id}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input id={field.field_id} {...register(field.field_id)} readOnly={field.auto} />
          {field.auto && field.auto_hint && (
            <p className="text-xs text-muted-foreground">{field.auto_hint}</p>
          )}
          {error?.message && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
      )

    case "number":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.field_id}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="relative">
            <Input
              id={field.field_id}
              type="number"
              step="any"
              {...register(field.field_id, { valueAsNumber: true })}
              className={field.unit ? "pr-12" : ""}
            />
            {field.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {field.unit}
              </span>
            )}
          </div>
          {error?.message && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
      )

    case "select":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.field_id}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={String(value ?? "")}
            onValueChange={(val) => setValue(field.field_id, val)}
            options={(field.options ?? []).map((opt) => ({ value: opt, label: opt }))}
            placeholder="Select an option"
          />
          {error?.message && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
      )

    case "multiselect":
      return (
        <div className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((option) => {
              const currentValue = Array.isArray(value) ? value : []
              const isSelected = currentValue.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setValue(
                        field.field_id,
                        currentValue.filter((v: string) => v !== option)
                      )
                    } else {
                      setValue(field.field_id, [...currentValue, option])
                    }
                  }}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
          {error?.message && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
      )

    case "boolean":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.field_id}>{field.label}</Label>
          <Select
            value={String(value ?? "false")}
            onValueChange={(val) => setValue(field.field_id, val === "true")}
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]}
          />
          {error?.message && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
      )

    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.field_id}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input id={field.field_id} {...register(field.field_id)} />
          {error?.message && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
      )
  }
}

export default function EditComponentPage({ params }: Props) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [component, setComponent] = useState<ComponentData | null>(null)
  const [componentType, setComponentType] = useState<ComponentTypeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("")
  const [loanInfo, setLoanInfo] = useState<LoanInfo>({})

  useEffect(() => {
    params.then((p) => {
      setCode(p.code)
      Promise.all([
        api.get<ComponentData>(`/components/${p.code}`),
        api.get<ComponentTypeData>(`/component-types/${p.code.split("-")[0]}`),
      ])
        .then(([comp, type]) => {
          setComponent(comp)
          setComponentType(type)
          setStatus(comp.status)
          setLoanInfo(comp.loan_info || {})
        })
        .catch(() => {
          toast.error("Failed to load component")
          router.push("/inventory")
        })
        .finally(() => setLoading(false))
    })
  }, [params, router])

  const updateMutation = useMutation({
    mutationFn: (data: {
      status: string
      loan_info?: LoanInfo
      notes?: string
      diagnostic_data?: Record<string, unknown>
    }) => api.patch<ComponentData>(`/components/${code}`, data),
    onSuccess: () => {
      toast.success("Component updated successfully")
      router.push(`/inventory/${code}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update component")
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: componentType?.fields
      ? zodResolver(buildDiagnosticSchema(componentType.fields))
      : undefined,
  })

  useEffect(() => {
    if (component?.diagnostic_data) {
      Object.entries(component.diagnostic_data).forEach(([key, value]) => {
        setValue(key, value)
      })
    }
  }, [component, setValue])

  function onSubmit(data: Record<string, unknown>) {
    const diagnosticData: Record<string, unknown> = {}
    for (const field of componentType?.fields ?? []) {
      const value = data[field.field_id]
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value) && value.length === 0) continue
        diagnosticData[field.field_id] = value
      }
    }

    let finalLoanInfo: LoanInfo | undefined
    if (status === "loaned") {
      finalLoanInfo = {
        borrower_name: loanInfo.borrower_name,
        expected_return: loanInfo.expected_return,
        notes: loanInfo.notes,
      }
    }

    updateMutation.mutate({
      status,
      loan_info: finalLoanInfo,
      notes: data.notes as string | undefined,
      diagnostic_data: diagnosticData,
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit {code}</h1>
            <p className="text-muted-foreground mt-1">
              Update component details, status, and diagnostic data
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Current status: <StatusBadge status={status} /></CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={status}
                onValueChange={setStatus}
                options={STATUS_OPTIONS}
              />

              {status === "loaned" && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="borrower_name">Borrower Name</Label>
                    <Input
                      id="borrower_name"
                      value={loanInfo.borrower_name ?? ""}
                      onChange={(e) => setLoanInfo({ ...loanInfo, borrower_name: e.target.value })}
                      placeholder="Team or person name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected_return">Expected Return</Label>
                    <Input
                      id="expected_return"
                      type="date"
                      value={loanInfo.expected_return ?? ""}
                      onChange={(e) => setLoanInfo({ ...loanInfo, expected_return: e.target.value })}
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
            </CardContent>
          </Card>

          {componentType && componentType.fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Data</CardTitle>
                <CardDescription>
                  Update diagnostic information for this {componentType.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {componentType.fields.map((field) => (
                  <InputField
                    key={field.field_id}
                    field={field}
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("notes")}
                placeholder="Add any notes about this component..."
                rows={4}
                defaultValue={component?.notes ?? ""}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/inventory/${code}`)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
