import { createFileRoute } from "@tanstack/react-router";
import { DriverLayout } from "@/components/driver/DriverLayout";
import { DriverDashboard } from "@/components/driver/DriverDashboard";
import { DeliveryHistory } from "@/components/driver/DeliveryHistory";
import { DriverProfile } from "@/components/driver/DriverProfile";
import { useState } from "react";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [{ title: "Driver App - Halamama LMD" }],
  }),
  component: DriverApp,
});

export type DriverTab = "dashboard" | "history" | "profile";

function DriverApp() {
  const [activeTab, setActiveTab] = useState<DriverTab>("dashboard");

  return (
    <DriverLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && <DriverDashboard />}
      {activeTab === "history" && <DeliveryHistory />}
      {activeTab === "profile" && <DriverProfile />}
    </DriverLayout>
  );
}
