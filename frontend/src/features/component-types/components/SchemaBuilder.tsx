"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, Check, Copy } from "lucide-react";
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

const TEMPLATE_FIELDS: FieldDefinition[] = [
  {
    field_id: "device_id",
    label: "CAN Device ID",
    field_type: "number",
    required: true,
    min_value: 0,
    max_value: 62,
    help_text: "Device ID on the CAN bus (0-62)",
  },
  {
    field_id: "firmware_version",
    label: "Firmware Version",
    field_type: "auto",
    auto: true,
    auto_hint: "Paste the firmware version from Phoenix Tuner X or REV Hardware Client",
    help_text: "Firmware version reported by the device",
  },
  {
    field_id: "peak_current",
    label: "Peak Current (A)",
    field_type: "number",
    min_value: 0,
    unit: "A",
    help_text: "Maximum current drawn during operation",
  },
  {
    field_id: "fault_flags",
    label: "Active Faults",
    field_type: "multiselect",
    options: ["Hardware Failure", "Under Voltage", "Reset During Enable", "Motor Fault", "Sensor Fault"],
    help_text: "Fault flags reported by the device diagnostics",
  },
  {
    field_id: "notes",
    label: "Mechanical Notes",
    field_type: "textarea",
    help_text: "Physical condition, cable integrity, mounting notes",
  },
];

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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface SortableFieldCardProps {
  field: FieldDefinition;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<FieldDefinition>) => void;
  onRemove: () => void;
}

