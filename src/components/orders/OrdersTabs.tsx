import { useRef, useEffect, useState } from "react";
import { LEGACY_TABS, type LegacyTabId, type LegacyTab } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OrdersTabs({
  activeTab,
  onTabChange,
  tabCounts,
}: {
  activeTab: LegacyTabId;
  onTabChange: (tab: LegacyTabId) => void;
  tabCounts: Record<LegacyTabId, number>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Scroll to active tab on mount / tab change
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetLeft - 12;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeTab]);

  // Handle native wheel event to convert vertical scroll to horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll-fast multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollRef}
      className={cn(
        "scrollbar-none flex items-center gap-1 overflow-x-auto py-1 px-4 sm:px-0",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      role="tablist"
      aria-label="Order status filters"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {LEGACY_TABS.reduce<React.ReactNode[]>((acc, tab) => {
        const REQUEST_TYPE_TABS = ["Returns & Replacements", "Replacement", "Exchange"];
        
        // Skip these as they will be rendered in the dropdown
        if (REQUEST_TYPE_TABS.includes(tab.id)) {
          return acc;
        }

        const isActive = activeTab === tab.id;
        const count = tabCounts[tab.id] ?? 0;

        const TabButton = (
          <button
            key={tab.id}
            ref={isActive ? activeRef : undefined}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={(e) => {
              // Prevent click action if user was dragging
              if (isDragging && Math.abs(scrollRef.current!.scrollLeft - scrollLeft) > 5) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              onTabChange(tab.id);
            }}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-200 select-none cursor-pointer",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute -top-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary-foreground/60" />
            )}
            <span>{tab.label}</span>
            <span
              className={cn(
                "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums leading-none",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          </button>
        );

        acc.push(TabButton);

        // Insert Request Type dropdown after Delivered
        if (tab.id === "Delivered") {
          const requestTabs = LEGACY_TABS.filter((t) => REQUEST_TYPE_TABS.includes(t.id));
          const isRequestTypeActive = REQUEST_TYPE_TABS.includes(activeTab);
          
          acc.push(
            <DropdownMenu key="request-type-dropdown">
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isRequestTypeActive}
                  className={cn(
                    "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-all duration-200 select-none outline-none border cursor-pointer",
                    isRequestTypeActive
                      ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm dark:bg-amber-500/10 dark:text-amber-400"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {isRequestTypeActive && (
                    <span className="absolute -top-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-amber-500" />
                  )}
                  <span>Request Type</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 font-medium">
                {requestTabs.map((reqTab) => (
                  <DropdownMenuItem
                    key={reqTab.id}
                    onClick={() => onTabChange(reqTab.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    {reqTab.label}
                    <span className="rounded-full bg-red-100 text-red-600 px-1.5 py-0.5 text-[10px] font-bold tabular-nums dark:bg-red-900/30 dark:text-red-400">
                      {tabCounts[reqTab.id] ?? 0}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return acc;
      }, [])}
    </div>
  );
}
