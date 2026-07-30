import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { getDeliveryDate, type EnrichedOrder } from "@/lib/orders";

/** Map fulfillment center code to short display label */
function getFLCode(fc: string): string {
  if (fc === "F01") return "FCH";
  if (fc === "MWO" || fc === "P63") return "MWO";
  return fc;
}

/** Arabic translations dictionary for mock/demo products */
const ARABIC_NAMES: Record<string, string> = {
  "Baby Brezza Bottle Washer Pro Detergent Tablets": "أقراص منظف غسالة زجاجات الأطفال بيبي بريزا برو",
  "Dr. Browns 5 oz / 150 ml PP Wide-Neck \"Options\" Baby Bottle, 2-Pack": "زجاجة رضاعة أطفال دكتور براونز سعة 150 مل (5 أونصة) ذات عنق عريض من البولي بروبيلين، عبوة من قطعتين",
  "Moon Baby Bath Sponge": "إسفنجة استحمام مون بيبي",
  "Munchkin Dots Bath Mat": "سجادة حمام منقوشة بنقاط مونشكن",
  "Elodie Details Pacifier (Faded Rose)": "لهاية إيلودي ديتي (لون وردي باهت)",
  "Babyhood Riya Cot - White/Beech": "سرير أطفال بيبي هود ريا - أبيض/خشب الزان",
  "TheKiddoz Bath and Changing Table - Animal design": "طاولة الاستحمام وتغيير الحفاضات من ذا كيدوز - تصميم حيواني",
  "Dr. Browns 5 oz/150 ml Glass W-N Options+ Bottle, 1-Pack": "زجاجة دكتور براونز سعة 150 مل (5 أونصة) من الزجاج W-N Options+، عبوة واحدة",
  "Frida Baby NoseFrida Saline Snot Spray": "بخاخ الأنف الملحي فريدا بيبي نوز فريدا",
  "SmarTrike STR3 6-in-1 Stroller-Trike (Black)": "عربة ودراجة سمارت ترايك STR3 6 في 1 (لون أسود)",
};

/** Get Arabic name of a product */
function getArabicName(name: string): string {
  return ARABIC_NAMES[name] || ARABIC_NAMES[name.replace(/\s+/g, " ").trim()] || "";
}

