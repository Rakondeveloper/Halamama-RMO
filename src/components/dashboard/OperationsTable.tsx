import {
  Filter,
  Calendar,
  Download,
  MoreHorizontal,
  AlertTriangle,
  Eye,
  UserPlus,
  Printer,
} from "lucide-react";
import { StatusBadge, type OrderStatus } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { MOCK_ORDERS } from "@/lib/orders";

interface OrderRow {
  id: string;
  customer: string;
  zone: string;
  picker: string;
  packer: string;
  driver: string | null;
  status: OrderStatus;
  tat: { mins: number; over: boolean };
  bags: number;
  payment: "COD" | "Prepaid" | "Card";
  amount: number;
  flag?: string;
}

const orders: OrderRow[] = [
  {
    id: "HLM-10248",
    customer: "Fatima Al-Mansouri",
    zone: "West Bay",
    picker: "Omar K.",
    packer: "Layla M.",
    driver: "Karim S.",
    status: "out",
    tat: { mins: 38, over: false },
    bags: 3,
    payment: "COD",
    amount: 412,
    flag: undefined,
  },
  {
    id: "HLM-10247",
    customer: "Ahmed Khalifa",
    zone: "Lusail",
    picker: "Sara A.",
    packer: "Yusuf R.",
    driver: null,
    status: "ready",
    tat: { mins: 22, over: false },
    bags: 2,
    payment: "Prepaid",
    amount: 287,
  },
  {
    id: "HLM-10246",
    customer: "Mariam Hassan",
    zone: "Al Wakrah",
    picker: "Hassan M.",
    packer: "Noura T.",
    driver: "Bilal H.",
    status: "delivered",
    tat: { mins: 84, over: false },
    bags: 5,
    payment: "Card",
    amount: 1240,
  },
  {
    id: "HLM-10245",
    customer: "Yousef Al-Thani",
    zone: "The Pearl",
    picker: "Layla M.",
    packer: "Omar K.",
    driver: "Tareq F.",
    status: "failed",
    tat: { mins: 142, over: true },
    bags: 4,
    payment: "COD",
    amount: 568,
    flag: "Customer unreachable",
  },
  {
    id: "HLM-10244",
    customer: "Aisha Mohammed",
    zone: "Mesaimeer",
    picker: "Yusuf R.",
    packer: "Sara A.",
    driver: null,
    status: "packed",
    tat: { mins: 18, over: false },
    bags: 1,
    payment: "Prepaid",
    amount: 95,
  },
  {
    id: "HLM-10243",
    customer: "Khalid Saleh",
    zone: "Al Sadd",
    picker: "Noura T.",
    packer: "Hassan M.",
    driver: null,
    status: "picked",
    tat: { mins: 11, over: false },
    bags: 2,
    payment: "COD",
    amount: 320,
  },
  {
    id: "HLM-10242",
    customer: "Reem Al-Kuwari",
    zone: "Education City",
    picker: "—",
    packer: "—",
    driver: null,
    status: "new",
    tat: { mins: 4, over: false },
    bags: 6,
    payment: "Card",
    amount: 1880,
  },
  {
    id: "HLM-10241",
    customer: "Salem Al-Naimi",
    zone: "Al Rayyan",
    picker: "Omar K.",
    packer: "Layla M.",
    driver: "Karim S.",
    status: "out",
    tat: { mins: 67, over: false },
    bags: 2,
    payment: "COD",
    amount: 244,
  },
  {
    id: "HLM-10240",
    customer: "Hind Al-Attiyah",
    zone: "Wakrah",
    picker: "Sara A.",
    packer: "Yusuf R.",
    driver: "Bilal H.",
    status: "delivered",
    tat: { mins: 92, over: false },
    bags: 3,
    payment: "Prepaid",
    amount: 612,
  },
  {
    id: "HLM-10239",
    customer: "Maha Al-Kaabi",
    zone: "West Bay",
    picker: "Noura T.",
    packer: "Hassan M.",
    driver: null,
    status: "new",
    tat: { mins: 42, over: false },
    bags: 2,
    payment: "Card",
    amount: 455,
  },
  {
    id: "HLM-10238",
    customer: "Noora Salem",
    zone: "The Pearl",
    picker: "Adhil P.",
    packer: "â€”",
    driver: null,
    status: "picked",
    tat: { mins: 75, over: false },
    bags: 2,
    payment: "COD",
    amount: 690,
  },
  {
    id: "HLM-10237",
    customer: "Faisal Al-Marri",
    zone: "Al Waab",
    picker: "Rahul V.",
    packer: "Mashood A.",
    driver: null,
    status: "ready",
    tat: { mins: 126, over: false },
    bags: 1,
    payment: "Prepaid",
    amount: 315,
  },
  {
    id: "HLM-10236",
    customer: "Hessa Al-Jaber",
    zone: "Lusail",
    picker: "Noushad K.",
    packer: "Layla M.",
    driver: "Irshad M.",
    status: "out",
    tat: { mins: 202, over: true },
    bags: 2,
    payment: "Card",
    amount: 760,
  },
  {
    id: "HLM-10235",
    customer: "Rashed Nasser",
    zone: "Education City",
    picker: "Adhil P.",
    packer: "Mashood A.",
    driver: "Farshad P.",
    status: "out",
    tat: { mins: 243, over: true },
    bags: 3,
    payment: "COD",
    amount: 925,
  },
  {
    id: "HLM-10234",
    customer: "Dana Ibrahim",
    zone: "Al Rayyan",
    picker: "Rahul V.",
    packer: "Layla M.",
    driver: "Nassim A.",
    status: "failed",
    tat: { mins: 337, over: true },
    bags: 1,
    payment: "COD",
    amount: 145,
    flag: "Address needs confirmation",
  },
];

