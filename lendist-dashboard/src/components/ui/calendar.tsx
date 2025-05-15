import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, setDate, isToday, isSameDay, getDay, getDaysInMonth, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ selectedDate, onDateSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate || new Date());
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handlePrevMonthClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    prevMonth();
  };
  
  const handleNextMonthClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    nextMonth();
  };
  
  const handleDateClick = (e: React.MouseEvent, day: number) => {
    e.stopPropagation();
    const date = setDate(currentMonth, day);
    onDateSelect(date);
  };
  
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const startDay = getDay(startOfMonth(currentMonth));
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-8 w-8" />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = setDate(currentMonth, day);
      const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
      const isCurrentDay = isToday(date);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={(e) => handleDateClick(e, day)}
          className={cn(
            "h-8 w-8 rounded-sm p-0 text-sm font-medium",
            "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none",
            isSelected && "bg-primary text-primary-foreground scale-90",
            isCurrentDay && !isSelected && "border border-primary text-primary",
            "disabled:opacity-50 disabled:pointer-events-none"
          )}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className={cn("p-2", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonthClick}
          type="button"
          className="inline-flex items-center justify-center rounded-md p-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
        <button
          onClick={handleNextMonthClick}
          type="button"
          className="inline-flex items-center justify-center rounded-md p-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="h-7 w-8 text-xs text-center font-medium text-muted-foreground flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {renderDays()}
      </div>
    </div>
  );
} 