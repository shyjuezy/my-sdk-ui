import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
  error?: string
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type, label, icon: Icon, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      if (props.onChange) {
        props.onChange(e)
      }
    }

    React.useEffect(() => {
      if (props.value) {
        setHasValue(true)
      }
    }, [props.value])

    return (
      <div className="relative group">
        <div className="relative">
          {Icon && (
            <div className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300",
              "text-gray-400 group-focus-within:text-indigo-600",
              error && "text-red-400"
            )}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              "peer flex h-12 w-full rounded-lg border bg-white",
              "px-3 py-1 text-base shadow-sm transition-all duration-200",
              "placeholder:text-transparent focus:placeholder:text-gray-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:border-gray-300",
              Icon && "pl-10",
              (isFocused || hasValue) && "pt-5",
              error ? 
                "border-red-300 focus:border-red-400 focus-visible:ring-red-400/20" :
                "border-gray-200 hover:border-gray-300 focus:border-indigo-400 focus-visible:ring-indigo-400/20",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder={label}
            {...props}
          />
          
          <label
            htmlFor={props.id}
            className={cn(
              "absolute left-3 transition-all duration-300 pointer-events-none",
              "text-gray-500 peer-focus:text-indigo-600",
              Icon && "left-10",
              (isFocused || hasValue) ? 
                "top-2 text-xs font-medium" : 
                "top-1/2 -translate-y-1/2 text-base",
              error && "text-red-500 peer-focus:text-red-600"
            )}
          >
            {label}
            {props.required && " *"}
          </label>

        </div>
        
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

FloatingInput.displayName = "FloatingInput"

export { FloatingInput }