function SortableFieldCard({
  field,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
}: SortableFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border bg-card transition-all"
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/5"
        onClick={onToggle}
      >
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent"
          {...attributes}
          {...listeners}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4"
          >
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {field.label || (
              <span className="text-muted-foreground italic">
                Unnamed field
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {field.field_id || "no field_id"} &middot;{" "}
            {FIELD_TYPES.find((t) => t.value === field.field_type)?.label ||
              field.field_type}
            {field.required && (
              <span className="text-primary ml-1">&bull; Required</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t p-4 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Label
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => {
                  const label = e.target.value;
                  onUpdate({ label });
                  if (!field.field_id || field.field_id === generateFieldId(field.label)) {
                    onUpdate({ field_id: generateFieldId(label) });
                  }
                }}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Field display label"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Field ID
              </label>
              <input
                type="text"
                value={field.field_id}
                onChange={(e) => onUpdate({ field_id: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="field_id"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Field Type
              </label>
              <select
                value={field.field_type}
                onChange={(e) => onUpdate({ field_type: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <button
                type="button"
                onClick={() => onUpdate({ required: !field.required })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  field.required
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input hover:border-primary"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded flex items-center justify-center transition-colors ${
                    field.required ? "bg-white/20" : "border border-muted-foreground"
                  }`}
                >
                  {field.required && <Check className="h-3 w-3" />}
                </span>
                Required
              </button>
            </div>
          </div>

          {(field.field_type === "select" ||
            field.field_type === "multiselect") && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Options
              </label>
              <textarea
                value={field.options?.join("\n") ?? ""}
                onChange={(e) =>
                  onUpdate({
                    options: e.target.value.split("\n").filter((o) => o.trim()),
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={4}
              />
            </div>
          )}

          {field.field_type === "number" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Min Value
                </label>
                <input
                  type="number"
                  value={field.min_value ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      min_value: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Max Value
                </label>
                <input
                  type="number"
                  value={field.max_value ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      max_value: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Unit
                </label>
                <input
                  type="text"
                  value={field.unit ?? ""}
                  onChange={(e) => onUpdate({ unit: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., RPM, A"
                />
              </div>
            </div>
          )}

          {field.field_type === "range" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Min Value
                </label>
                <input
                  type="number"
                  value={field.min_value ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      min_value: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Max Value
                </label>
                <input
                  type="number"
                  value={field.max_value ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      max_value: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="100"
                />
              </div>
            </div>
          )}

          {field.field_type === "auto" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Auto Hint
              </label>
              <input
                type="text"
                value={field.auto_hint ?? ""}
                onChange={(e) => onUpdate({ auto_hint: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., Paste the firmware version from Phoenix Tuner X"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Help Text
            </label>
            <input
              type="text"
              value={field.help_text ?? ""}
              onChange={(e) => onUpdate({ help_text: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Optional helper text shown below the field"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder ?? ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Optional placeholder text"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function SchemaBuilder({
  initialData,
  onSubmit,
  isSubmitting = false,
}: SchemaBuilderProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [fields, setFields] = useState<FieldDefinition[]>(
    initialData?.fields ?? []
  );
  const [expandedField, setExpandedField] = useState<number | null>(
    initialData?.fields && initialData.fields.length > 0 ? 0 : null
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!initialData?.slug) {
      setSlug(generateSlug(newName));
    }
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over.id as string);
      setFields(arrayMove(fields, oldIndex, newIndex));
      setExpandedField(newIndex);
    }
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-5">Basic Information</h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., Falcon 500 Motor"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Slug
                </label>
                <div className="mt-1.5 flex rounded-lg border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                  <span className="px-3 py-2.5 text-sm text-muted-foreground bg-muted/50 border-r border-input flex items-center">
                    /
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
                      )
                    }
                    className="flex-1 px-3 py-2.5 text-sm font-mono bg-transparent focus:outline-none"
                    placeholder="falcon500"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  URL-friendly identifier
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Describe this component type..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Form Fields</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed p-12 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  No fields yet. Add fields manually or start with a template.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addField}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Field
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFields(TEMPLATE_FIELDS);
                      setExpandedField(0);
                    }}
                    className="gap-2 text-muted-foreground"
                  >
                    <Copy className="h-4 w-4" />
                    Insert template fields
                  </Button>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((_, i) => i.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <SortableFieldCard
                        key={index}
                        field={field}
                        index={index}
                        isExpanded={expandedField === index}
                        onToggle={() =>
                          setExpandedField(expandedField === index ? null : index)
                        }
                        onUpdate={(updates) => updateField(index, updates)}
                        onRemove={() => removeField(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-lg font-semibold">Live Preview</h2>
            </div>
            <div className="space-y-5">
              {fields.filter((f) => f.label).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Add fields to see a preview
                  </p>
                </div>
              ) : (
                fields
                  .filter((f) => f.label)
                  .map((field, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        {field.label}
                        {field.required && (
                          <span className="text-destructive ml-0.5">*</span>
                        )}
                      </label>
                      {field.field_type === "select" && (
                        <select className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
                          <option value="">Select...</option>
                          {field.options?.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                      {field.field_type === "multiselect" && (
                        <div className="space-y-1.5">
                          {field.options?.map((opt, i) => (
                            <label
                              key={i}
                              className="flex items-center gap-2.5 text-sm p-2 rounded-lg border border-input hover:bg-accent/50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-primary text-primary focus:ring-primary/20"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      {field.field_type === "boolean" && (
                        <button
                          type="button"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-left flex items-center justify-between"
                        >
                          <span className="text-muted-foreground">
                            Toggle on/off
                          </span>
                          <div className="w-10 h-6 rounded-full bg-muted relative">
                            <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow" />
                          </div>
                        </button>
                      )}
                      {field.field_type === "textarea" && (
                        <textarea
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm resize-none"
                          rows={3}
                          placeholder={field.placeholder}
                        />
                      )}
                      {field.field_type === "range" && (
                        <div className="space-y-2">
                          <input
                            type="range"
                            className="w-full accent-primary"
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
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2.5 text-sm"
                            value="Click to paste from vendor tool"
                            readOnly
                          />
                          {field.auto_hint && (
                            <p className="text-xs text-muted-foreground">
                              {field.auto_hint}
                            </p>
                          )}
                        </div>
                      )}
                      {field.field_type === "date" && (
                        <input
                          type="date"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                        />
                      )}
                      {field.field_type === "file" && (
                        <div className="rounded-lg border-2 border-dashed border-input p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                          <p className="text-sm text-muted-foreground">
                            Click to upload file
                          </p>
                        </div>
                      )}
                      {![
                        "select",
                        "multiselect",
                        "boolean",
                        "textarea",
                        "range",
                        "auto",
                        "date",
                        "file",
                      ].includes(field.field_type) && (
                        <div className="relative">
                          <input
                            type={
                              field.field_type === "number" ? "number" : "text"
                            }
                            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm pr-12 focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                        <p className="text-xs text-muted-foreground">
                          {field.help_text}
                        </p>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting || !name || !slug}
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Type" : "Create Type"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
