"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FieldDefinition } from "@/features/component-types/api"
import { Clipboard, Info } from "lucide-react"

interface DynamicFormProps {
  fields: FieldDefinition[]
  onSubmit: (data: Record<string, unknown>) => void
  isSubmitting?: boolean
  className?: string
}

function buildSchema(fields: FieldDefinition[]) {
  try {
    const shape: Record<string, z.ZodTypeAny> = {}

    if (!Array.isArray(fields)) {
      console.error("fields is not an array:", fields)
      return z.object({})
    }

    if (fields.length === 0) {
      return z.object({})
    }

    for (const field of fields) {
      console.log("Processing field:", field.field_id, field.field_type, field.required)
      if (!field || typeof field.field_id !== "string") {
        console.error("Invalid field:", field)
        continue
      }

      let schema: z.ZodTypeAny = z.string()
      const fieldType = field.field_type || "text"

      console.log("fieldType:", fieldType)

      switch (fieldType) {
        case "number": {
          let numberSchema: z.ZodNumber = z.coerce.number()
          const minVal = field.min_value !== undefined ? Number(field.min_value) : undefined
          const maxVal = field.max_value !== undefined ? Number(field.max_value) : undefined
          console.log("minVal:", minVal, "maxVal:", maxVal)
          if (minVal !== undefined && !isNaN(minVal)) {
            numberSchema = numberSchema.min(minVal, { error: `Minimum value is ${minVal}` })
          }
          if (maxVal !== undefined && !isNaN(maxVal)) {
            numberSchema = numberSchema.max(maxVal, { error: `Maximum value is ${maxVal}` })
          }
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

      case "range": {
        let rangeSchema: z.ZodNumber = z.number()
        const minVal = field.min_value !== undefined ? Number(field.min_value) : undefined
        const maxVal = field.max_value !== undefined ? Number(field.max_value) : undefined
        if (minVal !== undefined && !isNaN(minVal)) {
          rangeSchema = rangeSchema.min(minVal)
        }
        if (maxVal !== undefined && !isNaN(maxVal)) {
          rangeSchema = rangeSchema.max(maxVal)
        }
        schema = rangeSchema
        break
      }

      case "date":
        schema = z.string()
        break

      case "file":
        schema = z.string()
        break

      default:
        schema = z.string()
    }

    if (field.required) {
      if (fieldType === "multiselect") {
        schema = (schema as z.ZodArray<z.ZodString>).min(1, { error: "At least one option is required" })
      } else if (fieldType === "boolean") {
        schema = schema.refine((val) => val === true, { error: `${field.label} is required` })
      } else {
        schema = schema.min(1, { error: `${field.label} is required` })
      }
    } else {
      schema = schema.optional()
    }

    shape[field.field_id] = schema
  }

    return z.object(shape)
  } catch (error) {
    console.error("Error building schema:", error)
    return z.object({})
  }
}

export function DynamicForm({
  fields,
  onSubmit,
  isSubmitting = false,
  className,
}: DynamicFormProps) {
  const schema = useMemo(() => buildSchema(fields), [fields])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const watchedValues = watch()

  function handleFormSubmit(data: Record<string, unknown>) {
    const cleanedData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value) && value.length === 0) continue
        cleanedData[key] = value
      }
    }
    onSubmit(cleanedData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn("space-y-6", className)}>
      {fields.map((field) => {
        const error = errors[field.field_id]
        const value = watchedValues[field.field_id]

        return (
          <div key={field.field_id} className="space-y-2">
            <Label htmlFor={field.field_id} className={cn(error && "text-destructive")}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.help_text && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                {field.help_text}
              </p>
            )}

            {field.field_type === "text" && (
              <>
                <Input
                  id={field.field_id}
                  {...register(field.field_id)}
                  placeholder={field.placeholder}
                  readOnly={field.auto}
                />
                {field.auto && field.auto_hint && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clipboard className="h-3 w-3" />
                    {field.auto_hint}
                  </p>
                )}
              </>
            )}

            {field.field_type === "number" && (
              <div className="relative">
                <Input
                  id={field.field_id}
                  type="number"
                  step="any"
                  {...register(field.field_id, { valueAsNumber: true })}
                  placeholder={field.placeholder}
                  className={field.unit ? "pr-12" : ""}
                />
                {field.unit && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {field.unit}
                  </span>
                )}
              </div>
            )}

            {field.field_type === "boolean" && (
              <Switch
                checked={ Boolean(value) }
                onCheckedChange={(checked) => setValue(field.field_id, checked)}
              />
            )}

            {field.field_type === "select" && field.options && (
              <Select
                value={String(value || "")}
                onValueChange={(val) => setValue(field.field_id, val)}
                options={field.options.map((opt) => ({ value: opt, label: opt }))}
                placeholder={field.placeholder || "Select an option"}
              />
            )}

            {field.field_type === "multiselect" && field.options && (
              <div className="flex flex-wrap gap-3">
                {field.options.map((option) => (
                  <Checkbox
                    key={option}
                    checked={Array.isArray(value) && value.includes(option)}
                    onCheckedChange={(checked) => {
                      const current = Array.isArray(value) ? value : []
                      if (checked) {
                        setValue(field.field_id, [...current, option])
                      } else {
                        setValue(
                          field.field_id,
                          current.filter((v: string) => v !== option)
                        )
                      }
                    }}
                    label={option}
                  />
                ))}
              </div>
            )}

            {field.field_type === "range" && field.min_value !== undefined && field.max_value !== undefined && (
              <div className="space-y-2">
                <Slider
                  value={[typeof value === "number" ? value : field.min_value]}
                  onValueChange={(val) => setValue(field.field_id, val[0])}
                  min={field.min_value}
                  max={field.max_value}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{field.min_value}</span>
                  <span className="font-medium">
                    {typeof value === "number" ? value : field.min_value}
                    {field.unit && ` ${field.unit}`}
                  </span>
                  <span>{field.max_value}</span>
                </div>
              </div>
            )}

            {field.field_type === "textarea" && (
              <Textarea
                id={field.field_id}
                {...register(field.field_id)}
                placeholder={field.placeholder}
                rows={4}
              />
            )}

            {field.field_type === "file" && (
              <Input
                id={field.field_id}
                type="file"
                accept="image/*,.txt,.pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      alert("File size must be less than 2MB")
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = () => {
                      const base64 = (reader.result as string).split(",")[1]
                      setValue(field.field_id, base64)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
            )}

            {field.field_type === "auto" && (
              <div className="relative">
                <Input
                  id={field.field_id}
                  {...register(field.field_id)}
                  placeholder={`Paste ${field.label.toLowerCase()}`}
                  readOnly
                  className="bg-muted"
                />
                {field.auto_hint && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clipboard className="h-3 w-3" />
                    {field.auto_hint}
                  </p>
                )}
              </div>
            )}

            {field.field_type === "date" && (
              <Input
                id={field.field_id}
                type="date"
                {...register(field.field_id)}
              />
            )}

            {error && (
              <p className="text-sm text-destructive">
                {error.message as string}
              </p>
            )}
          </div>
        )
      })}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  )
}