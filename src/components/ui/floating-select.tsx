import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface FloatingSelectProps {
  label: string
  value?: string
  onValueChange?: (value: string) => void
  options: readonly { value: string; label: string }[]
  icon?: LucideIcon
  error?: string
  required?: boolean
  id?: string
  name?: string
  disabled?: boolean
  placeholder?: string
}

const FloatingSelect = React.forwardRef<HTMLButtonElement, FloatingSelectProps>(
  ({ label, value, onValueChange, options, icon: Icon, error, required, id, disabled }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const hasValue = !!value

    return (
      <div className="relative group">
        <SelectPrimitive.Root value={value} onValueChange={onValueChange} open={isOpen} onOpenChange={setIsOpen}>
          <div className="relative">
            {Icon && (
              <div className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 z-10 pointer-events-none",
                "text-gray-400 group-focus-within:text-indigo-600",
                error && "text-red-400"
              )}>
                <Icon className="h-4 w-4" />
              </div>
            )}
            
            <SelectPrimitive.Trigger
              ref={ref}
              id={id}
              className={cn(
                "flex h-12 w-full items-center justify-between rounded-lg border bg-white",
                "px-3 text-base shadow-sm transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "hover:border-gray-300",
                Icon && "pl-10",
                hasValue && "pt-5",
                error ? 
                  "border-red-300 focus:border-red-400 focus:ring-red-400/20" :
                  "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20"
              )}
              disabled={disabled}
            >
              <span className={cn("text-left", !hasValue && "text-gray-400")}>
                {value ? options.find(opt => opt.value === value)?.label : ""}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </SelectPrimitive.Trigger>
            
            <label
              htmlFor={id}
              className={cn(
                "absolute left-3 transition-all duration-300 pointer-events-none",
                "text-gray-500",
                Icon && "left-10",
                (isOpen || hasValue) ? 
                  "top-2 text-xs font-medium" : 
                  "top-1/2 -translate-y-1/2 text-base",
                (isOpen || hasValue) && "text-indigo-600",
                error && "text-red-500"
              )}
            >
              {label}
              {required && " *"}
            </label>
          </div>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={cn(
                "relative z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-white shadow-lg",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              )}
              position="popper"
              sideOffset={5}
            >
              <SelectPrimitive.Viewport className="p-1 max-h-[300px] overflow-y-auto">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none",
                      "focus:bg-indigo-50 focus:text-indigo-900",
                      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    )}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="h-4 w-4 text-indigo-600" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        
        {error && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
            <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

FloatingSelect.displayName = "FloatingSelect"

export { FloatingSelect }