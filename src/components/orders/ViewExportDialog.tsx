import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import type { EnrichedOrder, OrderTimelineEvent } from "@/lib/orders";

export function ViewExportDialog({
  open,
  onOpenChange,
  orders,
  activeTab,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: EnrichedOrder[];
  activeTab: string;
}) {
  if (!orders || orders.length === 0) return null;

  // Helper to render timeline stages
  const renderTimeline = (timeline: OrderTimelineEvent[]) => {
    const placed = timeline.find((e) => e.type === "placed");
    const picking = timeline.find((e) => e.type === "picking_started" || e.type === "picking_completed" || e.type === "picker_assigned");
    const packing = timeline.find((e) => e.type === "packing_started" || e.type === "packing_completed" || e.type === "packer_assigned");
    const assigned = timeline.find((e) => e.type === "driver_assigned");
    const started = timeline.find((e) => e.type === "started");
    const delivered = timeline.find((e) => e.type === "delivered" || e.type === "delivery_failed");

    const steps = [
      { id: 'placed', label: 'PLACED', event: placed, icon: "activity", color: "text-blue-500" },
      { id: 'picking', label: 'PICKING', event: picking, icon: "user", color: "text-orange-500" },
      { id: 'packing', label: 'PACKING', event: packing, icon: "package", color: "text-purple-500" },
      { id: 'assigned', label: 'ASSIGNED', event: assigned, icon: "user-plus", color: "text-indigo-500" },
      { id: 'started', label: 'STARTED', event: started, icon: "truck", color: "text-emerald-500" },
      { id: 'delivered', label: 'DELIVERED', event: delivered, icon: "check-circle", color: "text-green-600" },
    ];

    return (
      <div className="flex gap-6 overflow-x-auto text-xs py-2 scrollbar-none">
        {steps.map((step) => {
          const isActive = !!step.event;
          return (
            <div key={step.id} className={`flex flex-col gap-1 min-w-[100px] ${isActive ? '' : 'opacity-30 grayscale'}`}>
              <div className={`font-bold flex items-center gap-1 ${isActive ? step.color : 'text-slate-400'}`}>
                {/* Minimal pseudo-icons for layout */}
                <span className="w-3 h-3 border rounded-sm flex items-center justify-center currentColor border-current"></span>
                {step.label}
              </div>
              <div className="font-bold text-slate-900 mt-1">
                {isActive ? `${step.event?.date}, ${step.event?.time}` : 'pending'}
              </div>
              {isActive && step.event?.actor && (
                <div className="text-slate-500 italic">by {step.event.actor}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-slate-50/50">
        <div className="p-6 pb-4 bg-white border-b border-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-orange-500" />
              <DialogTitle className="text-2xl font-semibold">Review Export Data</DialogTitle>
            </div>
            <DialogDescription className="text-base text-slate-500 mt-2">
              You are about to export {orders.length} order(s) matching your current criteria.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] bg-slate-50">
          {/* Filters Info */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-3">
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Status Tab</div>
              <div className="font-medium text-slate-900">{activeTab}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Zone</div>
              <div className="font-medium text-slate-900">All Zones</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Date Range</div>
              <div className="font-medium text-slate-900">Default Range</div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="text-orange-600 font-bold text-lg underline decoration-orange-200 underline-offset-4 cursor-pointer hover:text-orange-700">Order {order.id}</span>
                    <span className="px-3 py-1 rounded-full border border-slate-200 text-xs font-bold bg-white text-slate-900 shadow-sm">
                      QAR {order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-bold text-slate-900 uppercase">{order.customer.name}</div>
                    <div className="text-slate-500">{order.customer.email}</div>
                  </div>
                </div>
                
                {/* Timeline */}
                <div className="px-4 py-3 border-b border-slate-100 bg-white">
                  {renderTimeline(order.timeline)}
                </div>

                {/* Items Table (Invoice Style) */}
                <div className="p-4 bg-white border-b border-slate-100">
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-left border-b border-slate-200">
                          <th className="p-3 font-bold border-r border-slate-200 text-slate-800">
                            <div>Item Description</div>
                            <div className="text-xs font-normal text-slate-500 mt-1">العنصر</div>
                          </th>
                          <th className="p-3 font-bold border-r border-slate-200 w-24 text-center text-slate-800">
                            <div>Qty</div>
                            <div className="text-xs font-normal text-slate-500 mt-1">الكمية</div>
                          </th>
                          <th className="p-3 font-bold border-r border-slate-200 w-32 text-right text-slate-800">
                            <div>Unit Price</div>
                            <div className="text-xs font-normal text-slate-500 mt-1">سعر الوحدة</div>
                          </th>
                          <th className="p-3 font-bold border-r border-slate-200 w-16 text-center text-slate-800">
                            <div>FL</div>
                            <div className="text-xs font-normal text-slate-500 mt-1">فل.</div>
                          </th>
                          <th className="p-3 font-bold w-32 text-right text-slate-800">
                            <div>Total</div>
                            <div className="text-xs font-normal text-slate-500 mt-1">الإجمالي</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.itemsList.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                            <td className="p-3 border-r border-slate-200">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded shadow-sm border border-slate-100 flex-shrink-0" />
                                )}
                                <span className="font-medium text-slate-800">{item.name}</span>
                              </div>
                            </td>
                            <td className="p-3 border-r border-slate-200 text-center font-medium">{item.qty}</td>
                            <td className="p-3 border-r border-slate-200 text-right text-slate-600">QAR {item.price.toFixed(2)}</td>
                            <td className="p-3 border-r border-slate-200 text-center text-slate-400">00</td>
                            <td className="p-3 text-right font-medium text-slate-800">QAR {(item.price * item.qty).toFixed(2)}</td>
                          </tr>
                        ))}
                        {order.itemsList.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-slate-500">No items found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 flex items-center flex-wrap gap-x-8 gap-y-2 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase tracking-wider">Payment:</span> 
                    <span className="text-slate-900">{order.payment.method.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase tracking-wider">Status:</span> 
                    <span className="text-orange-500 uppercase px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-[10px]">
                      {order.status === 'Cancelled' ? 'Refunded' : order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-slate-500 uppercase tracking-wider">Collected:</span> 
                    <span className="text-green-600 text-sm">QAR {order.payment.totalPaid.toFixed(2)}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 p-6 pt-4 bg-white border-t border-slate-100">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-11 text-slate-700 font-semibold border-slate-300">
            Cancel
          </Button>
          <Button 
            className="bg-[#ea580c] hover:bg-[#c2410c] text-white px-6 h-11 gap-2 shadow-sm font-semibold text-base"
            onClick={() => {
              // Real export logic here
              const csvContent = "data:text/csv;charset=utf-8,ID,Customer,Total\n" + orders.map(o => `${o.id},${o.customer.name},${o.total}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "orders_export.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onOpenChange(false);
            }}
          >
            <Download className="w-4 h-4" />
            Confirm & Export CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
