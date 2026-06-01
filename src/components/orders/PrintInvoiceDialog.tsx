import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import type { EnrichedOrder } from "@/lib/orders";

export function PrintInvoiceDialog({
  open,
  onOpenChange,
  orders,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: EnrichedOrder[];
}) {
  if (!orders || orders.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-background">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl">Print Invoice</DialogTitle>
            <DialogDescription>
              You are about to print an invoice. Use the print button below to generate the receipt.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-2">
          {/* Invoice Paper Box */}
          <div className="border border-border rounded-lg bg-white text-slate-900 max-h-[60vh] overflow-y-auto p-8 relative print:max-h-none print:overflow-visible print:border-none print:p-0" id="invoice-print-area">
            {orders.map((order, index) => (
              <div key={order.id} className={index > 0 ? "mt-16 print:mt-0 print:break-before-page" : ""}>
                {/* Top section */}
                <div className="flex justify-between items-start mb-6">
                  {/* Logo Area */}
                  <div className="flex items-center">
                    <img src="https://halamama.com/cdn/shop/files/halamama_green.svg" alt="Halamama Logo" className="h-10" />
                  </div>

                  {/* Invoice Meta */}
                  <div className="text-right text-sm">
                    <div className="font-bold text-lg mb-2">Invoice No. {order.id} :فاتورة</div>
                    <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-slate-600">
                      <div className="text-right">Order Date</div>
                      <div className="text-left font-medium">{order.date}</div>
                      <div className="text-right">Order Time</div>
                      <div className="text-left font-medium">{order.time}</div>
                      <div className="text-right">Payment</div>
                      <div className="text-left font-medium capitalize">{order.payment.balance > 0 ? "voided" : "paid"}</div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-200 mb-6" />

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
                  <div>
                    <h3 className="font-bold mb-3">Billing Address <span className="font-normal" dir="rtl">عنوان الفاتورة</span></h3>
                    <div className="font-bold mb-2">{order.customer.name}</div>
                    <div className="text-slate-600 leading-relaxed">
                      {order.shippingAddress.line1}<br />
                      {order.shippingAddress.line2}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.country}<br />
                      <div className="mt-2">{order.customer.phone}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-3">Shipping Address <span className="font-normal" dir="rtl">عنوان الشحن</span></h3>
                    <div className="font-bold mb-2">{order.customer.name}</div>
                    <div className="text-slate-600 leading-relaxed">
                      {order.shippingAddress.line1}<br />
                      {order.shippingAddress.line2}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.country}<br />
                      <div className="mt-2">{order.customer.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border border-slate-200 bg-slate-50 text-left">
                        <th className="p-3 font-bold border-r border-slate-200">
                          <div>Item Description</div>
                          <div className="text-xs font-normal text-slate-500 mt-1">العنصر</div>
                        </th>
                        <th className="p-3 font-bold border-r border-slate-200 w-24 text-center">
                          <div>Qty</div>
                          <div className="text-xs font-normal text-slate-500 mt-1">الكمية</div>
                        </th>
                        <th className="p-3 font-bold border-r border-slate-200 w-32 text-right">
                          <div>Unit Price</div>
                          <div className="text-xs font-normal text-slate-500 mt-1">سعر الوحدة</div>
                        </th>
                        <th className="p-3 font-bold border-r border-slate-200 w-16 text-center">
                          <div>FL</div>
                          <div className="text-xs font-normal text-slate-500 mt-1">فل.</div>
                        </th>
                        <th className="p-3 font-bold w-32 text-right">
                          <div>Total</div>
                          <div className="text-xs font-normal text-slate-500 mt-1">الإجمالي</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.itemsList.map((item, idx) => (
                        <tr key={item.id} className="border-b border-slate-200">
                          <td className="p-3 border-r border-slate-200">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded shadow-sm border border-slate-100 flex-shrink-0" />
                              )}
                              <span className="font-medium text-slate-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-3 border-r border-slate-200 text-center">{item.qty}</td>
                          <td className="p-3 border-r border-slate-200 text-right">QAR {item.price.toFixed(2)}</td>
                          <td className="p-3 border-r border-slate-200 text-center">00</td>
                          <td className="p-3 text-right">QAR {(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                      ))}
                      {order.itemsList.length === 0 && (
                        <tr className="border-b border-slate-200">
                          <td colSpan={5} className="p-4 text-center text-slate-500">No items found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals & Footer Area */}
                <div className="grid grid-cols-[1fr_300px] gap-8 mb-8">
                  {/* QR Code */}
                  <div className="flex flex-col justify-end">
                    <div className="flex items-start gap-4">
                      <div className="p-2 border border-slate-200 rounded-lg inline-block">
                        <QrCode className="w-16 h-16 text-slate-800" />
                      </div>
                      <div className="text-xs mt-2 text-slate-600 space-y-1">
                        <div>Scan for Return, Refund & Exchange Policy</div>
                        <div dir="rtl">امسح للاطلاع على سياسة الإرجاع والاسترداد والتبديل</div>
                      </div>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border border-slate-200 rounded">
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Subtotal <span className="text-xs ml-1">(المجموع الفرعي)</span></div>
                      <div className="text-right font-medium">QAR {order.payment.subtotal.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Discount <span className="text-xs ml-1">(الخصم)</span></div>
                      <div className="text-right font-medium">-QAR {order.payment.discount.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Shipping <span className="text-xs ml-1">(الشحن)</span></div>
                      <div className="text-right font-medium">QAR {order.payment.shipping.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm font-bold bg-slate-50">
                      <div>Grand Total <span className="text-xs font-normal ml-1">(المجموع الكلي)</span></div>
                      <div className="text-right">QAR {order.payment.total.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Paid by Customer<br/><span className="text-xs">(المدفوع من قبل العميل)</span></div>
                      <div className="text-right font-medium mt-auto">QAR {order.payment.totalPaid.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Refunded <span className="text-xs ml-1">(تم رد المبلغ)</span></div>
                      <div className="text-right font-medium">-QAR 0.00</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Outstanding Amount<br/><span className="text-xs">(المبلغ المستحق)</span></div>
                      <div className="text-right font-medium mt-auto">QAR {order.payment.balance.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 text-sm">
                      <div className="text-slate-600">Balance <span className="text-xs ml-1">(توازن)</span></div>
                      <div className="text-right font-medium">QAR 0.00</div>
                    </div>
                  </div>
                </div>

                {/* Support Text */}
                <div className="text-center text-xs text-slate-500 space-y-1 mb-8">
                  <div>If you have any questions, please send an email to contactus@halamama.com or contact us at +974 6658 3338</div>
                  <div dir="rtl">إذا كانت لديكم أي أسئلة، يرجى إرسال بريد إلكتروني إلى contactus@halamama.com أو التواصل معنا على الرقم 3338 6658 974+.</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={() => {
              window.print();
            }}
            className="bg-[#14a0a0] hover:bg-[#108585] text-white px-6"
          >
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
