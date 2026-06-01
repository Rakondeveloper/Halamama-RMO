import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrewTagProps {
  name: string;
  color: string;
  Icon?: LucideIcon;
}

export function CrewTag({ name, color, Icon }: CrewTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
        color,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {name}
    </span>
  );
}
