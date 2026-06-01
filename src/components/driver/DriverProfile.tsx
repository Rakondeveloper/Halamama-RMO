import { UserCircle, MapPin, Star, Phone, Mail, FileText } from "lucide-react";

export function DriverProfile() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-muted/50 border-b border-border" />
        <div className="relative mx-auto w-20 h-20 bg-background border-4 border-card rounded-full flex items-center justify-center shadow-sm mt-2 mb-3">
          <UserCircle className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Ansil</h2>
        <p className="text-sm text-muted-foreground font-medium mb-4">Senior Delivery Driver</p>
        
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">4.9</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              Rating
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">1.2k</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <Package className="w-3 h-3" />
              Deliveries
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">2</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <MapPin className="w-3 h-3" />
              Zones
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Phone className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone Number</p>
            <p className="text-sm font-medium text-foreground">+974 5555 1234</p>
          </div>
        </div>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Mail className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">ansil@halamama.com</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vehicle Info</p>
            <p className="text-sm font-medium text-foreground">Nissan Sunny (A-12345)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  );
}
