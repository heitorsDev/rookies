"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 cursor-pointer text-sm",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "h-4 w-4 rounded border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked && "bg-primary border-primary"
        )}
      >
        {checked && <Check className="h-3 w-3 text-primary-foreground" />}
      </button>
      {label && <span>{label}</span>}
    </label>
  )
}