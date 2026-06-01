import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemSettings } from "@/components/settings/SystemSettings";
import { UserManagement } from "@/components/settings/UserManagement";
import { RejectionReasons } from "@/components/settings/RejectionReasons";
import { ZoneManagement } from "@/components/settings/ZoneManagement";
import {
  Settings2,
  Users,
  CircleSlash,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings - Halamama LMD" }],
  }),
  component: SettingsPage,
});

const TABS = [
  { value: "system", label: "System Settings", icon: Settings2 },
  { value: "users", label: "User Management", icon: Users },
  { value: "rejection", label: "Rejection Reasons", icon: CircleSlash },
  { value: "zones", label: "Zones", icon: MapPin },
];

function SettingsPage() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1780px] flex-1 p-4 md:p-6">
          <Tabs defaultValue="system" className="space-y-5">
            {/* Tab navigation bar */}
            <TabsList className="h-auto w-full justify-start gap-0 rounded-2xl bg-card border border-border p-1.5 shadow-soft flex-wrap">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* ── System Settings ── */}
            <TabsContent value="system">
              <SystemSettings />
            </TabsContent>

            {/* ── User Management ── */}
            <TabsContent value="users">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <UserManagement />
              </div>
            </TabsContent>

            {/* ── Rejection Reasons ── */}
            <TabsContent value="rejection">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <RejectionReasons />
              </div>
            </TabsContent>

            {/* ── Zones ── */}
            <TabsContent value="zones">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <ZoneManagement />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

/* ── Placeholder for future tabs ── */
function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 shadow-soft text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-muted grid place-items-center mb-4">
        <Settings2 className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <p className="text-xs text-muted-foreground mt-4">
        This section is under development and will be available soon.
      </p>
    </div>
  );
}
