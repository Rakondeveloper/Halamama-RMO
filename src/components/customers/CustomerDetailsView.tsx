import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CustomerPageData } from "@/lib/customerDetails";
import { mapsUrlFromCoords } from "@/lib/customerDetails";
import type { Order, OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  MoreHorizontal,
  Package,
  Pencil,
} from "lucide-react";

function statusPillClass(status: OrderStatus): string {
  switch (status) {
    case "Delivered":
      return "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100";
    case "New":
      return "border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100";
    case "Cancelled":
    case "Delivery Failed":
      return "border-red-200 bg-red-100 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100";
    default:
      return "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100";
  }
}

function channelLabel(channel: Order["channel"]): string {
  if (channel === "web") return "Web";
  if (channel === "shopify") return "Shopify";
  return "5382175";
}

function paymentBadgeClass(status: CustomerPageData["enrichment"]["payment"]["status"]): string {
  switch (status) {
    case "Paid":
      return "border-emerald-200 bg-emerald-100 text-emerald-900";
    case "Pending":
      return "border-amber-200 bg-amber-100 text-amber-900";
    case "Overdue":
      return "border-red-200 bg-red-100 text-red-900";
  }
}

export function CustomerDetailsView({ data }: { data: CustomerPageData }) {
  const { primary, orders, enrichment } = data;
  const { customer } = primary;
  const addr = enrichment.address;
  const pay = enrichment.payment;
  const mapsHref = mapsUrlFromCoords(addr.latitude, addr.longitude);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-lg border-slate-200" asChild>
            <Link to="/orders" aria-label="Back to orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">
              Customer detail
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {primary.customerId}
              </span>
              <span className="mx-2 text-slate-300">·</span>
              Last order context{" "}
              <span className="font-mono text-slate-600 dark:text-slate-400">{primary.id}</span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg border-slate-200 font-medium shadow-sm">
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-lg border-slate-200 font-medium shadow-sm">
                Actions
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Merge duplicate</DropdownMenuItem>
              <DropdownMenuItem>Send statement</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Block customer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {enrichment.billingAlert && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
          role="alert"
        >
          {enrichment.billingAlert}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {customer.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{customer.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={cn("rounded-md font-semibold", statusPillClass(primary.status))}
                    >
                      {primary.status}
                    </Badge>
                    <Badge variant="outline" className="rounded-md border-slate-200 font-medium">
                      {orders.length} orders
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="h-10 w-full justify-start rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-muted/40 sm:w-auto">
              <TabsTrigger value="orders" className="rounded-md">
                Orders
              </TabsTrigger>
              <TabsTrigger value="returns" className="rounded-md">
                Returns
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-md">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4 space-y-4 focus-visible:outline-none">
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 md:px-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Globe className="h-4 w-4 text-slate-400" aria-hidden />
                    Order history
                  </div>
                  <Button variant="outline" size="sm" className="rounded-md text-xs font-semibold">
                    New order
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-muted/30">
                        <th className="px-4 py-3 md:px-5">Order</th>
                        <th className="px-4 py-3 md:px-5">Channel</th>
                        <th className="px-4 py-3 md:px-5">Date</th>
                        <th className="px-4 py-3 md:px-5">Status</th>
                        <th className="px-4 py-3 text-right md:px-5">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr
                          key={o.id}
                          className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                        >
                          <td className="px-4 py-3 font-mono font-semibold text-primary md:px-5">
                            <Link to="/orders" className="hover:underline">
                              {o.id}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 md:px-5">
                            {channelLabel(o.channel)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 md:px-5">
                            {o.date} · {o.time}
                          </td>
                          <td className="px-4 py-3 md:px-5">
                            <span
                              className={cn(
                                "inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold",
                                statusPillClass(o.status),
                              )}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100 md:px-5">
                            QAR {o.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="returns" className="mt-4 focus-visible:outline-none">
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 md:px-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Package className="h-4 w-4 text-slate-400" aria-hidden />
                    Returns
                  </div>
                  <Button size="sm" className="rounded-md text-xs font-semibold">
                    Create return
                  </Button>
                </div>
                {enrichment.returns.length === 0 ? (
                  <div className="px-4 py-12 text-center md:px-5">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No returns yet</p>
                    <p className="mt-1 text-xs text-slate-500">Returns linked to this customer will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800">
                          <th className="px-4 py-3 md:px-5">Return</th>
                          <th className="px-4 py-3 md:px-5">Order</th>
                          <th className="px-4 py-3 md:px-5">Status</th>
                          <th className="px-4 py-3 md:px-5">Created</th>
                          <th className="px-4 py-3 text-right md:px-5">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrichment.returns.map((r) => (
                          <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="px-4 py-3 font-mono font-medium md:px-5">{r.id}</td>
                            <td className="px-4 py-3 font-mono text-primary md:px-5">{r.orderId}</td>
                            <td className="px-4 py-3 md:px-5">{r.status}</td>
                            <td className="px-4 py-3 text-slate-600 md:px-5">{r.createdAt}</td>
                            <td className="px-4 py-3 text-right font-medium tabular-nums md:px-5">
                              QAR {r.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 focus-visible:outline-none">
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center dark:border-slate-800 dark:bg-muted/20">
                <Clock className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">Activity log</p>
                <p className="mt-1 text-xs text-slate-500">Timeline events will appear here in a future release.</p>
              </div>
            </TabsContent>
          </Tabs>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card md:p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Payment summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                  QAR {pay.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
                <span>Discount</span>
                <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                  − QAR {pay.discount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                  QAR {pay.shipping.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800" />
              <div className="flex justify-between gap-4 text-base font-bold text-slate-900 dark:text-slate-50">
                <span>Total</span>
                <span className="tabular-nums">QAR {pay.total.toFixed(2)}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-slate-500">Balance</span>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  QAR {pay.balance.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span
                className={cn(
                  "inline-flex rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
                  paymentBadgeClass(pay.status),
                )}
              >
                {pay.status}
              </span>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 md:px-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">Notes</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" aria-label="Edit notes">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="px-4 py-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 md:px-5">
              {enrichment.notes}
            </div>
            <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800 md:px-5">
              Ref: <span className="font-mono text-slate-500">{enrichment.internalRef}</span>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
            <div className="border-b border-slate-100 bg-slate-800 px-4 py-3 text-white dark:border-slate-800 md:px-5">
              <h3 className="text-sm font-bold">Customer</h3>
            </div>
            <div className="space-y-4 px-4 py-4 md:px-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</div>
                <a
                  href={`mailto:${customer.email}`}
                  className="mt-1 inline-block text-sm font-semibold text-sky-600 hover:underline dark:text-sky-400"
                >
                  {customer.name}
                </a>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</div>
                <a
                  href={`mailto:${customer.email}`}
                  className="mt-1 inline-block text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  {customer.email}
                </a>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Phone</div>
                <a
                  href={`tel:${customer.phone.replace(/\s/g, "")}`}
                  className="mt-1 inline-block text-sm font-medium tabular-nums text-slate-800 hover:text-sky-600 dark:text-slate-200"
                >
                  {addr.phone}
                </a>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Shipping address
                </div>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {[
                    addr.recipientName,
                    `${addr.street}, ${addr.houseNumber}`,
                    `${addr.area}, ${addr.zone}`,
                    `${addr.city}, ${addr.country}`,
                    `Phone: ${addr.phone}`,
                    `${addr.latitude.toFixed(5)}, ${addr.longitude.toFixed(5)}`,
                  ].join("\n")}
                </p>
              </div>
              <Button
                variant="outline"
                className="h-10 w-full gap-2 rounded-lg border-sky-200 bg-sky-50 text-sm font-semibold text-sky-800 shadow-none hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
                asChild
              >
                <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  Open in Maps
                  <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-70" aria-hidden />
                </a>
              </Button>
            </div>
            <div className="border-t border-slate-100 p-2 dark:border-slate-800">
              <Button
                variant="outline"
                className="h-10 w-full gap-2 rounded-lg border-slate-200 text-sm font-semibold shadow-sm"
              >
                <Clock className="h-4 w-4 text-slate-500" aria-hidden />
                View timeline
              </Button>
            </div>
          </section>

          <Button variant="outline" className="w-full gap-2 rounded-lg border-slate-200 font-medium text-slate-600">
            <MoreHorizontal className="h-4 w-4" aria-hidden />
            More options
          </Button>
        </div>
      </div>
    </div>
  );
}
