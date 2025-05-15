import * as React from "react";
import { Calendar } from "./calendar";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled,
  name
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  const toggleCalendar = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  // Handle clicking outside to close the calendar
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Get references to both button and dropdown
      const button = buttonRef.current;
      const dropdown = document.querySelector("[data-date-picker-dropdown]");
      
      // Don't close if clicking on button or calendar dropdown
      if (button && !button.contains(event.target as Node) && 
          dropdown && !dropdown.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="flex relative">
        <Input
          readOnly
          placeholder={placeholder}
          value={value ? format(value, "yyyy-MM-dd") : ""}
          className="pr-10"
          disabled={disabled}
          name={name}
          onClick={toggleCalendar}
        />
        <Button
          ref={buttonRef}
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
          onClick={toggleCalendar}
          disabled={disabled}
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-popover rounded-md border shadow-md" data-date-picker-dropdown>
          <Calendar 
            selectedDate={value} 
            onDateSelect={handleDateSelect} 
          />
        </div>
      )}
    </div>
  );
} 