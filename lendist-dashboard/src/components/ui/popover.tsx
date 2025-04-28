import * as React from "react";
import { cn } from "../../lib/utils";

interface PopoverProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "center" | "start" | "end";
  sideOffset?: number;
}

export function Popover({
  children,
  className,
  open,
  onOpenChange,
  align = "center",
  sideOffset = 4,
}: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(open || false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Use controlled open state if provided
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Notify parent of open state changes
  React.useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={popoverRef} className={cn("relative inline-block", className)}>
      {children}
    </div>
  );
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function PopoverTrigger({ 
  children,
  asChild = false,
  ...props
}: PopoverTriggerProps) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "center" | "start" | "end";
  sideOffset?: number;
}

export function PopoverContent({
  children,
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  return (
    <div
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === "start" && "origin-top-left left-0",
        align === "center" && "origin-top left-1/2 -translate-x-1/2",
        align === "end" && "origin-top-right right-0",
        className
      )}
      style={{ marginTop: `${sideOffset}px` }}
      {...props}
    >
      {children}
    </div>
  );
} 