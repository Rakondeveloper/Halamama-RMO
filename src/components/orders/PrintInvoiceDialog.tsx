import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getDeliveryDate, type EnrichedOrder } from "@/lib/orders";

/** Map fulfillment center code to short display label */
function getFLCode(fc?: string): string {
  if (!fc) return "FC";
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
  "Dr. Browns Level 1 W-N Silicone Options+ Nipple, 2-Pack": "حلمات سيليكون دكتور براونز من المستوى 1 Options N-W،+ عبوة من قطعتين",
  "Frida Baby NoseFrida Saline Snot Spray": "بخاخ الأنف الملحي فريدا بيبي نوز فريدا",
  "Frida Baby Nosefrida Saline Mist Inhaler": "جهاز استنشاق فريدا بيبي نوزفريدا بالرذاذ الملحي",
  "SmarTrike STR3 6-in-1 Stroller-Trike (Black)": "عربة ودراجة سمارت ترايك STR3 6 في 1 (لون أسود)",
  "Bestway Apx 365 Round Pool Set (12' x 30\")": "بركة سباحة دائرية بست واي بيست واي ابكس",
  "Smoby Green XL Slide": "زحليقة سموبي الخضراء XL",
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
        const total = payment.total ?? Math.max(0, subtotal + shipping - discount);

        const hasExplicitPartialData =
          (order.payment && (order.payment.balance != null || order.payment.totalPaid != null)) ||
          (order as any).paymentStatus === "Partially Paid";

        const totalPaid = hasExplicitPartialData
          ? (payment.totalPaid ?? Math.max(0, total - (payment.balance ?? 0)))
          : total;

        const balance = hasExplicitPartialData
          ? (payment.balance ?? Math.max(0, total - totalPaid))
          : 0;

        const refunded = (payment as any).refunded ?? 0;
        const paymentMethod = payment.method || (order as any).paymentMethod || "Cash";
        
        const isFullyPaid = balance <= 0 && totalPaid > 0;
        const paymentStatus = (order as any).paymentStatus || (balance > 0 ? (totalPaid > 0 ? "Partially Paid" : "Unpaid") : "Paid");

        const itemsList = order.itemsList || [];
        const customerName = order.customer?.name || "Customer";
        const customerPhone = order.customer?.phone || "";
        const shippingLine1 = order.shippingAddress?.line1 || "";
        const shippingLine2 = order.shippingAddress?.line2 || "";
        const shippingCity = order.shippingAddress?.city || "";
        const shippingCountry = order.shippingAddress?.country || "";

        return (
          <div
            key={order.id}
            className={`relative z-0 bg-white text-slate-900 ${
              index > 0 ? "mt-12 print:mt-0 print:break-before-page" : ""
            }`}
          >
            {/* PAID Watermark Tag (z-20 pointer-events-none translucent overlay for fully paid orders) */}
            {!isGift && (isFullyPaid || paymentStatus.toLowerCase() === "paid") && paymentStatus.toLowerCase() !== "partially paid" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden select-none">
                <span
                  className="invoice-paid-watermark text-[180px] sm:text-[230px] font-black uppercase tracking-widest transform -rotate-[35deg] whitespace-nowrap leading-none"
                  style={{ color: "rgba(15, 23, 42, 0.16)" }}
                >
                  PAID
                </span>
              </div>
            )}

            <div className="relative z-10">
              {/* Header section */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-4">
                {/* Logo Area */}
                <div className="flex items-center">
                  <img
                    src="https://halamama.com/cdn/shop/files/halamama_green.svg"
                    alt="Halamama Logo"
                    className="h-9 w-auto object-contain"
                  />
                </div>

                {/* Invoice Meta */}
                <div className="text-left sm:text-right text-xs">
                  <div className="font-bold text-base text-slate-900 mb-2">
                    {isGift ? (
                      <>Gift Receipt No. {order.id} <span dir="rtl">:إيصال هدية</span></>
                    ) : (
                      <>Invoice No. {order.id} <span dir="rtl">:فاتورة</span></>
                    )}
                  </div>
                  <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-slate-600">
                    <div className="text-left sm:text-right">Order Date</div>
                    <div className="text-left font-medium text-slate-900">{order.date}</div>
                    <div className="text-left sm:text-right">Order Time</div>
                    <div className="text-left font-medium text-slate-900">{order.time}</div>
                    <div className="text-left sm:text-right">Delivery Date</div>
                    <div className="text-left font-medium text-slate-900">{getDeliveryDate(order)}</div>
                    {!isGift && (
                      <>
                        <div className="text-left sm:text-right">Payment Method</div>
                        <div className="text-left font-medium capitalize text-slate-900">{paymentMethod}</div>
                        <div className="text-left sm:text-right">Payment Status</div>
                        <div className="text-left font-medium capitalize text-slate-900">{paymentStatus}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Divider */}
              <hr className="border-t border-slate-300 my-4" />

              {/* Address Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">
                    Billing Address <span className="font-normal text-slate-600 ml-1" dir="rtl">عنوان الفاتورة</span>
                  </h3>
                  <div className="font-bold text-slate-900 mb-1 text-xs">{customerName}</div>
                  <div className="text-slate-600 leading-relaxed space-y-0.5">
                    {shippingLine1 && <div>{shippingLine1}</div>}
                    {shippingLine2 && <div>{shippingLine2}</div>}
                    {(shippingCity || shippingCountry) && (
                      <div>{shippingCity}{shippingCity && shippingCountry ? ", " : ""}{shippingCountry}</div>
                    )}
                    {customerPhone && <div className="mt-1 text-slate-800 font-medium">{customerPhone}</div>}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">
                    Shipping Address <span className="font-normal text-slate-600 ml-1" dir="rtl">عنوان الشحن</span>
                  </h3>
                  <div className="font-bold text-slate-900 mb-1 text-xs">{customerName}</div>
                  <div className="text-slate-600 leading-relaxed space-y-0.5">
                    {shippingLine1 && <div>{shippingLine1}</div>}
                    {shippingLine2 && <div>{shippingLine2}</div>}
                    {(shippingCity || shippingCountry) && (
                      <div>{shippingCity}{shippingCity && shippingCountry ? ", " : ""}{shippingCountry}</div>
                    )}
                    {customerPhone && <div className="mt-1 text-slate-800 font-medium">{customerPhone}</div>}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6 overflow-x-auto w-full">
                <table className="w-full text-xs border-collapse border border-slate-300 min-w-[550px] sm:min-w-0">
                  <thead>
                    <tr className="bg-slate-50 text-slate-900 text-left">
                      <th className="p-2.5 font-bold border border-slate-300 w-[58%]">
                        <div>Item Description</div>
                        <div className="text-[10px] font-normal text-slate-500 mt-0.5" dir="rtl">العنصر</div>
                      </th>
                      <th className="p-2.5 font-bold border border-slate-300 w-[10%] text-center">
                        <div>Qty</div>
                        <div className="text-[10px] font-normal text-slate-500 mt-0.5" dir="rtl">الكمية</div>
                      </th>
                      {!isGift && (
                        <th className="p-2.5 font-bold border border-slate-300 w-[14%] text-right">
                          <div>Unit Price</div>
                          <div className="text-[10px] font-normal text-slate-500 mt-0.5" dir="rtl">سعر الوحدة</div>
                        </th>
                      )}
                      <th className="p-2.5 font-bold border border-slate-300 w-[7%] text-center">
                        <div>FL</div>
                        <div className="text-[10px] font-normal text-slate-500 mt-0.5" dir="rtl">فل.</div>
                      </th>
                      {!isGift && (
                        <th className="p-2.5 font-bold border border-slate-300 w-[11%] text-right">
                          <div>Total</div>
                          <div className="text-[10px] font-normal text-slate-500 mt-0.5" dir="rtl">الإجمالي</div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.map((item) => {
                      const arabicName = (item as any).arabicName || getArabicName(item.name);
                      const itemPrice = item.price ?? 0;
                      const itemQty = item.qty ?? 1;
                      const itemSku = item.sku || "N/A";
                      const itemBarcode = item.barcode ? ` | ${item.barcode}` : "";
                      const itemLocation = item.bin || (item as any).location || (item as any).loc;

                      return (
                        <tr key={item.id} className="border-b border-slate-300 print:break-inside-avoid">
                          <td className="p-2.5 border border-slate-300 text-left align-top">
                            <div className="flex items-start gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-11 h-11 object-contain rounded border border-slate-200 flex-shrink-0"
                                />
                              )}
                              <div className="space-y-0.5">
                                <div className="font-semibold text-slate-900 text-xs leading-snug">{item.name}</div>
                                {arabicName && (
                                  <div className="text-[11px] text-slate-700 font-medium leading-snug" dir="rtl">
                                    {arabicName}
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {itemSku}{itemBarcode}
                                </div>
                                {itemLocation && (
                                  <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200/80">
                                    LOC: {itemLocation}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-2.5 border border-slate-300 text-center font-medium align-middle">
                            {isGift ? `x${itemQty}` : itemQty}
                          </td>
                          {!isGift && (
                            <td className="p-2.5 border border-slate-300 text-right font-medium align-middle whitespace-nowrap">
                              QAR {itemPrice.toFixed(2)}
                            </td>
                          )}
                          <td className="p-2.5 border border-slate-300 text-center font-medium align-middle">
                            {getFLCode(item.fc)}
                          </td>
                          {!isGift && (
                            <td className="p-2.5 border border-slate-300 text-right font-semibold align-middle whitespace-nowrap">
                              QAR {(itemPrice * itemQty).toFixed(2)}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {itemsList.length === 0 && (
                      <tr className="border-b border-slate-300">
                        <td colSpan={isGift ? 3 : 5} className="p-4 text-center text-slate-500">
                          No items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary or Gift Footer */}
              {isGift ? (
                <div className="space-y-6 mt-8 print:break-inside-avoid">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-1.5 border border-slate-200 rounded-lg inline-block bg-white shadow-sm">
                      <img
                        src="https://app.routemyorder.com/qr%20halamama.jpeg"
                        alt="QR Code"
                        className="w-20 h-20 object-contain rounded"
                      />
                    </div>
                    <div className="text-[11px] mt-2 text-slate-700 text-center space-y-0.5 font-medium">
                      <div>Scan for Return, Refund & Exchange Policy</div>
                      <div dir="rtl">امسح للاطلاع على سياسة الإرجاع والاسترداد والتبديل</div>
                    </div>
                  </div>
                  <div className="text-center text-[11px] text-slate-500 space-y-0.5 mb-6">
                    <div>If you have any questions, please send an email to contactus@halamama.com or contact us at +974 6658 3338</div>
                    <div dir="rtl">إذا كانت لديكم أي أسئلة، يرجى إرسال بريد إلكتروني إلى contactus@halamama.com أو التواصل معنا على الرقم 3338 6658 974+.</div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Totals Table - Aligned to right */}
                  <div className="flex justify-end mb-8 print:break-inside-avoid">
                    <div className="invoice-summary-box w-full sm:w-[320px] print:w-[320px] text-xs border border-slate-300 rounded bg-white overflow-hidden">
                      <table className="w-full text-xs border-collapse">
                        <tbody>
                          <tr className="border-b border-slate-300">
                            <td className="p-2 text-slate-600">
                              Subtotal <span className="text-[10px] text-slate-500 ml-0.5">(المجموع الفرعي)</span>
                            </td>
                            <td className="p-2 text-right font-medium text-slate-900 whitespace-nowrap">
                              QAR {subtotal.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300">
                            <td className="p-2 text-slate-600">
                              Discount <span className="text-[10px] text-slate-500 ml-0.5">(الخصم)</span>
                            </td>
                            <td className="p-2 text-right font-medium text-slate-900 whitespace-nowrap">
                              -QAR {discount.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300">
                            <td className="p-2 text-slate-600">
                              Shipping <span className="text-[10px] text-slate-500 ml-0.5">(الشحن)</span>
                            </td>
                            <td className="p-2 text-right font-medium text-slate-900 whitespace-nowrap">
                              QAR {shipping.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300 bg-slate-50 font-bold">
                            <td className="p-2 text-slate-900">
                              Grand Total <span className="text-[10px] font-normal text-slate-600 ml-0.5">(المجموع الكلي)</span>
                            </td>
                            <td className="p-2 text-right text-slate-900 whitespace-nowrap">
                              QAR {total.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300">
                            <td className="p-2 text-slate-600">
                              Paid by Customer <br />
                              <span className="text-[10px] text-slate-500">(المدفوع من قبل العميل)</span>
                            </td>
                            <td className="p-2 text-right font-medium text-slate-900 align-bottom whitespace-nowrap">
                              QAR {totalPaid.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300">
                            <td className="p-2 text-slate-600">
                              Refunded <span className="text-[10px] text-slate-500 ml-0.5">(تم رد المبلغ)</span>
                            </td>
                            <td className="p-2 text-right font-medium text-slate-900 whitespace-nowrap">
                              -QAR {refunded.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300">
                            <td className="p-2 text-slate-600">
                              Outstanding Amount <br />
                              <span className="text-[10px] text-slate-500">(المبلغ المستحق)</span>
                            </td>
                            <td className="p-2 text-right font-medium text-slate-900 align-bottom whitespace-nowrap">
                              QAR {balance.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-slate-600">
                              Balance <span className="text-[10px] text-slate-500 ml-0.5">(توازن)</span>
                            </td>
                            <td className="p-2 text-right font-medium text-slate-900 whitespace-nowrap">
                              QAR 0.00
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* QR Code and Policy Section */}
                  <div className="flex flex-col items-center justify-center mb-6 mt-8 print:break-inside-avoid">
                    <div className="p-1.5 border border-slate-200 rounded-lg inline-block bg-white shadow-sm">
                      <img
                        src="https://app.routemyorder.com/qr%20halamama.jpeg"
                        alt="QR Code"
                        className="w-20 h-20 object-contain rounded"
                      />
                    </div>
                    <div className="text-[11px] mt-2 text-slate-700 text-center space-y-0.5 font-medium">
                      <div>Scan for Return, Refund & Exchange Policy</div>
                      <div dir="rtl">امسح للاطلاع على سياسة الإرجاع والاسترداد والتبديل</div>
                    </div>
                  </div>

                  {/* Support Footer */}
                  <div className="text-center text-[11px] text-slate-500 space-y-0.5 mb-4 print:break-inside-avoid">
                    <div>If you have any questions, please send an email to contactus@halamama.com or contact us at +974 6658 3338</div>
                    <div dir="rtl">إذا كانت لديكم أي أسئلة، يرجى إرسال بريد إلكتروني إلى contactus@halamama.com أو التواصل معنا على الرقم 3338 6658 974+.</div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

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
            <div
              className="border border-border rounded-lg bg-white text-slate-900 p-4 sm:p-8 relative print:max-h-none print:overflow-visible print:border-none print:p-0"
              id="invoice-print-area"
            >
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
      {open &&
        createPortal(
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
