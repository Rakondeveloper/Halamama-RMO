import { Truck, MapPin, Navigation } from "lucide-react";

const drivers = [
  { name: "Karim S.", zone: "West Bay", load: 4, eta: "12 min", status: "moving", x: 35, y: 40 },
  { name: "Bilal H.", zone: "Al Wakrah", load: 3, eta: "8 min", status: "moving", x: 65, y: 70 },
  { name: "Tareq F.", zone: "The Pearl", load: 2, eta: "Idle", status: "idle", x: 25, y: 25 },
  { name: "Saad N.", zone: "Lusail", load: 5, eta: "20 min", status: "moving", x: 50, y: 18 },
];

export function DeliveryMap() {
  return (
    <section className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-border">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Live Delivery Map · Doha</h2>
          <p className="text-[11px] text-muted-foreground">
            12 drivers active · 41 orders en route
          </p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
          <Navigation className="h-3.5 w-3.5" /> Full map
        </button>
      </div>

      <div className="relative h-[280px] overflow-hidden bg-gradient-to-br from-info/5 via-primary/5 to-success/5">
        {/* grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* roads */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path
            d="M 0 50 Q 30 30, 50 50 T 100 50"
            stroke="currentColor"
            className="text-muted-foreground/30"
            strokeWidth="0.4"
            fill="none"
            strokeDasharray="2 1.5"
          />
          <path
            d="M 50 0 Q 40 40, 60 60 T 70 100"
            stroke="currentColor"
            className="text-muted-foreground/30"
            strokeWidth="0.4"
            fill="none"
            strokeDasharray="2 1.5"
          />
          <path
            d="M 20 0 L 80 100"
            stroke="currentColor"
            className="text-muted-foreground/20"
            strokeWidth="0.3"
            fill="none"
          />
        </svg>

        {/* warehouse */}
        <div className="absolute" style={{ left: "45%", top: "50%" }}>
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary shadow-glow grid place-items-center text-white">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-card border border-border rounded px-1.5 py-0.5 shadow-soft">
              HQ Warehouse
            </div>
          </div>
        </div>

        {/* drivers */}
        {drivers.map((d) => (
          <div key={d.name} className="absolute group" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <div
                className={`h-8 w-8 rounded-full bg-card border-2 ${d.status === "moving" ? "border-success" : "border-muted-foreground/40"} grid place-items-center shadow-soft`}
              >
                <Truck
                  className={`h-3.5 w-3.5 ${d.status === "moving" ? "text-success" : "text-muted-foreground"}`}
                />
              </div>
              {d.status === "moving" && (
                <span className="absolute inset-0 rounded-full bg-success/30 animate-ping" />
              )}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-lg px-2 py-1.5 shadow-elevated whitespace-nowrap z-10">
                <div className="text-[11px] font-semibold">{d.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {d.zone} · {d.load} orders · {d.eta}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* zone heatmap blob */}
        <div
          className="absolute h-32 w-32 rounded-full bg-warning/20 blur-3xl"
          style={{ left: "60%", top: "65%" }}
        />
      </div>

      <div className="px-5 py-3 border-t border-border grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Active", value: "12", color: "text-success" },
          { label: "Idle", value: "3", color: "text-warning" },
          { label: "Avg ETA", value: "18m", color: "text-info" },
        ].map((s) => (
          <div key={s.label}>
            <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
