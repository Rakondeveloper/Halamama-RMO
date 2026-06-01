import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { OrderList } from "@/components/orders/OrderList";
import { OrdersHeader } from "@/components/orders/OrdersHeader";
import { ORDER_STATS } from "@/lib/orders";

import { z } from "zod";

const searchSchema = z.object({
  tab: z.string().optional(),
});

export const Route = createFileRoute("/orders/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Orders - Halamama LMD" },
      {
        name: "description",
        content: "Manage, search and dispatch orders across Halamama warehouses and channels.",
      },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { tab } = Route.useSearch();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="mx-auto w-full max-w-[1780px] flex-1 space-y-4 p-4 md:space-y-5 md:p-6">
          <OrdersHeader stats={ORDER_STATS} />
          <OrderList initialTab={tab as any} />
        </main>
      </div>
    </div>
  );
}
