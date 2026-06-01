import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getEnrichedOrder } from "@/lib/orders";
import { OrderHeader } from "./OrderHeader";
import { FulfillmentSection } from "./FulfillmentSection";
import { CustomerSidebar } from "./CustomerSidebar";
import { PaymentSummary } from "./PaymentSummary";
import { ReturnsSection } from "./ReturnsSection";
import { ActivityTimeline } from "./ActivityTimeline";
import { Button } from "@/components/ui/button";

export function OrderDetails({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  const order = getEnrichedOrder(orderId);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    navigate({ to: "/orders" });
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-semibold text-foreground">Order not found</h2>
        <p className="mt-2 text-muted-foreground">The order {orderId} could not be found.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground shadow-soft transition-all hover:-translate-x-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-muted-foreground/60">/</span>
        <span className="font-semibold text-foreground">{order.id}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Main Content */}
        <div className="flex min-w-0 flex-col gap-6">
          <OrderHeader order={order} />
          <FulfillmentSection order={order} />
          <PaymentSummary order={order} />
          <ReturnsSection order={order} />
        </div>

        {/* Right Column: Sidebar */}
        <div className="flex min-w-0 flex-col gap-6">
          <CustomerSidebar order={order} />
          <ActivityTimeline order={order} />
        </div>
      </div>
    </div>
  );
}
