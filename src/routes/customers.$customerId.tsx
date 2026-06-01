import { createFileRoute, Link } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { Button } from "@/components/ui/button";
import { CustomerDetailsView } from "@/components/customers/CustomerDetailsView";
import { getCustomerPageData } from "@/lib/customerDetails";

export const Route = createFileRoute("/customers/$customerId")({
  head: ({ params }) => ({
    meta: [{ title: `Customer ${params.customerId} - Halamama LMD` }],
  }),
  component: CustomerDetailsPage,
});

function CustomerDetailsPage() {
  const { customerId } = Route.useParams();
  const data = getCustomerPageData(customerId);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-foreground dark:bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {!data ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm dark:border-slate-800 dark:bg-card">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Customer not found</p>
                <p className="mt-1 text-sm text-slate-500">
                  No profile matches <span className="font-mono font-medium text-slate-700">{customerId}</span>.
                </p>
                <Button className="mt-6" variant="default" asChild>
                  <Link to="/orders">Return to orders</Link>
                </Button>
              </div>
            ) : (
              <CustomerDetailsView data={data} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