const visibleOrders = orders.length;
const totalOrders = MOCK_ORDERS.length;

function Avatar({ name }: { name: string }) {
  if (name === "—") return <span className="text-xs text-muted-foreground">—</span>;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  const colors = [
    "bg-primary/15 text-primary",
    "bg-info/15 text-info",
    "bg-warning/15 text-warning",
    "bg-success/15 text-success",
  ];
  const c = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={cn(
          "h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold shrink-0",
          c,
        )}
      >
        {initials}
      </div>
      <span className="text-xs truncate">{name}</span>
    </div>
  );
}

export function OperationsTable() {
  return (
    <section className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-border">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Real-Time Operations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalOrders} orders · last refreshed 8 seconds ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors">
            <Calendar className="h-3.5 w-3.5" /> Today
          </button>
          <button className="h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors">
            <Filter className="h-3.5 w-3.5" /> Filters{" "}
            <span className="ml-0.5 h-4 px-1 rounded bg-primary text-primary-foreground text-[9px] grid place-items-center">
              3
            </span>
          </button>
          <button className="h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="h-9 px-3 rounded-lg bg-gradient-primary text-white text-xs font-semibold shadow-soft hover:opacity-90 transition-opacity">
            + New Order
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40 sticky top-0">
              <th className="text-left font-semibold px-5 py-3 w-8">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="text-left font-semibold py-3">Order ID</th>
              <th className="text-left font-semibold py-3">Customer / Zone</th>
              <th className="text-left font-semibold py-3">Picker</th>
              <th className="text-left font-semibold py-3">Packer</th>
              <th className="text-left font-semibold py-3">Driver</th>
              <th className="text-left font-semibold py-3">Status</th>
              <th className="text-left font-semibold py-3">TAT</th>
              <th className="text-center font-semibold py-3">Bags</th>
              <th className="text-left font-semibold py-3">Payment</th>
              <th className="text-right font-semibold py-3">Amount</th>
              <th className="text-right font-semibold px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-t border-border hover:bg-muted/30 transition-colors group"
              >
                <td className="px-5 py-3">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-3">
                  <div className="font-mono text-xs font-semibold">{o.id}</div>
                  {o.flag && (
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-destructive font-medium">
                      <AlertTriangle className="h-3 w-3" /> {o.flag}
                    </div>
                  )}
                </td>
                <td className="py-3 max-w-[180px]">
                  <div className="text-xs font-medium truncate">{o.customer}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{o.zone}</div>
                </td>
                <td className="py-3">
                  <Avatar name={o.picker} />
                </td>
                <td className="py-3">
                  <Avatar name={o.packer} />
                </td>
                <td className="py-3">
                  {o.driver ? (
                    <Avatar name={o.driver} />
                  ) : (
                    <button className="h-6 px-2 rounded-md bg-warning/12 text-warning text-[10px] font-semibold hover:bg-warning/20 transition-colors">
                      Assign
                    </button>
                  )}
                </td>
                <td className="py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="py-3">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
                      o.tat.over ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {o.tat.mins}m
                  </div>
                </td>
                <td className="py-3 text-center text-xs font-medium tabular-nums">{o.bags}</td>
                <td className="py-3">
                  <span
                    className={cn(
                      "inline-flex h-5 px-1.5 items-center rounded text-[10px] font-semibold",
                      o.payment === "COD" && "bg-warning/15 text-warning",
                      o.payment === "Prepaid" && "bg-success/15 text-success",
                      o.payment === "Card" && "bg-info/15 text-info",
                    )}
                  >
                    {o.payment}
                  </span>
                </td>
                <td className="py-3 text-right text-xs font-bold tabular-nums">
                  {o.amount.toLocaleString()}{" "}
                  <span className="text-[10px] text-muted-foreground font-medium">QAR</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      className="h-7 w-7 rounded-md hover:bg-muted grid place-items-center"
                      title="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="h-7 w-7 rounded-md hover:bg-muted grid place-items-center"
                      title="Assign"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="h-7 w-7 rounded-md hover:bg-muted grid place-items-center"
                      title="Print"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                    <button className="h-7 w-7 rounded-md hover:bg-muted grid place-items-center">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Showing 1–{visibleOrders} of {totalOrders} orders
        </div>
        <div className="flex items-center gap-1">
          <button className="h-7 px-2 rounded border border-border hover:bg-muted">Prev</button>
          <button className="h-7 w-7 rounded bg-primary text-primary-foreground font-semibold">
            1
          </button>
          <button className="h-7 px-2 rounded border border-border hover:bg-muted">Next</button>
        </div>
      </div>
    </section>
  );
}
