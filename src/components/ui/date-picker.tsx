import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  dateString?: string; // YYYY-MM-DD
  setDateString: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  dateString,
  setDateString,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const date = React.useMemo(() => {
    if (!dateString) return undefined;
    try {
      return parseISO(dateString);
    } catch {
      return undefined;
    }
  }, [dateString]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formatted = format(selectedDate, "yyyy-MM-dd");
      setDateString(formatted);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 h-10 w-full px-3 rounded-xl border border-border bg-muted/30 text-sm font-medium text-foreground text-left focus:outline-none focus:border-primary/40 focus:bg-background transition-all hover:border-primary/30 hover:bg-muted/40 active:scale-[0.98] duration-200 select-none",
            !dateString && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">
            {date ? format(date, "PPP") : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl border border-border shadow-elevated bg-popover" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
