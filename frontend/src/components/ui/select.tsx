"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-ring ring-offset-2"
        )}
      >
        <span className={selectedOption ? "" : "text-muted-foreground"}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 shadow-md">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onValueChange(option.value)
                setOpen(false)
              }}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                option.value === value && "bg-accent"
              )}
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {option.value === value && <Check className="h-4 w-4" />}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}