import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ScheduledList } from "@/components/scheduled/ScheduledList";

export const Route = createFileRoute("/scheduled")({
  head: () => ({
    meta: [
      { title: "Scheduled Installations - Halamama LMD" },
      {
        name: "description",
        content:
          "View and manage products scheduled for manual installation across all active orders.",
      },
    ],
  }),
  component: ScheduledInstallationsPage,
});

function ScheduledInstallationsPage() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground animate-fade-in">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1780px] flex-1 space-y-5 p-4 md:p-6 lg:p-8">
          <ScheduledList />
        </main>
      </div>
    </div>
  );
}
