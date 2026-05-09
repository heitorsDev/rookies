"use client";

import type { FieldDefinition } from "@/features/component-types/api";

interface DynamicFormProps {
  fields: FieldDefinition[];
  onSubmit: (data: Record<string, unknown>) => void;
}

export function DynamicForm({ fields, onSubmit }: DynamicFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({});
      }}
      className="space-y-4"
    >
      {fields.map((field) => (
        <div key={field.field_id}>
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      ))}
    </form>
  );
}
