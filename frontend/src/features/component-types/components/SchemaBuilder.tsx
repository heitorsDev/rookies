"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FieldDefinition, CreateComponentTypeRequest } from "../api";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "select", label: "Select (single)" },
  { value: "multiselect", label: "Select (multiple)" },
  { value: "range", label: "Range Slider" },
  { value: "textarea", label: "Text Area" },
  { value: "file", label: "File Upload" },
  { value: "auto", label: "Auto (paste from tool)" },
  { value: "date", label: "Date" },
];

interface SchemaBuilderProps {
  initialData?: CreateComponentTypeRequest;
  onSubmit: (data: CreateComponentTypeRequest) => void;
  isSubmitting?: boolean;
}

function createEmptyField(): FieldDefinition {
  return {
    field_id: "",
    label: "",
    field_type: "text",
    required: false,
    options: [],
    min_value: undefined,
    max_value: undefined,
    unit: "",
    placeholder: "",
    help_text: "",
    auto: false,
    auto_hint: "",
  };
}

function generateFieldId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function SchemaBuilder({
  initialData,
  onSubmit,
  isSubmitting = false,
}: SchemaBuilderProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [fields, setFields] = useState<FieldDefinition[]>(
    initialData?.fields ?? []
  );
  const [expandedField, setExpandedField] = useState<number | null>(
    initialData?.fields && initialData.fields.length > 0 ? 0 : null
  );

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!initialData?.slug) {
      setSlug(generateFieldId(newName));
    }
  };

  const handleFieldLabelChange = (index: number, label: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], label };
    if (!newFields[index].field_id || newFields[index].field_id === generateFieldId(newFields[index].label)) {
      newFields[index].field_id = generateFieldId(label);
    }
    setFields(newFields);
  };

  const addField = () => {
    setFields([...fields, createEmptyField()]);
    setExpandedField(fields.length);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    if (expandedField === index) {
      setExpandedField(null);
    } else if (expandedField !== null && expandedField > index) {
      setExpandedField(expandedField - 1);
    }
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= fields.length) return;
    const newFields = [...fields];
    const [removed] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, removed);
    setFields(newFields);
    setExpandedField(toIndex);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      slug,
      description,
      fields: fields.filter((f) => f.label.trim() !== ""),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., Falcon 500 Motor"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., falcon500"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  URL-friendly identifier (lowercase, letters, numbers, hyphens)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Describe this component type..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Form Fields</h2>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No fields added yet. Click &quot;Add Field&quot; to create your first form field.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-card transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer"
                      onClick={() => setExpandedField(expandedField === index ? null : index)}
                    >
                      <button
                        type="button"
                        className="cursor-grab text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="h-5 w-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {field.label || <span className="text-muted-foreground">Unnamed field</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {field.field_id || "no field_id"} • {FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type}
                          {field.required && " • Required"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-1 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(index, index - 1);
                          }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(index, index + 1);
                          }}
                          disabled={index === fields.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(index);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {expandedField === index && (
                      <div className="border-t p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Label</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => handleFieldLabelChange(index, e.target.value)}
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="Field display label"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Field ID</label>
                            <input
                              type="text"
                              value={field.field_id}
                              onChange={(e) => updateField(index, { field_id: e.target.value })}
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="field_id"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Field Type</label>
                            <select
                              value={field.field_type}
                              onChange={(e) => updateField(index, { field_type: e.target.value })}
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              {FIELD_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <input
                              type="checkbox"
                              id={`required-${index}`}
                              checked={field.required}
                              onChange={(e) => updateField(index, { required: e.target.checked })}
                              className="rounded border-input"
                            />
                            <label htmlFor={`required-${index}`} className="text-sm">
                              Required field
                            </label>
                          </div>
                        </div>

                        {(field.field_type === "select" || field.field_type === "multiselect") && (
                          <div>
                            <label className="text-sm font-medium">Options (one per line)</label>
                            <textarea
                              value={field.options?.join("\n") ?? ""}
                              onChange={(e) =>
                                updateField(index, {
                                  options: e.target.value.split("\n").filter((o) => o.trim()),
                                })
                              }
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              rows={4}
                            />
                          </div>
                        )}

                        {field.field_type === "number" && (
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium">Min Value</label>
                              <input
                                type="number"
                                value={field.min_value ?? ""}
                                onChange={(e) =>
                                  updateField(index, {
                                    min_value: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Max Value</label>
                              <input
                                type="number"
                                value={field.max_value ?? ""}
                                onChange={(e) =>
                                  updateField(index, {
                                    max_value: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="100"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Unit</label>
                              <input
                                type="text"
                                value={field.unit ?? ""}
                                onChange={(e) => updateField(index, { unit: e.target.value })}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="e.g., RPM, A"
                              />
                            </div>
                          </div>
                        )}

                        {field.field_type === "range" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Min Value</label>
                              <input
                                type="number"
                                value={field.min_value ?? ""}
                                onChange={(e) =>
                                  updateField(index, {
                                    min_value: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Max Value</label>
                              <input
                                type="number"
                                value={field.max_value ?? ""}
                                onChange={(e) =>
                                  updateField(index, {
                                    max_value: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="100"
                              />
                            </div>
                          </div>
                        )}

                        {field.field_type === "auto" && (
                          <div>
                            <label className="text-sm font-medium">Auto Hint</label>
                            <input
                              type="text"
                              value={field.auto_hint ?? ""}
                              onChange={(e) => updateField(index, { auto_hint: e.target.value })}
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="e.g., Paste the firmware version from Phoenix Tuner X"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                              Instruction shown to users about what to paste/copy
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">Help Text</label>
                          <input
                            type="text"
                            value={field.help_text ?? ""}
                            onChange={(e) => updateField(index, { help_text: e.target.value })}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Optional helper text shown below the field"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Placeholder</label>
                          <input
                            type="text"
                            value={field.placeholder ?? ""}
                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Optional placeholder text"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
            <div className="space-y-4">
              {fields.filter((f) => f.label).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add fields to see a live preview of your form.
                </p>
              ) : (
                fields
                  .filter((f) => f.label)
                  .map((field, index) => (
                    <div key={index}>
                      <label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      {field.field_type === "select" && (
                        <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select...</option>
                          {field.options?.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                      {field.field_type === "multiselect" && (
                        <div className="mt-1 space-y-1">
                          {field.options?.map((opt, i) => (
                            <label key={i} className="flex items-center gap-2 text-sm">
                              <input type="checkbox" className="rounded border-input" />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      {field.field_type === "boolean" && (
                        <input type="checkbox" className="mt-2 rounded border-input" />
                      )}
                      {field.field_type === "textarea" && (
                        <textarea
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          rows={3}
                          placeholder={field.placeholder}
                        />
                      )}
                      {field.field_type === "range" && (
                        <div className="mt-2">
                          <input
                            type="range"
                            className="w-full"
                            min={field.min_value ?? 0}
                            max={field.max_value ?? 100}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{field.min_value ?? 0}</span>
                            <span>{field.max_value ?? 100}</span>
                          </div>
                        </div>
                      )}
                      {field.field_type === "auto" && (
                        <div>
                          <input
                            type="text"
                            className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                            value="Read-only (paste from vendor tool)"
                            readOnly
                          />
                          {field.auto_hint && (
                            <p className="mt-1 text-xs text-muted-foreground">{field.auto_hint}</p>
                          )}
                        </div>
                      )}
                      {field.field_type === "date" && (
                        <input
                          type="date"
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      )}
                      {field.field_type === "file" && (
                        <input
                          type="file"
                          className="mt-1 w-full text-sm text-muted-foreground"
                        />
                      )}
                      {!["select", "multiselect", "boolean", "textarea", "range", "auto", "date", "file"].includes(field.field_type) && (
                        <div className="relative">
                          <input
                            type={field.field_type === "number" ? "number" : "text"}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-12"
                            placeholder={field.placeholder}
                          />
                          {field.unit && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      )}
                      {field.help_text && (
                        <p className="mt-1 text-xs text-muted-foreground">{field.help_text}</p>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Update Type" : "Create Type"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}