export function InvoicePrintLayout({
  orders,
  isGift = false,
}: {
  orders: EnrichedOrder[];
  isGift?: boolean;
}) {
  return (
    <>
      {orders.map((order, index) => {
        const payment = order.payment || {
          subtotal: order.total || 0,
          discount: 0,
          shipping: 0,
          total: order.total || 0,
          totalPaid: order.total || 0,
          balance: 0,
        };
        const subtotal = payment.subtotal ?? order.total ?? 0;
        const discount = payment.discount ?? 0;
        const shipping = payment.shipping ?? 0;
        const total = payment.total ?? order.total ?? 0;
        const totalPaid = payment.totalPaid ?? total;
        const balance = payment.balance ?? 0;
        const itemsList = order.itemsList || [];
        const customerName = order.customer?.name || "Customer";
        const customerPhone = order.customer?.phone || "";
        const shippingLine1 = order.shippingAddress?.line1 || "";
        const shippingLine2 = order.shippingAddress?.line2 || "";
        const shippingCity = order.shippingAddress?.city || "";
        const shippingCountry = order.shippingAddress?.country || "";

        return (
          <div key={order.id} className={index > 0 ? "mt-16 print:mt-0 print:break-before-page" : ""}>
            {/* Top section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6">
              {/* Logo Area */}
              <div className="flex items-center">
                <img src="https://halamama.com/cdn/shop/files/halamama_green.svg" alt="Halamama Logo" className="h-10" />
              </div>

              {/* Invoice Meta */}
              <div className="text-left sm:text-right text-sm">
                <div className="font-bold text-lg mb-2">
                  {isGift
                    ? <>Gift Receipt No. {order.id} <span dir="rtl">:إيصال هدية</span></>
                    : <>Invoice No. {order.id} :فاتورة</>
                  }
                </div>
                <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-slate-600">
                  <div className="text-left sm:text-right">Order Date</div>
                  <div className="text-left font-medium">{order.date}</div>
                  <div className="text-left sm:text-right">Order Time</div>
                  <div className="text-left font-medium">{order.time}</div>
                  <div className="text-left sm:text-right">Delivery Date</div>
                  <div className="text-left font-medium">{getDeliveryDate(order)}</div>
                  {!isGift && (
                    <>
                      <div className="text-left sm:text-right">Payment</div>
                      <div className="text-left font-medium capitalize">{balance > 0 ? "voided" : "paid"}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-slate-200 mb-6" />

            {/* Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 text-sm">
              <div>
                <h3 className="font-bold mb-3">Billing Address <span className="font-normal" dir="rtl">عنوان الفاتورة</span></h3>
                <div className="font-bold mb-2">{customerName}</div>
                <div className="text-slate-600 leading-relaxed">
                  {shippingLine1}{shippingLine1 && <br />}
                  {shippingLine2}{shippingLine2 && <br />}
                  {shippingCity}{shippingCity && shippingCountry ? ", " : ""}{shippingCountry}<br />
                  <div className="mt-2">{customerPhone}</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-3">Shipping Address <span className="font-normal" dir="rtl">عنوان الشحن</span></h3>
                <div className="font-bold mb-2">{customerName}</div>
                <div className="text-slate-600 leading-relaxed">
                  {shippingLine1}{shippingLine1 && <br />}
                  {shippingLine2}{shippingLine2 && <br />}
                  {shippingCity}{shippingCity && shippingCountry ? ", " : ""}{shippingCountry}<br />
                  <div className="mt-2">{customerPhone}</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
              <table className="w-full text-sm border-collapse min-w-[600px] sm:min-w-0">
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
                    {!isGift && (
                      <th className="p-3 font-bold border-r border-slate-200 w-32 text-right">
                        <div>Unit Price</div>
                        <div className="text-xs font-normal text-slate-500 mt-1">سعر الوحدة</div>
                      </th>
                    )}
                    <th className="p-3 font-bold border-r border-slate-200 w-16 text-center">
                      <div>FL</div>
                      <div className="text-xs font-normal text-slate-500 mt-1">فل.</div>
                    </th>
                    {!isGift && (
                      <th className="p-3 font-bold w-32 text-right">
                        <div>Total</div>
                        <div className="text-xs font-normal text-slate-500 mt-1">الإجمالي</div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {itemsList.map((item) => {
                    const arabicName = getArabicName(item.name);
                    const itemPrice = item.price ?? 0;
                    const itemQty = item.qty ?? 1;
                    return (
                      <tr key={item.id} className="border-b border-slate-200">
                        <td className="p-3 border-r border-slate-200">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded shadow-sm border border-slate-100 flex-shrink-0 print:hidden" />
                            )}
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                              {arabicName && (
                                <div className="text-xs text-slate-700 font-medium" dir="rtl">{arabicName}</div>
                              )}
                              <div className="text-[11px] text-slate-400">
                                {item.sku || "N/A"}{item.barcode ? ` | ${item.barcode}` : ""}
                              </div>
                              {item.bin && (
                                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/50">
                                  LOC: {item.bin}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 border-r border-slate-200 text-center font-medium">
                          {isGift ? `x${itemQty}` : itemQty}
                        </td>
                        {!isGift && (
                          <td className="p-3 border-r border-slate-200 text-right">QAR {itemPrice.toFixed(2)}</td>
                        )}
                        <td className="p-3 border-r border-slate-200 text-center font-medium">
                          {getFLCode(item.fc)}
                        </td>
                        {!isGift && (
                          <td className="p-3 text-right">QAR {(itemPrice * itemQty).toFixed(2)}</td>
                        )}
                      </tr>
                    );
                  })}
                  {itemsList.length === 0 && (
                    <tr className="border-b border-slate-200">
                      <td colSpan={isGift ? 3 : 5} className="p-4 text-center text-slate-500">No items found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Area */}
            {isGift ? (
              /* Gift Invoice Footer: Centered QR code and centered contact details */
              <div className="space-y-6 mt-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-2 border border-slate-200 rounded-lg inline-block bg-white">
                    <QrCode className="w-16 h-16 text-slate-800" />
                  </div>
                  <div className="text-xs mt-2 text-slate-600 text-center space-y-1">
                    <div>Scan for Return, Refund & Exchange Policy</div>
                    <div dir="rtl">امسح للاطلاع على سياسة الإرجاع والاسترداد والتبديل</div>
                  </div>
                </div>
                <div className="text-center text-xs text-slate-500 space-y-1 mb-8">
                  <div>If you have any questions, please send an email to contactus@halamama.com or contact us at +974 6658 3338</div>
                  <div>إذا كانت لديكم أي أسئلة، يرجى إرسال بريد إلكتروني إلى contactus@halamama.com أو التواصل معنا على الرقم 3338 6658 974+.</div>
                </div>
              </div>
            ) : (
              /* Normal Invoice Footer: Totals first, then QR code, then support text */
              <>
                {/* Totals - Aligned to the right */}
                <div className="flex justify-end mb-8">
                  <div className="border border-slate-200 rounded w-full sm:w-[300px] print:w-[300px]">
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Subtotal <span className="text-xs ml-1">(المجموع الفرعي)</span></div>
                      <div className="text-right font-medium">QAR {subtotal.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Discount <span className="text-xs ml-1">(الخصم)</span></div>
                      <div className="text-right font-medium">-QAR {discount.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Shipping <span className="text-xs ml-1">(الشحن)</span></div>
                      <div className="text-right font-medium">QAR {shipping.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm font-bold bg-slate-50">
                      <div>Grand Total <span className="text-xs font-normal ml-1">(المجموع الكلي)</span></div>
                      <div className="text-right">QAR {total.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Paid by Customer<br/><span className="text-xs">(المدفوع من قبل العميل)</span></div>
                      <div className="text-right font-medium mt-auto">QAR {totalPaid.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Refunded <span className="text-xs ml-1">(تم رد المبلغ)</span></div>
                      <div className="text-right font-medium">-QAR 0.00</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 border-b border-slate-200 text-sm">
                      <div className="text-slate-600">Outstanding Amount<br/><span className="text-xs">(المبلغ المستحق)</span></div>
                      <div className="text-right font-medium mt-auto">QAR {balance.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 p-2 text-sm">
                      <div className="text-slate-600">Balance <span className="text-xs ml-1">(توازن)</span></div>
                      <div className="text-right font-medium">QAR 0.00</div>
                    </div>
                  </div>
                </div>

                {/* QR Code and Policy - Centered and brought down */}
                <div className="flex flex-col items-center justify-center mb-8 mt-12 print:break-inside-avoid">
                  <div className="p-2 border border-slate-200 rounded-lg inline-block bg-white shadow-sm">
                    <QrCode className="w-16 h-16 text-slate-800" />
                  </div>
                  <div className="text-xs mt-3 text-slate-700 text-center space-y-1">
                    <div className="font-semibold">Scan for Return, Refund & Exchange Policy</div>
                    <div dir="rtl" className="font-semibold">امسح للاطلاع على سياسة الإرجاع والاسترداد والتبديل</div>
                  </div>
                </div>

                {/* Support Text */}
                <div className="text-center text-xs text-slate-500 space-y-1 mb-8 print:break-inside-avoid">
                  <div>If you have any questions, please send an email to contactus@halamama.com or contact us at +974 6658 3338</div>
                  <div>إذا كانت لديكم أي أسئلة، يرجى إرسال بريد إلكتروني إلى contactus@halamama.com أو التواصل معنا على الرقم 3338 6658 974+.</div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

import { createPortal } from "react-dom";

export function PrintInvoiceDialog({
  open,
  onOpenChange,
  orders,
  isGift = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: EnrichedOrder[];
  isGift?: boolean;
}) {
  if (!orders || orders.length === 0) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-4xl p-0 overflow-hidden bg-background max-h-[90vh] flex flex-col print:hidden">
          <div className="p-6 pb-4 border-b border-border flex-shrink-0 print:hidden">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isGift ? "Print Gift Invoice" : "Print Invoice"}
              </DialogTitle>
              <DialogDescription>
                You are about to print an invoice. Use the print button below to generate the receipt.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-muted/5">
            {/* Invoice Paper Box */}
            <div className="border border-border rounded-lg bg-white text-slate-900 p-4 sm:p-8 relative print:max-h-none print:overflow-visible print:border-none print:p-0" id="invoice-print-area">
              <InvoicePrintLayout orders={orders} isGift={isGift} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border flex-shrink-0 bg-muted/20 print:hidden">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
              Close
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                window.print();
                onOpenChange(false);
              }}
              className="bg-[#14a0a0] hover:bg-[#108585] text-white px-6"
            >
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dedicated print portal directly appended to document.body outside #root and dialog overlays */}
      {open && createPortal(
        <div className="print-only">
          <div className="bg-white text-slate-900 p-8 w-full">
            <InvoicePrintLayout orders={orders} isGift={isGift} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
