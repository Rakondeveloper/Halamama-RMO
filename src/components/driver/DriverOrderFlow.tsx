import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Navigation, Package, XCircle, CreditCard, Banknote, Link as LinkIcon, CheckCircle2, ChevronLeft, Map as MapIcon, Phone, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Mocking toast for now
const useToast = () => ({
  success: (msg: string) => console.log("Success:", msg),
  error: (msg: string) => console.error("Error:", msg),
});

interface DriverOrderFlowProps {
  order: any;
  open: boolean;
  onClose: () => void;
}

type FlowStep = "verify" | "navigate" | "deliver";

export function DriverOrderFlow({ order, open, onClose }: DriverOrderFlowProps) {
  const [step, setStep] = useState<FlowStep>("verify");
  
  // Modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "link">("card");
  const [amountCollected, setAmountCollected] = useState(order?.total?.toString() || "");

  const [failureModalOpen, setFailureModalOpen] = useState(false);
  const [failureReason, setFailureReason] = useState("");

  const { success } = useToast();

  if (!order) return null;

  const handleVerifyBags = () => {
    setStep("navigate");
    success("Bags verified. Ready to route.");
  };

  const handleStartDelivery = () => {
    setStep("deliver");
    success("Delivery started.");
  };

  const handleSuccess = () => {
    // In a real app, API call goes here
    success("Delivery marked as successful!");
    setPaymentModalOpen(false);
    onClose();
    // Simulate changing status globally in a real app
    order.status = "Delivered"; 
  };

  const handleFail = () => {
    if (!failureReason) return;
    // In a real app, API call goes here
    success("Delivery marked as failed.");
    setFailureModalOpen(false);
    onClose();
    // Simulate changing status globally in a real app
    order.status = "Delivery Failed";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
        <DialogContent className="max-w-md p-0 h-[100dvh] sm:h-[85vh] flex flex-col overflow-hidden bg-background border-none sm:border-solid sm:border-border rounded-none sm:rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card z-10 shadow-sm">
            <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-muted text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h2 className="text-[15px] font-bold tracking-tight text-foreground">{order.id}</h2>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{order.zone} Zone</p>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-muted/20 relative flex flex-col">
            
            {/* Customer Quick Info Card */}
            <div className="bg-card px-4 py-4 border-b border-border shadow-sm z-10 relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-foreground text-lg">{order.customer}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                    <Phone className="h-3 w-3" />
                    +974 5555 0000
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">QAR {order.total.toFixed(2)}</div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5 tracking-wider bg-muted px-1.5 py-0.5 rounded inline-block">COD</div>
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/90 font-medium leading-snug">
                    {order.shippingAddress?.line1 || "Street 25, Villa 42"}<br/>
                    {order.shippingAddress?.city || "Doha, Qatar"}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Step Content */}
            <div className="p-4 flex-1 flex flex-col gap-4">
              {step === "verify" && (
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Verify Packages</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                    Ensure you have the correct number of bags before leaving the center.
                  </p>
                  <div className="w-full bg-muted/50 rounded-lg p-4 mb-4 border border-border/50">
                    <div className="text-3xl font-black text-foreground mb-1">{order.bags || 1}</div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Bags</div>
                  </div>
                </div>
              )}

              {(step === "navigate" || step === "deliver") && (
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col relative min-h-[250px]">
                  {/* Fake Map */}
                  <div className="absolute inset-0 bg-[#e5e3df] dark:bg-[#242f3e] flex items-center justify-center overflow-hidden">
                    {/* Grid Pattern to simulate map */}
                    <div className="absolute inset-0 opacity-10" 
                         style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>
                    {/* Route line simulation */}
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 50 80 Q 20 50 60 20" fill="none" stroke="currentColor" strokeWidth="4" className="text-blue-500/50" strokeDasharray="5,5" />
                    </svg>
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-2 animate-pulse">
                        <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                      </div>
                      <div className="bg-background/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-bold text-foreground">15 min</span>
                        <span className="text-xs font-medium text-muted-foreground border-l border-border pl-2">4.2 km</span>
                      </div>
                    </div>
                  </div>
                  
                  {step === "deliver" && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-in fade-in zoom-in">
                      En Route to Customer
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className="border-t border-border bg-card p-4 pb-safe shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20">
            {step === "verify" && (
              <button 
                onClick={handleVerifyBags}
                className="w-full bg-foreground text-background font-semibold py-3.5 rounded-xl hover:bg-foreground/90 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Verify Bags & Continue
              </button>
            )}

            {step === "navigate" && (
              <button 
                onClick={handleStartDelivery}
                className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Navigation className="h-5 w-5" />
                Start Delivery Route
              </button>
            )}

            {step === "deliver" && (
              <div className="flex gap-3">
                <button 
                  onClick={() => setFailureModalOpen(true)}
                  className="flex-1 bg-muted text-foreground font-semibold py-3.5 rounded-xl hover:bg-muted/80 transition-colors border border-border shadow-sm flex items-center justify-center gap-2"
                >
                  <XCircle className="h-5 w-5 opacity-70" />
                  Failed
                </button>
                <button 
                  onClick={() => setPaymentModalOpen(true)}
                  className="flex-[2] bg-emerald-600 text-white font-semibold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Mark Delivered
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Collection Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[400px] w-[95vw] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b border-border bg-muted/20">
            <DialogTitle className="text-center text-lg">Collect Payment</DialogTitle>
          </DialogHeader>
          <div className="p-5 space-y-5">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Total Amount Due</p>
              <div className="text-3xl font-bold text-foreground">QAR {order.total.toFixed(2)}</div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                <PaymentOption 
                  icon={Banknote} 
                  label="Cash" 
                  selected={paymentMethod === "cash"} 
                  onClick={() => setPaymentMethod("cash")} 
                />
                <PaymentOption 
                  icon={CreditCard} 
                  label="Card" 
                  selected={paymentMethod === "card"} 
                  onClick={() => setPaymentMethod("card")} 
                />
                <PaymentOption 
                  icon={LinkIcon} 
                  label="Link" 
                  selected={paymentMethod === "link"} 
                  onClick={() => setPaymentMethod("link")} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount Collected (QAR)</label>
              <input 
                type="number" 
                value={amountCollected}
                onChange={(e) => setAmountCollected(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="0.00"
              />
            </div>
            
            <button 
              onClick={handleSuccess}
              className="w-full bg-foreground text-background font-bold py-3.5 rounded-xl hover:bg-foreground/90 transition-all shadow-sm"
            >
              Confirm & Complete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Failure Modal */}
      <Dialog open={failureModalOpen} onOpenChange={setFailureModalOpen}>
        <DialogContent className="sm:max-w-[400px] w-[95vw] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b border-border bg-muted/20">
            <DialogTitle className="text-center text-lg text-red-600 dark:text-red-400">Delivery Failed</DialogTitle>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground mb-2">Please select the primary reason for failure. This will notify the admin team to reschedule.</p>
            
            <div className="space-y-2">
              {["Customer not answering", "Wrong address", "Customer unavailable", "Unable to contact customer", "Other"].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setFailureReason(reason)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-sm font-medium",
                    failureReason === reason 
                      ? "border-foreground bg-foreground/5 text-foreground" 
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {reason}
                  {failureReason === reason && <div className="w-2 h-2 rounded-full bg-foreground" />}
                </button>
              ))}
            </div>

            <button 
              onClick={handleFail}
              disabled={!failureReason}
              className="w-full mt-4 bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Failure Report
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PaymentOption({ icon: Icon, label, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all h-20",
        selected 
          ? "border-foreground bg-foreground text-background shadow-md" 
          : "border-border bg-card text-muted-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
